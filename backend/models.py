import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Numeric, DateTime, ForeignKey, 
    Enum, UniqueConstraint, CheckConstraint
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class UserRole(str, enum.Enum):
    customer = "customer"
    manager = "manager"
    admin = "admin"

class ScreenType(str, enum.Enum):
    standard = "Standard"
    imax = "IMAX 3D"
    four_dx = "4DX"
    dolby = "Dolby Atmos"
    gold = "Gold Class"

class SeatCategory(str, enum.Enum):
    regular = "Regular"
    premium = "Premium"
    recliner = "Recliner"

class ScreeningStatus(str, enum.Enum):
    scheduled = "Scheduled"
    ongoing = "Ongoing"
    completed = "Completed"
    cancelled = "Cancelled"

class BookingStatus(str, enum.Enum):
    confirmed = "Confirmed"
    pending = "Pending"
    cancelled = "Cancelled"
    completed = "Completed"

class BookedSeatStatus(str, enum.Enum):
    reserved = "Reserved"
    confirmed = "Confirmed"
    cancelled = "Cancelled"

class TicketStatus(str, enum.Enum):
    active = "Active"
    used = "Used"
    cancelled = "Cancelled"

class ConcessionCategory(str, enum.Enum):
    snacks = "Snacks"
    beverages = "Beverages"
    combos = "Combos"
    dessert = "Dessert"

class ConcessionOrderStatus(str, enum.Enum):
    pending = "Pending"
    completed = "Completed"
    cancelled = "Cancelled"

class PaymentMethod(str, enum.Enum):
    credit_card = "Credit Card"
    debit_card = "Debit Card"
    upi = "UPI"
    net_banking = "Net Banking"
    wallet = "Cinema Wallet"

class PaymentStatus(str, enum.Enum):
    successful = "Successful"
    pending = "Pending"
    failed = "Failed"
    refunded = "Refunded"

class CancellationStatus(str, enum.Enum):
    approved = "Approved"
    pending = "Pending"
    rejected = "Rejected"

class RefundStatus(str, enum.Enum):
    processed = "Processed"
    pending = "Pending"
    failed = "Failed"

class LockStatus(str, enum.Enum):
    locked = "Locked"
    expired = "Expired"
    released = "Released"
    converted = "Converted"

# ============================================================================
# 1. Users
# ============================================================================
class User(Base):
    __tablename__ = "Users"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    role = Column(String(20), nullable=False, default=UserRole.customer.value, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    bookings = relationship("Booking", back_populates="user")
    seat_locks = relationship("SeatLock", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")

# ============================================================================
# 2. Cinemas
# ============================================================================
class Cinema(Base):
    __tablename__ = "Cinemas"

    cinema_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    address = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    contact_details = Column(String(100), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    screens = relationship("Screen", back_populates="cinema", cascade="all, delete-orphan")

# ============================================================================
# 3. Screens
# ============================================================================
class Screen(Base):
    __tablename__ = "Screens"

    screen_id = Column(Integer, primary_key=True, autoincrement=True)
    cinema_id = Column(Integer, ForeignKey("Cinemas.cinema_id", ondelete="CASCADE"), nullable=False, index=True)
    screen_name = Column(String(100), nullable=False)
    screen_type = Column(String(50), nullable=False, default="Standard")
    capacity = Column(Integer, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("cinema_id", "screen_name", name="uq_cinema_screen"),
    )

    cinema = relationship("Cinema", back_populates="screens")
    seats = relationship("Seat", back_populates="screen", cascade="all, delete-orphan")
    screenings = relationship("Screening", back_populates="screen", cascade="all, delete-orphan")

# ============================================================================
# 4. Seats
# ============================================================================
class Seat(Base):
    __tablename__ = "Seats"

    seat_id = Column(Integer, primary_key=True, autoincrement=True)
    screen_id = Column(Integer, ForeignKey("Screens.screen_id", ondelete="CASCADE"), nullable=False, index=True)
    row_label = Column(String(5), nullable=False)
    seat_number = Column(Integer, nullable=False)
    seat_category = Column(String(20), nullable=False, default="Regular", index=True)
    is_active = Column(Boolean, nullable=False, default=True)

    __table_args__ = (
        UniqueConstraint("screen_id", "row_label", "seat_number", name="uq_screen_seat"),
    )

    screen = relationship("Screen", back_populates="seats")
    booked_seats = relationship("BookedSeat", back_populates="seat")
    seat_locks = relationship("SeatLock", back_populates="seat")

# ============================================================================
# 5. Movies
# ============================================================================
class Movie(Base):
    __tablename__ = "Movies"

    movie_id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    genre = Column(String(100), nullable=False, index=True)
    language = Column(String(50), nullable=False, index=True)
    duration = Column(Integer, nullable=False) # minutes
    rating = Column(String(10), nullable=False, default="U/A")
    release_date = Column(DateTime, nullable=False)
    poster_url = Column(String(500), nullable=True)
    trailer_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    screenings = relationship("Screening", back_populates="movie", cascade="all, delete-orphan")

# ============================================================================
# 6. Screenings
# ============================================================================
class Screening(Base):
    __tablename__ = "Screenings"

    screening_id = Column(Integer, primary_key=True, autoincrement=True)
    movie_id = Column(Integer, ForeignKey("Movies.movie_id", ondelete="CASCADE"), nullable=False, index=True)
    screen_id = Column(Integer, ForeignKey("Screens.screen_id", ondelete="CASCADE"), nullable=False, index=True)
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False, index=True)
    status = Column(String(20), nullable=False, default="Scheduled")
    created_at = Column(DateTime, default=datetime.utcnow)

    movie = relationship("Movie", back_populates="screenings")
    screen = relationship("Screen", back_populates="screenings")
    prices = relationship("ScreeningPrice", back_populates="screening", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="screening")
    seat_locks = relationship("SeatLock", back_populates="screening")
    booked_seats = relationship("BookedSeat", back_populates="screening")

# ============================================================================
# 7. ScreeningPrices
# ============================================================================
class ScreeningPrice(Base):
    __tablename__ = "ScreeningPrices"

    price_id = Column(Integer, primary_key=True, autoincrement=True)
    screening_id = Column(Integer, ForeignKey("Screenings.screening_id", ondelete="CASCADE"), nullable=False)
    seat_category = Column(String(20), nullable=False)
    ticket_price = Column(Numeric(10, 2), nullable=False)

    __table_args__ = (
        UniqueConstraint("screening_id", "seat_category", name="uq_screening_category"),
    )

    screening = relationship("Screening", back_populates="prices")

# ============================================================================
# 8. Bookings
# ============================================================================
class Booking(Base):
    __tablename__ = "Bookings"

    booking_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("Users.user_id"), nullable=False, index=True)
    screening_id = Column(Integer, ForeignKey("Screenings.screening_id"), nullable=False, index=True)
    booking_reference = Column(String(30), nullable=False, unique=True, index=True)
    booking_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), nullable=False, default="Pending", index=True)
    total_amount = Column(Numeric(10, 2), nullable=False, default=0.00)

    user = relationship("User", back_populates="bookings")
    screening = relationship("Screening", back_populates="bookings")
    booked_seats = relationship("BookedSeat", back_populates="booking", cascade="all, delete-orphan")
    concession_orders = relationship("ConcessionOrder", back_populates="booking", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="booking")
    cancellation = relationship("Cancellation", back_populates="booking", uselist=False, cascade="all, delete-orphan")

# ============================================================================
# 9. BookedSeats
# ============================================================================
class BookedSeat(Base):
    __tablename__ = "BookedSeats"

    booked_seat_id = Column(Integer, primary_key=True, autoincrement=True)
    booking_id = Column(Integer, ForeignKey("Bookings.booking_id", ondelete="CASCADE"), nullable=False)
    screening_id = Column(Integer, ForeignKey("Screenings.screening_id", ondelete="CASCADE"), nullable=False, index=True)
    seat_id = Column(Integer, ForeignKey("Seats.seat_id"), nullable=False, index=True)
    ticket_price = Column(Numeric(10, 2), nullable=False)
    status = Column(String(20), nullable=False, default="Reserved")

    booking = relationship("Booking", back_populates="booked_seats")
    screening = relationship("Screening", back_populates="booked_seats")
    seat = relationship("Seat", back_populates="booked_seats")
    ticket = relationship("Ticket", back_populates="booked_seat", uselist=False, cascade="all, delete-orphan")

# ============================================================================
# 10. Tickets
# ============================================================================
class Ticket(Base):
    __tablename__ = "Tickets"

    ticket_id = Column(Integer, primary_key=True, autoincrement=True)
    booked_seat_id = Column(Integer, ForeignKey("BookedSeats.booked_seat_id", ondelete="CASCADE"), nullable=False, unique=True)
    ticket_code = Column(String(50), nullable=False, unique=True)
    qr_verification_token = Column(String(120), nullable=False, unique=True)
    issue_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), nullable=False, default="Active")

    booked_seat = relationship("BookedSeat", back_populates="ticket")

# ============================================================================
# 11. ConcessionItems
# ============================================================================
class ConcessionItem(Base):
    __tablename__ = "ConcessionItems"

    item_id = Column(Integer, primary_key=True, autoincrement=True)
    item_name = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False, default="Snacks", index=True)
    price = Column(Numeric(10, 2), nullable=False)
    stock_quantity = Column(Integer, nullable=False, default=0)
    image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    order_items = relationship("ConcessionOrderItem", back_populates="item")

# ============================================================================
# 12. ConcessionOrders
# ============================================================================
class ConcessionOrder(Base):
    __tablename__ = "ConcessionOrders"

    order_id = Column(Integer, primary_key=True, autoincrement=True)
    booking_id = Column(Integer, ForeignKey("Bookings.booking_id", ondelete="CASCADE"), nullable=False, index=True)
    order_date = Column(DateTime, default=datetime.utcnow)
    total_amount = Column(Numeric(10, 2), nullable=False, default=0.00)
    status = Column(String(20), nullable=False, default="Completed")

    booking = relationship("Booking", back_populates="concession_orders")
    items = relationship("ConcessionOrderItem", back_populates="order", cascade="all, delete-orphan")

# ============================================================================
# 13. ConcessionOrderItems
# ============================================================================
class ConcessionOrderItem(Base):
    __tablename__ = "ConcessionOrderItems"

    order_item_id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("ConcessionOrders.order_id", ondelete="CASCADE"), nullable=False)
    item_id = Column(Integer, ForeignKey("ConcessionItems.item_id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)

    order = relationship("ConcessionOrder", back_populates="items")
    item = relationship("ConcessionItem", back_populates="order_items")

# ============================================================================
# 14. Payments
# ============================================================================
class Payment(Base):
    __tablename__ = "Payments"

    payment_id = Column(Integer, primary_key=True, autoincrement=True)
    booking_id = Column(Integer, ForeignKey("Bookings.booking_id"), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String(50), nullable=False, default="UPI")
    transaction_reference = Column(String(100), nullable=False, unique=True, index=True)
    payment_status = Column(String(20), nullable=False, default="Successful", index=True)
    payment_date = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="payments")
    refunds = relationship("Refund", back_populates="payment")

# ============================================================================
# 15. Cancellations
# ============================================================================
class Cancellation(Base):
    __tablename__ = "Cancellations"

    cancellation_id = Column(Integer, primary_key=True, autoincrement=True)
    booking_id = Column(Integer, ForeignKey("Bookings.booking_id", ondelete="CASCADE"), nullable=False, unique=True)
    cancellation_date = Column(DateTime, default=datetime.utcnow)
    reason = Column(String(255), nullable=False)
    cancellation_status = Column(String(20), nullable=False, default="Approved")

    booking = relationship("Booking", back_populates="cancellation")
    refunds = relationship("Refund", back_populates="cancellation")

# ============================================================================
# 16. Refunds
# ============================================================================
class Refund(Base):
    __tablename__ = "Refunds"

    refund_id = Column(Integer, primary_key=True, autoincrement=True)
    payment_id = Column(Integer, ForeignKey("Payments.payment_id"), nullable=False, index=True)
    cancellation_id = Column(Integer, ForeignKey("Cancellations.cancellation_id", ondelete="CASCADE"), nullable=False)
    refund_amount = Column(Numeric(10, 2), nullable=False)
    refund_status = Column(String(20), nullable=False, default="Processed")
    processed_date = Column(DateTime, default=datetime.utcnow)

    payment = relationship("Payment", back_populates="refunds")
    cancellation = relationship("Cancellation", back_populates="refunds")

# ============================================================================
# 17. SeatLocks
# ============================================================================
class SeatLock(Base):
    __tablename__ = "SeatLocks"

    lock_id = Column(Integer, primary_key=True, autoincrement=True)
    screening_id = Column(Integer, ForeignKey("Screenings.screening_id", ondelete="CASCADE"), nullable=False)
    seat_id = Column(Integer, ForeignKey("Seats.seat_id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("Users.user_id", ondelete="CASCADE"), nullable=False)
    lock_expiration_time = Column(DateTime, nullable=False)
    lock_status = Column(String(20), nullable=False, default="Locked")
    created_at = Column(DateTime, default=datetime.utcnow)

    screening = relationship("Screening", back_populates="seat_locks")
    seat = relationship("Seat", back_populates="seat_locks")
    user = relationship("User", back_populates="seat_locks")

# ============================================================================
# 18. AuditLogs
# ============================================================================
class AuditLog(Base):
    __tablename__ = "AuditLogs"

    log_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("Users.user_id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False, index=True)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="audit_logs")
