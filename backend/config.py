import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
# Can be configured to MySQL via: mysql+pymysql://root:password@localhost:3306/CinemaBookingDB
MYSQL_URL = os.getenv("MYSQL_URL", "mysql+pymysql://root:root@localhost:3306/CinemaBookingDB")
SQLITE_URL = os.getenv("SQLITE_URL", "sqlite:///./CinemaBookingDB.sqlite")
DATABASE_URL = os.getenv("DATABASE_URL", None)

# Authentication & Security
SECRET_KEY = os.getenv("SECRET_KEY", "cinepulse-super-secret-security-token-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

# Business Policy Configurations
SEAT_LOCK_TTL_SECONDS = int(os.getenv("SEAT_LOCK_TTL_SECONDS", "300")) # 5 minutes hold
CLEANING_BUFFER_MINUTES = 20 # Minimum buffer interval between screenings in the same screen
CANCELLATION_MIN_HOURS_BEFORE_SHOW = 2 # Minimum hours before show to allow refund
CONVENIENCE_FEE_PERCENTAGE = 0.05 # 5% service fee
GST_TAX_PERCENTAGE = 0.18 # 18% GST
