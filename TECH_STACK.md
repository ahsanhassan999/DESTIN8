# Technology Stack Document — Travellure

> **Version**: 1.0
> **Last Updated**: 2026-03-04
> **App Type**: Mobile App (Android) — React Native via Expo Go
> **Scale**: MVP
> **Team Size**: 1 developer
> **Timeline**: MVP in 4–6 weeks
> **Budget**: $0 (all free & open-source tools)

---

## 1. Stack Overview

### Architecture Pattern: **Monolithic (Client-Server)**

```
┌─────────────────────┐        HTTP / WebSocket        ┌───────────────────────┐
│   React Native App  │ ◄──────── LAN (Wi-Fi) ────────►│   FastAPI Backend     │
│   (Expo Go)         │                                 │   + SQLite Database   │
│   Android Phone     │                                 │   MacBook (localhost) │
└─────────────────────┘                                 └───────────────────────┘
```

- **Pattern**: Monolithic REST API + WebSocket server.
- **Deployment (MVP)**: Local only — FastAPI runs on MacBook, phone connects via same Wi-Fi network.
- **Deployment (Future)**: Backend → Railway/Render, Database → PostgreSQL (Supabase), Frontend → Expo EAS Build + Play Store.

### Justification

| Decision                       | Reason                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Monolithic over Microservices  | Solo developer, MVP scope — microservices add unnecessary complexity                                    |
| REST + WebSocket over GraphQL  | Simpler to implement, sufficient for CRUD operations + real-time chat                                   |
| Local-first over Cloud         | $0 budget, academic project — cloud migration planned post-MVP                                          |
| FastAPI over Express.js        | Auto-generated Swagger docs, built-in validation (Pydantic), Python ecosystem for future AI/ML features |
| SQLite over PostgreSQL/MongoDB | Zero-config, file-based, no installation — perfect for local MVP. Easy migration to PostgreSQL later    |

---

## 2. Frontend Stack (Mobile App)

### Core Framework

| Technology               | Version            | License | Docs                                                            |
| ------------------------ | ------------------ | ------- | --------------------------------------------------------------- |
| **React Native**         | 0.76.7             | MIT     | [reactnative.dev](https://reactnative.dev/docs/getting-started) |
| **Expo SDK**             | 52.0.0             | MIT     | [docs.expo.dev](https://docs.expo.dev/)                         |
| **Expo Go** (dev client) | Latest (app store) | MIT     | [expo.dev/go](https://expo.dev/go)                              |
| **React**                | 18.3.1             | MIT     | [react.dev](https://react.dev/)                                 |

**Why React Native + Expo?**
- Professor mandated React Native for the project.
- Expo simplifies setup — no need for Android Studio or Xcode for MVP.
- Expo Go enables testing on physical phone without building an APK.
- Cross-platform capability for future iOS/web expansion.

**Alternatives Considered:**
| Alternative                    | Why Rejected                                                                 |
| ------------------------------ | ---------------------------------------------------------------------------- |
| Flutter                        | Professor assigned React Native; more JS/React ecosystem resources available |
| Native Android (Kotlin)        | Single-platform; React Native enables future iOS + web expansion             |
| Expo Dev Client (custom build) | Unnecessary for MVP; Expo Go is sufficient                                   |

### Language

| Technology                   | Version | License | Docs                                                                             |
| ---------------------------- | ------- | ------- | -------------------------------------------------------------------------------- |
| **JavaScript (ES2022+)**     | ES2022  | —       | [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/JavaScript) |
| **Node.js** (LTS, toolchain) | 22.14.0 | MIT     | [nodejs.org](https://nodejs.org/en/docs)                                         |

**Why JavaScript over TypeScript?**
- Solo developer, MVP timeline — TypeScript adds setup overhead.
- Can migrate to TypeScript post-MVP for type safety.

### Navigation

| Technology                        | Version | License | Docs                                                                    |
| --------------------------------- | ------- | ------- | ----------------------------------------------------------------------- |
| **React Navigation**              | 7.4.2   | MIT     | [reactnavigation.org](https://reactnavigation.org/docs/getting-started) |
| **@react-navigation/native**      | 7.1.6   | MIT     | —                                                                       |
| **@react-navigation/bottom-tabs** | 7.3.10  | MIT     | —                                                                       |
| **@react-navigation/stack**       | 7.2.10  | MIT     | —                                                                       |

**Why React Navigation?**
- De facto standard for React Native navigation.
- Built-in support for stack, tab, and drawer navigation.
- Deep linking support for future use.

### Styling

| Technology                  | Version  | License | Docs                                                                       |
| --------------------------- | -------- | ------- | -------------------------------------------------------------------------- |
| **React Native StyleSheet** | Built-in | MIT     | [reactnative.dev/docs/stylesheet](https://reactnative.dev/docs/stylesheet) |

**Why built-in StyleSheet?**
- Zero additional dependencies.
- Sufficient for MVP. NativeWind (Tailwind for RN) can be added later.

**Alternatives Considered:**
| Alternative               | Why Rejected                                      |
| ------------------------- | ------------------------------------------------- |
| NativeWind (Tailwind CSS) | Extra dependency; not needed for MVP scope        |
| Styled Components         | Runtime overhead; not necessary for small project |

### State Management

| Technology            | Version                 | License | Docs                                                                                                |
| --------------------- | ----------------------- | ------- | --------------------------------------------------------------------------------------------------- |
| **React Context API** | Built-in (React 18.3.1) | MIT     | [react.dev/reference/react/useContext](https://react.dev/reference/react/useContext)                |
| **AsyncStorage**      | 2.1.2                   | MIT     | [react-native-async-storage.github.io](https://react-native-async-storage.github.io/async-storage/) |

**Why Context API?**
- Built-in, no extra dependency.
- Sufficient for MVP state (auth token, user info, current filters).
- AsyncStorage for persistent JWT token storage.

**Alternatives Considered:**
| Alternative           | Why Rejected                                              |
| --------------------- | --------------------------------------------------------- |
| Redux / Redux Toolkit | Overkill for MVP; too much boilerplate for solo developer |
| Zustand               | Great library but unnecessary dependency for simple state |

### HTTP Client

| Technology | Version | License | Docs                                                |
| ---------- | ------- | ------- | --------------------------------------------------- |
| **Axios**  | 1.7.9   | MIT     | [axios-http.com](https://axios-http.com/docs/intro) |

**Why Axios?**
- Cleaner API than fetch for request/response interceptors (JWT token injection).
- Built-in request timeout and error handling.
- Automatic JSON parsing.

### Form Handling

- **Manual handling** with React `useState` hooks.
- No form library needed for MVP (registration + package creation forms are simple).
- Consider **React Hook Form** post-MVP for complex validation.

### UI Components

| Technology                    | Version | License | Docs                                                                                                 |
| ----------------------------- | ------- | ------- | ---------------------------------------------------------------------------------------------------- |
| **React Native Paper**        | 5.13.1  | MIT     | [callstack.github.io/react-native-paper](https://callstack.github.io/react-native-paper/)            |
| **React Native Vector Icons** | 10.2.0  | MIT     | [github.com/oblador/react-native-vector-icons](https://github.com/oblador/react-native-vector-icons) |
| **@expo/vector-icons**        | 14.0.4  | MIT     | [docs.expo.dev/guides/icons](https://docs.expo.dev/guides/icons/)                                    |

**Why React Native Paper?**
- Material Design 3 components out of the box.
- Works seamlessly with Expo.
- Consistent, professional look with minimal effort.

### Image Handling

| Technology            | Version | License | Docs                                                                                                    |
| --------------------- | ------- | ------- | ------------------------------------------------------------------------------------------------------- |
| **expo-image-picker** | 16.0.6  | MIT     | [docs.expo.dev/versions/latest/sdk/imagepicker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) |
| **expo-image**        | 2.0.6   | MIT     | [docs.expo.dev/versions/latest/sdk/image](https://docs.expo.dev/versions/latest/sdk/image/)             |

---

## 3. Backend Stack

### Core Framework

| Technology   | Version | License | Docs                                                      |
| ------------ | ------- | ------- | --------------------------------------------------------- |
| **Python**   | 3.12.9  | PSF     | [docs.python.org/3.12](https://docs.python.org/3.12/)     |
| **FastAPI**  | 0.115.8 | MIT     | [fastapi.tiangolo.com](https://fastapi.tiangolo.com/)     |
| **Uvicorn**  | 0.34.0  | BSD-3   | [uvicorn.org](https://www.uvicorn.org/)                   |
| **Pydantic** | 2.10.6  | MIT     | [docs.pydantic.dev/2.10](https://docs.pydantic.dev/2.10/) |

**Why FastAPI?**
- Auto-generated interactive API docs (Swagger UI at `/docs`) — invaluable for testing and professor demo.
- Built-in request validation via Pydantic models — reduces bugs.
- Native async support and WebSocket support for real-time chat.
- Python ecosystem opens doors for future AI/ML features (recommendation engine, NLP chat filtering).

**Alternatives Considered:**
| Alternative           | Why Rejected                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| Express.js (Node.js)  | No auto-docs, needs extra validation libraries; professor assigned Node.js but developer prefers Python |
| Django REST Framework | Heavier, more opinionated; FastAPI is lighter and faster for APIs                                       |
| Flask                 | No built-in validation, no async support, no auto-docs                                                  |

### Database

| Technology     | Version                      | License       | Docs                                                            |
| -------------- | ---------------------------- | ------------- | --------------------------------------------------------------- |
| **SQLite**     | 3.47.2 (bundled with Python) | Public Domain | [sqlite.org/docs.html](https://www.sqlite.org/docs.html)        |
| **SQLAlchemy** | 2.0.37                       | MIT           | [docs.sqlalchemy.org/en/20](https://docs.sqlalchemy.org/en/20/) |
| **Alembic**    | 1.14.1                       | MIT           | [alembic.sqlalchemy.org](https://alembic.sqlalchemy.org/)       |

**Why SQLite?**
- Zero installation — comes bundled with Python.
- File-based — entire database is a single `.db` file.
- Perfect for local MVP with 1–5 concurrent users.
- Easy to migrate to PostgreSQL via SQLAlchemy ORM (just change connection string).

**Why SQLAlchemy?**
- Industry-standard Python ORM.
- Database-agnostic — same models work with SQLite, PostgreSQL, MySQL.
- Alembic provides migration management for schema changes.

**Alternatives Considered:**
| Alternative  | Why Rejected                                                             |
| ------------ | ------------------------------------------------------------------------ |
| PostgreSQL   | Requires installation and setup; overkill for local MVP                  |
| MongoDB      | NoSQL adds complexity; relational data model fits travel packages better |
| Tortoise ORM | Less mature than SQLAlchemy; smaller community                           |
| Raw SQL      | No migration support; harder to maintain                                 |

### Authentication

| Technology           | Version | License    | Docs                                                                             |
| -------------------- | ------- | ---------- | -------------------------------------------------------------------------------- |
| **python-jose**      | 3.3.0   | MIT        | [github.com/mpdavis/python-jose](https://github.com/mpdavis/python-jose)         |
| **passlib[bcrypt]**  | 1.7.4   | BSD        | [passlib.readthedocs.io](https://passlib.readthedocs.io/)                        |
| **bcrypt**           | 4.2.1   | Apache-2.0 | [github.com/pyca/bcrypt](https://github.com/pyca/bcrypt)                         |
| **python-multipart** | 0.0.20  | Apache-2.0 | [github.com/Kludex/python-multipart](https://github.com/Kludex/python-multipart) |

**Auth Flow:**
```
Client → POST /api/auth/login { email, password }
Server → Verify password (bcrypt) → Generate JWT → Return { access_token, token_type }
Client → Store token in AsyncStorage → Attach to all requests as Authorization: Bearer <token>
Server → Decode JWT on protected routes → Extract user_id, role → Authorize
```

**Configuration:**
- JWT Algorithm: HS256
- Token Expiry: 7 days (604800 seconds)
- Bcrypt Rounds: 12
- Secret Key: Environment variable `SECRET_KEY`

### WebSocket (Real-Time Chat)

| Technology            | Version                    | License | Docs                                                                                          |
| --------------------- | -------------------------- | ------- | --------------------------------------------------------------------------------------------- |
| **FastAPI WebSocket** | Built-in (FastAPI 0.115.8) | MIT     | [fastapi.tiangolo.com/advanced/websockets](https://fastapi.tiangolo.com/advanced/websockets/) |

**Why built-in WebSocket?**
- No extra dependency needed.
- Sufficient for 1-on-1 traveler-agency chat in MVP.
- Connection manager pattern handles multiple concurrent chats.

### File Storage

| Technology            | Version | License    | Docs                                                             |
| --------------------- | ------- | ---------- | ---------------------------------------------------------------- |
| **Local File System** | —       | —          | —                                                                |
| **python-multipart**  | 0.0.20  | Apache-2.0 | —                                                                |
| **aiofiles**          | 24.1.0  | Apache-2.0 | [github.com/Tinche/aiofiles](https://github.com/Tinche/aiofiles) |

**Strategy:**
- Package images stored in `./uploads/` directory on laptop.
- Served as static files via FastAPI: `app.mount("/uploads", StaticFiles(directory="uploads"))`.
- Future: Migrate to Cloudinary (free tier) or S3 when moving to cloud.

### CORS

| Technology                 | Version  | License | Docs                                                                              |
| -------------------------- | -------- | ------- | --------------------------------------------------------------------------------- |
| **FastAPI CORSMiddleware** | Built-in | MIT     | [fastapi.tiangolo.com/tutorial/cors](https://fastapi.tiangolo.com/tutorial/cors/) |

**Configuration:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # MVP: allow all (local network)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Future (production): restrict to specific domains
```

---

## 4. Database Schema

### Migration Strategy

- **Tool**: Alembic 1.14.1 (SQLAlchemy's migration companion).
- **Workflow**:
  1. Modify SQLAlchemy models.
  2. Run `alembic revision --autogenerate -m "description"` to generate migration.
  3. Run `alembic upgrade head` to apply migration.
  4. Commit migration files to Git.

### Seeding Approach

- Seed script (`scripts/seed.py`) creates:
  - 1 admin account (hardcoded credentials).
  - 3 sample agencies (pre-approved).
  - 10 sample travel packages with images.
  - 2 sample traveler accounts.
- Run via: `python scripts/seed.py`.

### Backup Policy

- **MVP**: Manual backup — copy `travellure.db` file to external location.
- **Future (Cloud)**: Automated daily backups via hosting provider.
- SQLite DB file committed to `.gitignore` (seed script recreates data).

### Connection Pooling

- **MVP**: SQLite uses single-file access — no connection pool needed.
- SQLAlchemy `StaticPool` with `check_same_thread=False` for FastAPI async compatibility.
- **Future (PostgreSQL)**: SQLAlchemy connection pool with `pool_size=5`, `max_overflow=10`.

### Core Tables

```
users
├── id (UUID, PK)
├── name (VARCHAR 100)
├── email (VARCHAR 255, UNIQUE)
├── hashed_password (VARCHAR 255)
├── phone (VARCHAR 20, NULLABLE)
├── role (ENUM: traveler, agency, admin)
├── status (ENUM: active, pending, approved, rejected)
├── profile_image (VARCHAR 500, NULLABLE)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

agency_profiles
├── id (UUID, PK)
├── user_id (FK → users.id)
├── agency_name (VARCHAR 100)
├── owner_name (VARCHAR 100)
├── business_address (TEXT)
├── license_number (VARCHAR 50)
├── rejection_reason (TEXT, NULLABLE)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

packages
├── id (UUID, PK)
├── agency_id (FK → users.id)
├── title (VARCHAR 100)
├── destination (VARCHAR 50)
├── price (DECIMAL)
├── duration_days (INTEGER)
├── description (TEXT)
├── services (JSON — list of services)
├── cover_image (VARCHAR 500)
├── departure_date (DATE, NULLABLE)
├── is_active (BOOLEAN, DEFAULT true)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

reviews
├── id (UUID, PK)
├── package_id (FK → packages.id)
├── user_id (FK → users.id)
├── rating (INTEGER, 1–5)
├── comment (TEXT, NULLABLE)
├── created_at (TIMESTAMP)
└── UNIQUE(package_id, user_id)

conversations
├── id (UUID, PK)
├── traveler_id (FK → users.id)
├── agency_id (FK → users.id)
├── package_id (FK → packages.id)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

messages
├── id (UUID, PK)
├── conversation_id (FK → conversations.id)
├── sender_id (FK → users.id)
├── content (TEXT)
├── is_read (BOOLEAN, DEFAULT false)
├── created_at (TIMESTAMP)
└── INDEX(conversation_id, created_at)

wishlist (P2)
├── id (UUID, PK)
├── user_id (FK → users.id)
├── package_id (FK → packages.id)
├── created_at (TIMESTAMP)
└── UNIQUE(user_id, package_id)
```

---

## 5. DevOps & Infrastructure

### Version Control

| Tool       | Version | Docs                                   |
| ---------- | ------- | -------------------------------------- |
| **Git**    | 2.47+   | [git-scm.com](https://git-scm.com/doc) |
| **GitHub** | —       | [github.com](https://github.com)       |

**Branching Strategy (simplified for solo dev):**
```
main ──────────────────────────── (stable, demo-ready)
  └── dev ─────────────────────── (active development)
        ├── feature/auth ──────── (feature branches)
        ├── feature/packages
        ├── feature/chat
        └── fix/login-bug ─────── (bugfix branches)
```
- `main`: Always stable, demo-ready.
- `dev`: Active development. Merge to `main` at end of each week.
- `feature/*`: One branch per feature. Merge to `dev` when complete.

### CI/CD (Post-MVP)

- **MVP**: Manual deployment — run locally, no CI/CD pipeline.
- **Future**:
  - GitHub Actions for automated testing on push.
  - Backend: Auto-deploy to Railway/Render on push to `main`.
  - Mobile: Expo EAS Build for APK generation.

### Hosting (MVP — Local)

| Component             | Host                                   | Cost |
| --------------------- | -------------------------------------- | ---- |
| Backend (FastAPI)     | MacBook localhost `:8000`              | $0   |
| Database (SQLite)     | MacBook file system                    | $0   |
| Static Files (images) | MacBook `./uploads/` served by FastAPI | $0   |
| Mobile App            | Expo Go on Android phone (same Wi-Fi)  | $0   |

### Hosting (Future — Cloud Migration)

| Component    | Platform                                                         | Free Tier           |
| ------------ | ---------------------------------------------------------------- | ------------------- |
| Backend      | [Railway](https://railway.app/) or [Render](https://render.com/) | 500 hours/month     |
| Database     | [Supabase](https://supabase.com/) (PostgreSQL)                   | 500MB storage       |
| File Storage | [Cloudinary](https://cloudinary.com/)                            | 25GB bandwidth      |
| Mobile App   | [Expo EAS Build](https://expo.dev/eas)                           | Free for dev builds |

### Monitoring (Post-MVP)

- **MVP**: Console logs + FastAPI Swagger UI for API testing.
- **Future**: Sentry (free tier) for error tracking, basic request logging middleware.

### Testing

| Type               | Tool                   | Version | Docs                                                  |
| ------------------ | ---------------------- | ------- | ----------------------------------------------------- |
| Backend Unit Tests | **pytest**             | 8.3.4   | [docs.pytest.org](https://docs.pytest.org/)           |
| Backend API Tests  | **httpx** (TestClient) | 0.28.1  | [www.python-httpx.org](https://www.python-httpx.org/) |
| Frontend (future)  | **Jest**               | 29.7.0  | [jestjs.io](https://jestjs.io/)                       |

**MVP Testing Strategy:**
- Test critical auth endpoints (register, login, token validation).
- Test package CRUD endpoints.
- Manual testing via FastAPI Swagger UI (`/docs`).
- Manual testing on physical phone via Expo Go.

---

## 6. Development Tools

### Python Environment

| Tool       | Version  | Purpose             |
| ---------- | -------- | ------------------- |
| **Python** | 3.12.9   | Runtime             |
| **pip**    | 24.3+    | Package manager     |
| **venv**   | Built-in | Virtual environment |

### Linter & Formatter

| Tool         | Version | Config           | Docs                                                  |
| ------------ | ------- | ---------------- | ----------------------------------------------------- |
| **Ruff**     | 0.9.6   | `ruff.toml`      | [docs.astral.sh/ruff](https://docs.astral.sh/ruff/)   |
| **Black**    | 24.10.0 | `pyproject.toml` | [black.readthedocs.io](https://black.readthedocs.io/) |
| **ESLint**   | 9.19.0  | `.eslintrc.js`   | [eslint.org](https://eslint.org/)                     |
| **Prettier** | 3.4.2   | `.prettierrc`    | [prettier.io](https://prettier.io/)                   |

**Ruff Config (`ruff.toml`):**
```toml
line-length = 88
target-version = "py312"

[lint]
select = ["E", "F", "I", "N", "W"]
ignore = ["E501"]
```

**Prettier Config (`.prettierrc`):**
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### IDE Recommendations

| IDE                           | Extensions/Plugins                                                                        |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| **Antigravity** (recommended) | Python, Pylance, Ruff, ESLint, Prettier, React Native Tools, Thunder Client (API testing) |
| **PyCharm** (alternative)     | FastAPI plugin, Database plugin                                                           |

---

## 7. Environment Variables

### Backend (`backend/.env`)

```bash
# ── Server ──
HOST="0.0.0.0"                          # Listen on all interfaces (for LAN access)
PORT="8000"                             # API server port
DEBUG="true"                            # Enable debug mode (MVP only)

# ── Database ──
DATABASE_URL="sqlite:///./travellure.db" # SQLite file path
# Future: DATABASE_URL="postgresql://user:pass@host:5432/travellure"

# ── Authentication ──
SECRET_KEY="your-super-secret-key-change-in-production"  # JWT signing key
ALGORITHM="HS256"                       # JWT algorithm
ACCESS_TOKEN_EXPIRE_MINUTES="10080"     # 7 days = 10080 minutes

# ── CORS ──
ALLOWED_ORIGINS="*"                     # MVP: allow all; production: specific domains

# ── File Upload ──
UPLOAD_DIR="./uploads"                  # Local image storage directory
MAX_FILE_SIZE_MB="5"                    # Max upload size in MB
```

### Frontend (`mobile/.env`)

```bash
# ── API Connection ──
API_BASE_URL="http://192.168.1.100:8000"  # Laptop's local IP on Wi-Fi
WS_BASE_URL="ws://192.168.1.100:8000"     # WebSocket connection URL

# Future (cloud):
# API_BASE_URL="https://travellure-api.railway.app"
# WS_BASE_URL="wss://travellure-api.railway.app"
```

> **⚠️ Important**: Replace `192.168.1.100` with your MacBook's actual local IP address. Find it via `ifconfig | grep "inet " | grep -v 127.0.0.1`.

---

## 8. Scripts & Commands

### Backend Scripts

```bash
# ── Setup ──
python -m venv venv                      # Create virtual environment
source venv/bin/activate                 # Activate venv (macOS)
pip install -r requirements.txt          # Install dependencies

# ── Development ──
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000  # Start dev server
# API Docs: http://localhost:8000/docs (Swagger UI)
# Alt Docs: http://localhost:8000/redoc (ReDoc)

# ── Database ──
alembic init alembic                     # Initialize migrations (first time only)
alembic revision --autogenerate -m "msg" # Generate new migration
alembic upgrade head                     # Apply all pending migrations
alembic downgrade -1                     # Rollback last migration
python scripts/seed.py                   # Seed sample data

# ── Testing ──
pytest                                   # Run all tests
pytest -v                                # Run with verbose output
pytest tests/test_auth.py                # Run specific test file

# ── Linting ──
ruff check .                             # Lint Python code
black .                                  # Format Python code
```

### Frontend Scripts

```bash
# ── Setup ──
npx create-expo-app@latest ./            # Initialize Expo project (first time)
npm install                              # Install dependencies

# ── Development ──
npx expo start                           # Start Expo dev server
npx expo start --android                 # Start and open on Android
npx expo start --clear                   # Start with cache clear

# ── Building (Future) ──
eas build --platform android --profile preview  # Build APK for testing
eas build --platform android --profile production  # Build AAB for Play Store

# ── Linting ──
npx eslint .                             # Lint JavaScript code
npx prettier --write .                   # Format code
```

---

## 9. Dependencies Lock

### Backend Dependencies (`requirements.txt`)

```txt
# Core
fastapi==0.115.8
uvicorn[standard]==0.34.0
pydantic==2.10.6
pydantic-settings==2.7.1

# Database
sqlalchemy==2.0.37
alembic==1.14.1
aiosqlite==0.20.0

# Authentication
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
bcrypt==4.2.1
python-multipart==0.0.20

# File Handling
aiofiles==24.1.0

# HTTP (for TestClient)
httpx==0.28.1

# Testing
pytest==8.3.4
pytest-asyncio==0.25.3

# Linting
ruff==0.9.6
black==24.10.0
```

### Frontend Dependencies (`package.json` — key dependencies)

```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "react": "18.3.1",
    "react-native": "0.76.7",
    "@react-navigation/native": "^7.1.6",
    "@react-navigation/bottom-tabs": "^7.3.10",
    "@react-navigation/stack": "^7.2.10",
    "react-native-paper": "^5.13.1",
    "react-native-safe-area-context": "4.14.1",
    "react-native-screens": "~4.4.0",
    "@react-native-async-storage/async-storage": "2.1.2",
    "axios": "^1.7.9",
    "expo-image-picker": "~16.0.6",
    "expo-image": "~2.0.6",
    "@expo/vector-icons": "^14.0.4",
    "react-native-gesture-handler": "~2.20.2",
    "expo-status-bar": "~2.0.1"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "eslint": "^9.19.0",
    "prettier": "^3.4.2"
  }
}
```

---

## 10. Security Considerations

### Authentication Flow

```
1. Registration:
   Password → bcrypt hash (12 rounds) → stored in DB
   
2. Login:
   Input password → bcrypt verify against stored hash
   → Success: Generate JWT { user_id, role, exp } → Return token
   → Failure: Return 401 "Invalid credentials"

3. Protected Routes:
   Request Header: Authorization: Bearer <token>
   → Decode JWT → Verify signature + expiry
   → Extract user_id, role → Check permissions
   → 401 if invalid/expired, 403 if wrong role
```

### Security Configuration

| Setting          | Value                                               | Rationale                                                        |
| ---------------- | --------------------------------------------------- | ---------------------------------------------------------------- |
| Password Hashing | bcrypt, 12 rounds                                   | Industry standard; 12 rounds balances security and speed         |
| JWT Algorithm    | HS256                                               | Sufficient for single-server setup; RS256 for multi-server later |
| Token Expiry     | 7 days                                              | Balanced for mobile app UX (avoid frequent re-login)             |
| CORS Origins     | `*` (MVP)                                           | Local network only; restrict in production                       |
| Rate Limiting    | 5 login attempts / 5 minutes per IP                 | Prevent brute-force attacks                                      |
| Max Upload Size  | 5MB                                                 | Prevent storage abuse                                            |
| SQL Injection    | Prevented by SQLAlchemy ORM (parameterized queries) | —                                                                |
| Input Validation | Pydantic models validate all request bodies         | —                                                                |

### CORS Configuration (by environment)

```python
# MVP (local development)
allow_origins = ["*"]

# Production (future)
allow_origins = [
    "https://travellure.vercel.app",
    "https://travellure.com",
]
```

### Rate Limiting

```python
# MVP: slowapi library
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.post("/api/auth/login")
@limiter.limit("5/5minutes")  # 5 attempts per 5 minutes
async def login(): ...

@app.post("/api/auth/register")
@limiter.limit("3/hour")      # 3 registrations per hour per IP
async def register(): ...
```

---

## 11. Version Upgrade Policy

### When to Update

| Scenario                                        | Action                                           | Testing                           |
| ----------------------------------------------- | ------------------------------------------------ | --------------------------------- |
| **Security patch** (e.g., bcrypt vulnerability) | Update immediately                               | Run full test suite before deploy |
| **Minor version** (bug fixes)                   | Update monthly or when needed                    | Run affected feature tests        |
| **Major version** (breaking changes)            | Evaluate post-MVP only; not during active sprint | Full regression testing required  |
| **Expo SDK major update**                       | Update between sprints only                      | Test all screens on device        |

### Upgrade Workflow

```
1. Create branch: git checkout -b upgrade/package-name
2. Update version in requirements.txt or package.json
3. Install: pip install -r requirements.txt / npm install
4. Run tests: pytest / manual test on phone
5. If all pass → Merge to dev → Test again → Merge to main
6. If fails → Rollback: git checkout dev
```

### Rollback Procedures

- **Backend**: `pip install -r requirements.txt` with previous versions restores exact state.
- **Frontend**: `npm ci` with previous `package-lock.json` restores exact state.
- **Database**: `alembic downgrade -1` rolls back last migration.
- **Full rollback**: `git revert` on the upgrade commit.

### Dependency Compatibility Notes

| Dependency          | Pinned Because                 |
| ------------------- | ------------------------------ |
| React Native 0.76.7 | Must match Expo SDK 52         |
| React 18.3.1        | Must match React Native 0.76.7 |
| Pydantic 2.10.6     | Must match FastAPI 0.115.8     |
| SQLAlchemy 2.0.37   | Must match Alembic 1.14.1      |

---

## Appendix: Quick Start (Copy-Paste Setup)

### Backend Setup (MacBook Terminal)

```bash
cd Travellure
mkdir backend && cd backend
python3 -m venv venv
source venv/bin/activate
pip install fastapi==0.115.8 uvicorn[standard]==0.34.0 sqlalchemy==2.0.37 \
  alembic==1.14.1 python-jose[cryptography]==3.3.0 passlib[bcrypt]==1.7.4 \
  python-multipart==0.0.20 aiofiles==24.1.0 aiosqlite==0.20.0 \
  pydantic-settings==2.7.1 httpx==0.28.1 pytest==8.3.4
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup (MacBook Terminal — new tab)

```bash
cd Travellure
npx create-expo-app@latest mobile
cd mobile
npm install @react-navigation/native @react-navigation/bottom-tabs \
  @react-navigation/stack react-native-paper axios \
  @react-native-async-storage/async-storage react-native-screens \
  react-native-safe-area-context react-native-gesture-handler
npx expo start
```

### Phone Setup

1. Install **Expo Go** from Play Store.
2. Ensure phone and laptop are on the **same Wi-Fi**.
3. Scan QR code from `npx expo start` output.
4. App loads on phone, connecting to laptop backend.
