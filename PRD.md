# Product Requirements Document (PRD) - DESTIN8

DESTIN8 is a decentralized, secure, and intuitive travel booking ecosystem connecting travelers seeking immersive experiences directly with verified local travel agencies.

---

## 👥 User Roles & Personas

### 1. The Traveler
* **Goal**: Discover, compare, and safely reserve verified packages with flexible deposit payment terms.
* **Key Features**: Category discovery, multi-package side-by-side comparison, family-travel gender validator, real-time agency chat, payment receipts ledger, and package review submission.

### 2. The Travel Agency
* **Goal**: Publish tour itineraries, configure dynamic payment policies, directly manage bookings, and chat with customers.
* **Key Features**: Multi-image package creator, live-edit bypass for unbooked packages, secure bank details link, payouts wallet ledger, customer reviews screen, and traveler booking lists grouped by package.

### 3. The Platform Administrator
* **Goal**: Verify agency credentials, resolve traveler/agency support tickets, and manage platform safety.
* **Key Features**: Agency registration dashboard (approvals/rejections), package takedown management, and support ticket resolution.

---

## ⚙️ Core Business Logic & Rules

### 1. Family Package Rule
* **Requirement**: Safeguard travelers on family-centric tours.
* **Logic**: If a package is flagged in the `"Family"` category, the booking system enforces:
  - Minimum of **2 travelers**.
  - Minimum of **1 male** and **1 female** traveler.

### 2. Payment & Deposit System
* **Requirement**: Provide flexible booking deposits.
* **Logic**:
  - Agencies specify a deposit percentage (between 10% and 100%) during package creation.
  - Travelers pay only the marked-up deposit value (original price + 10% platform markup * deposit percentage) at checkout.
  - Remaining balance is paid directly to the agency upon arrival.

### 3. Refund & Cancellation Deadlines
* **Requirement**: Balance traveler flexibility with agency revenue security.
* **Logic**:
  - Agencies configure a refund deadline (in days) for each package.
  - If a traveler cancels **before** the deadline: A full refund of the deposit is automatically processed.
  - If a traveler cancels **after** the deadline: The deposit is forfeited and disbursed to the agency.

### 4. Smart Package Edit Policy
* **Requirement**: Protect active traveler bookings while giving agencies maximum flexibility.
* **Logic**:
  - **No Bookings**: If a package has `0` active bookings, the agency can modify any details (price, duration, itinerary) and updates go live **instantly**.
  - **Active Bookings**: If a package has active confirmed bookings, direct updates are blocked. Agencies must submit an edit request support ticket which the admin reviews to verify compatibility with existing traveler plans.

---

## 💬 Chat & Communication System

* Direct messaging is initialized from the package details page.
* Conversations are established uniquely per traveler-agency pair.
* In-app badge alerts represent unread message counts.
* Real-time sync is maintained via auto-polling interfaces on the mobile client.
