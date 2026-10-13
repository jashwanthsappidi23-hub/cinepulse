# Relational Database Normalization Analysis (Third Normal Form - 3NF)
## Project: Cinema Screening and Ticket Booking System (`CinemaBookingDB`)

---

## 1. Executive Summary & Objective

In relational database design, **Normalization** is the systematic process of decomposing relations to minimize data redundancy, eliminate update/insertion/deletion anomalies, and guarantee data integrity.

For the **CinePulse Cinema Screening and Ticket Booking System**, the schema has been formally structured into **Third Normal Form (3NF)** across all **18 relational tables**.

---

## 2. Normalization Stages & Definitions

### 2.1 First Normal Form (1NF)
A relation $R$ is in **1NF** if and only if:
1. Every attribute domain contains only **atomic (indivisible)** values.
2. There are no repeating groups or multivalued attributes.
3. Each record possesses a unique identifier (Primary Key).

**Application in CinemaBookingDB:**
- User phone numbers, movie genres, and seat identifiers are atomic.
- Multiple seats booked in one transaction are not stored as comma-separated values in `Bookings`. Instead, they are decomposed into discrete atomic tuples in the `BookedSeats` table.
- Concession orders store individual line items in `ConcessionOrderItems`.

### 2.2 Second Normal Form (2NF)
A relation $R$ is in **2NF** if and only if:
1. It is in **1NF**.
2. Every non-prime attribute is **fully functionally dependent** on the primary key (no **partial dependencies** on composite candidate keys).

**Application in CinemaBookingDB:**
- In composite relationship tables such as `ScreeningPrices(price_id, screening_id, seat_category, ticket_price)`:
  - If the candidate key is `(screening_id, seat_category)`, the `ticket_price` depends on the **entire** combination of the screening and the seat category, not on `screening_id` alone.
  - In `Seats(seat_id, screen_id, row_label, seat_number, seat_category)`:
    The surrogate key `seat_id` ensures that attributes such as `seat_category` belong to the specific seat.
- Similarly, `BookedSeats` separates the ticket price locked at purchase time from dynamic screen configuration.

### 2.3 Third Normal Form (3NF)
A relation $R$ is in **3NF** if and only if:
1. It is in **2NF**.
2. For every non-trivial functional dependency $X \to Y$, either:
   - $X$ is a **superkey**, OR
   - $Y$ is a **prime attribute** (member of a candidate key).
*(In formal terms: there are no transitive dependencies of non-prime attributes on the primary key: $PK \to A \to B$).*

---

## 3. Detailed Functional Dependency (FD) Analysis by Relation

### Table 1: `Users`
- **Candidate Keys:** $\{ \text{user\_id} \}$, $\{ \text{email} \}$
- **Functional Dependencies:**
  - $\text{user\_id} \to \{ \text{name}, \text{email}, \text{password\_hash}, \text{phone}, \text{role}, \text{created\_at} \}$
  - $\text{email} \to \{ \text{user\_id}, \text{name}, \text{password\_hash}, \text{phone}, \text{role}, \text{created\_at} \}$
- **3NF Verification:** Both determinants are superkeys. No transitive dependency. $\checkmark$

### Table 2: `Cinemas`
- **Candidate Key:** $\{ \text{cinema\_id} \}$
- **Functional Dependencies:**
  - $\text{cinema\_id} \to \{ \text{name}, \text{address}, \text{city}, \text{contact\_details}, \text{is\_active}, \text{created\_at} \}$
- **3NF Verification:** All non-prime attributes directly depend on `cinema_id`. $\checkmark$

### Table 3: `Screens`
- **Candidate Keys:** $\{ \text{screen\_id} \}$, $\{ \text{cinema\_id}, \text{screen\_name} \}$
- **Functional Dependencies:**
  - $\text{screen\_id} \to \{ \text{cinema\_id}, \text{screen\_name}, \text{screen\_type}, \text{capacity}, \text{is\_active} \}$
- **3NF Verification:** The cinema metadata is normalized into `Cinemas`; only foreign key `cinema_id` is retained. No transitive cinema address details exist in `Screens`. $\checkmark$

### Table 4: `Seats`
- **Candidate Keys:** $\{ \text{seat\_id} \}$, $\{ \text{screen\_id}, \text{row\_label}, \text{seat\_number} \}$
- **Functional Dependencies:**
  - $\text{seat\_id} \to \{ \text{screen\_id}, \text{row\_label}, \text{seat\_number}, \text{seat\_category}, \text{is\_active} \}$
- **3NF Verification:** Eliminates transitive dependency on screen properties. $\checkmark$

### Table 5: `Movies`
- **Candidate Key:** $\{ \text{movie\_id} \}$
- **Functional Dependencies:**
  - $\text{movie\_id} \to \{ \text{title}, \text{description}, \text{genre}, \text{language}, \text{duration}, \text{rating}, \text{release\_date}, \text{poster\_url}, \text{trailer\_url}, \text{is\_active} \}$
- **3NF Verification:** Movie details depend purely on the movie key. $\checkmark$

### Table 6: `Screenings`
- **Candidate Key:** $\{ \text{screening\_id} \}$
- **Functional Dependencies:**
  - $\text{screening\_id} \to \{ \text{movie\_id}, \text{screen\_id}, \text{start\_time}, \text{end\_time}, \text{status} \}$
- **3NF Verification:** Does not store movie duration or screen capacity (which would cause transitive dependency). Instead references `movie_id` and `screen_id`. $\checkmark$

### Table 7: `ScreeningPrices`
- **Candidate Key:** $\{ \text{price\_id} \}$, $\{ \text{screening\_id}, \text{seat\_category} \}$
- **Functional Dependencies:**
  - $\text{price\_id} \to \{ \text{screening\_id}, \text{seat\_category}, \text{ticket\_price} \}$
  - $\{ \text{screening\_id}, \text{seat\_category} \} \to \text{ticket\_price}$
- **3NF Verification:** Prevents repeating price tables; prices are explicitly linked to category per screening. $\checkmark$

### Table 8: `Bookings`
- **Candidate Keys:** $\{ \text{booking\_id} \}$, $\{ \text{booking\_reference} \}$
- **Functional Dependencies:**
  - $\text{booking\_id} \to \{ \text{user\_id}, \text{screening\_id}, \text{booking\_reference}, \text{booking\_date}, \text{status}, \text{total\_amount} \}$
- **3NF Verification:** User contact and screening time are not duplicated here. Foreign keys reference parents. $\checkmark$

### Table 9: `BookedSeats`
- **Candidate Key:** $\{ \text{booked\_seat\_id} \}$
- **Alternate Key for active bookings:** $\{ \text{screening\_id}, \text{seat\_id} \}$
- **Functional Dependencies:**
  - $\text{booked\_seat\_id} \to \{ \text{booking\_id}, \text{screening\_id}, \text{seat\_id}, \text{ticket\_price}, \text{status} \}$
- **3NF Verification:** Stores the historical ticket price agreed at sale time. Full atomic 3NF. $\checkmark$

### Table 10: `Tickets`
- **Candidate Keys:** $\{ \text{ticket\_id} \}$, $\{ \text{booked\_seat\_id} \}$, $\{ \text{ticket\_code} \}$, $\{ \text{qr\_verification\_token} \}$
- **Functional Dependencies:**
  - $\text{ticket\_id} \to \{ \text{booked\_seat\_id}, \text{ticket\_code}, \text{qr\_verification\_token}, \text{issue\_date}, \text{status} \}$
- **3NF Verification:** 1:1 ticket issuance token normalized per booked seat. $\checkmark$

### Table 11: `ConcessionItems`
- **Candidate Key:** $\{ \text{item\_id} \}$
- **Functional Dependencies:**
  - $\text{item\_id} \to \{ \text{item\_name}, \text{category}, \text{price}, \text{stock\_quantity}, \text{image\_url}, \text{is\_active} \}$
- **3NF Verification:** Standalone catalog. $\checkmark$

### Table 12 & 13: `ConcessionOrders` & `ConcessionOrderItems`
- **Decomposition Proof:** If orders and items were combined, each order with $N$ snacks would duplicate `booking_id` and order date $N$ times.
- Normalizing into Master (`ConcessionOrders`) and Detail (`ConcessionOrderItems`) completely eliminates insertion/deletion anomalies:
  - $\text{order\_id} \to \{ \text{booking\_id}, \text{order\_date}, \text{total\_amount}, \text{status} \}$
  - $\text{order\_item\_id} \to \{ \text{order\_id}, \text{item\_id}, \text{quantity}, \text{unit\_price}, \text{subtotal} \}$ $\checkmark$

### Table 14: `Payments`
- **Candidate Keys:** $\{ \text{payment\_id} \}$, $\{ \text{transaction\_reference} \}$
- **Functional Dependencies:**
  - $\text{payment\_id} \to \{ \text{booking\_id}, \text{amount}, \text{payment\_method}, \text{transaction\_reference}, \text{payment\_status}, \text{payment\_date} \}$
- **3NF Verification:** Decoupled from booking entity to allow multiple payment attempts, refunds, and gateways. $\checkmark$

### Table 15 & 16: `Cancellations` & `Refunds`
- Normalized to separate the customer's cancellation intent and policy reason from the financial reversal transaction. $\checkmark$

### Table 17: `SeatLocks`
- Normalizes transient seat holds (TTL expiration) without dirtying persistent booking tables. $\checkmark$

### Table 18: `AuditLogs`
- Immutable append-only log capturing user actions, timestamps, and entity changes for security compliance. $\checkmark$

---

## 4. Summary Table of 3NF Relations

| Relation | Primary Key | Foreign Keys | Normal Form |
| :--- | :--- | :--- | :--- |
| `Users` | `user_id` | None | **3NF** |
| `Cinemas` | `cinema_id` | None | **3NF** |
| `Screens` | `screen_id` | `cinema_id` $\to$ `Cinemas` | **3NF** |
| `Seats` | `seat_id` | `screen_id` $\to$ `Screens` | **3NF** |
| `Movies` | `movie_id` | None | **3NF** |
| `Screenings` | `screening_id` | `movie_id`, `screen_id` | **3NF** |
| `ScreeningPrices` | `price_id` | `screening_id` $\to$ `Screenings` | **3NF** |
| `Bookings` | `booking_id` | `user_id`, `screening_id` | **3NF** |
| `BookedSeats` | `booked_seat_id` | `booking_id`, `screening_id`, `seat_id` | **3NF** |
| `Tickets` | `ticket_id` | `booked_seat_id` $\to$ `BookedSeats` | **3NF** |
| `ConcessionItems` | `item_id` | None | **3NF** |
| `ConcessionOrders` | `order_id` | `booking_id` $\to$ `Bookings` | **3NF** |
| `ConcessionOrderItems` | `order_item_id` | `order_id`, `item_id` | **3NF** |
| `Payments` | `payment_id` | `booking_id` $\to$ `Bookings` | **3NF** |
| `Cancellations` | `cancellation_id` | `booking_id` $\to$ `Bookings` | **3NF** |
| `Refunds` | `refund_id` | `payment_id`, `cancellation_id` | **3NF** |
| `SeatLocks` | `lock_id` | `screening_id`, `seat_id`, `user_id` | **3NF** |
| `AuditLogs` | `log_id` | `user_id` $\to$ `Users` | **3NF** |
