# Product Requirements Document (PRD)

## 1. Product Overview
- **Project Title**: DESTIN8
- **Version**: 1.0
- **Last Updated**: 2026-03-03
- **Owner**: Syed Ahsan Hassan Rizvi

## 2. Problem Statement

**User Problem**
1. Travelers have to check many websites and social media pages to compare travel packages.
2. There is no single trusted platform to see verified agencies and real reviews.
3. Contacting agencies takes time (calls, WhatsApp, messages).
4. It is hard to find packages that match budget, dates, and preferences.

**Business Problem**
1. Small travel agencies have limited online reach.
2. They spend money on ads but still struggle to find serious customers.
3. There is no centralized platform to showcase their packages.
4. Agencies lack data about customer preferences and trends.

## 3. Goals & Objectives
### Business Goals
- Increase agency registrations: Onboard at least 100 travel agencies within the first year.
- Increase successful bookings: Achieve 1,000 completed bookings within the first year of launch.
- Generate revenue: Earn revenue through commission (5–10%) on each successful booking.

### User Goals
- Easily find and compare travel packages in one place.
- Book trusted and verified packages without fear of scams.
- Find packages that match their budget, dates, and preferences.
- Communicate directly with agencies in a simple and fast way.
- Read real reviews and ratings from other travelers.
- Get instant confirmation and updates on their bookings.

## 4. Success Metrics
- If the app successfully allows travel agencies to create accounts and post travel packages without errors, it will be considered a success.
- If users can search, filter, and compare travel packages easily in one place, the core functionality will be successful.
- If users can communicate with agencies through the in-app chat system smoothly, the communication feature will be successful.
- If users can book or request a package directly through the app without technical issues, the booking system will be successful.
- If the app runs smoothly, loads quickly, and does not crash during normal use, the system performance will be considered successful.

## 5. Target Users & Personas
### Primary Persona: Ahmed (Traveler)
- **Demographics**: 22–35 years old, student or working professional, middle-income, lives in urban areas.
- **Pain Points**: 
- Hard to compare travel packages.
- Fear of scams or fake agencies.
- Takes time to contact different agencies.
  
- **Goals**: 
- Find trusted and affordable travel packages.
- Compare options easily in one place.
- Book trips safely and quickly.
  
- **Technical Proficiency**: Comfortable using mobile apps and online platforms.

### Secondary Persona: Mr. Khan (Travel Agency Owner)
- **Demographics**: 30–50 years old, owner of a small or medium travel agency.
- **Pain Points**: 
- Limited digital reach.
- High marketing costs.
- Difficulty finding serious customers.
  
- **Goals**: 
- Promote travel packages to a larger audience.
- Increase bookings and revenue.
- Manage inquiries efficiently.

- **Technical Proficiency**: Basic to moderate technical skills.

### Admin Persona: System Administrator
- **Demographics**: 25–40 years old, IT or management background.
- **Pain Points**: 
- Need to monitor platform activity.
- Prevent fraud or fake listings.
- Handle user complaints efficiently.

- **Goals**:
- Approve and verify travel agencies.
- Monitor bookings and transactions.
- Resolve disputes and technical issues.
- Maintain system performance and security.

**Technical Proficiency**: Advanced technical knowledge and familiar with admin dashboards.

## 6. Features & Requirements
### Must-Have Features (P0)

1. **User Registration & Login**
- Description: Allows travelers and agencies to create accounts and log in securely.
- User Story: As a user, I want to create an account so that I can access app features securely.
- Acceptance Criteria:
  - User can register using email and password.
  - User can log in and log out successfully.
  - System shows error for invalid login details.
- Success Metric: Successful login rate without errors.

2. **Agency Account Approval**
- Description: Admin verifies and approves agency accounts before they can post travel packages.
- User Story: As an admin, I want to approve agency accounts so that only verified and trustworthy agencies can post packages on the app.
- Acceptance Criteria:
- New agency account requires admin approval before posting packages.
- Admin can approve or reject an agency account.
- Agency is notified about account approval or rejection.
- Only approved agencies can log in and post packages.
- Success Metric: 
- 100% of agencies are verified before they can post packages.
- No unverified agency can post a package.

3. **Agency Package Posting**
- Description: Travel agencies can create, edit, and delete travel packages.
- User Story: As an agency, I want to post travel packages so that customers can view and book them.
- Acceptance Criteria:
  - Agency can add package details (price, duration, location, services).
  - Agency can update or delete packages.
  - Package appears in public listing after approval.
- Success Metric: Registered agencies can successfully post their packages.

4. **Search & Filter Packages**
- Description: Users can search and filter packages based on budget, location, and dates.
- User Story: As a traveler, I want to filter packages so that I can find options that match my needs.
- Acceptance Criteria:
  - Search bar works correctly.
  - Filters apply correctly (budget, destination, duration).
  - Results update instantly after filtering.
- Success Metric: 70% of users use search/filter feature.

5. **In-App Chat System**
- Description: Enables direct communication between traveler and agency.
- User Story: As a traveler, I want to message the agency so that I can ask questions before booking.
- Acceptance Criteria:
  - Users can send and receive messages.
  - Notifications appear for new messages.
  - Chat history is saved.
- Success Metric: 60% of bookings initiated through chat.

6. **Admin Dashboard**
- Description: Admin can monitor users, agencies, and packages.
- User Story: As an admin, I want to monitor activities so that I can maintain platform quality and security.
- Acceptance Criteria:
  - Admin can approve/reject agencies.
  - Admin can remove inappropriate packages.
  - Admin can view booking reports.
- Success Metric: 100% agency verification before public listing.

### Should-Have Features (P1)
1. **Package Comparison**
- Description: Allows users to compare multiple packages side-by-side.
- User Story: As a traveler, I want to compare packages so that I can choose the best one.
- Acceptance Criteria:
  - User can select at least 2 packages to compare.
  - Comparison shows price, duration, services, and rating.
- Success Metric: 50% of active users use compare feature.

2. **Ratings & Reviews**
- Description: Users can rate and review agencies after booking.
- User Story: As a traveler, I want to see reviews so that I can trust the agency.
- Acceptance Criteria:
  - Users can rate from 1–5 stars.
  - Reviews are visible on agency profile.
- Success Metric: 40% of completed bookings receive reviews.

3. **Payment & Booking Confirmation**
- Description: Allows travelers to pay a 50% advance deposit to confirm their booking. The deposit is refundable and can be canceled up to a date set by the travel agency.
- User Story: As a traveler, I want to pay a partial amount to confirm my booking so that I secure my trip and have the option to cancel if needed.
- Acceptance Criteria:
  - User can pay 50% of the package price via secure payment gateway.
  - Booking status updates to “Confirmed” after payment.
  - User can cancel the booking before the cutoff date defined by the agency.
  - Refund is processed automatically according to agency policy.
- Success Metric: 95% of confirmed bookings are paid via the advance deposit system without errors.

4. **In-App Chat Monitoring & Contact Restriction**
- Description: Users and agencies can chat before or after booking.
- Before 50% payment: Users can ask questions about packages, but cannot share personal contact information.
- After 50% advance payment: Users can chat freely and share contact details.
- Admin can view all chat messages at any time for monitoring and dispute resolution.
- User Story: As a traveler or agency, I want to communicate safely through the app, and after confirming my booking, share contact information so that I can coordinate directly with the other party.
- Acceptance Criteria:
  - Users can start a chat before booking to ask questions.
  - Users cannot send contact info before payment (phone, email, WhatsApp, social media).
  - After 50% advance payment, users can share contact info freely.
  - System blocks contact info only before payment.
  - Admin can monitor all chat messages on the dashboard in real-time.
  - Commission is automatically deducted from payment at booking confirmation.
- Success Metric:
  - 100% of messages with contact info before payment are blocked.
  - After payment, users can share contact info successfully.
  - Admin can monitor all chats continuously.
  - 100% of bookings follow the 50% advance payment commission workflow correctly.

### Nice-to-Have Features (P2)
1. **Wishlist / Save for Later**
- Description: Users can save packages for future viewing.
- User Story: As a traveler, I want to save packages so that I can review them later.
- Acceptance Criteria:
  - User can add/remove packages from wishlist.
  - Saved packages appear in profile section.
- Success Metric: 30% of users use wishlist feature.

2. **Budget Planner Tool**
- Description: Suggests packages based on user’s total budget and group size.
- User Story: As a traveler, I want budget suggestions so that I can plan within my limits.
- Acceptance Criteria:
  - User can enter budget and number of people.
  - System shows matching packages.
- Success Metric: Increased user engagement and session time.

## 7. Explicitly OUT OF SCOPE
- **Flight or Hotel Booking Integration**: The app will not handle direct flight or hotel reservations; only travel packages listed by agencies.
- **International Payment Gateway Compliance**: Payments are limited to standard local methods; full international banking compliance is not included.
- **Travel Insurance or Visa Services**: The app will not provide insurance, visa, or legal travel documentation services.
- **Real-Time Travel Tracking**: The app will not provide GPS tracking or live location updates for travelers.
- **Social Media Posting or Sharing**: The app will not automatically share travel plans on social media platforms.

## 8. User Scenarios

### Scenario 1: Traveler Asks Questions Before Payment
- **Context**: Ahmed wants to know more about a Murree package before confirming booking.
- **Steps**:
1. User selects a travel package.
2. User initiates in-app chat to ask questions.
3. System allows messaging but blocks any contact info.
4. Admin can monitor all messages in real-time.
- **Expected Outcome**: User gets all package information.
- **Contact info cannot be shared**.
- **Admin can view and monitor the conversation**.

- **Edge Cases**:
- User tries to bypass system with disguised contact info (e.g., “call me five-five-five…”) → system must block.
- Admin misses inappropriate content → delayed intervention.

### Scenario 2: Traveler Confirms Booking with 50% Advance Payment
- **Context**: Ahmed decides to book the package after asking questions.
- **Steps**:
1. User chooses to pay 50% advance deposit.
2. System processes the payment and deducts platform commission.
3. Booking status updates to “Confirmed.”
- **Expected Outcome**:
- Payment succeeds.
- Booking is confirmed.
- Commission is automatically deducted.
- **Edge Cases**:
- Payment fails → booking remains unconfirmed.
- Network issues cause duplicate payment attempts → system must prevent double charge.

### Scenario 3: Traveler and Agency Chat After Payment
- **Context**: Ahmed wants to coordinate trip details with the agency after paying 50% advance.
- **Steps**:
1. User accesses the chat for the confirmed booking.
2. System allows full messaging and sharing of contact info.
3. Admin monitors all messages in real-time.
- **Expected Outcome**:
- Users can share contact info and finalize trip details.
- Admin has full visibility for audit and dispute resolution.
- **Edge Cases**:
- Users attempt to share irrelevant or inappropriate content → admin can intervene.
- Technical glitches block message sending → messages may be delayed.

### Scenario 4: Admin Monitors Chat for Policy Compliance
- **Context**: Admin wants to ensure users and agencies follow the chat rules.
- **Steps**:
1. Admin logs into the dashboard.
2. Admin opens chat monitoring panel.
3. System flags messages containing prohibited content before payment.
4. Admin reviews flagged messages and takes action if needed.
- **Expected Outcome**:
- No contact info is shared before payment.
- Admin can intervene in policy violations.
- Platform maintains commission security and user safety.
- **Edge Cases**:
- Users try to evade detection with disguised contact info.
- Admin misses messages due to system lag → delayed action.

### Scenario 5: Traveler Compares Multiple Packages
- **Context**: Ahmed wants to choose the best package by comparing several options.
- **Steps**:
1. User selects 2–3 packages from the search results.
2. System displays a side-by-side comparison of price, duration, services, and ratings.
3. User reviews the comparison and selects the preferred package.
- **Expected Outcome**:
- User can easily see differences and pick the best package.
- **Edge Cases**:
- Comparison page fails to load → user cannot make informed decision.
- Some package details missing → comparison incomplete.

### Scenario 6: Traveler Saves Package to Wishlist
- **Context**: Ahmed finds an interesting package but wants to decide later.
- **Steps**:
1. User clicks “Save to Wishlist” on a travel package.
2. System adds the package to the user’s profile wishlist.
3. User can access saved packages from their profile anytime.
- **Expected Outcome**:
- Package is saved successfully and visible in wishlist.
- User can review or book it later.
- **Edge Cases**:
- System fails to save the package → user loses track of selection.
- Wishlist data not synced across devices.

### Scenario 7: Agency Posts a New Travel Package
- **Context**: Mr. Khan has a verified agency account and wants to add a new travel package.
- **Steps**:
1. Agency logs in and navigates to “Add Package.”
2. Agency enters package details (destination, price, duration, services).
3. System saves the package and makes it visible to travelers immediately.
- **Expected Outcome**:
- Package is successfully posted and visible to travelers.
- Only verified agencies can post packages.
- **Edge Cases**:
- Required fields are missing → system shows validation error.
- Technical issue prevents package from being saved → user notified.

### Scenario 8: Agency Updates an Existing Package
- **Context**: Mr. Khan wants to update the price or details of an existing package.
- **Steps**:
1. Agency selects a package from their dashboard.
2. Agency edits the package details (price, services, dates).
3. System saves the updated package immediately.
4. Travelers see the updated package information.
- **Expected Outcome**:
- Updated package details are visible to travelers instantly.
- Only verified agencies can update packages.
- **Edge Cases**:
- System fails to save updates → package shows outdated info.
- Agency enters invalid information → system shows error.

### Scenario 9: Agency Deletes a Package
- **Context**: Mr. Khan wants to remove an unused package from their dashboard.
- **Steps**:
1. Agency selects a package from their dashboard.
2. Agency clicks “Delete Package.”
3. System removes the package from the dashboard.
- **Expected Outcome**:
- Package is removed from the dashboard.
- Only verified agencies can delete packages.
- **Edge Cases**:
- System fails to delete the package → package remains visible.
- Agency tries to delete a package that is currently booked → system shows error.

### Scenario 10: Admin Approves a New Travel Agency
- **Context**: Mr. Khan signs up as a travel agency and waits for admin approval.
- **Steps**:
1. Agency submits account registration with required details.
2. System notifies admin of a pending agency registration.
3. Admin reviews agency details (documents, business info).
4. Admin approves or rejects the agency account.
5. System notifies the agency of the approval/rejection.
- **Expected Outcome**:
- Only approved agencies can log in and post packages.
- Unapproved agencies cannot access posting features.
- **Edge Cases**:
- Admin delays approval → agency waits longer to post packages.
- Agency submits incomplete or invalid info → account is rejected.

### Scenario 11: Traveler Searches and Filters Packages
- **Context**: Ahmed wants a trip within a specific budget and dates.
- **Steps**:
1. User opens the app and goes to search.
2. User enters location, budget, and date range.
3. System displays filtered packages matching criteria.
- **Expected Outcome**:
- User sees only relevant packages.
- Search results update instantly based on filters.
- **Edge Cases**:
- No packages match the filter → system shows “No results found.”
- Network error → search fails.


## 9. Dependencies & Constraints

### Technical Constraints
- **Server**: MacBook runs **FastAPI (Python)** backend + **SQLite** database locally.
- **Client**: **React Native (Expo Go)** Android app, tested on personal phone — both devices on the **same Wi-Fi network**.
- **Android-only** for MVP. Web app will be added later using the same backend API.
- No cloud services — everything runs on localhost.
- Payment integration deferred to post-MVP.

### Business Constraints
- **Budget: $0** — all tools are free and open-source.
- **Team size: 1 developer**.
- **Timeline: 4–6 weeks** for MVP.
- App only accessible on local network until cloud migration.

### External Dependencies (All Free & Local)
- **Python 3.10+ / FastAPI** — Backend REST API + WebSocket support.
- **Uvicorn** — ASGI server to run FastAPI.
- **SQLite** — Zero-config, file-based local database (no install required).
- **SQLAlchemy** — ORM for database operations.
- **React Native + Expo Go** — Android app, tested via LAN.
- **JWT (python-jose) + bcrypt (passlib)** — Authentication & password hashing.
- **Node.js (LTS)** — Required by React Native / Expo toolchain.
- **GitHub** — Version control.

## 10. Timeline & Milestones

| Milestone                      | Target | Features                                                                                                                              |
| ------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Week 1 – Setup & Auth**      | Week 1 | Project setup (Expo + FastAPI + SQLite), user registration & login (JWT), role-based access (traveler, agency, admin)                 |
| **Week 2 – Agency & Packages** | Week 2 | Agency registration + admin approval, package CRUD APIs, package listing UI                                                           |
| **Week 3 – Search & Chat**     | Week 3 | Search & filter packages (budget, destination, duration), real-time chat (FastAPI WebSockets)                                         |
| **Week 4 – Admin & Polish**    | Week 4 | Admin dashboard (approve agencies, view packages/bookings), ratings & reviews, UI polish                                              |
| **Week 5 – Testing & Demo**    | Week 5 | End-to-end testing on Android phone, bug fixes, demo-ready local build                                                                |
| **Post-MVP**                   | TBD    | Cloud migration, web app (React/Next.js consuming same API), payment integration, contact-info blocking, package comparison, wishlist |

## 11. Risks & Assumptions

### Risks

| Risk                                     | Mitigation                                                                                |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| App only works on same Wi-Fi as laptop   | Acceptable for dev/demo; cloud migration resolves this later                              |
| Laptop must stay running during testing  | Simple startup script (`uvicorn main:app --host 0.0.0.0`); cloud migration for production |
| Professor expects Node.js backend        | Justify with auto-docs, built-in validation, and Python ecosystem advantages              |
| Solo developer delays due to scope creep | Strict P0-only scope; defer P1/P2 features                                                |
| Data loss if laptop crashes              | Regular Git commits; SQLite DB file backed up periodically                                |

### Assumptions

| Assumption                                                      | Validation                                          |
| --------------------------------------------------------------- | --------------------------------------------------- |
| Developer has Python 3.10+ and Node.js (LTS) installed          | Verify in Week 1                                    |
| Expo Go on Android connects to FastAPI on laptop via LAN        | Test in Week 1 (`http://<laptop-ip>:8000`)          |
| Same FastAPI backend will serve both Android and future web app | Design clean RESTful endpoints from the start       |
| SQLite is sufficient for MVP data volume                        | Monitor; migrate to PostgreSQL when moving to cloud |
| FastAPI backend choice is acceptable for grading                | Confirm or justify with professor                   |

## 12. Non-Functional Requirements

- **Performance**: API response under 1 second on local network. App loads within 2 seconds. Supports 1–5 concurrent test users.
- **Security**: Passwords hashed with bcrypt (passlib). JWT tokens for API authentication. Role-based access control (traveler, agency, admin). HTTPS added during cloud migration.
- **Accessibility**: English language support. Readable fonts and adequate color contrast on Android.
- **Scalability (Cloud-Ready Design)**: Environment variables for server URL (localhost:8000 → cloud URL). Same REST API serves Android app and future web app. SQLite → PostgreSQL when migrating to cloud. FastAPI deploys easily to Railway, Render, or Docker.
- **Reliability**: Server runs while laptop is on. App shows friendly error messages if server is unreachable. Graceful error handling on all API endpoints.

## 13. References & Resources

### Tech Stack Documentation
- [FastAPI](https://fastapi.tiangolo.com/) — Backend framework
- [Uvicorn](https://www.uvicorn.org/) — ASGI server
- [SQLite](https://www.sqlite.org/docs.html) — Local database
- [SQLAlchemy](https://docs.sqlalchemy.org/) — Python ORM
- [React Native](https://reactnative.dev/docs/getting-started) — Mobile framework
- [Expo Docs](https://docs.expo.dev/) — React Native toolchain
- [FastAPI WebSockets](https://fastapi.tiangolo.com/advanced/websockets/) — Real-time chat

### Competitor Analysis
- [Sastaticket.pk](https://www.sastaticket.pk) — Travel booking in Pakistan
- [FindMyAdventure.pk](https://www.findmyadventure.pk) — Adventure travel packages
- [Bookme.pk](https://www.bookme.pk) — Bus/event/tour booking

### Free Design Resources
- [Material Design 3](https://m3.material.io/) — UI/UX guidelines
- [Figma (Free)](https://www.figma.com/) — UI mockups
- [Unsplash](https://unsplash.com/) — Free travel images

### Cloud Migration (For Later)
- [Railway](https://railway.app/) — Free Python hosting
- [Render](https://render.com/) — Free FastAPI hosting
- [MongoDB Atlas](https://www.mongodb.com/atlas) or [Supabase](https://supabase.com/) — Free cloud database
- [Vercel](https://vercel.com/) — Future web app hosting