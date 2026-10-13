-- ============================================================================
-- Cinema Screening and Ticket Booking System (CinemaBookingDB)
-- SQL Views for Analytics and Academic DBMS Demonstration
-- ============================================================================

USE CinemaBookingDB;

-- ----------------------------------------------------------------------------
-- 1. Movie Performance and Revenue View
-- Aggregates total bookings, tickets sold, and ticket revenue per movie
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_movie_performance AS
SELECT 
    m.movie_id,
    m.title,
    m.genre,
    m.language,
    m.rating,
    COUNT(DISTINCT b.booking_id) AS total_bookings,
    COUNT(bs.booked_seat_id) AS total_tickets_sold,
    COALESCE(SUM(CASE WHEN bs.status IN ('Confirmed', 'Reserved') THEN bs.ticket_price ELSE 0 END), 0) AS total_ticket_revenue,
    AVG(CASE WHEN bs.status IN ('Confirmed', 'Reserved') THEN bs.ticket_price ELSE NULL END) AS average_ticket_price
FROM Movies m
LEFT JOIN Screenings s ON m.movie_id = s.movie_id
LEFT JOIN Bookings b ON s.screening_id = b.screening_id AND b.status IN ('Confirmed', 'Completed')
LEFT JOIN BookedSeats bs ON b.booking_id = bs.booking_id AND bs.status IN ('Confirmed', 'Reserved')
GROUP BY m.movie_id, m.title, m.genre, m.language, m.rating;

-- ----------------------------------------------------------------------------
-- 2. Screening Occupancy View
-- Calculates occupancy rate (booked seats / total screen capacity) per screening
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_screening_occupancy AS
SELECT 
    s.screening_id,
    m.title AS movie_title,
    c.name AS cinema_name,
    c.city,
    sc.screen_name,
    sc.screen_type,
    sc.capacity AS total_capacity,
    s.start_time,
    s.end_time,
    s.status AS screening_status,
    COUNT(CASE WHEN bs.status IN ('Confirmed', 'Reserved') THEN bs.booked_seat_id END) AS booked_seats_count,
    ROUND((COUNT(CASE WHEN bs.status IN ('Confirmed', 'Reserved') THEN bs.booked_seat_id END) / sc.capacity) * 100, 2) AS occupancy_percentage
FROM Screenings s
JOIN Movies m ON s.movie_id = m.movie_id
JOIN Screens sc ON s.screen_id = sc.screen_id
JOIN Cinemas c ON sc.cinema_id = c.cinema_id
LEFT JOIN BookedSeats bs ON s.screening_id = bs.screening_id AND bs.status IN ('Confirmed', 'Reserved')
GROUP BY s.screening_id, m.title, c.name, c.city, sc.screen_name, sc.screen_type, sc.capacity, s.start_time, s.end_time, s.status;

-- ----------------------------------------------------------------------------
-- 3. Concession Sales & Popularity View
-- Tracks snack/beverage demand, units sold, and generated revenue
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_concession_sales AS
SELECT 
    ci.item_id,
    ci.item_name,
    ci.category,
    ci.price AS current_unit_price,
    ci.stock_quantity AS current_stock,
    COALESCE(SUM(coi.quantity), 0) AS total_units_sold,
    COALESCE(SUM(coi.subtotal), 0) AS total_concession_revenue
FROM ConcessionItems ci
LEFT JOIN ConcessionOrderItems coi ON ci.item_id = coi.item_id
LEFT JOIN ConcessionOrders co ON coi.order_id = co.order_id AND co.status = 'Completed'
GROUP BY ci.item_id, ci.item_name, ci.category, ci.price, ci.stock_quantity;

-- ----------------------------------------------------------------------------
-- 4. Daily Comprehensive Revenue View
-- Synthesizes ticket sales, concessions, processed refunds, and net revenue
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_daily_revenue_summary AS
SELECT 
    DATE(p.payment_date) AS revenue_date,
    COALESCE(SUM(CASE WHEN p.payment_status = 'Successful' THEN p.amount ELSE 0 END), 0) AS gross_payment_collected,
    COALESCE((
        SELECT SUM(r.refund_amount) 
        FROM Refunds r 
        WHERE DATE(r.processed_date) = DATE(p.payment_date) AND r.refund_status = 'Processed'
    ), 0) AS total_refunded_amount,
    COALESCE(SUM(CASE WHEN p.payment_status = 'Successful' THEN p.amount ELSE 0 END), 0) - 
    COALESCE((
        SELECT SUM(r.refund_amount) 
        FROM Refunds r 
        WHERE DATE(r.processed_date) = DATE(p.payment_date) AND r.refund_status = 'Processed'
    ), 0) AS net_revenue
FROM Payments p
GROUP BY DATE(p.payment_date);
