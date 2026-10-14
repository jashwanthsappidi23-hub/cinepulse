from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import init_db, active_db_type
from backend.routers import (
    auth_router, movies_router, cinemas_router,
    screenings_router, seat_locks_router, bookings_router,
    concessions_router, manager_router, admin_router
)

app = FastAPI(
    title="CinePulse Cinema Screening & Ticket Booking API",
    description="Full-featured REST API for Cinema Screening and Ticket Booking System (Academic DBMS Project in 3NF)",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all modular routers
app.include_router(auth_router.router)
app.include_router(movies_router.router)
app.include_router(cinemas_router.router)
app.include_router(screenings_router.router)
app.include_router(seat_locks_router.router)
app.include_router(bookings_router.router)
app.include_router(concessions_router.router)
app.include_router(manager_router.router)
app.include_router(admin_router.router)

@app.on_event("startup")
def on_startup():
    init_db()

import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import HTTPException

# Frontend Static Files & SPA Fallback
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
assets_dir = os.path.join(frontend_dist, "assets")

if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

@app.get("/api/health")
def api_health():
    return {
        "system": "CinePulse Cinema Screening and Ticket Booking System API",
        "status": "online",
        "database_backend": active_db_type.upper(),
        "database_name": "CinemaBookingDB",
        "normalized_tables": 18,
        "normalization_level": "3NF",
        "documentation": "/docs"
    }

@app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
async def serve_spa(full_path: str):
    # Don't intercept API routes (if any didn't match, return 404)
    if full_path.startswith("api/") or full_path == "api":
        raise HTTPException(status_code=404, detail="API endpoint not found")

    file_path = os.path.join(frontend_dist, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)

    index_file = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)

    return {"message": "CinePulse API is online. Frontend build not found."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
