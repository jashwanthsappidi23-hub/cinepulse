# Entity-Relationship (ER) Diagram & Schema Architecture
## Cinema Screening and Ticket Booking System (`CinemaBookingDB`)

---

## 1. Visual Entity-Relationship Diagram

```mermaid
erDiagram
    Users ||--o{ Bookings : places
    Users ||--o{ SeatLocks : acquires
    Users ||--o{ AuditLogs : triggers
    
    Cinemas ||--|{ Screens : contains
    Screens ||--|{ Seats : configures
    Screens ||--o{ Screenings : hosts
    
    Movies ||--o{ Screenings : featured_in
    Screenings ||--|{ ScreeningPrices : has_rates
    Screenings ||--o{ Bookings : books_show
    Screenings ||--o{ SeatLocks : locks_seat
    Screenings ||--o{ BookedSeats : reserves_seat
    
    Seats ||--o{ BookedSeats : allocated_in
    Seats ||--o{ SeatLocks : held_by
    
    Bookings ||--|{ BookedSeats : includes_seats
    Bookings ||--o{ ConcessionOrders : orders_food
    Bookings ||--|{ Payments : paid_by
    Bookings ||--o| Cancellations : subjected_to
    
    BookedSeats ||--|| Tickets : generates_eticket
    
    ConcessionOrders ||--|{ ConcessionOrderItems : contains_items
    ConcessionItems ||--o{ ConcessionOrderItems : ordered_as
    
    Payments ||--o| Refunds : refunded_via
    Cancellations ||--o| Refunds : originates
    
    Users {
        int user_id PK
        string name
        string email UK
        string password_hash
        string phone
        string role "customer | manager | admin"
        timestamp created_at
    }

    Cinemas {
        int cinema_id PK
        string name
        string address
        string city
        string contact_details
        boolean is_active
        timestamp created_at
    }

    Screens {
        int screen_id PK
        int cinema_id FK
        string screen_name
        string screen_type "Standard | IMAX 3D | 4DX | Dolby Atmos | Gold Class"
        int capacity
        boolean is_active
        timestamp created_at
    }

    Seats {
        int seat_id PK
        int screen_id FK
        string row_label
        int seat_number
        string seat_category "Regular | Premium | Recliner"
        boolean is_active
    }

    Movies {
        int movie_id PK
        string title
        string description
        string genre
        string language
        int duration
        string rating
        date release_date
        string poster_url
        string trailer_url
        boolean is_active
        timestamp created_at
    }

    Screenings {
        int screening_id PK
        int movie_id FK
        int screen_id FK
        datetime start_time
        datetime end_time
        string status "Scheduled | Ongoing | Completed | Cancelled"
        timestamp created_at
    }

    ScreeningPrices {
        int price_id PK
        int screening_id FK
        string seat_category "Regular | Premium | Recliner"
        decimal ticket_price
    }

    Bookings {
        int booking_id PK
        int user_id FK
        int screening_id FK
        string booking_reference UK
        timestamp booking_date
        string status "Confirmed | Pending | Cancelled | Completed"
        decimal total_amount
    }

    BookedSeats {
        int booked_seat_id PK
        int booking_id FK
        int screening_id FK
        int seat_id FK
        decimal ticket_price
        string status "Reserved | Confirmed | Cancelled"
    }

    Tickets {
        int ticket_id PK
        int booked_seat_id FK, UK
        string ticket_code UK
        string qr_verification_token UK
        timestamp issue_date
        string status "Active | Used | Cancelled"
    }

    ConcessionItems {
        int item_id PK
        string item_name
        string category "Snacks | Beverages | Combos | Dessert"
        decimal price
        int stock_quantity
        string image_url
        boolean is_active
        timestamp created_at
    }

    ConcessionOrders {
        int order_id PK
        int booking_id FK
        timestamp order_date
        decimal total_amount
        string status "Pending | Completed | Cancelled"
    }

    ConcessionOrderItems {
        int order_item_id PK
        int order_id FK
        int item_id FK
        int quantity
        decimal unit_price
        decimal subtotal
    }

    Payments {
        int payment_id PK
        int booking_id FK
        decimal amount
        string payment_method "Credit Card | Debit Card | UPI | Net Banking"
        string transaction_reference UK
        string payment_status "Successful | Pending | Failed | Refunded"
        timestamp payment_date
    }

    Cancellations {
        int cancellation_id PK
        int booking_id FK, UK
        timestamp cancellation_date
        string reason
        string cancellation_status "Approved | Pending | Rejected"
    }

    Refunds {
        int refund_id PK
        int payment_id FK
        int cancellation_id FK
        decimal refund_amount
        string refund_status "Processed | Pending | Failed"
        timestamp processed_date
    }

    SeatLocks {
        int lock_id PK
        int screening_id FK
        int seat_id FK
        int user_id FK
        datetime lock_expiration_time
        string lock_status "Locked | Expired | Released | Converted"
        timestamp created_at
    }

    AuditLogs {
        int log_id PK
        int user_id FK
        string action
        string entity_type
        int entity_id
        string details
        timestamp timestamp
    }
```

---

## 2. Cardinality and Relationship Constraints

1. **Cinemas to Screens ($1 : N$):** One cinema contains multiple screens. Each screen belongs to exactly one cinema.
2. **Screens to Seats ($1 : N$):** One screen has multiple seats. A seat belongs to only one screen.
3. **Screenings to ScreeningPrices ($1 : N$):** Each screening specifies prices for each seat category (`Regular`, `Premium`, `Recliner`).
4. **Bookings to BookedSeats ($1 : N$):** A single customer booking reservation can contain multiple seats.
5. **BookedSeats to Tickets ($1 : 1$):** Each booked seat is issued exactly one e-ticket with a distinct QR verification token.
6. **Bookings to ConcessionOrders ($1 : 0..1$):** A booking may optionally include a concession order.
7. **ConcessionOrders to ConcessionOrderItems ($1 : N$):** An order itemizes $N$ concession products with quantity and unit price.
8. **Bookings to Payments ($1 : 1..N$):** Tracks initial payment transaction and any subsequent adjustments.
9. **Bookings to Cancellations ($1 : 0..1$):** A booking may be cancelled at most once.
10. **Payments to Refunds ($1 : 0..1$):** A payment may generate a refund following an approved cancellation.
11. **SeatLocks Concurrency ($M : N$ with TTL):** Prevents simultaneous seat booking race conditions with automatic time-to-live locks.
