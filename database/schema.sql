-- ============================================================================
-- Cinema Screening and Ticket Booking System (CinemaBookingDB)
-- Relational Schema in Third Normal Form (3NF)
-- Compatible with MySQL 8.0+ and MariaDB
-- ============================================================================

CREATE DATABASE IF NOT EXISTS CinemaBookingDB;
USE CinemaBookingDB;

-- Drop tables in reverse dependency order if recreating
DROP TABLE IF EXISTS AuditLogs;
DROP TABLE IF EXISTS SeatLocks;
DROP TABLE IF EXISTS Refunds;
DROP TABLE IF EXISTS Cancellations;
DROP TABLE IF EXISTS Payments;
DROP TABLE IF EXISTS ConcessionOrderItems;
DROP TABLE IF EXISTS ConcessionOrders;
DROP TABLE IF EXISTS ConcessionItems;
DROP TABLE IF EXISTS Tickets;
DROP TABLE IF EXISTS BookedSeats;
DROP TABLE IF EXISTS Bookings;
DROP TABLE IF EXISTS ScreeningPrices;
DROP TABLE IF EXISTS Screenings;
DROP TABLE IF EXISTS Seats;
DROP TABLE IF EXISTS Screens;
DROP TABLE IF EXISTS Movies;
DROP TABLE IF EXISTS Cinemas;
DROP TABLE IF EXISTS Users;

-- ============================================================================
-- 1. Users Table (Customer, Cinema Manager, Administrator)
-- ============================================================================
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role ENUM('customer', 'manager', 'admin') NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. Cinemas Table
-- ============================================================================
CREATE TABLE Cinemas (
    cinema_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    contact_details VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cinemas_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. Screens Table
-- ============================================================================
CREATE TABLE Screens (
    screen_id INT AUTO_INCREMENT PRIMARY KEY,
    cinema_id INT NOT NULL,
    screen_name VARCHAR(100) NOT NULL,
    screen_type ENUM('Standard', 'IMAX 3D', '4DX', 'Dolby Atmos', 'Gold Class') NOT NULL DEFAULT 'Standard',
    capacity INT NOT NULL CHECK (capacity > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_cinema_screen (cinema_id, screen_name),
    FOREIGN KEY (cinema_id) REFERENCES Cinemas(cinema_id) ON DELETE CASCADE,
    INDEX idx_screens_cinema (cinema_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. Seats Table
-- ============================================================================
CREATE TABLE Seats (
    seat_id INT AUTO_INCREMENT PRIMARY KEY,
    screen_id INT NOT NULL,
    row_label VARCHAR(5) NOT NULL,
    seat_number INT NOT NULL,
    seat_category ENUM('Regular', 'Premium', 'Recliner') NOT NULL DEFAULT 'Regular',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE KEY uq_screen_seat (screen_id, row_label, seat_number),
    FOREIGN KEY (screen_id) REFERENCES Screens(screen_id) ON DELETE CASCADE,
    INDEX idx_seats_screen (screen_id),
    INDEX idx_seats_category (seat_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. Movies Table
-- ============================================================================
CREATE TABLE Movies (
    movie_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    genre VARCHAR(100) NOT NULL,
    language VARCHAR(50) NOT NULL,
    duration INT NOT NULL CHECK (duration > 0), -- duration in minutes
    rating VARCHAR(10) NOT NULL DEFAULT 'U/A', -- CBFC rating: U, U/A, A
    release_date DATE NOT NULL,
    poster_url VARCHAR(500),
    trailer_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_movies_title (title),
    INDEX idx_movies_genre (genre),
    INDEX idx_movies_language (language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. Screenings Table
-- ============================================================================
CREATE TABLE Screenings (
    screening_id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL,
    screen_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('Scheduled', 'Ongoing', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES Movies(movie_id) ON DELETE CASCADE,
    FOREIGN KEY (screen_id) REFERENCES Screens(screen_id) ON DELETE CASCADE,
    INDEX idx_screenings_movie (movie_id),
    INDEX idx_screenings_screen (screen_id),
    INDEX idx_screenings_time (start_time, end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. ScreeningPrices Table (Per Category Pricing per Screening)
-- ============================================================================
CREATE TABLE ScreeningPrices (
    price_id INT AUTO_INCREMENT PRIMARY KEY,
    screening_id INT NOT NULL,
    seat_category ENUM('Regular', 'Premium', 'Recliner') NOT NULL,
    ticket_price DECIMAL(10, 2) NOT NULL CHECK (ticket_price >= 0),
    UNIQUE KEY uq_screening_category (screening_id, seat_category),
    FOREIGN KEY (screening_id) REFERENCES Screenings(screening_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. Bookings Table
-- ============================================================================
CREATE TABLE Bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    screening_id INT NOT NULL,
    booking_reference VARCHAR(30) NOT NULL UNIQUE,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Confirmed', 'Pending', 'Cancelled', 'Completed') NOT NULL DEFAULT 'Pending',
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (screening_id) REFERENCES Screenings(screening_id) ON DELETE RESTRICT,
    INDEX idx_bookings_user (user_id),
    INDEX idx_bookings_screening (screening_id),
    INDEX idx_bookings_reference (booking_reference),
    INDEX idx_bookings_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. BookedSeats Table (Enforcing no duplicate seat booking per screening)
-- ============================================================================
CREATE TABLE BookedSeats (
    booked_seat_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    screening_id INT NOT NULL,
    seat_id INT NOT NULL,
    ticket_price DECIMAL(10, 2) NOT NULL CHECK (ticket_price >= 0),
    status ENUM('Reserved', 'Confirmed', 'Cancelled') NOT NULL DEFAULT 'Reserved',
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (screening_id) REFERENCES Screenings(screening_id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES Seats(seat_id) ON DELETE RESTRICT,
    INDEX idx_booked_screening_seat (screening_id, seat_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 10. Tickets Table (E-Ticket with Verification Token)
-- ============================================================================
CREATE TABLE Tickets (
    ticket_id INT AUTO_INCREMENT PRIMARY KEY,
    booked_seat_id INT NOT NULL UNIQUE,
    ticket_code VARCHAR(50) NOT NULL UNIQUE,
    qr_verification_token VARCHAR(120) NOT NULL UNIQUE,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Active', 'Used', 'Cancelled') NOT NULL DEFAULT 'Active',
    FOREIGN KEY (booked_seat_id) REFERENCES BookedSeats(booked_seat_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 11. ConcessionItems Table (F&B Catalog)
-- ============================================================================
CREATE TABLE ConcessionItems (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(150) NOT NULL,
    category ENUM('Snacks', 'Beverages', 'Combos', 'Dessert') NOT NULL DEFAULT 'Snacks',
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    image_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_concessions_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 12. ConcessionOrders Table
-- ============================================================================
CREATE TABLE ConcessionOrders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    status ENUM('Pending', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Completed',
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    INDEX idx_concession_orders_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 13. ConcessionOrderItems Table
-- ============================================================================
CREATE TABLE ConcessionOrderItems (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    FOREIGN KEY (order_id) REFERENCES ConcessionOrders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES ConcessionItems(item_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 14. Payments Table (Academic Simulation)
-- ============================================================================
CREATE TABLE Payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    payment_method ENUM('Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Cinema Wallet') NOT NULL DEFAULT 'UPI',
    transaction_reference VARCHAR(100) NOT NULL UNIQUE,
    payment_status ENUM('Successful', 'Pending', 'Failed', 'Refunded') NOT NULL DEFAULT 'Successful',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE RESTRICT,
    INDEX idx_payments_booking (booking_id),
    INDEX idx_payments_status (payment_status),
    INDEX idx_payments_ref (transaction_reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 15. Cancellations Table
-- ============================================================================
CREATE TABLE Cancellations (
    cancellation_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    cancellation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(255) NOT NULL,
    cancellation_status ENUM('Approved', 'Pending', 'Rejected') NOT NULL DEFAULT 'Approved',
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 16. Refunds Table
-- ============================================================================
CREATE TABLE Refunds (
    refund_id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT NOT NULL,
    cancellation_id INT NOT NULL,
    refund_amount DECIMAL(10, 2) NOT NULL CHECK (refund_amount >= 0),
    refund_status ENUM('Processed', 'Pending', 'Failed') NOT NULL DEFAULT 'Processed',
    processed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES Payments(payment_id) ON DELETE RESTRICT,
    FOREIGN KEY (cancellation_id) REFERENCES Cancellations(cancellation_id) ON DELETE CASCADE,
    INDEX idx_refunds_payment (payment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 17. SeatLocks Table (Concurrency Control & Temporary Seat Holds)
-- ============================================================================
CREATE TABLE SeatLocks (
    lock_id INT AUTO_INCREMENT PRIMARY KEY,
    screening_id INT NOT NULL,
    seat_id INT NOT NULL,
    user_id INT NOT NULL,
    lock_expiration_time DATETIME NOT NULL,
    lock_status ENUM('Locked', 'Expired', 'Released', 'Converted') NOT NULL DEFAULT 'Locked',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (screening_id) REFERENCES Screenings(screening_id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES Seats(seat_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    INDEX idx_seatlocks_lookup (screening_id, seat_id, lock_status, lock_expiration_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 18. AuditLogs Table (System Security, Role Tracking & Action Audits)
-- ============================================================================
CREATE TABLE AuditLogs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL,
    INDEX idx_audit_action (action),
    INDEX idx_audit_time (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
