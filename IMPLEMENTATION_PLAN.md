# DESTIN8 — Full Implementation Plan
### Project Recovery & Rebuild Roadmap

> **Context:** The DESTIN8 project was lost due to hard disk corruption. This plan rebuilds the entire platform from scratch using the original documentation (PRD, APP_FLOW, TECH_STACK), the previous agent's chat transcript, and the Stitch design files.
>
> **Execution style:** Phase-by-phase with testing between each phase. The user can suggest changes or additions at any point.

---

## Project Architecture

```
DESTIN8/
├── backend/                  # FastAPI + SQLite backend
│   ├── app/
│   │   ├── core/
│   │   │   └── security.py   # JWT + bcrypt
│   │   ├── routers/
│   │   │   ├── auth.py       # Registration + Login
│   │   │   ├── admin.py      # Admin panel APIs
│   │   │   └── packages.py   # Package CRUD + Reviews + Wishlist
│   │   ├── database.py       # Async SQLAlchemy + SQLite
│   │   ├── models.py         # ORM models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── dependencies.py   # Auth guards
│   │   └── main.py           # FastAPI app entry
│   ├── scripts/
│   │   └── seed_admin.py     # Seed default admin user
│   ├── uploads/              # Uploaded files (images)
│   ├── venv/                 # Python virtual environment
│   ├── .env                  # Environment variables
│   └── requirements.txt      # Python dependencies
│
├── users-app/                # React Native (Expo Go) mobile app
│   └── src/
│       ├── context/
│       │   └── AuthContext.js
│       ├── services/
│       │   └── api.js        # Axios instance (JWT interceptor)
│       ├── store/
│       │   └── wishlistStore.js
│       ├── components/
│       │   ├── AppTopBar.js  # Shared top nav bar
│       │   └── BottomNavBar.js # Shared bottom nav bar
│       ├── navigation/
│       │   └── AppNavigator.js
│       └── screens/
│           ├── auth/
│           │   ├── WelcomeScreen.js
│           │   ├── RoleSelectionScreen.js
│           │   ├── LoginScreen.js
│           │   ├── TravelerSignUpScreen.js
│           │   ├── AgencySignUpScreen.js
│           │   └── SuspendedAccountScreen.js
│           ├── dashboard/
│           │   ├── TravelerDashboardScreen.js
│           │   └── AgencyDashboardScreen.js
│           ├── profile/
│           │   ├── TravelerProfileScreen.js
│           │   └── AgencyProfileScreen.js
│           ├── traveler/
│           │   ├── PackageDetailScreen.js
│           │   ├── WishlistScreen.js
│           │   └── ChatScreen.js
│           └── agency/
│               └── PostPackageScreen.js
│
└── admin-web/                # React + Vite admin panel
    └── src/
        ├── api.js
        ├── App.jsx
        ├── index.css
        ├── context/
        │   └── AuthContext.jsx
        ├── components/
        │   ├── AdminLayout.jsx
        │   └── AdminLayout.css
        └── screens/
            ├── LoginScreen.jsx + .css
            ├── AnalyticsScreen.jsx + .css
            ├── AgencyApprovalsScreen.jsx + .css
            ├── UserDirectoryScreen.jsx + .css
            ├── PackageModerationScreen.jsx
            └── ChatMonitoringScreen.jsx
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native + Expo Go |
| Backend | FastAPI (Python 3.11) |
| Database | SQLite via async SQLAlchemy |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| Admin Panel | React + Vite (Vanilla CSS) |
| Design System | Stitch — "Kinetic Editorial" theme |
| Primary Colors | Signature Lavender `#967BB6`, Deep Plum `#52396F`, Surface `#F5F6F7` |
| Fonts | Epilogue (headlines), Manrope (body) |

---

## Design System (Stitch — "Kinetic Editorial")

### Colors
| Token | Hex | Usage |
|---|---|---|
| `primary` | `#0149E6` | CTAs, active states |
| `secondary` | `#52396F` | Brand purple / agency accents |
| `tertiary` | `#903985` | Decorative accents |
| `surface` | `#F5F6F7` | App backgrounds |
| `on_surface` | `#2C2F30` | Primary text |
| `on_surface_variant` | `#595C5D` | Secondary text |
| Lavender | `#967BB6` | Signature accent / highlights |

### Typography
- **Display / Headlines:** Epilogue (Bold/SemiBold)
- **Body / Labels:** Manrope (Regular/Bold)
- **Labels:** ALL CAPS + 0.05em letter spacing

### Rules
- No 1px borders — use surface color shifts for separation
- No sharp corners — minimum `sm` (0.5rem) radius
- Glassmorphism for floating elements: 80% opacity + 24px blur
- Ambient shadows only: `0px 32px 48px rgba(44, 47, 48, 0.06)`

---

## Credentials

| Account | Email | Password |
|---|---|---|
| Admin (web panel) | `admin@destin8.com` | `Admin@123` |

### Local URLs
| Service | URL |
|---|---|
| Backend API | `http://localhost:8000` |
| API Docs (Swagger) | `http://localhost:8000/docs` |
| Admin Panel (dev) | `http://localhost:5173` |
| Mobile ↔ Backend | `http://192.168.4.114:8000` |

---

---

# PHASE 1 — Backend Foundation

> **Status: ✅ COMPLETE**

## Goal
Build the FastAPI backend with all models, authentication, admin APIs, and package management.

## Tasks

- [x] Create `backend/` directory structure
- [x] Create Python virtual environment (`venv`)
- [x] Create `requirements.txt` with all dependencies
- [x] Create `.env` with environment variables
- [x] Create `app/database.py` — async SQLAlchemy + SQLite
- [x] Create `app/models.py` — User, AgencyProfile, Package, Review, Wishlist
- [x] Create `app/schemas.py` — all Pydantic request/response schemas
- [x] Create `app/core/security.py` — JWT + bcrypt utilities
- [x] Create `app/dependencies.py` — auth guards (user, admin, agency, traveler)
- [x] Create `app/routers/auth.py` — Register + Login + Profile
- [x] Create `app/routers/admin.py` — Stats, Agency Approvals, User Directory, Package Moderation
- [x] Create `app/routers/packages.py` — Package CRUD, Reviews, Wishlist
- [x] Create `app/main.py` — FastAPI app assembly
- [x] Create `scripts/seed_admin.py` — seed default admin
- [x] Run seed script (admin user created)
- [x] Start backend server — **running on `http://0.0.0.0:8000`**

## API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register/traveler` | Register traveler |
| POST | `/register/agency` | Register agency (status: pending) |
| POST | `/login` | Login (returns JWT) |
| GET | `/me` | Get current user profile |
| PATCH | `/me` | Update name/phone |

### Admin (`/api/admin`) — requires admin JWT
| Method | Endpoint | Description |
|---|---|---|
| GET | `/stats` | Platform-wide stats |
| GET | `/agencies?status=pending` | List agencies (filterable) |
| PATCH | `/agencies/{id}/status` | Approve / Reject agency |
| GET | `/users?role=traveler` | List all users |
| PATCH | `/users/{id}/suspend` | Suspend a user |
| PATCH | `/users/{id}/activate` | Activate a user |
| POST | `/users/create-admin` | Create new admin staff |
| GET | `/packages` | List all packages |
| PATCH | `/packages/{id}/takedown` | Take down a package |
| PATCH | `/packages/{id}/restore` | Restore a package |

### Packages (`/api/packages`) — requires JWT
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Browse packages (traveler) |
| GET | `/{id}` | Get package detail |
| GET | `/agency/my-packages` | Agency's own packages |
| POST | `/agency/create` | Create package (approved agency) |
| PATCH | `/agency/{id}` | Update package |
| DELETE | `/agency/{id}` | Delete package |
| GET | `/{id}/reviews` | Get reviews for package |
| POST | `/{id}/reviews` | Submit review (traveler) |
| GET | `/wishlist/my` | Get traveler's wishlist |
| POST | `/wishlist/{id}` | Add to wishlist |
| DELETE | `/wishlist/{id}` | Remove from wishlist |

## Testing Phase 1
- Open `http://localhost:8000/docs` — verify all endpoints are listed
- Test login with admin credentials via Swagger
- Verify DB file `destin8.db` exists in `backend/`

---

---

# PHASE 2 — Mobile App (React Native + Expo)

> **Status: 🔲 NOT STARTED**

## Goal
Rebuild the full React Native mobile app matching the Stitch designs. Supports two user roles: **Traveler** and **Agency**.

## App Flow Summary

```
App Launch
  └── Auth screens (Welcome → Role Selection → Login / Register)
        ├── Traveler Login → Traveler Dashboard
        │     ├── Bottom Nav: Explore | Wishlist | My Trips | Chat
        │     ├── Top Bar: DESTIN8 wordmark + notifications + avatar (→ Profile)
        │     ├── Hero image + search bar
        │     ├── Category filters
        │     ├── Featured packages carousel (with heart icons)
        │     ├── Budget deals list
        │     └── Sub-screens: Package Detail, Wishlist, Chat, Profile
        │
        └── Agency Login → Agency Dashboard
              ├── Bottom Nav: Home | Packages | Explore | Chat
              ├── Top Bar: DESTIN8 wordmark + avatar (→ Profile)
              ├── Welcome back section
              ├── Stat cards (Active Deals, Taken Down)
              ├── Quick Actions grid (Post Package, etc.)
              └── Sub-screens: Post Package, Profile
```

## Tasks

### Setup
- [ ] Initialize Expo project: `npx create-expo-app@latest users-app`
- [ ] Install core dependencies:
  - `@react-navigation/native`, `@react-navigation/native-stack`
  - `react-native-screens`, `react-native-safe-area-context`
  - `@expo/vector-icons` (Ionicons)
  - `axios`
  - `expo-secure-store`
  - `expo-image-picker`

### Foundation
- [ ] Create `src/services/api.js` — Axios with JWT interceptor pointing to `192.168.4.114:8000`
- [ ] Create `src/context/AuthContext.js` — JWT storage via expo-secure-store, role-based navigation
- [ ] Create `src/store/wishlistStore.js` — pub/sub wishlist (sync with backend)

### Shared Components
- [ ] Create `src/components/AppTopBar.js` — DESTIN8 wordmark + bell + avatar (tappable → Profile)
- [ ] Create `src/components/BottomNavBar.js` — role-specific tabs, `useSafeAreaInsets()` for gesture bar

### Navigation
- [ ] Create `src/navigation/AppNavigator.js` — Stack-only (no tabs), role-based routing:
  - `AuthStack`: Welcome → RoleSelection → Login → TravelerSignUp / AgencySignUp
  - `TravelerRoot`: Dashboard → Profile → PackageDetail → Wishlist → Chat
  - `AgencyRoot`: Dashboard → Profile → PostPackage

### Auth Screens (match Stitch designs)
- [ ] `WelcomeScreen.js` — split traveler/agency welcome screens
- [ ] `RoleSelectionScreen.js` — choose Traveler or Agency
- [ ] `LoginScreen.js` — email + password, forgot password link
- [ ] `TravelerSignUpScreen.js` — name, email, password, confirm password
- [ ] `AgencySignUpScreen.js` — agency name, owner name, email, phone, address, license, password
- [ ] `SuspendedAccountScreen.js` — shown to suspended accounts

### Dashboard Screens (match Stitch designs)
- [ ] `TravelerDashboardScreen.js`:
  - DESTIN8 top bar + notification bell + avatar
  - Mountain hero image with "Where to next, [Name]?" in lavender
  - White pill search bar overlaid at hero bottom
  - Category pills row (Beach, Mountain, City, etc.)
  - "Featured for You" horizontal carousel — snap scroll, 180px image height
  - Heart icons on every card (top-right)
  - "Budget-Friendly" list rows with heart icons
- [ ] `AgencyDashboardScreen.js`:
  - DESTIN8 top bar + avatar
  - "Welcome back, [Agency Name]" — name in purple bold
  - Stat cards row (Total Active Deals, Taken Down)
  - 2×2 Quick Actions grid (Post New Package in purple, others white)
  - Packages list (live from API)

### Profile Screens
- [ ] `TravelerProfileScreen.js` — name, email, phone, logout
- [ ] `AgencyProfileScreen.js` — agency details, stats, packages, logout

### Package Screens
- [ ] `PackageDetailScreen.js` — hero image, title, price, duration, services, description, reviews, book button
- [ ] `PostPackageScreen.js` — form to create/edit packages (title, destination, price, duration, description, services, image)

### Traveler Feature Screens
- [ ] `WishlistScreen.js`:
  - Pill search bar
  - Full-width vertical cards (image + chips + description + price + View Details CTA)
  - Heart remove button
  - Empty state illustration
- [ ] `ChatScreen.js`:
  - Conversation list (agency avatar + name + package tag + last message + unread badge)
  - Search bar
  - Empty state

## Testing Phase 2
- Run `npx expo start` — scan QR with Expo Go on phone
- Register a new traveler → verify JWT stored + dashboard loads
- Register a new agency → verify "pending approval" state shown
- Navigate all screens — verify top bar and bottom nav are consistent
- Add a package to wishlist → verify heart fills

---

---

# PHASE 3 — Admin Web Panel (React + Vite)

> **Status: 🔲 NOT STARTED**

## Goal
Build the web-based admin panel for platform management. Connects to the FastAPI backend. Uses Destin8 design system with Vanilla CSS.

## Design System Tokens (Vanilla CSS)
```css
:root {
  --color-lavender:    #967BB6;
  --color-deep-plum:   #52396F;
  --color-white:       #FFFFFF;
  --color-surface:     #F5F6F7;
  --color-light-tone:  #EFF1F2;
  --color-dim-tone:    #E6E8EA;
  --color-text-dark:   #2C2F30;
  --color-text-mid:    #595C5D;
  --radius-sm:         8px;
  --radius-md:         12px;
  --radius-lg:         20px;
  --radius-full:       9999px;
}
```

## Pages

| Page | Description |
|---|---|
| **Login** | Admin email + password |
| **Analytics** | Stat cards: total users, agencies, packages. Charts placeholder |
| **Agency Approvals** | Filter by status. Expandable rows with approve/reject + reason |
| **User Directory** | Table: all users, roles, status. Suspend/activate. Create admin modal |
| **Package Moderation** | Table: all packages, agency name, status. Take down/restore |
| **Chat Monitoring** | Conversation list (read-only). Coming soon UI with mock data |

## Tasks

### Setup
- [ ] Initialize Vite React project: `npm create vite@latest admin-web -- --template react`
- [ ] Install: `npm install axios react-router-dom`

### Foundation
- [ ] Create `src/index.css` — design system variables + reset + shared styles
- [ ] Create `src/api.js` — Axios instance pointing to `localhost:8000`
- [ ] Create `src/context/AuthContext.jsx` — admin JWT session (localStorage)
- [ ] Create `src/App.jsx` — React Router with protected routes + AdminLayout

### Shared Component
- [ ] Create `src/components/AdminLayout.jsx` + CSS:
  - Left sidebar: DESTIN8 logo + nav links (Analytics, Agencies, Users, Packages, Chat)
  - Top bar: page title + logout button
  - Right content area

### Screens
- [ ] `LoginScreen.jsx` + CSS — centered card, lavender CTA button
- [ ] `AnalyticsScreen.jsx` + CSS — 4-column stat grid (total travelers, agencies, packages, pending)
- [ ] `AgencyApprovalsScreen.jsx` + CSS — filter bar (All/Pending/Approved/Rejected), expandable agency rows
- [ ] `UserDirectoryScreen.jsx` + CSS — role filter tabs, user table, suspend/activate, Create Admin modal
- [ ] `PackageModerationScreen.jsx` — package table with takedown/restore buttons
- [ ] `ChatMonitoringScreen.jsx` — conversation list (mock data, read-only)

## Testing Phase 3
- Run `npm run dev` — open `http://localhost:5173`
- Log in with `admin@destin8.com` / `Admin@123`
- Check analytics stats load from backend
- Register a dummy agency from phone → see it appear as "Pending"
- Approve agency → verify agency can now post packages on mobile

---

---

# PHASE 4 — Integration, Polish & Features

> **Status: 🔲 NOT STARTED**

## Goal
Connect all pieces together, wire the package module fully (both mobile and admin), add real wishlist persistence, and polish the overall experience.

## Sub-Phase 4A — Package Module Integration

### Mobile ↔ Backend
- [ ] `TravelerDashboardScreen` — fetch real packages from `GET /api/packages`
- [ ] `PackageDetailScreen` — load real package from `GET /api/packages/{id}` + load reviews
- [ ] `PostPackageScreen` — submit to `POST /api/packages/agency/create`, edit via `PATCH`
- [ ] `AgencyDashboardScreen` — load real packages from `GET /api/packages/agency/my-packages`

### Wishlist Persistence
- [ ] Replace in-memory `wishlistStore.js` with backend calls (`POST/DELETE /api/packages/wishlist/{id}`)
- [ ] `WishlistScreen` — fetch from `GET /api/packages/wishlist/my`

### Reviews
- [ ] `PackageDetailScreen` — show star rating + comments from `GET /api/packages/{id}/reviews`
- [ ] Allow traveler to submit review via `POST /api/packages/{id}/reviews`

## Sub-Phase 4B — Admin Panel Polish

- [ ] Wire `PackageModerationScreen` — load real packages from `GET /api/admin/packages`, call takedown/restore
- [ ] Wire `AnalyticsScreen` — live stats from `GET /api/admin/stats`
- [ ] Wire `AgencyApprovalsScreen` — expandable rejection reason form
- [ ] Wire `UserDirectoryScreen` — real user data + suspend/activate/create admin

## Sub-Phase 4C — UX Improvements (Suggested)

- [ ] **Image Upload** for packages — `POST /uploads` endpoint + `expo-image-picker` on mobile
- [ ] **Agency Status Banner** — show "Pending Approval" banner to newly registered agencies
- [ ] **Package Search** — search bar on Traveler Dashboard filters packages by destination
- [ ] **Agency Chat (Stub)** — agency Chat nav tab shows incoming inquiry UI (future WebSocket)
- [ ] **My Trips tab** — shows packages traveler has enquired about or bookmarked
- [ ] **Forgot Password** — UI screen (email field, shows confirmation message)
- [ ] **Pull-to-Refresh** — on all list screens
- [ ] **Loading Skeletons** — instead of plain ActivityIndicator on package lists

## Sub-Phase 4D — Testing & Hardening

- [ ] End-to-end test: Traveler registers → Agency registers → Admin approves agency → Agency posts package → Traveler browses + wishlists + reviews
- [ ] Error states: network error banners, empty states on all screens
- [ ] Input validation: client-side form feedback before API call
- [ ] Long-session handling: expired JWT → auto logout → redirect to Login

---

---

## Progress Tracker

| Phase | Description | Status |
|---|---|---|
| Phase 1 | Backend (FastAPI + SQLite) | ✅ Complete |
| Phase 2 | Mobile App (React Native + Expo) | 🔲 Next |
| Phase 3 | Admin Web Panel (React + Vite) | 🔲 Pending |
| Phase 4 | Integration + Polish + Features | 🔲 Pending |

---

*Last updated: 2026-05-27*
*Rebuilt by Antigravity AI after hard disk recovery*
