# Application Flow Documentation — DESTIN8

> **Version**: 1.0
> **Last Updated**: 2026-03-03
> **Tech Stack**: FastAPI (Python) + SQLite + React Native (Expo Go / Android)
> **Architecture**: Local-first (MacBook server + phone client on same Wi-Fi)

---

## 1. Entry Points

### 1.1 Direct App Launch
- User opens the DESTIN8 app on Android via Expo Go.
- **First launch** → Splash Screen → Onboarding / Welcome Screen.
- **Returning user (token valid)** → Splash Screen → Home Screen.
- **Returning user (token expired)** → Splash Screen → Login Screen.

### 1.2 Push Notifications (Post-MVP)
- New chat message → Opens Chat Screen for that conversation.
- Booking status update → Opens Booking Details Screen.
- Agency approval notification → Opens Agency Dashboard.

### 1.3 Deep Links (Post-MVP / Cloud Phase)
- Shared package link → Opens Package Detail Screen.
- Email verification link → Opens Email Verified confirmation screen.

### 1.4 Search (Post-MVP / Web App Phase)
- Search engine results link to web app package pages when web version is deployed.

> **MVP Note**: For MVP (local-only), the only entry point is direct app launch via Expo Go on Android.

---

## 2. Core User Flows

---

### 2.1 Traveler Registration & Onboarding

#### Happy Path
1. **Splash Screen** → App logo displayed for 2 seconds → auto-navigate.
2. **Welcome Screen**
   - UI: App logo, tagline ("Find. Compare. Travel."), two buttons: `Sign Up`, `Log In`.
   - User taps `Sign Up`.
3. **Registration Screen (Role Selection)**
   - UI: Two cards — "I'm a Traveler" and "I'm a Travel Agency".
   - User selects **"I'm a Traveler"**.
4. **Traveler Registration Form**
   - UI: Input fields — Full Name, Email, Password, Confirm Password. Button: `Create Account`.
   - **Validation Rules**:
     - Full Name: Required, min 2 characters, max 50 characters.
     - Email: Required, valid email format, must be unique.
     - Password: Required, min 8 characters, at least 1 uppercase, 1 number.
     - Confirm Password: Must match Password.
   - User fills in form → taps `Create Account`.
5. **System Response**:
   - API: `POST /api/auth/register` with `{ name, email, password, role: "traveler" }`.
   - Success → Account created → JWT token returned → Navigate to **Home Screen**.
   - Success toast: "Account created successfully! Welcome to Travellure."

#### Error States
| Error                    | Display                                                                                      | Recovery                                |
| ------------------------ | -------------------------------------------------------------------------------------------- | --------------------------------------- |
| Email already registered | Inline error: "This email is already registered. Try logging in."                            | Tap `Log In` link below form            |
| Invalid email format     | Inline error: "Please enter a valid email address."                                          | User corrects input                     |
| Password too weak        | Inline error: "Password must be at least 8 characters with 1 uppercase letter and 1 number." | User corrects input                     |
| Passwords don't match    | Inline error: "Passwords do not match."                                                      | User re-enters confirm password         |
| Server unreachable       | Modal: "Cannot connect to server. Please make sure you're on the same Wi-Fi network."        | Retry button + check Wi-Fi instructions |
| Request timeout (>10s)   | Modal: "Request timed out. Please try again."                                                | Retry button                            |

#### Edge Cases
- **User abandons flow**: Partially entered data is NOT saved. User returns to Welcome Screen.
- **User goes back**: Back button returns to Role Selection → Welcome Screen. Form data is cleared.
- **Duplicate submission**: Button disabled after first tap + loading spinner. Prevents double registration.
- **Session expiry**: Not applicable (user not yet logged in).

---

### 2.2 Agency Registration & Approval

#### Happy Path
1. **Welcome Screen** → User taps `Sign Up`.
2. **Registration Screen (Role Selection)** → User selects **"I'm a Travel Agency"**.
3. **Agency Registration Form**
   - UI: Input fields — Agency Name, Owner Name, Email, Password, Confirm Password, Phone Number, Business Address, Business License Number. Button: `Submit for Approval`.
   - **Validation Rules**:
     - Agency Name: Required, min 3 characters, max 100 characters.
     - Owner Name: Required, min 2 characters.
     - Email: Required, valid format, unique.
     - Password: Required, min 8 characters, 1 uppercase, 1 number.
     - Phone Number: Required, valid Pakistani phone format (03XX-XXXXXXX).
     - Business Address: Required, min 10 characters.
     - Business License Number: Required, alphanumeric.
   - User fills in form → taps `Submit for Approval`.
4. **System Response**:
   - API: `POST /api/auth/register` with `{ ..., role: "agency", status: "pending" }`.
   - Success → Navigate to **Pending Approval Screen**.
   - Screen message: "Your agency account has been submitted for review. You will be notified once approved by the admin."
5. **Admin Reviews** (on Admin Dashboard):
   - Admin sees pending agency in list → Reviews details → Taps `Approve` or `Reject`.
   - API: `PUT /api/admin/agencies/{id}/approve` or `/reject`.
6. **Agency Receives Notification**:
   - **Approved** → Agency can now log in → redirected to **Agency Dashboard**.
   - **Rejected** → Agency sees: "Your account was not approved. Please contact support for more information."

#### Error States
| Error                    | Display                                                           | Recovery                      |
| ------------------------ | ----------------------------------------------------------------- | ----------------------------- |
| Required fields missing  | Inline error on each field: "This field is required."             | User fills in missing fields  |
| Invalid phone format     | Inline error: "Please enter a valid phone number (03XX-XXXXXXX)." | User corrects input           |
| Email already registered | Inline error: "This email is already registered."                 | Use different email or log in |
| Server unreachable       | Modal: "Cannot connect to server."                                | Retry button                  |

#### Edge Cases
- **Agency tries to log in before approval**: System shows "Your account is pending approval. Please wait for admin verification."
- **Agency rejected tries to re-register**: Can register with same email after rejection (previous record marked as rejected).
- **Admin takes too long**: No automatic timeout. Agency sees pending status until admin acts.

---

### 2.3 User Login

#### Happy Path
1. **Welcome Screen** → User taps `Log In`.
2. **Login Screen**
   - UI: Email input, Password input, `Log In` button, `Forgot Password?` link, `Sign Up` link.
   - User enters email and password → taps `Log In`.
3. **System Response**:
   - API: `POST /api/auth/login` with `{ email, password }`.
   - **Validation**:
     - Email: Required, valid format.
     - Password: Required.
   - Success → JWT token stored locally → Route based on role:

```
IF role == "traveler" THEN → Home Screen (package feed)
ELSE IF role == "agency" AND status == "approved" THEN → Agency Dashboard
ELSE IF role == "agency" AND status == "pending" THEN → Pending Approval Screen
ELSE IF role == "agency" AND status == "rejected" THEN → Show rejection message
ELSE IF role == "admin" THEN → Admin Dashboard
```

#### Error States
| Error                   | Display                                                    | Recovery                   |
| ----------------------- | ---------------------------------------------------------- | -------------------------- |
| Wrong email or password | Toast: "Invalid email or password. Please try again."      | User re-enters credentials |
| Account not found       | Toast: "No account found with this email. Please sign up." | Tap `Sign Up` link         |
| Agency pending approval | Screen: "Your account is pending approval."                | Wait for admin             |
| Agency rejected         | Screen: "Your account was not approved."                   | Contact support            |
| Server unreachable      | Modal: "Cannot connect to server."                         | Retry button               |

#### Edge Cases
- **Multiple failed attempts**: After 5 failed attempts, show: "Too many failed attempts. Please try again in 5 minutes." (rate limiting on API).
- **Token expiry during session**: API returns 401 → Auto-redirect to Login Screen with toast: "Session expired. Please log in again."
- **Back button on Login**: Returns to Welcome Screen.

---

### 2.4 Package Browsing & Search (Traveler)

#### Happy Path
1. **Home Screen**
   - UI: Search bar at top, filter chips (Budget, Destination, Duration), horizontally scrollable category cards (Mountains, Beach, Historical, etc.), vertical list of featured packages.
   - Each package card shows: Cover image, title, destination, price, duration, agency name, rating (stars).
2. **User searches** → Types "Murree" in search bar → taps search icon.
3. **Search Results Screen**
   - API: `GET /api/packages?search=Murree`.
   - UI: Filtered package list. Filter bar (Budget range slider, Duration dropdown, Sort by: Price/Rating).
   - Results update instantly as filters change.
4. **User taps a package card** → Navigates to **Package Detail Screen**.
5. **Package Detail Screen**
   - API: `GET /api/packages/{id}`.
   - UI: Image carousel, package title, destination, price, duration, services included (bullet list), agency name + rating, description, `Chat with Agency` button, `Book Now` button (post-MVP), `Save to Wishlist` heart icon (P2).

#### Error States
| Error                       | Display                                                                                             | Recovery                |
| --------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------- |
| No results found            | Empty state: illustration + "No packages found matching your criteria. Try adjusting your filters." | Clear filters button    |
| Server unreachable          | Full-screen error: "Unable to load packages. Check your connection."                                | `Retry` button          |
| Package deleted/unavailable | Screen: "This package is no longer available."                                                      | `Back to Search` button |
| Image fails to load         | Placeholder image with broken-image icon                                                            | Auto-retry on scroll    |

#### Edge Cases
- **Empty database (no packages)**: Home Screen shows: "No packages available yet. Check back soon!" with illustration.
- **User applies conflicting filters** (e.g., budget ₹0–₹100): Show "No results" gracefully.
- **Rapid filter changes**: Debounce API calls (300ms delay) to avoid excessive requests.

---

### 2.5 In-App Chat (Traveler ↔ Agency)

#### Happy Path
1. **Package Detail Screen** → User taps `Chat with Agency`.
2. **System Check**:

```
IF user is NOT logged in THEN → Redirect to Login Screen with message: "Please log in to chat."
ELSE IF user is logged in THEN → Open Chat Screen
```

3. **Chat Screen**
   - API: WebSocket connection to `ws://<server-ip>:8000/ws/chat/{conversation_id}`.
   - UI: Message bubbles (user = right/blue, agency = left/gray), text input field, send button, package reference card at top.
   - User types message → taps send → message appears instantly.
   - Agency receives message in real-time via WebSocket.

4. **Contact Info Restriction** (P1 — Post-MVP):

```
IF booking_status != "confirmed" THEN
    IF message contains phone/email/WhatsApp pattern THEN
        → Block message
        → Show warning: "Contact information cannot be shared before booking confirmation."
    ELSE
        → Send message normally
ELSE IF booking_status == "confirmed" THEN
    → Send message normally (no restrictions)
```

#### Error States
| Error                      | Display                                         | Recovery                                   |
| -------------------------- | ----------------------------------------------- | ------------------------------------------ |
| WebSocket connection fails | Banner: "Chat connection lost. Reconnecting..." | Auto-retry every 5 seconds, max 3 attempts |
| Message fails to send      | Red icon on message + "Tap to retry"            | User taps message to resend                |
| Server unreachable         | Modal: "Cannot connect to chat server."         | Retry button                               |

#### Edge Cases
- **User sends message while offline**: Message queued locally with "pending" indicator. Sent when connection restores.
- **Both users type simultaneously**: Messages appear in chronological order from server timestamp.
- **Long message**: Max 1000 characters. Show character counter. Inline error if exceeded.
- **Chat history loading**: Load last 50 messages initially. "Load more" button for older messages (pagination).

---

### 2.6 Agency Package Management (CRUD)

#### Happy Path — Create Package
1. **Agency Dashboard** → Agency taps `+ Add Package`.
2. **Create Package Screen**
   - UI: Form fields — Title, Destination, Price (PKR), Duration (days), Services Included (multi-select chips: Transport, Hotel, Meals, Guide), Description (textarea), Cover Image (upload), Departure Date. Button: `Post Package`.
   - **Validation Rules**:
     - Title: Required, 5–100 characters.
     - Destination: Required, 3–50 characters.
     - Price: Required, positive number, min ₹500.
     - Duration: Required, positive integer, 1–30 days.
     - Services: At least 1 service selected.
     - Description: Required, 20–2000 characters.
     - Cover Image: Required, max 5MB, JPG/PNG only.
   - Agency fills form → taps `Post Package`.
3. **System Response**:
   - API: `POST /api/packages` with form data + JWT token.
   - Success → Toast: "Package posted successfully!" → Navigate to Agency Dashboard.
   - Package appears in public listing immediately (approved agencies have auto-publish).

#### Happy Path — Edit Package
1. **Agency Dashboard** → Agency taps a package card → taps `Edit`.
2. **Edit Package Screen**: Pre-filled form with existing data.
3. Agency modifies fields → taps `Update Package`.
4. API: `PUT /api/packages/{id}` → Success toast: "Package updated successfully!"

#### Happy Path — Delete Package
1. **Agency Dashboard** → Agency taps a package → taps `Delete`.
2. **Confirmation Modal**: "Are you sure you want to delete this package? This action cannot be undone."
3. Agency taps `Delete` → API: `DELETE /api/packages/{id}`.
4. Success → Toast: "Package deleted." → Package removed from list.

#### Error States
| Error                              | Display                                                          | Recovery                |
| ---------------------------------- | ---------------------------------------------------------------- | ----------------------- |
| Required fields missing            | Inline errors on each field                                      | User fills missing data |
| Image too large (>5MB)             | Toast: "Image must be under 5MB."                                | Choose smaller image    |
| Invalid image format               | Toast: "Only JPG and PNG images are allowed."                    | Choose valid format     |
| Delete package with active booking | Modal: "This package has active bookings and cannot be deleted." | Cancel delete action    |
| Server unreachable                 | Modal: "Cannot save. Check connection."                          | Retry button            |

#### Edge Cases
- **Agency tries to post without approval**: API returns 403 → "Your account is not yet approved."
- **Agency edits during traveler viewing**: Traveler sees updated version on next API call/refresh.
- **Image upload interrupted**: Show progress bar. If interrupted, user must re-upload.

---

### 2.7 Admin Dashboard & Agency Approval

#### Happy Path
1. **Admin logs in** → Redirected to **Admin Dashboard**.
2. **Admin Dashboard**
   - UI: Top stats bar (Total Travelers, Total Agencies, Total Packages, Pending Approvals count).
   - Tab navigation: `Agencies` | `Packages` | `Users` | `Chat Monitor` (P1).
3. **Agencies Tab**
   - Sub-tabs: `Pending` | `Approved` | `Rejected`.
   - Each agency card shows: Agency Name, Owner, Email, Phone, License Number, Registration Date.
   - Admin taps a pending agency → **Agency Review Screen**.
4. **Agency Review Screen**
   - UI: Full agency details + `Approve` button (green) + `Reject` button (red).
   - Admin taps `Approve`:
     - API: `PUT /api/admin/agencies/{id}/status` with `{ status: "approved" }`.
     - Toast: "Agency approved successfully."
     - Agency moved to Approved tab.
   - Admin taps `Reject`:
     - Rejection reason modal → Admin enters reason → Confirm.
     - API: `PUT /api/admin/agencies/{id}/status` with `{ status: "rejected", reason: "..." }`.
     - Toast: "Agency rejected."
5. **Packages Tab**
   - List of all packages across agencies.
   - Admin can tap a package → view details → `Remove Package` button.
   - Removal: Confirmation modal → API: `DELETE /api/admin/packages/{id}`.

#### Error States
| Error                                          | Display                                         | Recovery     |
| ---------------------------------------------- | ----------------------------------------------- | ------------ |
| No pending agencies                            | Empty state: "No pending agency registrations." | —            |
| Server unreachable                             | Error banner: "Cannot load data."               | Retry button |
| Admin tries to approve already-approved agency | Toast: "This agency is already approved."       | Refresh list |

#### Edge Cases
- **Multiple admins approve simultaneously**: Server processes first request; second gets "already approved".
- **Admin deletes package with active bookings (post-MVP)**: Warning shown before deletion.

---

### 2.8 Ratings & Reviews (P1)

#### Happy Path
1. **Traveler opens a package they've booked (post-trip)**.
2. System shows: "How was your trip? Rate this package."
3. **Review Screen**:
   - UI: 5-star rating selector, review text input (optional, max 500 chars), `Submit Review` button.
   - Traveler selects 4 stars → writes review → taps `Submit`.
4. API: `POST /api/packages/{id}/reviews` with `{ rating, comment }`.
5. Success → Toast: "Review submitted! Thank you." → Review appears on Package Detail.

#### Error States
| Error              | Display                                             | Recovery             |
| ------------------ | --------------------------------------------------- | -------------------- |
| No rating selected | Inline error: "Please select a rating (1–5 stars)." | User selects stars   |
| Review too long    | Character counter turns red at 500                  | User shortens review |
| Duplicate review   | Toast: "You've already reviewed this package."      | —                    |

---

### 2.9 Account Management

#### View Profile
1. **Bottom Tab** → `Profile` tab.
2. **Profile Screen**:
   - UI: Profile avatar, name, email, role badge (Traveler/Agency).
   - Menu: `Edit Profile`, `My Bookings` (post-MVP), `My Wishlist` (P2), `My Reviews`, `Log Out`.

#### Edit Profile
1. Profile Screen → taps `Edit Profile`.
2. **Edit Profile Screen**: Editable fields — Name, Phone (optional), Profile Photo.
3. User updates → taps `Save` → API: `PUT /api/users/me`.
4. Success toast: "Profile updated."

#### Logout
1. Profile Screen → taps `Log Out`.
2. Confirmation: "Are you sure you want to log out?"
3. User confirms → JWT token cleared → Navigate to **Welcome Screen**.

#### Edge Cases
- **Edit profile while offline**: Show error: "Cannot save changes. Check your connection."
- **Session expiry during edit**: Redirect to Login with message: "Session expired."

---

### 2.10 Wishlist / Save for Later (P2)

#### Happy Path
1. **Package Detail Screen** → User taps the heart icon (♡).
2. Heart icon fills (♥) + toast: "Saved to wishlist!"
3. API: `POST /api/wishlist` with `{ package_id }`.
4. User can view saved packages via **Profile → My Wishlist**.
5. Tap heart again → Remove from wishlist → API: `DELETE /api/wishlist/{package_id}`.

---

## 3. Navigation Map

```
Travellure App
│
├── 🔓 Welcome Screen (Public)
│   ├── Sign Up → Role Selection Screen
│   │   ├── Traveler → Traveler Registration Form → Home Screen
│   │   └── Agency → Agency Registration Form → Pending Approval Screen
│   └── Log In → Login Screen
│       ├── Traveler → Home Screen
│       ├── Agency (approved) → Agency Dashboard
│       ├── Agency (pending) → Pending Approval Screen
│       └── Admin → Admin Dashboard
│
├── 🔒 Traveler Screens (Authenticated: role=traveler)
│   ├── Home Screen (Bottom Tab: Home)
│   │   ├── Search Results Screen
│   │   │   └── Package Detail Screen
│   │   │       ├── Chat Screen (with agency)
│   │   │       ├── Book Now (post-MVP)
│   │   │       └── Save to Wishlist (P2)
│   │   └── Package Detail Screen (from featured)
│   ├── Chat List Screen (Bottom Tab: Chats)
│   │   └── Chat Screen
│   ├── Wishlist Screen (Bottom Tab: Wishlist) [P2]
│   └── Profile Screen (Bottom Tab: Profile)
│       ├── Edit Profile Screen
│       ├── My Bookings Screen (post-MVP)
│       ├── My Reviews Screen
│       └── Log Out → Welcome Screen
│
├── 🔒 Agency Screens (Authenticated: role=agency, status=approved)
│   ├── Agency Dashboard (Bottom Tab: Dashboard)
│   │   ├── Package Detail (own package)
│   │   │   ├── Edit Package Screen
│   │   │   └── Delete Package (confirmation modal)
│   │   └── Create Package Screen
│   ├── Chat List Screen (Bottom Tab: Chats)
│   │   └── Chat Screen
│   └── Profile Screen (Bottom Tab: Profile)
│       ├── Edit Profile Screen
│       └── Log Out → Welcome Screen
│
└── 🔒 Admin Screens (Authenticated: role=admin)
    ├── Admin Dashboard (Tab: Overview)
    │   ├── Stats (total users, agencies, packages, pending)
    ├── Agencies Tab
    │   ├── Pending Agencies List
    │   │   └── Agency Review Screen → Approve / Reject
    │   ├── Approved Agencies List
    │   └── Rejected Agencies List
    ├── Packages Tab
    │   └── Package Detail → Remove Package
    ├── Users Tab
    │   └── User List (view-only)
    └── Chat Monitor Tab (P1)
        └── Chat Viewer (read-only)
```

---

## 4. Screen Inventory

### Public Screens (No Authentication Required)

| Screen                | Route                | Purpose                             | Key UI Elements                                                    | Actions → Destination                             |
| --------------------- | -------------------- | ----------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------- |
| Splash Screen         | `/splash`            | Brand display on launch             | App logo, loading indicator                                        | Auto-navigate → Welcome / Home                    |
| Welcome Screen        | `/welcome`           | Entry point for new/returning users | Logo, tagline, `Sign Up` btn, `Log In` btn                         | Sign Up → Role Selection; Log In → Login Screen   |
| Role Selection        | `/register/role`     | Choose account type                 | Traveler card, Agency card                                         | Traveler → Traveler Reg; Agency → Agency Reg      |
| Traveler Registration | `/register/traveler` | Create traveler account             | Name, email, password, confirm pw, submit btn                      | Submit → Home Screen                              |
| Agency Registration   | `/register/agency`   | Create agency account               | Agency name, owner, email, pw, phone, address, license, submit btn | Submit → Pending Approval                         |
| Login Screen          | `/login`             | Authenticate existing user          | Email, password, log in btn, sign up link                          | Login → Home / Agency Dashboard / Admin Dashboard |
| Pending Approval      | `/pending`           | Inform agency of pending status     | Status message, illustration                                       | None (waiting for admin)                          |

### Traveler Screens (Authenticated: role=traveler)

| Screen         | Route              | Purpose                  | Key UI Elements                                              | State Variants                              |
| -------------- | ------------------ | ------------------------ | ------------------------------------------------------------ | ------------------------------------------- |
| Home Screen    | `/home`            | Browse featured packages | Search bar, filter chips, category cards, package list       | Loading, Empty (no packages), Loaded, Error |
| Search Results | `/search?q=`       | View filtered packages   | Package list, filter bar, sort options                       | Loading, Results, No Results, Error         |
| Package Detail | `/packages/:id`    | View full package info   | Image carousel, details, agency info, chat btn, wishlist btn | Loading, Loaded, Not Found, Error           |
| Chat List      | `/chats`           | View all conversations   | Conversation list with last message preview                  | Loading, Empty, Loaded, Error               |
| Chat Screen    | `/chats/:id`       | Chat with agency         | Message bubbles, text input, send btn                        | Connected, Reconnecting, Error              |
| Profile        | `/profile`         | View account info        | Avatar, name, email, menu items                              | Loaded                                      |
| Edit Profile   | `/profile/edit`    | Modify account details   | Editable name, phone, photo                                  | Loading, Loaded, Saving                     |
| My Reviews     | `/profile/reviews` | View submitted reviews   | Review list with rating and text                             | Loading, Empty, Loaded                      |
| Wishlist (P2)  | `/wishlist`        | View saved packages      | Package cards with remove btn                                | Loading, Empty, Loaded                      |

### Agency Screens (Authenticated: role=agency, status=approved)

| Screen           | Route                       | Purpose                     | Key UI Elements                              | State Variants                     |
| ---------------- | --------------------------- | --------------------------- | -------------------------------------------- | ---------------------------------- |
| Agency Dashboard | `/agency`                   | Manage packages             | Stats bar, package list, `+ Add Package` btn | Loading, Empty, Loaded             |
| Create Package   | `/agency/packages/new`      | Post new package            | Form fields, image upload, submit btn        | Empty Form, Validating, Submitting |
| Edit Package     | `/agency/packages/:id/edit` | Modify existing package     | Pre-filled form, update btn                  | Loading, Loaded, Saving            |
| Chat List        | `/agency/chats`             | View traveler conversations | Conversation list                            | Loading, Empty, Loaded             |
| Chat Screen      | `/agency/chats/:id`         | Chat with traveler          | Message bubbles, text input                  | Connected, Reconnecting            |

### Admin Screens (Authenticated: role=admin)

| Screen            | Route                 | Purpose               | Key UI Elements                                    | State Variants         |
| ----------------- | --------------------- | --------------------- | -------------------------------------------------- | ---------------------- |
| Admin Dashboard   | `/admin`              | Platform overview     | Stats cards, tab navigation                        | Loading, Loaded        |
| Agencies List     | `/admin/agencies`     | Manage agencies       | Sub-tabs (Pending/Approved/Rejected), agency cards | Loading, Empty, Loaded |
| Agency Review     | `/admin/agencies/:id` | Review agency details | Full details, Approve/Reject btns                  | Loading, Loaded        |
| Packages List     | `/admin/packages`     | Monitor all packages  | Package cards, remove btn                          | Loading, Empty, Loaded |
| Users List        | `/admin/users`        | View all users        | User list (view-only)                              | Loading, Empty, Loaded |
| Chat Monitor (P1) | `/admin/chats`        | Monitor all chats     | Chat list, read-only viewer                        | Loading, Empty, Loaded |

---

## 5. Decision Points

### Authentication Guard (Every Protected Screen)

```
IF jwt_token exists in local storage THEN
    IF token is valid (not expired) THEN
        IF user.role matches required role for screen THEN
            → Allow access
        ELSE
            → Redirect to appropriate dashboard for user's role
    ELSE
        → Clear token
        → Redirect to Login Screen
        → Toast: "Session expired. Please log in again."
ELSE
    → Redirect to Welcome Screen
```

### First Launch vs Returning User

```
IF jwt_token exists AND is valid THEN
    → Splash Screen → Home / Dashboard (based on role)
ELSE IF user has opened app before (flag in AsyncStorage) THEN
    → Splash Screen → Login Screen
ELSE
    → Splash Screen → Welcome Screen (first-time onboarding)
```

### Login Routing

```
IF login successful THEN
    IF role == "traveler" THEN → Home Screen
    ELSE IF role == "agency" THEN
        IF status == "approved" THEN → Agency Dashboard
        ELSE IF status == "pending" THEN → Pending Approval Screen
        ELSE IF status == "rejected" THEN → Show rejection message
    ELSE IF role == "admin" THEN → Admin Dashboard
ELSE
    → Show error message on Login Screen
```

### Chat Initiation

```
IF user taps "Chat with Agency" THEN
    IF user is authenticated THEN
        IF existing conversation with this agency exists THEN
            → Open existing Chat Screen
        ELSE
            → Create new conversation → Open Chat Screen
    ELSE
        → Redirect to Login Screen
        → Toast: "Please log in to chat with agencies."
```

### Package Actions (Agency)

```
IF agency taps "Delete Package" THEN
    IF package has active bookings (post-MVP) THEN
        → Show error: "Cannot delete package with active bookings."
    ELSE
        → Show confirmation modal
        → IF confirmed THEN delete package
        → ELSE cancel
```

### Search & Filter

```
IF search query is empty AND no filters applied THEN
    → Show featured/all packages
ELSE IF search query provided OR filters applied THEN
    → API call with query params
    → IF results > 0 THEN → Show results
    → ELSE → Show empty state: "No packages found."
```

### Agency Account Status Check (On Login)

```
IF agency.status == "pending" THEN
    → Show Pending Approval Screen
    → Disable all package management features
ELSE IF agency.status == "rejected" THEN
    → Show rejection message with reason
    → Offer option to contact support
ELSE IF agency.status == "approved" THEN
    → Full access to Agency Dashboard
```

---

## 6. Error Handling

### 6.1 Network / Server Errors

| Error              | HTTP Code                | Display                                                                                                                  | User Actions                               | System Recovery                    |
| ------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ | ---------------------------------- |
| Server unreachable | N/A (connection refused) | Full-screen: "Cannot connect to server. Make sure your laptop server is running and both devices are on the same Wi-Fi." | `Retry` button, `Check Setup` link         | Auto-retry every 10s in background |
| Server error       | 500                      | Full-screen: "Something went wrong on our end. Please try again."                                                        | `Retry` button                             | Log error for debugging            |
| Request timeout    | N/A (>10s)               | Toast: "Request timed out. Please try again."                                                                            | `Retry` button                             | —                                  |
| Network offline    | N/A                      | Banner at top: "No internet connection." (persistent)                                                                    | Banner disappears when connection restores | Auto-detect network changes        |

### 6.2 Authentication Errors

| Error                  | HTTP Code | Display                                            | User Actions                  | System Recovery       |
| ---------------------- | --------- | -------------------------------------------------- | ----------------------------- | --------------------- |
| Invalid credentials    | 401       | Toast: "Invalid email or password."                | Re-enter credentials          | —                     |
| Token expired          | 401       | Toast: "Session expired. Please log in again."     | Auto-redirect to Login        | Clear stored token    |
| Forbidden (wrong role) | 403       | Toast: "You don't have permission to access this." | Redirect to correct dashboard | —                     |
| Rate limited           | 429       | Toast: "Too many attempts. Please wait 5 minutes." | Wait and retry                | Countdown timer shown |

### 6.3 Data / Resource Errors

| Error              | HTTP Code | Display                                    | User Actions        | System Recovery |
| ------------------ | --------- | ------------------------------------------ | ------------------- | --------------- |
| Resource not found | 404       | Screen: "This page/package doesn't exist." | `Go Back` button    | —               |
| Validation error   | 422       | Inline field errors (specific to field)    | User corrects input | —               |
| Duplicate resource | 409       | Toast: "This already exists."              | Modify input        | —               |
| File too large     | 413       | Toast: "File must be under 5MB."           | Choose smaller file | —               |

### 6.4 Form Validation Failures

All forms validate on submit. Errors shown inline below each field in red text.

```
Validation Order:
1. Required fields checked first → "This field is required."
2. Format validation → specific error message per field.
3. Business rules (uniqueness, min/max) → specific error message.
4. Scroll to first error field automatically.
```

---

## 7. Responsive Behavior

> **MVP is Android-only (React Native / Expo Go).** Web app and tablet support are post-MVP.

### 7.1 Mobile (Android — MVP Target)

- **Navigation**: Bottom tab bar (4 tabs max — Home, Chats, Wishlist, Profile).
- **Touch interactions**: Tap, swipe-to-go-back, pull-to-refresh on lists, swipe to delete (agency packages).
- **Keyboard**: Soft keyboard pushes content up. Auto-dismiss on scroll. `Done` button on keyboard.
- **Screen orientation**: Portrait only (locked).
- **Image handling**: Images responsive to screen width. Carousel uses full-width with horizontal swipe.
- **Lists**: Infinite scroll with loading spinner at bottom. Pull-to-refresh at top.
- **Modals**: Bottom sheet style (slide up from bottom).
- **Forms**: Full-width inputs. Labels above fields. Scroll within form if content overflows.

### 7.2 Tablet (Post-MVP)

- **Layout**: Split-view where applicable (package list on left, detail on right).
- **Navigation**: Side drawer or bottom tabs (larger touch targets).
- **Modals**: Centered modals instead of bottom sheets.

### 7.3 Desktop / Web App (Post-MVP)

- **Layout**: Multi-column layouts. Sidebar navigation.
- **Navigation**: Top navigation bar + sidebar for admin.
- **Interactions**: Hover states on cards and buttons. Right-click context menus for admin actions.
- **Forms**: Multi-column form layouts for wider screens.
- **Comparison (P1)**: Side-by-side package comparison uses full desktop width.

---

## 8. Animations & Transitions

### 8.1 Page Transitions

| Transition                | Type                 | Duration | Easing      |
| ------------------------- | -------------------- | -------- | ----------- |
| Forward navigation (push) | Slide in from right  | 300ms    | ease-in-out |
| Back navigation (pop)     | Slide out to right   | 250ms    | ease-in-out |
| Tab switch (bottom tabs)  | Crossfade            | 200ms    | ease        |
| Modal open                | Slide up from bottom | 300ms    | ease-out    |
| Modal close               | Slide down           | 250ms    | ease-in     |

### 8.2 Loading States

| State               | Animation                          | Description                                                 |
| ------------------- | ---------------------------------- | ----------------------------------------------------------- |
| App launch (Splash) | Fade in → scale up logo → fade out | Logo appears, scales slightly, then fades to next screen    |
| Screen loading      | Skeleton placeholders              | Gray pulsing rectangles mimicking content layout            |
| Button loading      | Spinner replaces button text       | Button text replaced with circular spinner, button disabled |
| Pull-to-refresh     | Spinner at top of list             | Circular spinner appears above list during refresh          |
| Image loading       | Blur-up                            | Low-res placeholder → sharp image fade-in                   |

### 8.3 Interactive Elements

| Element                | Animation                             | Trigger                       | Duration                        |
| ---------------------- | ------------------------------------- | ----------------------------- | ------------------------------- |
| Package card           | Scale down 0.97 → release             | Press/tap                     | 100ms                           |
| Heart icon (wishlist)  | Fill + scale bounce (1.0 → 1.3 → 1.0) | Tap to save                   | 300ms                           |
| Star rating            | Stars fill sequentially (gold)        | Tap a star                    | 150ms per star                  |
| Send message           | Message bubble slides up from input   | Send button tap               | 200ms                           |
| Toast notification     | Slide down from top → auto-dismiss    | System event                  | 300ms in, 3s visible, 300ms out |
| Filter chip (selected) | Background fill + checkmark appear    | Tap                           | 200ms                           |
| Delete confirmation    | Shake animation on delete button      | Confirming destructive action | 300ms                           |

### 8.4 Micro-Animations

| Animation                | Description                                 |
| ------------------------ | ------------------------------------------- |
| Chat typing indicator    | Three dots pulsing sequentially (bounce)    |
| Unread badge             | Scale-in bounce when count updates          |
| Empty state illustration | Subtle float/bob animation (up-down loop)   |
| Pending approval         | Pulsing clock icon + animated dots          |
| Success checkmark        | Draw-on animation (circle + checkmark path) |
| Error shake              | Horizontal shake on form field with error   |

### 8.5 Performance Guidelines

- All animations use `useNativeDriver: true` in React Native for 60fps.
- No animation exceeds 500ms duration.
- Animations disabled if device has "Reduce Motion" accessibility setting enabled.
- Loading skeletons used instead of spinners for content-heavy screens.
- Image transitions use progressive loading (blur-up technique).

---

## Appendix: API Endpoint Summary

| Method   | Endpoint                          | Auth           | Description                              |
| -------- | --------------------------------- | -------------- | ---------------------------------------- |
| `POST`   | `/api/auth/register`              | Public         | Register new user (traveler/agency)      |
| `POST`   | `/api/auth/login`                 | Public         | Login and get JWT token                  |
| `GET`    | `/api/users/me`                   | Authenticated  | Get current user profile                 |
| `PUT`    | `/api/users/me`                   | Authenticated  | Update current user profile              |
| `GET`    | `/api/packages`                   | Public         | List/search packages (with query params) |
| `GET`    | `/api/packages/{id}`              | Public         | Get package details                      |
| `POST`   | `/api/packages`                   | Agency         | Create new package                       |
| `PUT`    | `/api/packages/{id}`              | Agency (owner) | Update package                           |
| `DELETE` | `/api/packages/{id}`              | Agency (owner) | Delete package                           |
| `POST`   | `/api/packages/{id}/reviews`      | Traveler       | Submit review for a package              |
| `GET`    | `/api/packages/{id}/reviews`      | Public         | Get reviews for a package                |
| `GET`    | `/api/chats`                      | Authenticated  | List conversations                       |
| `WS`     | `/ws/chat/{conversation_id}`      | Authenticated  | WebSocket for real-time chat             |
| `POST`   | `/api/wishlist`                   | Traveler       | Add package to wishlist                  |
| `DELETE` | `/api/wishlist/{package_id}`      | Traveler       | Remove from wishlist                     |
| `GET`    | `/api/wishlist`                   | Traveler       | Get wishlist                             |
| `GET`    | `/api/admin/agencies`             | Admin          | List agencies (with status filter)       |
| `PUT`    | `/api/admin/agencies/{id}/status` | Admin          | Approve/reject agency                    |
| `GET`    | `/api/admin/packages`             | Admin          | List all packages                        |
| `DELETE` | `/api/admin/packages/{id}`        | Admin          | Remove any package                       |
| `GET`    | `/api/admin/users`                | Admin          | List all users                           |
| `GET`    | `/api/admin/stats`                | Admin          | Get dashboard statistics                 |
