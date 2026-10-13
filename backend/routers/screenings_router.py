from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database import get_db
from backend.models import Screening, Screen, Cinema, Movie, Seat, BookedSeat, SeatLock, ScreeningPrice, User
from backend.auth import get_current_user

router = APIRouter(prefix="/api/screenings", tags=["Screenings"])

@router.get("")
def list_screenings(
    movie_id: Optional[int] = None,
    cinema_id: Optional[int] = None,
    city: Optional[str] = None,
    date: Optional[str] = None,
    status: Optional[str] = "Scheduled",
    db: Session = Depends(get_db)
):
    query = db.query(Screening).join(Screen).join(Cinema).join(Movie)

    if status and status.lower() != "all":
        query = query.filter(Screening.status == status)
    if movie_id:
        query = query.filter(Screening.movie_id == movie_id)
    if cinema_id:
        query = query.filter(Screen.cinema_id == cinema_id)
    if city and city.lower() != "all":
        query = query.filter(Cinema.city.ilike(f"%{city.strip()}%"))
    if date:
        # Match year-month-day
        query = query.filter(func.date(Screening.start_time) == date)

    screenings = query.order_by(Screening.start_time.asc()).all()

    # Graceful fallback: If city has no direct showtimes scheduled, show regional network screenings
    if not screenings and city and city.lower() != "all":
        fb_query = db.query(Screening).join(Screen).join(Cinema).join(Movie)
        if status and status.lower() != "all":
            fb_query = fb_query.filter(Screening.status == status)
        if movie_id:
            fb_query = fb_query.filter(Screening.movie_id == movie_id)
        screenings = fb_query.order_by(Screening.start_time.asc()).limit(20).all()

    results = []
    for s in screenings:
        prices_map = {p.seat_category: float(p.ticket_price) for p in s.prices}
        results.append({
            "screening_id": s.screening_id,
            "movie_id": s.movie_id,
            "movie_title": s.movie.title,
            "movie_poster": s.movie.poster_url,
            "movie_rating": s.movie.rating,
            "movie_duration": s.movie.duration,
            "movie_language": s.movie.language,
            "cinema_id": s.screen.cinema.cinema_id,
            "cinema_name": s.screen.cinema.name,
            "cinema_city": s.screen.cinema.city,
            "screen_id": s.screen.screen_id,
            "screen_name": s.screen.screen_name,
            "screen_type": s.screen.screen_type,
            "start_time": s.start_time.strftime("%Y-%m-%d %H:%M:%S"),
            "end_time": s.end_time.strftime("%Y-%m-%d %H:%M:%S"),
            "status": s.status,
            "prices": prices_map
        })

    return results

@router.get("/{screening_id}/layout")
def get_screening_seat_layout(
    screening_id: int, 
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    screening = db.query(Screening).filter(Screening.screening_id == screening_id).first()
    if not screening:
        raise HTTPException(status_code=404, detail="Screening not found.")

    screen = screening.screen
    cinema = screen.cinema
    movie = screening.movie

    # Prices
    prices_map = {p.seat_category: float(p.ticket_price) for p in screening.prices}

    # Fetch all seats for the screen
    seats = db.query(Seat).filter(Seat.screen_id == screen.screen_id).order_by(Seat.row_label.asc(), Seat.seat_number.asc()).all()

    # Fetch currently confirmed/reserved seats for this screening
    booked_seat_records = db.query(BookedSeat).filter(
        BookedSeat.screening_id == screening_id,
        BookedSeat.status.in_(["Confirmed", "Reserved"])
    ).all()
    booked_seat_ids = set([b.seat_id for b in booked_seat_records])

    # Fetch active seat locks
    now = datetime.utcnow()
    active_locks = db.query(SeatLock).filter(
        SeatLock.screening_id == screening_id,
        SeatLock.lock_status == "Locked",
        SeatLock.lock_expiration_time > now
    ).all()

    locked_seat_map = {lock.seat_id: lock.user_id for lock in active_locks}

    if current_user is None:
        customer_user = db.query(User).filter(User.role == "customer").first()
        current_user = customer_user or db.query(User).first()

    current_user_id = current_user.user_id if current_user else None

    # Group seats by rows
    rows_dict = {}
    total_available = 0
    total_booked = 0

    for s in seats:
        # Determine status
        if not s.is_active:
            status = "blocked" # Maintenance
        elif s.seat_id in booked_seat_ids:
            status = "booked" # Booked (Red)
            total_booked += 1
        elif s.seat_id in locked_seat_map:
            locking_user = locked_seat_map[s.seat_id]
            if current_user_id and locking_user == current_user_id:
                status = "selected" # Selected by current customer (Yellow)
            else:
                status = "locked" # Unavailable / locked by someone else (Grey)
        else:
            status = "available" # Available (Green)
            total_available += 1

        seat_info = {
            "seat_id": s.seat_id,
            "row_label": s.row_label,
            "seat_number": s.seat_number,
            "seat_identifier": f"{s.row_label}{s.seat_number}",
            "category": s.seat_category,
            "price": prices_map.get(s.seat_category, 300.00),
            "status": status,
            "is_active": s.is_active
        }

        if s.row_label not in rows_dict:
            rows_dict[s.row_label] = []
        rows_dict[s.row_label].append(seat_info)

    return {
        "screening": {
            "screening_id": screening.screening_id,
            "start_time": screening.start_time.strftime("%Y-%m-%d %H:%M:%S"),
            "end_time": screening.end_time.strftime("%Y-%m-%d %H:%M:%S"),
            "status": screening.status,
            "movie": {
                "movie_id": movie.movie_id,
                "title": movie.title,
                "poster_url": movie.poster_url,
                "rating": movie.rating,
                "duration": movie.duration,
                "genre": movie.genre,
                "language": movie.language
            },
            "cinema": {
                "cinema_id": cinema.cinema_id,
                "name": cinema.name,
                "city": cinema.city,
                "address": cinema.address
            },
            "screen": {
                "screen_id": screen.screen_id,
                "screen_name": screen.screen_name,
                "screen_type": screen.screen_type,
                "capacity": screen.capacity
            },
            "prices": prices_map
        },
        "stats": {
            "total_seats": len(seats),
            "available_seats": total_available,
            "booked_seats": total_booked
        },
        "rows": rows_dict
    }
