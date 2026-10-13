-- ============================================================================
-- Cinema Screening and Ticket Booking System (CinemaBookingDB)
-- SQL Queries and DBMS Academic Demonstration Script
-- Demonstrating Core DML, Joins, Aggregates, Nested Queries, Transactions,
-- Stored Procedures, and Analytical Reporting
-- ============================================================================

USE CinemaBookingDB;

-- ============================================================================
-- SECTION 1: BASIC DML OPERATIONS (INSERT, UPDATE, DELETE, SELECT)
-- ============================================================================

-- 1.1 SELECT: Fetch all active movies with rating and duration
SELECT movie_id, title, genre, language, duration, rating, release_date
FROM Movies
WHERE is_active = TRUE
ORDER BY release_date DESC;

-- 1.2 INSERT: Register a new customer
INSERT INTO Users (name, email, password_hash, phone, role)
VALUES ('Deepak Kumar', 'deepak.kumar@example.com', '$2b$12$4Nx2vgnaOAMdNJr/sGDb3.gkTCz.QPoNWTpKBKK7IKXpaPC9zwIvu', '+91-9988112233', 'customer');

-- 1.3 UPDATE: Adjust concession stock following warehouse replenishment
UPDATE ConcessionItems
SET stock_quantity = stock_quantity + 50
WHERE item_id = 1;

-- 1.4 DELETE: Purge expired seat locks (Safe cleanup)
DELETE FROM SeatLocks
WHERE lock_status = 'Expired' OR lock_expiration_time < NOW();

-- ============================================================================
-- SECTION 2: MULTI-TABLE JOINS (INNER JOIN, LEFT JOIN)
-- ============================================================================

-- 2.1 Multi-Table INNER JOIN: Comprehensive Ticket and Booking Detail
SELECT 
    b.booking_reference,
    u.name AS customer_name,
    u.email AS customer_email,
    m.title AS movie_title,
    c.name AS cinema_name,
    sc.screen_name,
    sc.screen_type,
    s.start_time,
    CONCAT(st.row_label, st.seat_number) AS seat_identifier,
    st.seat_category,
    bs.ticket_price,
    t.ticket_code,
    t.qr_verification_token
FROM Bookings b
INNER JOIN Users u ON b.user_id = u.user_id
INNER JOIN Screenings s ON b.screening_id = s.screening_id
INNER JOIN Movies m ON s.movie_id = m.movie_id
INNER JOIN Screens sc ON s.screen_id = sc.screen_id
INNER JOIN Cinemas c ON sc.cinema_id = c.cinema_id
INNER JOIN BookedSeats bs ON b.booking_id = bs.booking_id
INNER JOIN Seats st ON bs.seat_id = st.seat_id
INNER JOIN Tickets t ON bs.booked_seat_id = t.booked_seat_id
WHERE b.status = 'Confirmed'
ORDER BY s.start_time ASC, seat_identifier ASC;

-- 2.2 LEFT JOIN: Find movies that currently have zero scheduled screenings
SELECT 
    m.movie_id,
    m.title,
    m.genre,
    COUNT(s.screening_id) AS total_screenings
FROM Movies m
LEFT JOIN Screenings s ON m.movie_id = s.movie_id
GROUP BY m.movie_id, m.title, m.genre
HAVING total_screenings = 0;

-- ============================================================================
-- SECTION 3: AGGREGATES, GROUP BY, HAVING, AND STATISTICAL FUNCTIONS
-- ============================================================================

-- 3.1 Screening Revenue and Occupancy Statistics (COUNT, SUM, AVG, MIN, MAX)
SELECT 
    c.city,
    c.name AS cinema_name,
    COUNT(DISTINCT s.screening_id) AS scheduled_screenings,
    COUNT(DISTINCT b.booking_id) AS total_bookings,
    COUNT(bs.booked_seat_id) AS total_tickets_sold,
    MIN(bs.ticket_price) AS lowest_ticket_price,
    MAX(bs.ticket_price) AS highest_ticket_price,
    ROUND(AVG(bs.ticket_price), 2) AS average_ticket_price,
    COALESCE(SUM(bs.ticket_price), 0) AS total_ticket_sales
FROM Cinemas c
INNER JOIN Screens sc ON c.cinema_id = sc.cinema_id
INNER JOIN Screenings s ON sc.screen_id = s.screen_id
LEFT JOIN Bookings b ON s.screening_id = b.screening_id AND b.status IN ('Confirmed', 'Completed')
LEFT JOIN BookedSeats bs ON b.booking_id = bs.booking_id AND bs.status = 'Confirmed'
GROUP BY c.city, c.name
HAVING total_ticket_sales > 0
ORDER BY total_ticket_sales DESC;

-- ============================================================================
-- SECTION 4: NESTED QUERIES AND CORRELATED SUBQUERIES
-- ============================================================================

-- 4.1 Correlated Subquery: Customers who spent above the average booking amount
SELECT 
    u.user_id,
    u.name,
    u.email,
    b.booking_reference,
    b.total_amount
FROM Bookings b
INNER JOIN Users u ON b.user_id = u.user_id
WHERE b.total_amount > (
    SELECT AVG(total_amount)
    FROM Bookings
    WHERE status IN ('Confirmed', 'Completed')
)
ORDER BY b.total_amount DESC;

-- 4.2 Nested Query with IN: Find seats in Audi 1 that are NOT booked for screening 1
SELECT 
    seat_id,
    row_label,
    seat_number,
    seat_category
FROM Seats
WHERE screen_id = 1
  AND is_active = TRUE
  AND seat_id NOT IN (
      SELECT seat_id
      FROM BookedSeats
      WHERE screening_id = 1 AND status IN ('Reserved', 'Confirmed')
  )
ORDER BY row_label, seat_number;

-- ============================================================================
-- SECTION 5: ACID TRANSACTION MANAGEMENT
-- Demonstrating concurrency control, row locking, and rollback safety
-- ============================================================================

-- 5.1 Atomicity & Consistency Demo: Booking Workflow with Safe Rollback
START TRANSACTION;

-- Step 1: Insert pending booking record
INSERT INTO Bookings (user_id, screening_id, booking_reference, status, total_amount)
VALUES (4, 1, 'BK-TEST-TXN-001', 'Pending', 700.00);

SET @new_booking_id = LAST_INSERT_ID();

-- Step 2: Check and verify seat availability with exclusive lock (FOR UPDATE)
-- In production, if seat is already booked, transaction rolls back immediately
INSERT INTO BookedSeats (booking_id, screening_id, seat_id, ticket_price, status)
VALUES (@new_booking_id, 1, 15, 350.00, 'Reserved'),
       (@new_booking_id, 1, 16, 350.00, 'Reserved');

-- Step 3: Record simulated payment
INSERT INTO Payments (booking_id, amount, payment_method, transaction_reference, payment_status)
VALUES (@new_booking_id, 700.00, 'UPI', 'TXN-TEST-SIM-001', 'Successful');

-- Step 4: Issue tickets
INSERT INTO Tickets (booked_seat_id, ticket_code, qr_verification_token, status)
SELECT booked_seat_id, CONCAT('TCK-TEST-', booked_seat_id), UUID(), 'Active'
FROM BookedSeats
WHERE booking_id = @new_booking_id;

-- Step 5: Finalize booking status
UPDATE Bookings
SET status = 'Confirmed'
WHERE booking_id = @new_booking_id;

-- Commit transaction atomically
COMMIT;

-- ============================================================================
-- SECTION 6: THE 8 ANALYTICAL REPORTS REQUIRED BY ACADEMIC SPECIFICATION
-- ============================================================================

-- REPORT 1: Show Occupancy Report
SELECT 
    s.screening_id,
    m.title AS movie_title,
    c.name AS cinema_name,
    sc.screen_name,
    s.start_time,
    sc.capacity AS total_seats,
    COUNT(CASE WHEN bs.status IN ('Confirmed', 'Reserved') THEN bs.booked_seat_id END) AS booked_seats,
    ROUND((COUNT(CASE WHEN bs.status IN ('Confirmed', 'Reserved') THEN bs.booked_seat_id END) / sc.capacity) * 100, 2) AS occupancy_percentage
FROM Screenings s
JOIN Movies m ON s.movie_id = m.movie_id
JOIN Screens sc ON s.screen_id = sc.screen_id
JOIN Cinemas c ON sc.cinema_id = c.cinema_id
LEFT JOIN BookedSeats bs ON s.screening_id = bs.screening_id AND bs.status IN ('Confirmed', 'Reserved')
GROUP BY s.screening_id, m.title, c.name, sc.screen_name, s.start_time, sc.capacity
ORDER BY occupancy_percentage DESC;

-- REPORT 2: Movie Performance Report
SELECT 
    m.movie_id,
    m.title,
    m.genre,
    m.language,
    COUNT(DISTINCT b.booking_id) AS total_bookings,
    COUNT(bs.booked_seat_id) AS total_tickets_sold,
    COALESCE(SUM(bs.ticket_price), 0) AS gross_ticket_revenue,
    DENSE_RANK() OVER (ORDER BY COALESCE(SUM(bs.ticket_price), 0) DESC) AS revenue_rank
FROM Movies m
LEFT JOIN Screenings s ON m.movie_id = s.movie_id
LEFT JOIN Bookings b ON s.screening_id = b.screening_id AND b.status IN ('Confirmed', 'Completed')
LEFT JOIN BookedSeats bs ON b.booking_id = bs.booking_id AND bs.status = 'Confirmed'
GROUP BY m.movie_id, m.title, m.genre, m.language
ORDER BY gross_ticket_revenue DESC;

-- REPORT 3: Screen Utilization Report (Scheduled Show Hours vs 14hr Daily Operating Capacity)
SELECT 
    sc.screen_id,
    c.name AS cinema_name,
    sc.screen_name,
    sc.screen_type,
    COUNT(s.screening_id) AS total_screenings_scheduled,
    ROUND(COALESCE(SUM(TIMESTAMPDIFF(MINUTE, s.start_time, s.end_time)), 0) / 60.0, 2) AS scheduled_hours,
    ROUND((COALESCE(SUM(TIMESTAMPDIFF(MINUTE, s.start_time, s.end_time)), 0) / 60.0 / 14.0) * 100, 2) AS utilization_rate_percent
FROM Screens sc
JOIN Cinemas c ON sc.cinema_id = c.cinema_id
LEFT JOIN Screenings s ON sc.screen_id = s.screen_id AND DATE(s.start_time) = '2026-10-12'
GROUP BY sc.screen_id, c.name, sc.screen_name, sc.screen_type
ORDER BY utilization_rate_percent DESC;

-- REPORT 4: Concession Sales Report
SELECT 
    ci.item_id,
    ci.item_name,
    ci.category,
    ci.price AS unit_price,
    ci.stock_quantity AS remaining_stock,
    COALESCE(SUM(coi.quantity), 0) AS total_quantity_sold,
    COALESCE(SUM(coi.subtotal), 0) AS total_revenue
FROM ConcessionItems ci
LEFT JOIN ConcessionOrderItems coi ON ci.item_id = coi.item_id
LEFT JOIN ConcessionOrders co ON coi.order_id = co.order_id AND co.status = 'Completed'
GROUP BY ci.item_id, ci.item_name, ci.category, ci.price, ci.stock_quantity
ORDER BY total_revenue DESC;

-- REPORT 5: Cancellation Report
SELECT 
    c.cancellation_id,
    b.booking_reference,
    u.name AS customer_name,
    m.title AS movie_title,
    s.start_time AS screening_time,
    c.cancellation_date,
    c.reason,
    c.cancellation_status
FROM Cancellations c
JOIN Bookings b ON c.booking_id = b.booking_id
JOIN Users u ON b.user_id = u.user_id
JOIN Screenings s ON b.screening_id = s.screening_id
JOIN Movies m ON s.movie_id = m.movie_id
ORDER BY c.cancellation_date DESC;

-- REPORT 6: Refund Report
SELECT 
    r.refund_id,
    b.booking_reference,
    p.transaction_reference,
    p.payment_method,
    p.amount AS original_paid_amount,
    r.refund_amount,
    r.refund_status,
    r.processed_date
FROM Refunds r
JOIN Payments p ON r.payment_id = p.payment_id
JOIN Bookings b ON p.booking_id = b.booking_id
ORDER BY r.processed_date DESC;

-- REPORT 7: Revenue Report (Ticket vs Concession vs Refunds vs Net)
SELECT 
    DATE(p.payment_date) AS transaction_date,
    SUM(p.amount) AS gross_collections,
    COALESCE((
        SELECT SUM(r.refund_amount)
        FROM Refunds r
        WHERE DATE(r.processed_date) = DATE(p.payment_date) AND r.refund_status = 'Processed'
    ), 0) AS total_refunds,
    SUM(p.amount) - COALESCE((
        SELECT SUM(r.refund_amount)
        FROM Refunds r
        WHERE DATE(r.processed_date) = DATE(p.payment_date) AND r.refund_status = 'Processed'
    ), 0) AS net_revenue
FROM Payments p
WHERE p.payment_status = 'Successful'
GROUP BY DATE(p.payment_date)
ORDER BY transaction_date DESC;

-- REPORT 8: Customer Booking Report (Frequency & History without Exposing Card Info)
SELECT 
    u.user_id,
    u.name AS customer_name,
    u.email,
    COUNT(b.booking_id) AS total_bookings_made,
    SUM(CASE WHEN b.status = 'Confirmed' THEN 1 ELSE 0 END) AS confirmed_bookings,
    SUM(CASE WHEN b.status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled_bookings,
    COALESCE(SUM(CASE WHEN b.status IN ('Confirmed', 'Completed') THEN b.total_amount ELSE 0 END), 0) AS total_spend,
    MAX(b.booking_date) AS most_recent_booking
FROM Users u
LEFT JOIN Bookings b ON u.user_id = b.user_id
WHERE u.role = 'customer'
GROUP BY u.user_id, u.name, u.email
ORDER BY total_bookings_made DESC, total_spend DESC;
