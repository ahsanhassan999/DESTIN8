# DESTIN8 - Technical Presentation & Viva Guide

This document contains possible technical questions and answers to prepare for project reviews, exams, or developer handovers.

---

## 🗄️ Database & Schema Design

### Q1: Why did you choose SQLite for development instead of PostgreSQL?
**Answer**: SQLite was chosen for development because it requires zero server configuration and stores the entire database in a single local file (`destin8.db`). This makes local setup and testing extremely fast. However, the schema is designed using **SQLAlchemy ORM** models, meaning we can switch to a production-grade database like PostgreSQL simply by changing the connection URL string in environment variables (`.env`), without changing any database query code.

### Q2: How does the database schema structure handle relationships?
**Answer**: 
- **Users and Agency Profiles**: Has a **1-to-1** relationship. An `AgencyProfile` row is created only if a user registers as an agency.
- **Agency and Packages**: Has a **1-to-many** relationship. An agency can post multiple packages, linked via `agency_id` foreign keys.
- **Bookings and Payments**: Has a **1-to-1** relationship. Each `Booking` is associated with exactly one `PaymentTransaction` recording the deposit receipt.

---

## ⚙️ Core Business Logic & Rules

### Q3: Explain the math behind the Traveler Deposit Payment and Agency Payouts.
**Answer**: 
1. **Original Package Price**: Configured by the agency (e.g., `PKR 10,000`).
2. **Traveler Price (10% Platform Markup)**: To generate platform revenue, all packages shown to travelers are marked up by 10%:
   $$\text{Traveler Price} = \text{Original Price} \times 1.10 \quad \text{(e.g., PKR 11,000)}$$
3. **Traveler Deposit Paid**: If the package has a 50% deposit rule:
   $$\text{Deposit Paid} = \text{Traveler Price} \times 0.50 \quad \text{(e.g., PKR 5,500)}$$
4. **Platform Commission**: 10% of the **Original Price** is deducted from the deposit:
   $$\text{Platform Commission} = \text{Original Price} \times 0.10 \quad \text{(e.g., PKR 1,000)}$$
5. **Agency Payout Amount**: The remaining deposit amount is disbursed to the agency:
   $$\text{Agency Payout} = \text{Deposit Paid} - \text{Platform Commission} \quad \text{(e.g., PKR 4,500)}$$

### Q4: How is the Family Trip Rule enforced in the backend?
**Answer**: When a traveler attempts to reserve a package flagged as `"Family"`, the booking endpoint validates that:
1. `num_travelers` is $\ge 2$.
2. `male_count` is $\ge 1$ and `female_count` is $\ge 1$.
If these conditions are not met, the API returns a `400 Bad Request` with validation instructions.

### Q5: What is the "Smart Package Edit Policy"?
**Answer**: 
- If a package has **no bookings**, the agency can modify any property, and edits save directly to the database.
- If a package has **active bookings**, direct editing is locked to protect traveler itineraries. The agency must submit a request. This creates a `SupportTicket` of type `package_edit_request` storing changes as a JSON string. The admin verifies and approves the request, which then merges the changes safely.

---

## 🔒 Security & Authorization

### Q6: How are passwords secured in the database?
**Answer**: Passwords are never stored in plain text. They are hashed using **bcrypt** via the `passlib` library before being written to SQLite.

### Q7: How is user session authentication managed?
**Answer**: The backend implements **JWT (JSON Web Tokens)**. When a user logs in, the server generates a token containing the user's ID, role, and expiration time, signed using a secure secret key. The mobile client sends this token in the `Authorization: Bearer <TOKEN>` header of every request. FastAPI dependencies (e.g. `get_current_approved_agency`) decode the token to authenticate and authorize the request based on roles.

---

## 📱 Mobile Client & Communication

### Q8: How does the chat feature sync messages in real-time?
**Answer**: The mobile client implements an auto-polling cycle in `ChatDetailScreen.js`. It runs a `useEffect` timer that triggers an API call every 3 seconds to fetch new messages from `/api/chat/conversations/{id}/messages`. This delivers high-reliability real-time messaging without the extra server setup required for WebSockets.

### Q9: Why is XMLHttpRequest used instead of Fetch for image uploads?
**Answer**: React Native's `fetch` API has known memory and format parser issues when constructing multi-part form data streams on certain Android and iOS system engines. We resolved this by building a native `XMLHttpRequest` uploader, providing stable transmission for cover and gallery image files.
