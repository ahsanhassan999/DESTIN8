# Project Logic & API Specifications - DESTIN8

This document serves as the unified technical reference manual for DESTIN8's core business logic, database relationships, and complete REST API schema.

---

## 🗄️ Database Schema & Models

The SQLite database structure contains 13 relational tables linked via SQLAlchemy async schemas:

```
                               ┌──────────────┐
                               │     User     │
                               └──────┬───────┘
                                      │ (1:1)
                       ┌──────────────▼──────────────┐
                       │        AgencyProfile        │
                       └──────────────┬──────────────┘
                                      │ (1:N)
                       ┌──────────────▼──────────────┐
                       │           Package           │
                       └──────────────┬──────────────┘
                                      │ (1:N)
         ┌────────────────────────────┼────────────────────────────┐
         │ (1:N)                      │ (1:N)                      │ (1:N)
┌────────▼────────┐          ┌────────▼────────┐          ┌────────▼────────┐
│     Booking     │          │     Review      │          │    Wishlist     │
└────────┬────────┘          └─────────────────┘          └─────────────────┘
         │ (1:1)
┌────────▼────────┐
│PaymentTransaction│
└─────────────────┘
```

### Table Dictionary
1. **`users`**: Main credential index storing Name, Email, Password Hash, Role (traveler, agency, admin), status, and suspension metrics.
2. **`agency_profiles`**: Links 1:1 to a User of role `agency`, holding business registration assets, license numbers, bank details, and verification metrics.
3. **`packages`**: Holds tour properties: Destination, Description, Price, Duration, Itinerary (JSON array), Deposit % (10–100), Refund Deadline (days), and Gallery Images (JSON array).
4. **`bookings`**: Records traveler orders, reservation status, travel dates, gender/traveler count validator counts, and cancellations.
5. **`payment_transactions`**: Financial transaction registers storing amounts, platform fees deducted (10%), agency payouts, and transaction references.
6. **`reviews`**: Package feedback ledger storing rating (1–5) and traveler text.
7. **`conversations`** & **`messages`**: Multi-party real-time messaging threads.
8. **`support_tickets`**: Ticket ledger storing general support, package edits, or compensation transactions.

---

## ⚙️ Business Rules Implementations

### 1. Family Traveler Count Validator
* **Implementation Location**: [bookings.py:L76-82](file:///d:/DESTIN8/DESTIN8/backend/app/routers/bookings.py#L76-L82)
* **Rule**:
  ```python
  if is_family:
      if data.num_travelers < 2:
          raise HTTPException(status_code=400, detail="Family trip packages require a minimum of 2 travelers.")
      if male_count < 1 or female_count < 1:
          raise HTTPException(status_code=400, detail="Family trip bookings require at least 1 male and 1 female traveler.")
  ```

### 2. Refund Deadline Rule
* **Implementation Location**: [bookings.py:L190-210](file:///d:/DESTIN8/DESTIN8/backend/app/routers/bookings.py#L190-L210)
* **Rule**: Reads package `refund_deadline_days` vs `travel_date` or `departure_date`. If traveler cancels within the deadline limit, status is set to `refunded`. Otherwise, the deposit is marked non-refundable.

### 3. Smart Direct Edits vs Ticket Approvals
* **Implementation Location**: [packages.py:L351-370](file:///d:/DESTIN8/DESTIN8/backend/app/routers/packages.py#L351-L370)
* **Rule**:
  ```python
  booking_check = await db.execute(
      select(Booking).where(Booking.package_id == package_id, Booking.status != BookingStatus.cancelled)
  )
  has_any_bookings = booking_check.scalars().first() is not None
  if not has_any_bookings:
      # No bookings: edit goes live immediately!
  else:
      # Has bookings: create support edit request ticket for admin approval.
  ```

---

## 🛰️ REST API Endpoints Specification

Auto-generated OpenAPI docs are accessible at `http://localhost:8000/docs`.

### 1. Authentication (`/api/auth`)
* `POST /register/traveler`: Create new traveler.
* `POST /register/agency`: Register agency (requires license & address).
* `POST /login`: Log in to get JWT token.
* `GET /me` & `PATCH /me`: Retrieve/update profile metadata (Name, Phone).
* `POST /change-password`: Change user password.

### 2. Travel Packages (`/api/packages`)
* `GET /`: Browse active packages (supports destination, category, and price filters).
* `GET /{package_id}`: Detail package properties.
* `GET /agency/my-packages`: List all packages created by logged-in agency.
* `GET /agency/my-reviews`: Retrieve traveler comments and ratings across agency packages.
* `POST /agency/create`: Create a new package.
* `PATCH /agency/{package_id}`: Update package details (uses smart live edit bypass).
* `POST /upload`: Upload cover and gallery images (`multipart/form-data`).

### 3. Bookings & Checkout (`/api/bookings`)
* `POST /`: Initialize a package reservation.
* `GET /mine`: List bookings created by the logged-in traveler.
* `GET /agency/my-bookings`: Retrieve bookings grouped by packages with traveler detail and advance payment ledgers.
* `POST /{booking_id}/pay`: Charge deposit and confirm booking.
* `DELETE /{booking_id}`: Request cancellation and process deposit refund status.
* `GET /traveler/payments`: Retrieve payment receipts.

### 4. Messaging & Chat (`/api/chat`)
* `GET /conversations`: Retrieve active chats inbox.
* `POST /conversations`: Start or resume a conversation context.
* `GET /conversations/{conversation_id}/messages`: Load message thread.
* `POST /conversations/{conversation_id}/messages`: Append new chat message.

### 5. Administrative Controls (`/api/admin`)
* `GET /agencies` & `POST /agencies/{user_id}/approve`: Audit/approve agency applications.
* `GET /tickets` & `POST /tickets/{ticket_id}/resolve`: Manage package edit requests or general support tickets.
