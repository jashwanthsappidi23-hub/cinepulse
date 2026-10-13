# CinePulse — Cinema Screening & Ticket Booking System
### A Full-Stack DBMS Academic Project in Third Normal Form (3NF)

---

## 1. Project Overview

**CinePulse** is a modern, responsive, and fully functional commercial-grade cinema screening and ticket booking web application (inspired by BookMyShow). Built specifically as a comprehensive College Database Management Systems (DBMS) project, CinePulse showcases:

- **Third Normal Form (3NF) Relational Schema** with 18 interrelated tables.
- **BookMyShow & District App Experience:** Category pills ("Trending in District 🔥", "Action 💥", "Sci-Fi 🚀"), BMS-style ratings (`★ 9.4/10 (85K Votes)`), format chips (`IMAX 3D`, `4DX`, `2D`), watchlist heart toggles, and load-more pagination.
- **180+ Movies with Emojis & Posters across All Woods:** Database seeded with **184 blockbusters** from Tollywood (Telugu), Bollywood (Hindi), Hollywood (English), Kollywood (Tamil), Mollywood (Malayalam), and Sandalwood (Kannada), each with thematic emojis, authentic synopsis, and theatrical posters referenced from IMDb/studio releases.
- **All 190+ Cities of India (BookMyShow-Style City Modal):** Interactive city selection modal covering 190+ cities across all 28 States and 8 Union Territories with 16 popular metro hubs (landmarks & emojis), state filters, and live search.
- **Concurrency Control & Race Condition Prevention** using temporary Seat Locks with Time-to-Live (TTL) expiration and database unique constraints.
- **ACID Transaction Management** guaranteeing full rollback on simulated payment failure.
- **Conflict Prevention Engine** preventing overlapping screenings on the same auditorium screen (enforcing a 20-minute turnaround cleaning buffer).
- **Three Discrete User Roles:** Customer, Cinema Manager, and System Administrator.
- **8 Dedicated SQL Analytical Reports** calculating live business metrics with interactive charts and 1-click CSV streaming export.
- **Realistic E-Ticket Generator** with dynamic QR code verification.

---

## 2. Technology Stack

- **Frontend:** React.js, Tailwind CSS v3.4, Lucide React, Recharts, QRCode Canvas.
- **Backend:** Python FastAPI REST API with modular routers, Pydantic data validation, and bcrypt password hashing.
- **Database:** MySQL 8.0+ / MariaDB (`CinemaBookingDB`) with auto-fallback to SQLite for zero-configuration viva demonstrations.
- **Security:** JSON Web Tokens (JWT) with Role-Based Access Control (RBAC).

---

## 3. Project Structure

```
sahasra/
├── database/
│   ├── schema.sql           # MySQL DDL creating CinemaBookingDB & 18 tables in 3NF
│   ├── seed.sql             # Realistic seed data (cinemas, screens, seats, 153 movies with emojis, 172 shows)
│   ├── views.sql            # Stored SQL views (movie revenue, occupancy, concessions)
│   └── queries.sql          # Academic DBMS queries demonstrating JOINs, subqueries, ACID, reports
├── docs/
│   ├── 3nf_normalization.md # Complete normalization proof with Functional Dependencies (FDs)
│   └── er_diagram.md        # Mermaid Entity-Relationship (ER) diagram with cardinalities
├── backend/
│   ├── main.py              # FastAPI application entrypoint & CORS configuration
│   ├── config.py            # Environment settings and business rule parameters
│   ├── database.py          # SQLAlchemy engine, MySQL/SQLite auto-fallback, auto-seeder
│   ├── models.py            # SQLAlchemy ORM models for all 18 tables
│   ├── auth.py              # JWT authentication and RBAC role dependencies
│   └── routers/
│       ├── auth_router.py       # Login, Register, Profile, 1-Click Demo accounts
│       ├── movies_router.py     # Filterable movie catalog & synopsis
│       ├── cinemas_router.py    # Cinemas, screens, and location endpoints
│       ├── screenings_router.py # Screenings & live categorized seat layout
│       ├── seat_locks_router.py # Concurrency seat locks with TTL timer
│       ├── bookings_router.py   # Transactional ticket booking & cancellation/refund
│       ├── concessions_router.py# F&B snack menu & stock tracking
│       ├── manager_router.py    # Conflict-free scheduling & maintenance
│       └── admin_router.py      # 8 SQL Analytical Reports & CSV export
├── frontend/
│   ├── src/
│   │   ├── api.js               # Central REST API client
│   │   ├── context/AuthContext  # Auth state and 1-click demo switcher
│   │   ├── components/          # Navbar, Footer, AuthModal, TrailerModal, TicketModal
│   │   └── pages/               # HomePage, MoviesPage, CinemasPage, BookingFlow, Dashboards
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
├── .env.example
└── README.md
```

---

## 4. The 18 Normalized Relational Tables (3NF)

| Table # | Entity Name | Description | Key Constraints |
| :--- | :--- | :--- | :--- |
| **1** | `Users` | Customers, Managers, Administrators | `PK: user_id`, `UK: email` |
| **2** | `Cinemas` | Cinema locations across Indian Metros | `PK: cinema_id` |
| **3** | `Screens` | Auditoriums (IMAX Laser, 4DX, Dolby Atmos) | `PK: screen_id`, `FK: cinema_id`, `UK: (cinema_id, screen_name)` |
| **4** | `Seats` | Categorized seats (Regular, Premium, Recliner) | `PK: seat_id`, `FK: screen_id`, `UK: (screen_id, row, number)` |
| **5** | `Movies` | Movie title, genres, language, rating, trailer | `PK: movie_id` |
| **6** | `Screenings` | Scheduled showtimes | `PK: screening_id`, `FK: movie_id, screen_id` |
| **7** | `ScreeningPrices`| Per-category pricing for each show | `PK: price_id`, `FK: screening_id`, `UK: (screening_id, category)` |
| **8** | `Bookings` | Customer reservations & references | `PK: booking_id`, `FK: user_id, screening_id`, `UK: booking_reference` |
| **9** | `BookedSeats` | Atomic seat bookings preventing collisions | `PK: booked_seat_id`, `FK: booking_id, seat_id` |
| **10** | `Tickets` | E-Tickets with QR tokens | `PK: ticket_id`, `FK: booked_seat_id`, `UK: qr_token` |
| **11** | `ConcessionItems`| Food & Beverage catalog | `PK: item_id` |
| **12** | `ConcessionOrders`| Food orders linked to bookings | `PK: order_id`, `FK: booking_id` |
| **13** | `ConcessionOrderItems`| Line items with unit price and quantities | `PK: order_item_id`, `FK: order_id, item_id` |
| **14** | `Payments` | Financial records & transaction refs | `PK: payment_id`, `FK: booking_id`, `UK: transaction_reference` |
| **15** | `Cancellations` | Cancellation requests & reasons | `PK: cancellation_id`, `FK: booking_id` |
| **16** | `Refunds` | Refund processing records | `PK: refund_id`, `FK: payment_id, cancellation_id` |
| **17** | `SeatLocks` | Concurrency locks with expiration TTL | `PK: lock_id`, `FK: screening_id, seat_id, user_id` |
| **18** | `AuditLogs` | Immutable security audit trail | `PK: log_id`, `FK: user_id` |

---

## 5. The Three Dedicated Portals & Gmail Format Logins

CinePulse features **three discrete, dedicated portals** for each user persona with instant 1-click launch and manual authentication support. All three portals use credentials in **Gmail format**:

| Portal | Dedicated Workspace | Email Address (Gmail Format) | Password | Permissions & Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| 👤 **Customer Portal** | Patron Booking Suite | `customer@gmail.com` | `password123` | Browse 100+ movies across 190+ Indian cities, interactive seat maps with 5-min TTL concurrency locks, concession combos ordering, printable QR e-tickets, cancellations |
| 🎬 **Manager Portal** | Cinema Operations Suite | `manager@gmail.com` | `password123` | Screenings scheduler with real-time overlap collision checks (20-min cleaning buffer), hall seat maintenance blocking, concession item inventory and pricing updates, occupancy tracking |
| ⚙️ **Admin Portal** | Enterprise DBMS Control Room | `admin@gmail.com` | `password123` | Full 8 relational analytical DBMS reports & charts, immutable SQL audit trail inspector, RBAC user role administration (promote/demote), 1-click streaming CSV exports |

*You can switch between the 3 portals anytime using the top navigation bar portal switcher ribbon, or open the unified 3-way **All 3 Login Portals** modal.*

---

## 6. How to Run Locally

### Prerequisites
- Python 3.9+
- Node.js 18+ and npm

### Step 1: Start the Backend REST API
```bash
# Navigate to project directory
cd /path/to/sahasra

# Activate virtual environment
source backend/venv/bin/activate

# Start FastAPI server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend initializes the database schema automatically and seeds comprehensive demo data.
Interactive Swagger API documentation is available at: **http://127.0.0.1:8000/docs**

### Step 2: Start the Frontend React Web App
```bash
cd /path/to/sahasra/frontend

# Start Vite dev server
npm run dev
```
Open **http://127.0.0.1:5173** in your browser.

---

## 7. The 8 SQL Analytical Reports

All reports execute genuine SQL queries with aggregates:

1. **Show Occupancy Report:** Booked seats divided by screen capacity per screening (`ROUND(booked / capacity * 100, 2)`).
2. **Movie Performance Report:** Movies ranked by tickets sold and total revenue using `DENSE_RANK()`.
3. **Screen Utilization Report:** Scheduled screen hours compared against 14-hour daily theater capacity.
4. **Concession Sales Report:** Units sold, inventory remaining, and revenue per snack item.
5. **Cancellation Report:** Cancellations grouped by movie, date, and stated reason.
6. **Refund Report:** Original payment vs refund amount, gateway reference, and status.
7. **Comprehensive Revenue Report:** Daily gross collections, refunds deducted, and net revenue.
8. **Customer Booking Frequency Report:** Customer booking volume, spend, and cancellation ratios.

*Every report features interactive visual charts (Recharts) and a 1-click **Export CSV File** button.*

---

## 8. College DBMS Viva Cheatsheet

### Q1: Why is this schema in 3NF?
- **1NF:** All attribute values are atomic; no multivalued fields (e.g., multiple seats in a single booking are split into rows in `BookedSeats`).
- **2NF:** Every non-prime attribute depends on the whole primary key. In composite relationships like `ScreeningPrices`, prices depend on both `screening_id` and `seat_category`.
- **3NF:** No non-prime attribute depends transitively on a primary key ($X \to Y$ only where $X$ is a superkey). For example, cinema details are not stored in `Screens` or `Screenings`.

### Q2: How do you prevent two customers from booking the same seat simultaneously?
1. **Application Layer TTL Lock (`SeatLocks`):** When a user selects a seat, a temporary hold is placed for 300 seconds. Competing requests return HTTP `409 Conflict`.
2. **ACID Transaction:** The booking confirmation runs inside a single database transaction (`db.begin()`).
3. **Database Uniqueness Constraint:** `(screening_id, seat_id)` ensures that an already confirmed seat cannot have a duplicate record inserted.
4. **Atomic Rollback:** If any step fails (or simulated payment declines), the entire transaction rolls back via `db.rollback()`.

### Q3: How is screening overlap prevented?
When a manager schedules a screening, the backend checks:
$$\text{Existing Start} < \text{New End} \quad \text{AND} \quad \text{Existing End} > \text{New Start}$$
The movie duration plus a **20-minute cleaning and audience buffer** interval is automatically enforced. Overlapping submissions are rejected with HTTP 409.
