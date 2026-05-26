# Week 2 — Travel Package Module

## Overview
This milestone introduces the core marketplace functionality: agencies can post travel packages and travelers can browse, search, and view them. This covers backend CRUD, mobile UI for both roles, and activating the admin moderation panel.

---

## Part 1: Backend — Package Model & API

### [MODIFY] `backend/app/models.py`
Add a `Package` model with:
- `id`, `agency_user_id` (FK → `users.id`)
- `title`, `destination`, `description`
- `price` (Float), `duration_days` (Int)
- `included_services` (Text — comma-separated or JSON string)
- `image_url` (String, optional for now)
- `is_active` (Bool, default `True`)
- `created_at`, `updated_at`

### [MODIFY] `backend/app/schemas.py`
Add Pydantic schemas:
- `PackageCreate` — Fields an agency fills in to post a package
- `PackageUpdate` — Same fields but all optional (for partial edits)
- `PackageResponse` — What gets returned to the client (includes agency name)

### [NEW] `backend/app/routers/packages.py`
> [!IMPORTANT]
> Only **approved** agencies (status = `approved`) can create or manage packages. A new `get_current_approved_agency` dependency will enforce this.

| Method | Endpoint | Who | Description |
|---|---|---|---|
| `POST` | `/api/packages` | Agency | Create a new package |
| `GET` | `/api/packages` | Public | Browse all active packages (with optional `?destination=` filter) |
| `GET` | `/api/packages/my` | Agency | Get only their own packages |
| `GET` | `/api/packages/{id}` | Public | View a single package detail |
| `PUT` | `/api/packages/{id}` | Agency | Edit their own package |
| `DELETE` | `/api/packages/{id}` | Agency | Delete their own package |

### [MODIFY] `backend/app/routers/admin.py`
Activate the Package Moderation endpoints:
- `GET /api/admin/packages` — All packages (not just active)
- `PUT /api/admin/packages/{id}/takedown` — Sets `is_active = False`
- `PUT /api/admin/packages/{id}/restore` — Sets `is_active = True`

### [MODIFY] `backend/app/main.py`
- Include the new `packages` router.
- Update stats endpoint to return the real package count.

---

## Part 2: Mobile — Agency Side

### [MODIFY] `users-app/src/screens/dashboard/AgencyDashboardScreen.js`
Upgrade from the static placeholder to a real dashboard:
- **Header**: Agency name + Logout button (already exists)
- **"My Packages" list**: Fetch from `GET /api/packages/my` and display cards
- **"Post New Package" button**: Navigates to `PostPackageScreen`
- Each package card has **Edit** and **Delete** actions

### [NEW] `users-app/src/screens/packages/PostPackageScreen.js`
A form screen for agencies to create/edit a package:
- Fields: Destination, Title, Description, Price (PKR), Duration (days), Included Services (multi-select or comma-separated tags)
- On submit: calls `POST /api/packages` or `PUT /api/packages/{id}` depending on whether editing
- Input validation + loading state

### [MODIFY] `users-app/src/navigation/AppNavigator.js`
- Add `PostPackageScreen` to the Agency stack navigator

---

## Part 3: Mobile — Traveler Side

### [MODIFY] `users-app/src/screens/dashboard/TravelerDashboardScreen.js`
Upgrade from static placeholder to a live, data-driven feed:
- Fetch packages from `GET /api/packages` on mount
- Render package cards with: Destination, Title, Price, Duration
- Tapping a card navigates to `PackageDetailScreen`
- Pull-to-refresh support

### [NEW] `users-app/src/screens/packages/PackageDetailScreen.js`
A full-page view of a single package:
- Large header image (placeholder for now, real images in Week 3)
- All package details: Description, Price, Duration, Included Services
- Agency name displayed
- **"Enquire Now"** button (placeholder → will trigger chat in Week 3)

### [MODIFY] `users-app/src/navigation/AppNavigator.js`
- Add `PackageDetailScreen` to the Traveler stack navigator

---

## Part 4: Admin Web — Activate Package Moderation

### [MODIFY] `admin-web/src/screens/PackageModerationScreen.jsx`
- Remove mock data and wire up real API calls to `/api/admin/packages`
- Real "Take Down" and "Restore" buttons that call the backend
- Update `AdminLayout.jsx` to remove the "Coming Soon" lock from the Packages nav item

### [MODIFY] `admin-web/src/screens/AnalyticsScreen.jsx`
- The "Total Packages" stat card will now show real data (since backend now returns real count)

---

## Execution Order

1. `models.py` + run DB migration → Package table created
2. `schemas.py` → Pydantic models ready
3. `packages.py` router → All API endpoints live
4. `admin.py` + `main.py` → Admin moderation + stats updated
5. `AgencyDashboardScreen` + `PostPackageScreen` → Agency can post
6. `TravelerDashboardScreen` + `PackageDetailScreen` → Traveler can browse
7. `PackageModerationScreen` → Admin can moderate

## Verification Plan

1. Log in as an **approved agency** on the mobile app → Post a package → Confirm it appears in the Agency Dashboard.
2. Log in as a **traveler** → See the new package in the home feed → Tap it to view details.
3. Log in as **admin** on the web panel → See the package in Package Moderation → Take it down → Confirm it disappears from the traveler feed.
4. Confirm that a **pending/rejected agency** cannot post a package (403 error).

> [!NOTE]
> Image upload will be handled in a later sprint. For now, agencies can optionally provide a direct image URL, or we use a default placeholder image from a CDN.
