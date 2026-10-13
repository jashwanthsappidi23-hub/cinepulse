from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from backend.database import get_db
from backend.models import Movie, Screening, Screen, Cinema

router = APIRouter(prefix="/api/movies", tags=["Movies"])

@router.get("")
def list_movies(
    search: Optional[str] = None,
    genre: Optional[str] = None,
    language: Optional[str] = None,
    city: Optional[str] = None,
    status_filter: Optional[str] = Query("all", pattern="^(all|now_showing|upcoming)$"),
    db: Session = Depends(get_db)
):
    query = db.query(Movie).filter(Movie.is_active == True)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Movie.title.ilike(search_pattern),
                Movie.description.ilike(search_pattern),
                Movie.genre.ilike(search_pattern)
            )
        )

    if genre and genre.lower() != "all":
        query = query.filter(Movie.genre.ilike(f"%{genre.strip()}%"))

    if language and language.lower() != "all":
        query = query.filter(Movie.language.ilike(f"%{language.strip()}%"))

    now = datetime.utcnow()
    if status_filter == "now_showing":
        query = query.filter(Movie.release_date <= now)
    elif status_filter == "upcoming":
        query = query.filter(Movie.release_date > now)

    movies = query.order_by(Movie.release_date.desc()).all()

    result = []
    for m in movies:
        scr_query = db.query(Screening).join(Screen).join(Cinema).filter(
            Screening.movie_id == m.movie_id,
            Screening.start_time >= now
        )
        
        local_shows = 0
        if city and city.lower() != "all":
            local_shows = db.query(Screening).join(Screen).join(Cinema).filter(
                Screening.movie_id == m.movie_id,
                Screening.start_time >= now,
                Cinema.city.ilike(f"%{city.strip()}%")
            ).count()

        total_shows = scr_query.count()

        movie_dict = {
            "movie_id": m.movie_id,
            "title": m.title,
            "description": m.description,
            "genre": m.genre,
            "language": m.language,
            "duration": m.duration,
            "rating": m.rating,
            "release_date": m.release_date.strftime("%Y-%m-%d"),
            "poster_url": m.poster_url,
            "trailer_url": m.trailer_url,
            "is_now_showing": m.release_date <= now,
            "active_shows_count": local_shows if (city and city.lower() != "all") else total_shows,
            "total_shows_network": total_shows,
            "playing_in_city": local_shows > 0
        }
        result.append(movie_dict)

    if city and city.lower() != "all":
        # Sort movies playing in city first, then by release date
        result.sort(key=lambda x: (0 if x["playing_in_city"] else 1, 0 if x["is_now_showing"] else 1))

    return result

@router.get("/genres")
def get_genres(db: Session = Depends(get_db)):
    movies = db.query(Movie.genre).filter(Movie.is_active == True).all()
    genres_set = set()
    for row in movies:
        for g in row[0].split("/"):
            genres_set.add(g.strip())
    return sorted(list(genres_set))

@router.get("/languages")
def get_languages(db: Session = Depends(get_db)):
    langs = db.query(Movie.language).filter(Movie.is_active == True).distinct().all()
    return sorted([l[0] for l in langs])

@router.get("/{movie_id}")
def get_movie_detail(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.movie_id == movie_id, Movie.is_active == True).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie listing not found.")

    now = datetime.utcnow()
    screenings = db.query(Screening).filter(
        Screening.movie_id == movie_id,
        Screening.start_time >= now
    ).order_by(Screening.start_time.asc()).all()

    screenings_list = []
    for s in screenings:
        cinema = s.screen.cinema
        screenings_list.append({
            "screening_id": s.screening_id,
            "start_time": s.start_time.strftime("%Y-%m-%d %H:%M:%S"),
            "end_time": s.end_time.strftime("%Y-%m-%d %H:%M:%S"),
            "status": s.status,
            "screen_name": s.screen.screen_name,
            "screen_type": s.screen.screen_type,
            "cinema_id": cinema.cinema_id,
            "cinema_name": cinema.name,
            "cinema_city": cinema.city,
            "prices": [{"category": p.seat_category, "price": float(p.ticket_price)} for p in s.prices]
        })

    return {
        "movie_id": movie.movie_id,
        "title": movie.title,
        "description": movie.description,
        "genre": movie.genre,
        "language": movie.language,
        "duration": movie.duration,
        "rating": movie.rating,
        "release_date": movie.release_date.strftime("%Y-%m-%d"),
        "poster_url": movie.poster_url,
        "trailer_url": movie.trailer_url,
        "screenings": screenings_list
    }
