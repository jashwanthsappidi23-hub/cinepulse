from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Cinema, Screen, Screening, Movie
from backend.data_cities import POPULAR_CITIES, ALL_INDIAN_CITIES, ALL_CITY_NAMES
from typing import Optional

router = APIRouter(prefix="/api/cinemas", tags=["Cinemas"])

@router.get("")
def list_cinemas(city: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Cinema).filter(Cinema.is_active == True)
    
    if city and city.lower() != "all":
        city_clean = city.strip()
        matched = query.filter(Cinema.city.ilike(f"%{city_clean}%")).all()
        if matched:
            cinemas = matched
        else:
            # If no direct cinema exists in this specific city yet,
            # provide flagship regional CinePulse Multiplexes so user can still browse and book!
            cinemas = query.limit(3).all()
    else:
        cinemas = query.all()

    results = []
    for c in cinemas:
        results.append({
            "cinema_id": c.cinema_id,
            "name": c.name,
            "address": c.address,
            "city": c.city,
            "contact_details": c.contact_details,
            "total_screens": len([s for s in c.screens if s.is_active]),
            "screen_types": list(set([s.screen_type for s in c.screens if s.is_active])),
            "is_direct_match": (city.lower() in c.city.lower()) if (city and city.lower() != "all") else True
        })
    return results

@router.get("/cities")
def list_cities(detailed: bool = False, db: Session = Depends(get_db)):
    """
    Returns all cities of India across 28 states and 8 union territories.
    """
    # Active cinema cities in DB
    active_in_db = [c[0] for c in db.query(Cinema.city).filter(Cinema.is_active == True).distinct().all()]
    
    if detailed:
        return {
            "popular": POPULAR_CITIES,
            "all_cities": ALL_INDIAN_CITIES,
            "all_names": ALL_CITY_NAMES,
            "active_cities": sorted(active_in_db),
            "total_count": len(ALL_CITY_NAMES)
        }
    
    # Return complete sorted list of all 160+ cities of India
    return ALL_CITY_NAMES

@router.get("/cities/directory")
def get_cities_directory(db: Session = Depends(get_db)):
    """
    Detailed directory endpoint for BookMyShow style city selection modal.
    """
    active_in_db = [c[0] for c in db.query(Cinema.city).filter(Cinema.is_active == True).distinct().all()]
    return {
        "popular": POPULAR_CITIES,
        "all_cities": ALL_INDIAN_CITIES,
        "all_names": ALL_CITY_NAMES,
        "active_cities": sorted(active_in_db),
        "total_count": len(ALL_CITY_NAMES)
    }

@router.get("/{cinema_id}")
def get_cinema_detail(cinema_id: int, db: Session = Depends(get_db)):
    cinema = db.query(Cinema).filter(Cinema.cinema_id == cinema_id, Cinema.is_active == True).first()
    if not cinema:
        raise HTTPException(status_code=404, detail="Cinema not found.")

    screens_data = []
    for s in cinema.screens:
        if s.is_active:
            screens_data.append({
                "screen_id": s.screen_id,
                "screen_name": s.screen_name,
                "screen_type": s.screen_type,
                "capacity": s.capacity,
            })

    return {
        "cinema_id": cinema.cinema_id,
        "name": cinema.name,
        "address": cinema.address,
        "city": cinema.city,
        "contact_details": cinema.contact_details,
        "screens": screens_data
    }
