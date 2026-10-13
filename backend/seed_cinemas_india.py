"""
Seed Flagship CinePulse Multiplexes, Screens, Seats, and Screenings across Major Indian Cities.
"""
from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models import Cinema, Screen, Seat, Movie, Screening, ScreeningPrice

CINEMAS_TO_ADD = [
    {
        "name": "CinePulse Inorbit Cyberabad",
        "city": "Hyderabad",
        "address": "Inorbit Mall, Mindspace Madhapur, Hitec City",
        "contact_details": "+91-40-44880000",
        "screens": [
            {"name": "Audi 1 - IMAX Laser", "type": "IMAX 3D", "cap": 40},
            {"name": "Audi 2 - 4DX Dynamic", "type": "4DX", "cap": 32},
            {"name": "Audi 3 - Dolby Atmos Premier", "type": "Dolby Atmos", "cap": 36}
        ]
    },
    {
        "name": "CinePulse Express Avenue",
        "city": "Chennai",
        "address": "Express Avenue Mall, Royapettah, Mount Road",
        "contact_details": "+91-44-28464646",
        "screens": [
            {"name": "Audi 1 - IMAX 3D Giant", "type": "IMAX 3D", "cap": 40},
            {"name": "Audi 2 - Dolby Atmos", "type": "Dolby Atmos", "cap": 36}
        ]
    },
    {
        "name": "CinePulse Quest Mall",
        "city": "Kolkata",
        "address": "33 Syed Amir Ali Avenue, Park Circus",
        "contact_details": "+91-33-22877000",
        "screens": [
            {"name": "Audi 1 - IMAX Laser", "type": "IMAX 3D", "cap": 40},
            {"name": "Audi 2 - Dolby Premier", "type": "Dolby Atmos", "cap": 36}
        ]
    },
    {
        "name": "CinePulse Phoenix Marketcity",
        "city": "Pune",
        "address": "Viman Nagar, Nagar Road",
        "contact_details": "+91-20-66890000",
        "screens": [
            {"name": "Audi 1 - 4DX Dynamic", "type": "4DX", "cap": 32},
            {"name": "Audi 2 - Gold Class Luxury", "type": "Gold Class", "cap": 24}
        ]
    },
    {
        "name": "CinePulse Nexus Ahmedabad One",
        "city": "Ahmedabad",
        "address": "Vastrapur, Near Alpha One Lake",
        "contact_details": "+91-79-40003000",
        "screens": [
            {"name": "Audi 1 - IMAX 3D", "type": "IMAX 3D", "cap": 40},
            {"name": "Audi 2 - Dolby Atmos", "type": "Dolby Atmos", "cap": 36}
        ]
    },
    {
        "name": "CinePulse Elante Mall",
        "city": "Chandigarh",
        "address": "178-178A Industrial Area Phase 1",
        "contact_details": "+91-172-5005000",
        "screens": [
            {"name": "Audi 1 - IMAX 3D", "type": "IMAX 3D", "cap": 40},
            {"name": "Audi 2 - 4DX Dynamic", "type": "4DX", "cap": 32}
        ]
    },
    {
        "name": "CinePulse LuLu International Mall",
        "city": "Kochi",
        "address": "34/1000 N.H 47, Edappally",
        "contact_details": "+91-484-2727777",
        "screens": [
            {"name": "Audi 1 - IMAX 3D", "type": "IMAX 3D", "cap": 40},
            {"name": "Audi 2 - Dolby Atmos", "type": "Dolby Atmos", "cap": 36}
        ]
    },
    {
        "name": "CinePulse World Trade Park",
        "city": "Jaipur",
        "address": "Jawahar Lal Nehru Marg, Malviya Nagar",
        "contact_details": "+91-141-2729000",
        "screens": [
            {"name": "Audi 1 - IMAX Laser", "type": "IMAX 3D", "cap": 40},
            {"name": "Audi 2 - Dolby Atmos", "type": "Dolby Atmos", "cap": 36}
        ]
    },
    {
        "name": "CinePulse Phoenix Palassio",
        "city": "Lucknow",
        "address": "Sector 7, Amar Shaheed Path, Gomti Nagar Extension",
        "contact_details": "+91-522-6789000",
        "screens": [
            {"name": "Audi 1 - IMAX Laser", "type": "IMAX 3D", "cap": 40},
            {"name": "Audi 2 - Gold Class Luxury", "type": "Gold Class", "cap": 24}
        ]
    },
    {
        "name": "CinePulse Phoenix Citadel",
        "city": "Indore",
        "address": "MR 10 Road, Jhalaria",
        "contact_details": "+91-731-4001000",
        "screens": [
            {"name": "Audi 1 - IMAX 3D", "type": "IMAX 3D", "cap": 40},
            {"name": "Audi 2 - Dolby Atmos", "type": "Dolby Atmos", "cap": 36}
        ]
    },
    {
        "name": "CinePulse CMR Central",
        "city": "Visakhapatnam",
        "address": "Maddilapalem, NH 16",
        "contact_details": "+91-891-2555555",
        "screens": [
            {"name": "Audi 1 - IMAX Laser", "type": "IMAX 3D", "cap": 40},
            {"name": "Audi 2 - Dolby Atmos", "type": "Dolby Atmos", "cap": 36}
        ]
    },
    {
        "name": "CinePulse Mall de Goa",
        "city": "Goa",
        "address": "NH 17, Alto Porvorim, Panaji",
        "contact_details": "+91-832-2415000",
        "screens": [
            {"name": "Audi 1 - IMAX 3D", "type": "IMAX 3D", "cap": 40},
            {"name": "Audi 2 - Gold Class", "type": "Gold Class", "cap": 24}
        ]
    },
    {
        "name": "CinePulse VR Surat",
        "city": "Surat",
        "address": "Dumas Road, Magdalla",
        "contact_details": "+91-261-3989000",
        "screens": [
            {"name": "Audi 1 - IMAX Laser", "type": "IMAX 3D", "cap": 40},
            {"name": "Audi 2 - Dolby Atmos", "type": "Dolby Atmos", "cap": 36}
        ]
    },
    {
        "name": "CinePulse DB City Mall",
        "city": "Bhopal",
        "address": "Arera Hills, MP Nagar Zone 1",
        "contact_details": "+91-755-6668000",
        "screens": [
            {"name": "Audi 1 - Dolby Premier", "type": "Dolby Atmos", "cap": 36},
            {"name": "Audi 2 - Standard Cine", "type": "Standard", "cap": 36}
        ]
    },
    {
        "name": "CinePulse City Centre",
        "city": "Patna",
        "address": "Lodipur, Frazer Road",
        "contact_details": "+91-612-2200000",
        "screens": [
            {"name": "Audi 1 - Dolby Atmos", "type": "Dolby Atmos", "cap": 36},
            {"name": "Audi 2 - Standard Cine", "type": "Standard", "cap": 36}
        ]
    },
    {
        "name": "CinePulse Esplanade One",
        "city": "Bhubaneswar",
        "address": "Rasulgarh, Cuttack Road",
        "contact_details": "+91-674-6661000",
        "screens": [
            {"name": "Audi 1 - Dolby Atmos", "type": "Dolby Atmos", "cap": 36},
            {"name": "Audi 2 - Standard Cine", "type": "Standard", "cap": 36}
        ]
    },
    {
        "name": "CinePulse City Centre GS Road",
        "city": "Guwahati",
        "address": "GS Road, Christian Basti",
        "contact_details": "+91-361-2345000",
        "screens": [
            {"name": "Audi 1 - IMAX 3D", "type": "IMAX 3D", "cap": 40},
            {"name": "Audi 2 - Dolby Atmos", "type": "Dolby Atmos", "cap": 36}
        ]
    },
    {
        "name": "CinePulse Mall of Dehradun",
        "city": "Dehradun",
        "address": "Haridwar Bypass Road, Mohkampur",
        "contact_details": "+91-135-2678000",
        "screens": [
            {"name": "Audi 1 - IMAX Laser", "type": "IMAX 3D", "cap": 40},
            {"name": "Audi 2 - Standard Cine", "type": "Standard", "cap": 36}
        ]
    },
    {
        "name": "CinePulse Mall of Amritsar",
        "city": "Amritsar",
        "address": "MBN Grand Trunk Road, Near Celebration Mall",
        "contact_details": "+91-183-5002000",
        "screens": [
            {"name": "Audi 1 - IMAX 3D", "type": "IMAX 3D", "cap": 40},
            {"name": "Audi 2 - Dolby Atmos", "type": "Dolby Atmos", "cap": 36}
        ]
    },
    {
        "name": "CinePulse Prozone Mall",
        "city": "Coimbatore",
        "address": "Sathy Road, Saravanampatti",
        "contact_details": "+91-422-6628000",
        "screens": [
            {"name": "Audi 1 - IMAX Laser", "type": "IMAX 3D", "cap": 40},
            {"name": "Audi 2 - Dolby Atmos", "type": "Dolby Atmos", "cap": 36}
        ]
    },
    {
        "name": "CinePulse PVP Square",
        "city": "Vijayawada",
        "address": "MG Road, Acharya Ranga Nagar",
        "contact_details": "+91-866-2489000",
        "screens": [
            {"name": "Audi 1 - IMAX Laser", "type": "IMAX 3D", "cap": 40},
            {"name": "Audi 2 - Dolby Atmos", "type": "Dolby Atmos", "cap": 36}
        ]
    },
    {
        "name": "CinePulse Nexus Centre City",
        "city": "Mysuru (Mysore)",
        "address": "Hyder Ali Road, Nazarbad",
        "contact_details": "+91-821-2445000",
        "screens": [
            {"name": "Audi 1 - Dolby Atmos", "type": "Dolby Atmos", "cap": 36},
            {"name": "Audi 2 - Standard Cine", "type": "Standard", "cap": 36}
        ]
    },
    {
        "name": "CinePulse Empress Mall",
        "city": "Nagpur",
        "address": "Near Gandhi Sagar Lake, Empress City",
        "contact_details": "+91-712-6635000",
        "screens": [
            {"name": "Audi 1 - IMAX Laser", "type": "IMAX 3D", "cap": 40},
            {"name": "Audi 2 - Dolby Atmos", "type": "Dolby Atmos", "cap": 36}
        ]
    },
    {
        "name": "CinePulse JHV Mall",
        "city": "Varanasi",
        "address": "Varanasi Cantt, The Mall Road",
        "contact_details": "+91-542-2500000",
        "screens": [
            {"name": "Audi 1 - Dolby Atmos", "type": "Dolby Atmos", "cap": 36},
            {"name": "Audi 2 - Standard Cine", "type": "Standard", "cap": 36}
        ]
    }
]

def seed_india_cinemas():
    db: Session = SessionLocal()
    try:
        now = datetime.utcnow()
        all_movies = db.query(Movie).filter(Movie.is_active == True).all()
        now_showing_movies = [m for m in all_movies if m.release_date <= now]
        if not now_showing_movies:
            now_showing_movies = all_movies[:10]

        created_cinemas = 0
        created_screens = 0
        created_screenings = 0

        for cin_data in CINEMAS_TO_ADD:
            existing = db.query(Cinema).filter(Cinema.name == cin_data["name"]).first()
            if existing:
                continue

            cinema = Cinema(
                name=cin_data["name"],
                city=cin_data["city"],
                address=cin_data["address"],
                contact_details=cin_data["contact_details"],
                is_active=True
            )
            db.add(cinema)
            db.flush()
            created_cinemas += 1

            for sc_info in cin_data["screens"]:
                screen = Screen(
                    cinema_id=cinema.cinema_id,
                    screen_name=sc_info["name"],
                    screen_type=sc_info["type"],
                    capacity=sc_info["cap"],
                    is_active=True
                )
                db.add(screen)
                db.flush()
                created_screens += 1

                # Add seats
                rows = [('A', 'Regular'), ('B', 'Regular'), ('C', 'Premium'), ('D', 'Premium'), ('E', 'Recliner')]
                for r_label, r_cat in rows:
                    for num in range(1, 9):
                        db.add(Seat(
                            screen_id=screen.screen_id,
                            row_label=r_label,
                            seat_number=num,
                            seat_category=r_cat,
                            is_active=True
                        ))
                db.flush()

                # Schedule 3 screenings (today, tomorrow, day after)
                for day_offset in range(3):
                    date_val = now + timedelta(days=day_offset)
                    for start_hr, start_min in [(11, 0), (15, 30), (19, 45)]:
                        st = datetime(date_val.year, date_val.month, date_val.day, start_hr, start_min)
                        if st < now:
                            continue
                        
                        movie = random.choice(now_showing_movies)
                        et = st + timedelta(minutes=movie.duration + 20)

                        scr = Screening(
                            movie_id=movie.movie_id,
                            screen_id=screen.screen_id,
                            start_time=st,
                            end_time=et,
                            status="Scheduled"
                        )
                        db.add(scr)
                        db.flush()
                        created_screenings += 1

                        base_price = 250 if sc_info["type"] == "Standard" else 350 if sc_info["type"] == "Dolby Atmos" else 450
                        db.add(ScreeningPrice(screening_id=scr.screening_id, seat_category="Regular", ticket_price=base_price))
                        db.add(ScreeningPrice(screening_id=scr.screening_id, seat_category="Premium", ticket_price=base_price + 150))
                        db.add(ScreeningPrice(screening_id=scr.screening_id, seat_category="Recliner", ticket_price=base_price + 350))

        db.commit()
        print(f"Successfully seeded {created_cinemas} Cinemas, {created_screens} Screens, and {created_screenings} Screenings across India!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding India cinemas: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_india_cinemas()
