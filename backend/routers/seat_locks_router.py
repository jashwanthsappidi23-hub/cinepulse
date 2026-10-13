from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import SeatLock, BookedSeat, Screening, User
from backend.auth import get_current_user
from backend.config import SEAT_LOCK_TTL_SECONDS

router = APIRouter(prefix="/api/screenings", tags=["Seat Concurrency Locks"])

class LockSeatsRequest(BaseModel):
    seat_ids: List[int]

class ReleaseSeatsRequest(BaseModel):
    seat_ids: Optional[List[int]] = None

@router.post("/{screening_id}/lock-seats")
def lock_seats(
    screening_id: int,
    req: LockSeatsRequest,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not req.seat_ids:
        raise HTTPException(status_code=400, detail="No seat IDs provided.")

    if current_user is None:
        customer_user = db.query(User).filter(User.role == "customer").first()
        current_user = customer_user or db.query(User).first()

    screening = db.query(Screening).filter(Screening.screening_id == screening_id).first()
    if not screening:
        raise HTTPException(status_code=404, detail="Screening not found.")

    now = datetime.utcnow()

    # 1. Check if any seat is already booked
    already_booked = db.query(BookedSeat).filter(
        BookedSeat.screening_id == screening_id,
        BookedSeat.seat_id.in_(req.seat_ids),
        BookedSeat.status.in_(["Confirmed", "Reserved"])
    ).first()
    if already_booked:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Seat ID {already_booked.seat_id} is already booked for this show."
        )

    # 2. Clean up any expired locks for this screening first
    db.query(SeatLock).filter(
        SeatLock.screening_id == screening_id,
        SeatLock.lock_expiration_time <= now
    ).delete(synchronize_session=False)

    # Check if any seat is currently locked by ANOTHER customer
    competing_lock = db.query(SeatLock).filter(
        SeatLock.screening_id == screening_id,
        SeatLock.seat_id.in_(req.seat_ids),
        SeatLock.lock_status == "Locked",
        SeatLock.lock_expiration_time > now,
        SeatLock.user_id != current_user.user_id
    ).first()
    if competing_lock:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Seat ID {competing_lock.seat_id} is currently held by another customer. Please choose different seats."
        )

    # 3. Apply/Renew locks
    expiration = now + timedelta(seconds=SEAT_LOCK_TTL_SECONDS)
    
    # Release any other existing locks for these seats
    db.query(SeatLock).filter(
        SeatLock.screening_id == screening_id,
        SeatLock.seat_id.in_(req.seat_ids)
    ).delete(synchronize_session=False)

    for sid in req.seat_ids:
        new_lock = SeatLock(
            screening_id=screening_id,
            seat_id=sid,
            user_id=current_user.user_id,
            lock_expiration_time=expiration,
            lock_status="Locked"
        )
        db.add(new_lock)

    db.commit()

    return {
        "success": True,
        "message": f"Successfully locked {len(req.seat_ids)} seats.",
        "seat_ids": req.seat_ids,
        "locked_until": expiration.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "ttl_seconds": SEAT_LOCK_TTL_SECONDS
    }

@router.post("/{screening_id}/release-seats")
def release_seats(
    screening_id: int,
    req: ReleaseSeatsRequest,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user is None:
        customer_user = db.query(User).filter(User.role == "customer").first()
        current_user = customer_user or db.query(User).first()

    query = db.query(SeatLock).filter(
        SeatLock.screening_id == screening_id,
        SeatLock.user_id == current_user.user_id,
        SeatLock.lock_status == "Locked"
    )
    if req.seat_ids:
        query = query.filter(SeatLock.seat_id.in_(req.seat_ids))

    updated_count = query.update({"lock_status": "Released"}, synchronize_session=False)
    db.commit()

    return {
        "success": True,
        "released_count": updated_count,
        "message": "Seats released successfully."
    }
