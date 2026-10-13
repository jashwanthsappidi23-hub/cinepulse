from datetime import datetime, timedelta
from typing import Dict, Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from backend.database import get_db
from backend.models import (
    Cinema, Screen, Seat, Movie, Screening, ScreeningPrice,
    Booking, BookedSeat, ConcessionItem, ConcessionOrder,
    Payment, Refund, AuditLog, User
)
from backend.auth import require_role
from backend.config import CLEANING_BUFFER_MINUTES

router = APIRouter(prefix="/api/manager", tags=["Cinema Manager Operations"])

class ScheduleScreeningRequest(BaseModel):
    movie_id: int
    screen_id: int
    start_time: str # "YYYY-MM-DD HH:MM"
    prices: Dict[str, float] # {"Regular": 350.0, "Premium": 550.0, "Recliner": 850.0}

class CreateMovieRequest(BaseModel):
    title: str
    description: Optional[str] = ""
    genre: str
    language: str
    duration: int # minutes
    rating: Optional[str] = "U/A"
    release_date: str # "YYYY-MM-DD"
    poster_url: Optional[str] = ""
    trailer_url: Optional[str] = ""

class UpdateStockPriceRequest(BaseModel):
    stock_quantity: int
    price: float

@router.get("/stats")
def get_manager_stats(
    current_user: User = Depends(require_role(["manager", "admin"])),
    db: Session = Depends(get_db)
):
    total_movies = db.query(Movie).filter(Movie.is_active == True).count()
    total_screenings = db.query(Screening).count()
    total_bookings = db.query(Booking).filter(Booking.status.in_(["Confirmed", "Completed"])).count()
    
    tickets_sold = db.query(BookedSeat).filter(BookedSeat.status.in_(["Confirmed", "Reserved"])).count()

    # Total capacity across all active screens * number of screenings
    total_capacity_slots = db.query(func.sum(Screen.capacity)).join(Screening).scalar() or 1
    occupancy_pct = round((tickets_sold / total_capacity_slots) * 100, 2)

    # Ticket revenue
    ticket_revenue = db.query(func.sum(BookedSeat.ticket_price)).filter(
        BookedSeat.status.in_(["Confirmed", "Reserved"])
    ).scalar() or 0.0

    # Concession revenue
    concession_revenue = db.query(func.sum(ConcessionOrder.total_amount)).filter(
        ConcessionOrder.status == "Completed"
    ).scalar() or 0.0

    # Refund total
    refund_total = db.query(func.sum(Refund.refund_amount)).filter(
        Refund.refund_status == "Processed"
    ).scalar() or 0.0

    return {
        "total_movies": total_movies,
        "total_screenings": total_screenings,
        "total_bookings": total_bookings,
        "tickets_sold": tickets_sold,
        "occupancy_percentage": occupancy_pct,
        "ticket_revenue": float(ticket_revenue),
        "concession_revenue": float(concession_revenue),
        "refund_total": float(refund_total),
        "net_revenue": float(ticket_revenue) + float(concession_revenue) - float(refund_total)
    }

@router.post("/screenings")
def schedule_screening(
    req: ScheduleScreeningRequest,
    current_user: User = Depends(require_role(["manager", "admin"])),
    db: Session = Depends(get_db)
):
    movie = db.query(Movie).filter(Movie.movie_id == req.movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found.")

    screen = db.query(Screen).filter(Screen.screen_id == req.screen_id).first()
    if not screen:
        raise HTTPException(status_code=404, detail="Screen not found.")

    try:
        start_dt = datetime.strptime(req.start_time.strip(), "%Y-%m-%d %H:%M:%S" if len(req.start_time) > 16 else "%Y-%m-%d %H:%M")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use 'YYYY-MM-DD HH:MM'.")

    now = datetime.utcnow()
    if start_dt < now:
        raise HTTPException(status_code=400, detail="Cannot schedule screenings in the past.")

    # Calculate end time based on movie duration + cleaning buffer
    duration_with_buffer = movie.duration + CLEANING_BUFFER_MINUTES
    end_dt = start_dt + timedelta(minutes=duration_with_buffer)

    # Validation: Prevent screen-time overlap
    # Overlap formula: (start_A < end_B) and (end_A > start_B)
    conflict = db.query(Screening).filter(
        Screening.screen_id == req.screen_id,
        Screening.status != "Cancelled",
        Screening.start_time < end_dt,
        Screening.end_time > start_dt
    ).first()

    if conflict:
        c_movie = conflict.movie.title
        c_start = conflict.start_time.strftime("%H:%M")
        c_end = conflict.end_time.strftime("%H:%M")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Scheduling conflict! Screen {screen.screen_name} is already booked for '{c_movie}' from {c_start} to {c_end} (including cleaning interval)."
        )

    # Insert Screening
    screening = Screening(
        movie_id=movie.movie_id,
        screen_id=screen.screen_id,
        start_time=start_dt,
        end_time=end_dt,
        status="Scheduled"
    )
    db.add(screening)
    db.flush()

    # Insert Category Prices
    for category in ["Regular", "Premium", "Recliner"]:
        price_val = req.prices.get(category, 300.0)
        sp = ScreeningPrice(
            screening_id=screening.screening_id,
            seat_category=category,
            ticket_price=price_val
        )
        db.add(sp)

    # Audit log
    audit = AuditLog(
        user_id=current_user.user_id,
        action="SCHEDULE_SCREENING",
        entity_type="Screening",
        entity_id=screening.screening_id,
        details=f"Scheduled '{movie.title}' in {screen.screen_name} for {start_dt.strftime('%Y-%m-%d %H:%M')}."
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "message": "Screening scheduled successfully without conflicts!",
        "screening_id": screening.screening_id,
        "movie_title": movie.title,
        "screen_name": screen.screen_name,
        "start_time": start_dt.strftime("%Y-%m-%d %H:%M:%S"),
        "end_time": end_dt.strftime("%Y-%m-%d %H:%M:%S")
    }

@router.delete("/screenings/{screening_id}")
def cancel_screening(
    screening_id: int,
    current_user: User = Depends(require_role(["manager", "admin"])),
    db: Session = Depends(get_db)
):
    screening = db.query(Screening).filter(Screening.screening_id == screening_id).first()
    if not screening:
        raise HTTPException(status_code=404, detail="Screening not found.")

    screening.status = "Cancelled"
    audit = AuditLog(
        user_id=current_user.user_id,
        action="CANCEL_SCREENING",
        entity_type="Screening",
        entity_id=screening.screening_id,
        details=f"Manager cancelled screening {screening_id}."
    )
    db.add(audit)
    db.commit()
    return {"success": True, "message": "Screening status set to Cancelled."}

@router.post("/movies")
def create_movie(
    req: CreateMovieRequest,
    current_user: User = Depends(require_role(["manager", "admin"])),
    db: Session = Depends(get_db)
):
    try:
        rel_date = datetime.strptime(req.release_date.strip(), "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format for release_date. Use 'YYYY-MM-DD'.")

    movie = Movie(
        title=req.title.strip(),
        description=req.description.strip(),
        genre=req.genre.strip(),
        language=req.language.strip(),
        duration=req.duration,
        rating=req.rating.strip(),
        release_date=rel_date,
        poster_url=req.poster_url.strip() or "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80",
        trailer_url=req.trailer_url.strip() or "https://www.youtube.com"
    )
    db.add(movie)
    db.flush()

    audit = AuditLog(
        user_id=current_user.user_id,
        action="CREATE_MOVIE",
        entity_type="Movie",
        entity_id=movie.movie_id,
        details=f"Added new movie listing: {movie.title}."
    )
    db.add(audit)
    db.commit()

    return {"success": True, "message": "Movie added successfully!", "movie_id": movie.movie_id}

@router.post("/seats/{seat_id}/toggle-maintenance")
def toggle_seat_maintenance(
    seat_id: int,
    current_user: User = Depends(require_role(["manager", "admin"])),
    db: Session = Depends(get_db)
):
    seat = db.query(Seat).filter(Seat.seat_id == seat_id).first()
    if not seat:
        raise HTTPException(status_code=404, detail="Seat not found.")

    seat.is_active = not seat.is_active
    status_label = "Active / Available" if seat.is_active else "Blocked for Maintenance"

    audit = AuditLog(
        user_id=current_user.user_id,
        action="TOGGLE_SEAT_STATUS",
        entity_type="Seat",
        entity_id=seat.seat_id,
        details=f"Seat {seat.row_label}{seat.seat_number} status set to {status_label}."
    )
    db.add(audit)
    db.commit()

    return {"success": True, "seat_id": seat.seat_id, "is_active": seat.is_active, "status": status_label}

@router.put("/concessions/{item_id}")
def update_concession_item(
    item_id: int,
    req: UpdateStockPriceRequest,
    current_user: User = Depends(require_role(["manager", "admin"])),
    db: Session = Depends(get_db)
):
    item = db.query(ConcessionItem).filter(ConcessionItem.item_id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Concession item not found.")

    item.stock_quantity = req.stock_quantity
    item.price = req.price

    audit = AuditLog(
        user_id=current_user.user_id,
        action="UPDATE_CONCESSION",
        entity_type="ConcessionItem",
        entity_id=item.item_id,
        details=f"Updated {item.item_name}: price INR {req.price}, stock {req.stock_quantity}."
    )
    db.add(audit)
    db.commit()

    return {"success": True, "message": "Concession item updated successfully."}
