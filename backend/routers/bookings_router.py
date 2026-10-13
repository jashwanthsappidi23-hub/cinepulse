import uuid
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import (
    Booking, BookedSeat, Ticket, Screening, Screen, Cinema, Movie,
    Seat, ScreeningPrice, ConcessionItem, ConcessionOrder, ConcessionOrderItem,
    Payment, Cancellation, Refund, SeatLock, AuditLog, User
)
from backend.auth import get_current_user, require_auth
from backend.config import CONVENIENCE_FEE_PERCENTAGE, GST_TAX_PERCENTAGE, CANCELLATION_MIN_HOURS_BEFORE_SHOW

router = APIRouter(prefix="/api/bookings", tags=["Bookings & Tickets"])

class ConcessionOrderItemInput(BaseModel):
    item_id: int
    quantity: int

class CreateBookingRequest(BaseModel):
    screening_id: int
    seat_ids: List[int]
    concessions: Optional[List[ConcessionOrderItemInput]] = []
    payment_method: Optional[str] = "UPI"
    simulated_payment_success: Optional[bool] = True

class CancelBookingRequest(BaseModel):
    reason: Optional[str] = "Customer requested cancellation"

@router.post("")
def create_booking(
    req: CreateBookingRequest,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user is None:
        customer_user = db.query(User).filter(User.role == "customer").first()
        current_user = customer_user or db.query(User).first()

    if not req.seat_ids:
        raise HTTPException(status_code=400, detail="At least one seat must be selected.")

    # 1. Validate screening
    screening = db.query(Screening).filter(Screening.screening_id == req.screening_id).first()
    if not screening:
        raise HTTPException(status_code=404, detail="Screening does not exist.")

    now = datetime.utcnow()
    # In DBMS project demo testing, allow screenings scheduled for today and future days.
    # Only reject cancelled or archived historical screenings.
    if screening.status == "Cancelled":
        raise HTTPException(status_code=400, detail="Cannot book tickets for a cancelled screening.")
    if screening.status == "Completed" and screening.start_time < (now - timedelta(days=2)):
        raise HTTPException(status_code=400, detail="Cannot book tickets for an archive screening from past days.")

    screen = screening.screen
    movie = screening.movie

    # 2. Validate seats exist and belong to this screen
    seats = db.query(Seat).filter(
        Seat.seat_id.in_(req.seat_ids),
        Seat.screen_id == screen.screen_id
    ).all()
    if len(seats) != len(req.seat_ids):
        raise HTTPException(status_code=400, detail="One or more selected seats are invalid for this screen.")

    for s in seats:
        if not s.is_active:
            raise HTTPException(status_code=400, detail=f"Seat {s.row_label}{s.seat_number} is blocked for maintenance.")

    # 3. Transactional collision check: Prevent double booking
    already_booked = db.query(BookedSeat).filter(
        BookedSeat.screening_id == req.screening_id,
        BookedSeat.seat_id.in_(req.seat_ids),
        BookedSeat.status.in_(["Confirmed", "Reserved"])
    ).first()
    if already_booked:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Seat {already_booked.seat.row_label}{already_booked.seat.seat_number} was just booked by another customer! Transaction aborted."
        )

    # 4. Calculate ticket prices by seat category
    prices_map = {p.seat_category: float(p.ticket_price) for p in screening.prices}
    total_ticket_amount = 0.0
    seat_price_tuples = []

    for s in seats:
        seat_price = prices_map.get(s.seat_category, 300.0)
        seat_price_tuples.append((s, seat_price))
        total_ticket_amount += seat_price

    # 5. Process concession items
    concession_items_to_order = []
    concessions_total = 0.0

    if req.concessions:
        for c_input in req.concessions:
            if c_input.quantity <= 0:
                continue
            item = db.query(ConcessionItem).filter(
                ConcessionItem.item_id == c_input.item_id,
                ConcessionItem.is_active == True
            ).first()
            if not item:
                raise HTTPException(status_code=404, detail=f"Concession item ID {c_input.item_id} not found.")
            if item.stock_quantity < c_input.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for {item.item_name}. Only {item.stock_quantity} available."
                )
            subtotal = float(item.price) * c_input.quantity
            concessions_total += subtotal
            concession_items_to_order.append((item, c_input.quantity, float(item.price), subtotal))

    # 6. Calculate taxes & final total
    base_subtotal = total_ticket_amount + concessions_total
    service_fee = round(base_subtotal * CONVENIENCE_FEE_PERCENTAGE, 2)
    gst_tax = round((base_subtotal + service_fee) * GST_TAX_PERCENTAGE, 2)
    grand_total = round(base_subtotal + service_fee + gst_tax, 2)

    # 7. Check simulated payment gateway status
    if not req.simulated_payment_success:
        # Log failed attempt
        audit_fail = AuditLog(
            user_id=current_user.user_id,
            action="SIMULATED_PAYMENT_FAILED",
            entity_type="Payment",
            details=f"Payment declined in simulated gateway for amount INR {grand_total}."
        )
        db.add(audit_fail)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Simulated payment authorization failed or was declined by bank. Transaction rolled back."
        )

    # 8. ACID Transaction: Execute all database inserts
    try:
        # Generate booking reference
        random_suffix = uuid.uuid4().hex[:6].upper()
        date_stamp = now.strftime("%Y%m%d")
        booking_ref = f"BK-CNP-{date_stamp}-{random_suffix}"

        # Insert Booking
        booking = Booking(
            user_id=current_user.user_id,
            screening_id=req.screening_id,
            booking_reference=booking_ref,
            booking_date=now,
            status="Confirmed",
            total_amount=grand_total
        )
        db.add(booking)
        db.flush()

        # Insert BookedSeats and Tickets
        generated_tickets = []
        for s, price in seat_price_tuples:
            booked_seat = BookedSeat(
                booking_id=booking.booking_id,
                screening_id=req.screening_id,
                seat_id=s.seat_id,
                ticket_price=price,
                status="Confirmed"
            )
            db.add(booked_seat)
            db.flush()

            ticket_code = f"TCK-{booking_ref}-{s.row_label}{s.seat_number}"
            qr_token = f"VTOKEN-{uuid.uuid4().hex[:12].upper()}-{s.row_label}{s.seat_number}"

            ticket = Ticket(
                booked_seat_id=booked_seat.booked_seat_id,
                ticket_code=ticket_code,
                qr_verification_token=qr_token,
                issue_date=now,
                status="Active"
            )
            db.add(ticket)
            generated_tickets.append({
                "ticket_code": ticket_code,
                "qr_token": qr_token,
                "seat_identifier": f"{s.row_label}{s.seat_number}",
                "seat_category": s.seat_category,
                "price": price
            })

        # Insert Concession order if items present
        if concession_items_to_order:
            c_order = ConcessionOrder(
                booking_id=booking.booking_id,
                order_date=now,
                total_amount=concessions_total,
                status="Completed"
            )
            db.add(c_order)
            db.flush()

            for item, qty, unit_p, sub_p in concession_items_to_order:
                # Deduct inventory
                item.stock_quantity -= qty
                co_item = ConcessionOrderItem(
                    order_id=c_order.order_id,
                    item_id=item.item_id,
                    quantity=qty,
                    unit_price=unit_p,
                    subtotal=sub_p
                )
                db.add(co_item)

        # Record Payment
        txn_ref = f"TXN-{req.payment_method.replace(' ', '')[:4].upper()}-{date_stamp}-{uuid.uuid4().hex[:8].upper()}"
        payment = Payment(
            booking_id=booking.booking_id,
            amount=grand_total,
            payment_method=req.payment_method,
            transaction_reference=txn_ref,
            payment_status="Successful",
            payment_date=now
        )
        db.add(payment)

        # Convert SeatLocks
        db.query(SeatLock).filter(
            SeatLock.screening_id == req.screening_id,
            SeatLock.seat_id.in_(req.seat_ids),
            SeatLock.user_id == current_user.user_id
        ).update({"lock_status": "Converted"}, synchronize_session=False)

        # Audit log
        audit = AuditLog(
            user_id=current_user.user_id,
            action="BOOKING_CONFIRMED",
            entity_type="Booking",
            entity_id=booking.booking_id,
            details=f"Confirmed booking {booking_ref} for {len(req.seat_ids)} seats. Amount INR {grand_total}."
        )
        db.add(audit)

        db.commit()

        return {
            "success": True,
            "message": "Tickets booked successfully!",
            "booking_reference": booking_ref,
            "booking_id": booking.booking_id,
            "status": "Confirmed",
            "booking_date": now.strftime("%Y-%m-%d %H:%M:%S"),
            "movie": {
                "movie_id": movie.movie_id,
                "title": movie.title,
                "poster_url": movie.poster_url,
                "rating": movie.rating,
                "genre": movie.genre,
                "duration": movie.duration
            },
            "screening": {
                "screening_id": screening.screening_id,
                "movie_title": movie.title,
                "movie_poster": movie.poster_url,
                "movie_rating": movie.rating,
                "cinema_name": screen.cinema.name,
                "cinema_city": screen.cinema.city,
                "screen_name": screen.screen_name,
                "screen_type": screen.screen_type,
                "start_time": screening.start_time.strftime("%Y-%m-%d %H:%M:%S"),
            },
            "tickets": generated_tickets,
            "financial_summary": {
                "ticket_amount": total_ticket_amount,
                "concessions_amount": concessions_total,
                "service_fee": service_fee,
                "gst_tax": gst_tax,
                "grand_total": grand_total,
                "transaction_reference": txn_ref,
                "payment_method": req.payment_method,
                "payment_status": "Successful"
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Transaction rolled back due to error: {str(e)}"
        )

@router.get("/my-bookings")
def get_my_bookings(
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user is None:
        customer_user = db.query(User).filter(User.role == "customer").first()
        current_user = customer_user or db.query(User).first()

    if not current_user:
        return []

    bookings = db.query(Booking).filter(
        Booking.user_id == current_user.user_id
    ).order_by(Booking.booking_date.desc()).all()

    now = datetime.utcnow()
    results = []

    for b in bookings:
        screening = b.screening
        movie = screening.movie
        screen = screening.screen
        cinema = screen.cinema

        # Tickets
        tickets_data = []
        for bs in b.booked_seats:
            if bs.ticket:
                tickets_data.append({
                    "ticket_id": bs.ticket.ticket_id,
                    "ticket_code": bs.ticket.ticket_code,
                    "qr_token": bs.ticket.qr_verification_token,
                    "seat_identifier": f"{bs.seat.row_label}{bs.seat.seat_number}",
                    "category": bs.seat.seat_category,
                    "price": float(bs.ticket_price),
                    "status": bs.ticket.status
                })

        # Concessions
        concession_summary = []
        for co in b.concession_orders:
            for item in co.items:
                concession_summary.append({
                    "item_name": item.item.item_name,
                    "quantity": item.quantity,
                    "unit_price": float(item.unit_price),
                    "subtotal": float(item.subtotal)
                })

        # Check cancellation eligibility: Show must be at least 2 hours in the future
        can_cancel = False
        if b.status == "Confirmed" and screening.start_time > (now + timedelta(hours=CANCELLATION_MIN_HOURS_BEFORE_SHOW)):
            can_cancel = True

        # Payment details
        payment_info = None
        if b.payments:
            p = b.payments[0]
            payment_info = {
                "transaction_reference": p.transaction_reference,
                "method": p.payment_method,
                "status": p.payment_status,
                "amount": float(p.amount)
            }

        # Refund details if cancelled
        refund_info = None
        if b.cancellation and b.cancellation.refunds:
            r = b.cancellation.refunds[0]
            refund_info = {
                "refund_amount": float(r.refund_amount),
                "refund_status": r.refund_status,
                "processed_date": r.processed_date.strftime("%Y-%m-%d %H:%M:%S")
            }

        results.append({
            "booking_id": b.booking_id,
            "booking_reference": b.booking_reference,
            "booking_date": b.booking_date.strftime("%Y-%m-%d %H:%M:%S"),
            "status": b.status,
            "total_amount": float(b.total_amount),
            "can_cancel": can_cancel,
            "movie": {
                "movie_id": movie.movie_id,
                "title": movie.title,
                "poster_url": movie.poster_url,
                "rating": movie.rating,
                "duration": movie.duration,
                "genre": movie.genre
            },
            "screening": {
                "screening_id": screening.screening_id,
                "start_time": screening.start_time.strftime("%Y-%m-%d %H:%M:%S"),
                "end_time": screening.end_time.strftime("%Y-%m-%d %H:%M:%S"),
                "cinema_name": cinema.name,
                "cinema_city": cinema.city,
                "cinema_address": cinema.address,
                "screen_name": screen.screen_name,
                "screen_type": screen.screen_type
            },
            "tickets": tickets_data,
            "concessions": concession_summary,
            "payment": payment_info,
            "refund": refund_info
        })

    return results

@router.get("/ref/{booking_ref}")
def get_booking_by_reference(booking_ref: str, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.booking_reference == booking_ref).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking reference not found.")

    screening = booking.screening
    movie = screening.movie
    screen = screening.screen
    cinema = screen.cinema

    tickets_data = [
        {
            "ticket_code": bs.ticket.ticket_code if bs.ticket else "",
            "qr_token": bs.ticket.qr_verification_token if bs.ticket else "",
            "seat_identifier": f"{bs.seat.row_label}{bs.seat.seat_number}",
            "category": bs.seat.seat_category,
            "price": float(bs.ticket_price)
        }
        for bs in booking.booked_seats
    ]

    return {
        "booking_reference": booking.booking_reference,
        "booking_date": booking.booking_date.strftime("%Y-%m-%d %H:%M:%S"),
        "status": booking.status,
        "total_amount": float(booking.total_amount),
        "movie_title": movie.title,
        "movie_poster": movie.poster_url,
        "rating": movie.rating,
        "cinema_name": cinema.name,
        "cinema_city": cinema.city,
        "cinema_address": cinema.address,
        "screen_name": screen.screen_name,
        "screen_type": screen.screen_type,
        "showtime": screening.start_time.strftime("%Y-%m-%d %H:%M:%S"),
        "tickets": tickets_data
    }

@router.post("/{booking_id}/cancel")
def cancel_booking(
    booking_id: int,
    req: CancelBookingRequest,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.booking_id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    # Authorization: Customer must own booking or be manager/admin
    if current_user.role == "customer" and booking.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Unauthorized to cancel this booking.")

    if booking.status == "Cancelled":
        raise HTTPException(status_code=400, detail="Booking has already been cancelled.")

    now = datetime.utcnow()
    screening = booking.screening

    # Cancellation policy: Must be at least 2 hours before show
    if screening.start_time <= (now + timedelta(hours=CANCELLATION_MIN_HOURS_BEFORE_SHOW)):
        raise HTTPException(
            status_code=400,
            detail=f"Cancellations are only permitted at least {CANCELLATION_MIN_HOURS_BEFORE_SHOW} hours prior to showtime."
        )

    try:
        # 1. Update Booking status
        booking.status = "Cancelled"

        # 2. Update BookedSeats and Tickets
        for bs in booking.booked_seats:
            bs.status = "Cancelled"
            if bs.ticket:
                bs.ticket.status = "Cancelled"

        # 3. Create Cancellation entry
        cancellation = Cancellation(
            booking_id=booking.booking_id,
            cancellation_date=now,
            reason=req.reason.strip(),
            cancellation_status="Approved"
        )
        db.add(cancellation)
        db.flush()

        # 4. Process Refund
        payment = db.query(Payment).filter(
            Payment.booking_id == booking.booking_id,
            Payment.payment_status == "Successful"
        ).first()

        refund_amount = float(booking.total_amount)
        if payment:
            payment.payment_status = "Refunded"
            refund = Refund(
                payment_id=payment.payment_id,
                cancellation_id=cancellation.cancellation_id,
                refund_amount=refund_amount,
                refund_status="Processed",
                processed_date=now
            )
            db.add(refund)

        # 5. Audit Log
        audit = AuditLog(
            user_id=current_user.user_id,
            action="BOOKING_CANCELLED",
            entity_type="Booking",
            entity_id=booking.booking_id,
            details=f"Cancelled booking {booking.booking_reference}. Processed refund of INR {refund_amount}."
        )
        db.add(audit)

        db.commit()

        return {
            "success": True,
            "message": "Booking successfully cancelled and refund processed.",
            "booking_reference": booking.booking_reference,
            "refund_amount": refund_amount,
            "refund_status": "Processed"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to cancel booking: {str(e)}")
