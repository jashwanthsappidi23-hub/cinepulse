import logging
from datetime import datetime, timedelta
import os
from sqlalchemy import create_engine, text, event
from sqlalchemy.orm import sessionmaker
from backend.config import MYSQL_URL, SQLITE_URL, DATABASE_URL
from backend.models import (
    Base, User, Cinema, Screen, Seat, Movie, Screening, ScreeningPrice,
    Booking, BookedSeat, Ticket, ConcessionItem, ConcessionOrder,
    ConcessionOrderItem, Payment, Cancellation, Refund, SeatLock, AuditLog
)

logger = logging.getLogger("cinema_db")
logging.basicConfig(level=logging.INFO)

# Determine Engine
engine = None
active_db_type = "sqlite"

def get_engine():
    global engine, active_db_type
    if engine is not None:
        return engine

    # If user explicitly set DATABASE_URL, try it first
    if DATABASE_URL:
        try:
            logger.info(f"Attempting connection to specified DATABASE_URL: {DATABASE_URL}")
            test_engine = create_engine(DATABASE_URL, pool_pre_ping=True)
            with test_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            engine = test_engine
            active_db_type = "mysql" if "mysql" in DATABASE_URL else "postgres" if "postgres" in DATABASE_URL else "sqlite"
            logger.info(f"Successfully connected to {active_db_type.upper()}")
            return engine
        except Exception as e:
            logger.warning(f"Failed to connect to DATABASE_URL: {e}. Falling back...")

    # Next attempt default MySQL
    try:
        logger.info(f"Attempting connection to MySQL: {MYSQL_URL}")
        test_engine = create_engine(MYSQL_URL, pool_pre_ping=True, pool_recycle=3600)
        with test_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        engine = test_engine
        active_db_type = "mysql"
        logger.info("Successfully connected to MySQL database!")
        return engine
    except Exception as e:
        logger.info(f"MySQL unavailable ({e}). Falling back to SQLite database ({SQLITE_URL}).")
        # SQLite fallback
        sqlite_engine = create_engine(
            SQLITE_URL, 
            connect_args={"check_same_thread": False}
        )
        # Enable foreign key support in SQLite
        @event.listens_for(sqlite_engine, "connect")
        def set_sqlite_pragma(dbapi_connection, connection_record):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

        engine = sqlite_engine
        active_db_type = "sqlite"
        logger.info("Initialized local SQLite relational database engine.")
        return engine

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initializes tables and seeds data if empty"""
    logger.info("Verifying and creating relational database tables...")
    Base.metadata.create_all(bind=engine)
    
    # Check if seed data exists
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count == 0:
            logger.info("Database is empty. Populating comprehensive seed data...")
            seed_database(db)
            logger.info("Seed data loaded successfully!")
        else:
            logger.info(f"Database contains {user_count} users. Seed already applied.")

        # Ensure Indian cinemas are seeded
        cinema_count = db.query(Cinema).count()
        if cinema_count < 10:
            logger.info("Seeding Indian cinemas across metros and states...")
            try:
                from backend.seed_cinemas_india import seed_india_cinemas
                seed_india_cinemas()
            except Exception as ex:
                logger.warning(f"Could not seed additional Indian cinemas: {ex}")

        # Ensure 100+ and recent movies are seeded
        movie_count = db.query(Movie).count()
        if movie_count < 100:
            logger.info("Seeding 100+ and recent blockbuster movies...")
            try:
                from backend.seed_100_movies import seed_100_movies
                from backend.seed_recent_movies import seed_recent_movies
                seed_100_movies()
                seed_recent_movies()
            except Exception as ex:
                logger.warning(f"Could not seed additional movies: {ex}")
    except Exception as e:
        logger.error(f"Error initializing/seeding database: {e}")
        db.rollback()
    finally:
        db.close()

def seed_database(db):
    """Programmatically seeds the database adhering to schema relationships"""
    # 1. Users (password123 hash)
    pwd_hash = "$2b$12$4Nx2vgnaOAMdNJr/sGDb3.gkTCz.QPoNWTpKBKK7IKXpaPC9zwIvu"
    
    users = [
        User(name="System Administrator", email="admin@gmail.com", password_hash=pwd_hash, phone="+91-9820011223", role="admin"),
        User(name="System Administrator (Backup)", email="admin@cinepulse.com", password_hash=pwd_hash, phone="+91-9820011224", role="admin"),
        User(name="Rajesh Sharma (Cinema Manager)", email="manager@gmail.com", password_hash=pwd_hash, phone="+91-9820044556", role="manager"),
        User(name="Rajesh Sharma (Mumbai Manager)", email="manager.mumbai@cinepulse.com", password_hash=pwd_hash, phone="+91-9820044557", role="manager"),
        User(name="Kavita Nair (Bengaluru Manager)", email="manager.bengaluru@cinepulse.com", password_hash=pwd_hash, phone="+91-9880011223", role="manager"),
        User(name="Sahasra Reddy (Customer)", email="customer@gmail.com", password_hash=pwd_hash, phone="+91-9988776655", role="customer"),
        User(name="Aarav Mehta", email="aarav@gmail.com", password_hash=pwd_hash, phone="+91-9123456780", role="customer"),
        User(name="Diya Patel", email="diya@gmail.com", password_hash=pwd_hash, phone="+91-9123456781", role="customer"),
        User(name="Rohit Verma", email="rohit@gmail.com", password_hash=pwd_hash, phone="+91-9123456782", role="customer"),
        User(name="Priya Iyer", email="priya@gmail.com", password_hash=pwd_hash, phone="+91-9123456783", role="customer"),
        User(name="Vikram Malhotra", email="vikram@gmail.com", password_hash=pwd_hash, phone="+91-9123456784", role="customer"),
        User(name="Ananya Sengupta", email="ananya@gmail.com", password_hash=pwd_hash, phone="+91-9123456785", role="customer"),
        User(name="Karan Singhania", email="karan@gmail.com", password_hash=pwd_hash, phone="+91-9123456786", role="customer"),
        User(name="Sneha Joshi", email="sneha@gmail.com", password_hash=pwd_hash, phone="+91-9123456787", role="customer"),
        User(name="Arjun Kapoor", email="arjun@gmail.com", password_hash=pwd_hash, phone="+91-9123456788", role="customer"),
        User(name="Pooja Hegde", email="pooja@gmail.com", password_hash=pwd_hash, phone="+91-9123456789", role="customer"),
        User(name="Rahul Deshmukh", email="rahul@gmail.com", password_hash=pwd_hash, phone="+91-9123456790", role="customer"),
        User(name="Neha Bansal", email="neha@gmail.com", password_hash=pwd_hash, phone="+91-9123456791", role="customer"),
        User(name="Siddharth Rao", email="siddharth@gmail.com", password_hash=pwd_hash, phone="+91-9123456792", role="customer"),
        User(name="Meera Nambiar", email="meera@gmail.com", password_hash=pwd_hash, phone="+91-9123456793", role="customer")
    ]
    db.add_all(users)
    db.flush()

    # 2. Cinemas
    cinemas = [
        Cinema(name="CinePulse Phoenix Palladium", address="462 Senapati Bapat Marg, Lower Parel", city="Mumbai", contact_details="+91-22-66100000"),
        Cinema(name="CinePulse Forum IMAX", address="Hosur Road, Koramangala 7th Block", city="Bengaluru", contact_details="+91-80-25537000"),
        Cinema(name="CinePulse Select Citywalk", address="A-3 District Centre, Saket", city="New Delhi", contact_details="+91-11-42114200")
    ]
    db.add_all(cinemas)
    db.flush()

    # 3. Screens
    screens = [
        Screen(cinema_id=cinemas[0].cinema_id, screen_name="Audi 1 - IMAX Laser", screen_type="IMAX 3D", capacity=40),
        Screen(cinema_id=cinemas[0].cinema_id, screen_name="Audi 2 - Dolby Atmos", screen_type="Dolby Atmos", capacity=36),
        Screen(cinema_id=cinemas[0].cinema_id, screen_name="Audi 3 - Gold Class Luxury", screen_type="Gold Class", capacity=24),
        Screen(cinema_id=cinemas[1].cinema_id, screen_name="Audi 1 - IMAX Giant", screen_type="IMAX 3D", capacity=40),
        Screen(cinema_id=cinemas[1].cinema_id, screen_name="Audi 2 - 4DX Dynamic", screen_type="4DX", capacity=32),
        Screen(cinema_id=cinemas[2].cinema_id, screen_name="Audi 1 - Dolby Premier", screen_type="Dolby Atmos", capacity=36),
        Screen(cinema_id=cinemas[2].cinema_id, screen_name="Audi 2 - Standard Cine", screen_type="Standard", capacity=36),
    ]
    db.add_all(screens)
    db.flush()

    # 4. Seats for screens
    seats = []
    # Screen 1 (40 seats): Rows A, B, C Regular (8 each = 24), D Premium (8), E Recliner (8)
    for row, cat in [('A', 'Regular'), ('B', 'Regular'), ('C', 'Regular'), ('D', 'Premium'), ('E', 'Recliner')]:
        for num in range(1, 9):
            seats.append(Seat(screen_id=screens[0].screen_id, row_label=row, seat_number=num, seat_category=cat))

    # Screen 2 (36 seats): Rows A, B Regular (6 each), C, D, E Premium (6 each), F Recliner (6)
    for row, cat in [('A', 'Regular'), ('B', 'Regular'), ('C', 'Premium'), ('D', 'Premium'), ('E', 'Premium'), ('F', 'Recliner')]:
        for num in range(1, 7):
            seats.append(Seat(screen_id=screens[1].screen_id, row_label=row, seat_number=num, seat_category=cat))

    # Screen 3 (Gold Class - 24 seats: A, B Premium (6 each), C, D Recliner (6 each))
    for row, cat in [('A', 'Premium'), ('B', 'Premium'), ('C', 'Recliner'), ('D', 'Recliner')]:
        for num in range(1, 7):
            seats.append(Seat(screen_id=screens[2].screen_id, row_label=row, seat_number=num, seat_category=cat))

    # Screen 4 (40 seats)
    for row, cat in [('A', 'Regular'), ('B', 'Regular'), ('C', 'Regular'), ('D', 'Premium'), ('E', 'Recliner')]:
        for num in range(1, 9):
            seats.append(Seat(screen_id=screens[3].screen_id, row_label=row, seat_number=num, seat_category=cat))

    # Screen 5 (32 seats)
    for row, cat in [('A', 'Regular'), ('B', 'Regular'), ('C', 'Premium'), ('D', 'Recliner')]:
        for num in range(1, 9):
            seats.append(Seat(screen_id=screens[4].screen_id, row_label=row, seat_number=num, seat_category=cat))

    # Screens 6 & 7 (36 seats each)
    for sc in [screens[5], screens[6]]:
        for row, cat in [('A', 'Regular'), ('B', 'Regular'), ('C', 'Premium'), ('D', 'Premium'), ('E', 'Recliner')]:
            seats.extend([
                Seat(screen_id=sc.screen_id, row_label=row, seat_number=num, seat_category=cat)
                for num in range(1, 7 if row != 'E' else 13) # total ~36
            ][:6 if row != 'E' else 12])

    db.add_all(seats)
    db.flush()

    # 5. Movies
    movies_data = [
        ("Kalki 2898 AD", "A modern avatar of Vishnu descends to Earth in a dystopian post-apocalyptic future to protect the world from dark totalitarian forces.", "Sci-Fi / Action", "Hindi", 181, "U/A", "2024-06-27", "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80", "https://www.youtube.com/watch?v=kQDd1AhGIHk"),
        ("Oppenheimer", "The gripping story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.", "Biography / Drama", "English", 180, "A", "2023-07-21", "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80", "https://www.youtube.com/watch?v=uYPbbksJxIg"),
        ("Dune: Part Two", "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.", "Sci-Fi / Adventure", "English", 166, "U/A", "2024-03-01", "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80", "https://www.youtube.com/watch?v=Way9Dexny3w"),
        ("Jawan", "A high-octane action thriller outlining the emotional journey of a man who is set out to rectify the wrongs in the society.", "Action / Thriller", "Hindi", 169, "U/A", "2023-09-07", "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80", "https://www.youtube.com/watch?v=COv52Qyctws"),
        ("Interstellar", "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked with piloting a spacecraft to find a new planet for humans.", "Sci-Fi / Drama", "English", 169, "U/A", "2014-11-07", "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80", "https://www.youtube.com/watch?v=zSWdZVtXT7E"),
        ("Animal", "A complex relationship between a father and son leads the son to embark on a violent journey of vengeance and bloodshed.", "Action / Crime", "Hindi", 201, "A", "2023-12-01", "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80", "https://www.youtube.com/watch?v=Dydmpfo68DA"),
        ("Spider-Man: Across the Spider-Verse", "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.", "Animation / Action", "English", 140, "U", "2023-06-02", "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80", "https://www.youtube.com/watch?v=cqGjhVJWtEg"),
        ("RRR", "A fearless warrior on a perilous mission comes face to face with a steely cop serving British forces in pre-independent India.", "Action / Drama", "Telugu", 182, "U/A", "2022-03-25", "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80", "https://www.youtube.com/watch?v=NgBoMJy386M"),
        ("Inception", "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.", "Sci-Fi / Thriller", "English", 148, "U/A", "2010-07-16", "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=600&q=80", "https://www.youtube.com/watch?v=YoHD9XEInc0"),
        ("Stree 2: Sarkate Ka Aatank", "The legend of Chanderi returns as a headless monster terrorizes the women of the town, forcing the quirky gang to unite once more.", "Horror / Comedy", "Hindi", 149, "U/A", "2024-08-15", "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=600&q=80", "https://www.youtube.com/watch?v=KVnhe_L8OqA"),
        ("Fighter", "Top Indian Air Force aviators come together in the face of imminent danger to form the Air Dragons, fighting for national honor.", "Action / Aerial", "Hindi", 166, "U/A", "2024-01-25", "https://images.unsplash.com/photo-1519074069444-1ba4ea16e6f1?auto=format&fit=crop&w=600&q=80", "https://www.youtube.com/watch?v=6amIq_mP4xM"),
        ("Leo: Bloody Sweet", "A mild-mannered cafe owner in Himachal Pradesh becomes a local hero, attracting the attention of a drug cartel.", "Action / Thriller", "Tamil", 164, "U/A", "2023-10-19", "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80", "https://www.youtube.com/watch?v=Po3jVh_yRxU")
    ]
    movies = [
        Movie(title=t, description=d, genre=g, language=l, duration=dur, rating=rat,
              release_date=datetime.strptime(rel, "%Y-%m-%d"), poster_url=p, trailer_url=tr)
        for t, d, g, l, dur, rat, rel, p, tr in movies_data
    ]
    db.add_all(movies)
    db.flush()

    # 6. Screenings (30+ Screenings across dates)
    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")
    tomorrow_str = (now + timedelta(days=1)).strftime("%Y-%m-%d")
    day_after_str = (now + timedelta(days=2)).strftime("%Y-%m-%d")
    yesterday_str = (now - timedelta(days=1)).strftime("%Y-%m-%d")

    screenings_info = [
        # Today
        (movies[0].movie_id, screens[0].screen_id, f"{today_str} 10:00:00", f"{today_str} 13:15:00", "Scheduled", 350, 550, 850),
        (movies[0].movie_id, screens[0].screen_id, f"{today_str} 14:00:00", f"{today_str} 17:15:00", "Scheduled", 380, 580, 900),
        (movies[0].movie_id, screens[0].screen_id, f"{today_str} 18:30:00", f"{today_str} 21:45:00", "Scheduled", 420, 650, 980),
        (movies[2].movie_id, screens[0].screen_id, f"{today_str} 22:30:00", f"{tomorrow_str} 01:25:00", "Scheduled", 320, 500, 750),
        
        (movies[1].movie_id, screens[1].screen_id, f"{today_str} 11:00:00", f"{today_str} 14:15:00", "Scheduled", 280, 420, 650),
        (movies[1].movie_id, screens[1].screen_id, f"{today_str} 15:00:00", f"{today_str} 18:15:00", "Scheduled", 300, 450, 700),
        (movies[3].movie_id, screens[1].screen_id, f"{today_str} 19:00:00", f"{today_str} 22:00:00", "Scheduled", 320, 480, 750),

        (movies[4].movie_id, screens[2].screen_id, f"{today_str} 12:00:00", f"{today_str} 15:00:00", "Scheduled", 400, 600, 900),
        (movies[5].movie_id, screens[2].screen_id, f"{today_str} 16:00:00", f"{today_str} 19:35:00", "Scheduled", 450, 650, 950),
        (movies[8].movie_id, screens[2].screen_id, f"{today_str} 20:30:00", f"{today_str} 23:15:00", "Scheduled", 450, 650, 950),

        (movies[0].movie_id, screens[3].screen_id, f"{today_str} 10:30:00", f"{today_str} 13:45:00", "Scheduled", 350, 550, 850),
        (movies[2].movie_id, screens[3].screen_id, f"{today_str} 14:30:00", f"{today_str} 17:30:00", "Scheduled", 380, 580, 890),
        (movies[1].movie_id, screens[3].screen_id, f"{today_str} 18:15:00", f"{today_str} 21:30:00", "Scheduled", 400, 620, 920),

        (movies[6].movie_id, screens[4].screen_id, f"{today_str} 11:30:00", f"{today_str} 14:00:00", "Scheduled", 300, 480, 720),
        (movies[7].movie_id, screens[4].screen_id, f"{today_str} 15:00:00", f"{today_str} 18:15:00", "Scheduled", 320, 500, 750),
        (movies[9].movie_id, screens[4].screen_id, f"{today_str} 19:30:00", f"{today_str} 22:15:00", "Scheduled", 320, 500, 750),

        (movies[0].movie_id, screens[5].screen_id, f"{today_str} 10:00:00", f"{today_str} 13:15:00", "Scheduled", 300, 450, 680),
        (movies[3].movie_id, screens[5].screen_id, f"{today_str} 14:00:00", f"{today_str} 17:00:00", "Scheduled", 320, 480, 720),
        (movies[10].movie_id, screens[5].screen_id, f"{today_str} 18:00:00", f"{today_str} 21:00:00", "Scheduled", 350, 500, 750),

        (movies[11].movie_id, screens[6].screen_id, f"{today_str} 12:00:00", f"{today_str} 15:00:00", "Scheduled", 260, 380, 580),
        (movies[9].movie_id, screens[6].screen_id, f"{today_str} 16:30:00", f"{today_str} 19:15:00", "Scheduled", 280, 400, 620),
        (movies[5].movie_id, screens[6].screen_id, f"{today_str} 20:00:00", f"{today_str} 23:30:00", "Scheduled", 300, 440, 660),

        # Tomorrow
        (movies[0].movie_id, screens[0].screen_id, f"{tomorrow_str} 10:00:00", f"{tomorrow_str} 13:15:00", "Scheduled", 350, 550, 850),
        (movies[2].movie_id, screens[0].screen_id, f"{tomorrow_str} 14:00:00", f"{tomorrow_str} 17:00:00", "Scheduled", 380, 580, 890),
        (movies[1].movie_id, screens[1].screen_id, f"{tomorrow_str} 15:00:00", f"{tomorrow_str} 18:15:00", "Scheduled", 300, 450, 700),
        (movies[3].movie_id, screens[1].screen_id, f"{tomorrow_str} 19:00:00", f"{tomorrow_str} 22:00:00", "Scheduled", 320, 480, 750),
        (movies[6].movie_id, screens[4].screen_id, f"{tomorrow_str} 11:00:00", f"{tomorrow_str} 13:30:00", "Scheduled", 300, 480, 720),

        # Yesterday (Completed for reports)
        (movies[0].movie_id, screens[0].screen_id, f"{yesterday_str} 18:00:00", f"{yesterday_str} 21:15:00", "Completed", 400, 600, 900),
        (movies[1].movie_id, screens[1].screen_id, f"{yesterday_str} 19:00:00", f"{yesterday_str} 22:15:00", "Completed", 300, 450, 700),
        (movies[3].movie_id, screens[5].screen_id, f"{yesterday_str} 18:00:00", f"{yesterday_str} 21:00:00", "Completed", 320, 480, 720),
        (movies[2].movie_id, screens[3].screen_id, f"{yesterday_str} 14:00:00", f"{yesterday_str} 17:00:00", "Completed", 380, 580, 890),
    ]

    screenings = []
    prices = []
    for m_id, s_id, st, et, status, reg_p, prem_p, rec_p in screenings_info:
        scr = Screening(
            movie_id=m_id, screen_id=s_id,
            start_time=datetime.strptime(st, "%Y-%m-%d %H:%M:%S"),
            end_time=datetime.strptime(et, "%Y-%m-%d %H:%M:%S"),
            status=status
        )
        screenings.append(scr)
    db.add_all(screenings)
    db.flush()

    for idx, (m_id, s_id, st, et, status, reg_p, prem_p, rec_p) in enumerate(screenings_info):
        scr_id = screenings[idx].screening_id
        prices.append(ScreeningPrice(screening_id=scr_id, seat_category="Regular", ticket_price=reg_p))
        prices.append(ScreeningPrice(screening_id=scr_id, seat_category="Premium", ticket_price=prem_p))
        prices.append(ScreeningPrice(screening_id=scr_id, seat_category="Recliner", ticket_price=rec_p))

    db.add_all(prices)
    db.flush()

    # 7. Concessions
    concessions_data = [
        ("Large Caramel Popcorn (Tub)", "Snacks", 320.00, 150, "https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=300&q=80"),
        ("Classic Salted Popcorn (Regular)", "Snacks", 240.00, 200, "https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=300&q=80"),
        ("Cheese Burst Nachos with Salsa", "Snacks", 290.00, 120, "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=300&q=80"),
        ("Crispy Chicken Nuggets (8 Pcs)", "Snacks", 310.00, 95, "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=300&q=80"),
        ("Coca-Cola Zero Sugar (750ml)", "Beverages", 180.00, 250, "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=300&q=80"),
        ("Fresh Lemon Mint Mojito", "Beverages", 220.00, 110, "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=300&q=80"),
        ("Hazelnut Iced Frappe", "Beverages", 260.00, 80, "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=300&q=80"),
        ("Blockbuster Couple Combo", "Combos", 690.00, 75, "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=300&q=80"),
        ("Solo Movie Fanatic Combo", "Combos", 460.00, 90, "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=300&q=80"),
        ("Warm Belgian Chocolate Brownie", "Dessert", 230.00, 65, "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=300&q=80")
    ]
    concessions = [
        ConcessionItem(item_name=n, category=c, price=p, stock_quantity=sq, image_url=img)
        for n, c, p, sq, img in concessions_data
    ]
    db.add_all(concessions)
    db.flush()

    # 8. Sample Bookings, Seats, Tickets, Payments
    # Booking 1: Customer (id 4) books 2 seats in screening 3 (evening Kalki)
    b1 = Booking(user_id=users[3].user_id, screening_id=screenings[2].screening_id,
                 booking_reference="BK-CNP-20261012-001", status="Confirmed", total_amount=1240.00)
    # Booking 2: Customer (id 5) books 2 seats in screening 3
    b2 = Booking(user_id=users[4].user_id, screening_id=screenings[2].screening_id,
                 booking_reference="BK-CNP-20261012-002", status="Confirmed", total_amount=840.00)
    # Booking 3: Customer (id 6) books 2 seats in screening 2
    b3 = Booking(user_id=users[5].user_id, screening_id=screenings[1].screening_id,
                 booking_reference="BK-CNP-20261012-003", status="Confirmed", total_amount=1540.00)
    # Booking 4: Customer (id 7) booked and cancelled screening 1
    b4 = Booking(user_id=users[6].user_id, screening_id=screenings[0].screening_id,
                 booking_reference="BK-CNP-20261012-004", status="Cancelled", total_amount=700.00)
    # Booking 5: Completed past booking in screening 27 (yesterday)
    b5 = Booking(user_id=users[7].user_id, screening_id=screenings[27].screening_id,
                 booking_reference="BK-CNP-20261011-005", status="Completed", total_amount=1800.00)
    
    db.add_all([b1, b2, b3, b4, b5])
    db.flush()

    # Fetch some seats from screen 1 (seats[0], seats[1], etc.)
    scr1_seats = [s for s in seats if s.screen_id == screens[0].screen_id]
    
    bs1 = BookedSeat(booking_id=b1.booking_id, screening_id=screenings[2].screening_id, seat_id=scr1_seats[0].seat_id, ticket_price=420.00, status="Confirmed")
    bs2 = BookedSeat(booking_id=b1.booking_id, screening_id=screenings[2].screening_id, seat_id=scr1_seats[1].seat_id, ticket_price=420.00, status="Confirmed")
    bs3 = BookedSeat(booking_id=b2.booking_id, screening_id=screenings[2].screening_id, seat_id=scr1_seats[2].seat_id, ticket_price=420.00, status="Confirmed")
    bs4 = BookedSeat(booking_id=b2.booking_id, screening_id=screenings[2].screening_id, seat_id=scr1_seats[3].seat_id, ticket_price=420.00, status="Confirmed")
    bs5 = BookedSeat(booking_id=b3.booking_id, screening_id=screenings[1].screening_id, seat_id=scr1_seats[24].seat_id, ticket_price=580.00, status="Confirmed")
    bs6 = BookedSeat(booking_id=b3.booking_id, screening_id=screenings[1].screening_id, seat_id=scr1_seats[25].seat_id, ticket_price=580.00, status="Confirmed")
    bs7 = BookedSeat(booking_id=b4.booking_id, screening_id=screenings[0].screening_id, seat_id=scr1_seats[0].seat_id, ticket_price=350.00, status="Cancelled")
    bs8 = BookedSeat(booking_id=b4.booking_id, screening_id=screenings[0].screening_id, seat_id=scr1_seats[1].seat_id, ticket_price=350.00, status="Cancelled")

    db.add_all([bs1, bs2, bs3, bs4, bs5, bs6, bs7, bs8])
    db.flush()

    # Tickets with QR codes
    t1 = Ticket(booked_seat_id=bs1.booked_seat_id, ticket_code="TCK-20261012-001-A1", qr_verification_token="VTOKEN-892F-A01-CINEPULSE-SECURE", status="Active")
    t2 = Ticket(booked_seat_id=bs2.booked_seat_id, ticket_code="TCK-20261012-001-A2", qr_verification_token="VTOKEN-892F-A02-CINEPULSE-SECURE", status="Active")
    t3 = Ticket(booked_seat_id=bs3.booked_seat_id, ticket_code="TCK-20261012-002-A3", qr_verification_token="VTOKEN-437D-A03-CINEPULSE-SECURE", status="Active")
    t4 = Ticket(booked_seat_id=bs4.booked_seat_id, ticket_code="TCK-20261012-002-A4", qr_verification_token="VTOKEN-437D-A04-CINEPULSE-SECURE", status="Active")
    t5 = Ticket(booked_seat_id=bs5.booked_seat_id, ticket_code="TCK-20261012-003-D1", qr_verification_token="VTOKEN-128E-D01-CINEPULSE-SECURE", status="Active")
    t6 = Ticket(booked_seat_id=bs6.booked_seat_id, ticket_code="TCK-20261012-003-D2", qr_verification_token="VTOKEN-128E-D02-CINEPULSE-SECURE", status="Active")
    t7 = Ticket(booked_seat_id=bs7.booked_seat_id, ticket_code="TCK-20261012-004-A1", qr_verification_token="VTOKEN-771C-A01-CINEPULSE-SECURE", status="Cancelled")
    t8 = Ticket(booked_seat_id=bs8.booked_seat_id, ticket_code="TCK-20261012-004-A2", qr_verification_token="VTOKEN-771C-A02-CINEPULSE-SECURE", status="Cancelled")
    db.add_all([t1, t2, t3, t4, t5, t6, t7, t8])

    # Concession Orders
    co1 = ConcessionOrder(booking_id=b1.booking_id, total_amount=400.00, status="Completed")
    co2 = ConcessionOrder(booking_id=b3.booking_id, total_amount=380.00, status="Completed")
    db.add_all([co1, co2])
    db.flush()

    coi1 = ConcessionOrderItem(order_id=co1.order_id, item_id=concessions[1].item_id, quantity=1, unit_price=240.00, subtotal=240.00)
    coi2 = ConcessionOrderItem(order_id=co1.order_id, item_id=concessions[4].item_id, quantity=1, unit_price=160.00, subtotal=160.00)
    coi3 = ConcessionOrderItem(order_id=co2.order_id, item_id=concessions[7].item_id, quantity=1, unit_price=380.00, subtotal=380.00)
    db.add_all([coi1, coi2, coi3])

    # Payments
    p1 = Payment(booking_id=b1.booking_id, amount=1240.00, payment_method="UPI", transaction_reference="TXN-UPI-CNP-20261012-98401", payment_status="Successful")
    p2 = Payment(booking_id=b2.booking_id, amount=840.00, payment_method="Credit Card", transaction_reference="TXN-CC-CNP-20261012-98402", payment_status="Successful")
    p3 = Payment(booking_id=b3.booking_id, amount=1540.00, payment_method="UPI", transaction_reference="TXN-UPI-CNP-20261012-98403", payment_status="Successful")
    p4 = Payment(booking_id=b4.booking_id, amount=700.00, payment_method="Debit Card", transaction_reference="TXN-DC-CNP-20261012-98404", payment_status="Refunded")
    p5 = Payment(booking_id=b5.booking_id, amount=1800.00, payment_method="Credit Card", transaction_reference="TXN-CC-CNP-20261010-98406", payment_status="Successful")
    db.add_all([p1, p2, p3, p4, p5])
    db.flush()

    # Cancellation & Refund
    canc = Cancellation(booking_id=b4.booking_id, reason="Sudden emergency, unable to attend show", cancellation_status="Approved")
    db.add(canc)
    db.flush()

    ref = Refund(payment_id=p4.payment_id, cancellation_id=canc.cancellation_id, refund_amount=700.00, refund_status="Processed")
    db.add(ref)

    # Seat Locks
    sl1 = SeatLock(screening_id=screenings[0].screening_id, seat_id=scr1_seats[4].seat_id, user_id=users[4].user_id,
                   lock_expiration_time=now - timedelta(minutes=10), lock_status="Expired")
    sl2 = SeatLock(screening_id=screenings[2].screening_id, seat_id=scr1_seats[6].seat_id, user_id=users[5].user_id,
                   lock_expiration_time=now + timedelta(minutes=4), lock_status="Locked")
    db.add_all([sl1, sl2])

    # Audit Logs
    audit1 = AuditLog(user_id=users[0].user_id, action="SYSTEM_INIT", entity_type="Database", entity_id=1, details="CinemaBookingDB initialized with 18 3NF tables and sample data.")
    audit2 = AuditLog(user_id=users[1].user_id, action="CREATE_SCREENING", entity_type="Screening", entity_id=screenings[0].screening_id, details="Scheduled Kalki 2898 AD in Audi 1.")
    audit3 = AuditLog(user_id=users[3].user_id, action="CREATE_BOOKING", entity_type="Booking", entity_id=b1.booking_id, details="Booked 2 seats for screening 3.")
    db.add_all([audit1, audit2, audit3])

    db.commit()
    logger.info("Complete seed data committed to database successfully.")
