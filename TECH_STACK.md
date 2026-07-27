# Technical Stack & Codebase Architecture - DESTIN8

DESTIN8's infrastructure is divided into three main components: a Python FastAPI REST service, an Expo-powered React Native mobile app, and a Vite React web management portal.

---

## 🛠️ Technology Stack Breakdown

### 1. Backend API Service (`backend/`)
* **Framework**: FastAPI (Python 3.11)
* **Database**: SQLite (local dev)
* **ORM & Query Engine**: SQLAlchemy (asyncio extension)
* **Security & Auth**: JWT (JSON Web Tokens), Passlib (bcrypt hashing)
* **API Documentation**: Swagger UI (auto-generated at `/docs`)

### 2. Mobile Client App (`users-app/`)
* **Framework**: React Native with Expo Go v50+
* **Navigation**: React Navigation (Stack + Custom Bottom Tab Bar)
* **Design & Typography**: HSL custom theme (Radius, Shadows), Epilogue (bold headings), Manrope (body text)
* **Media Handling**: Expo ImagePicker, native FormData with `XMLHttpRequest` streams for robust uploads
* **Networking**: Fetch API with dynamic host fallback (Candidate IP address resolving)

### 3. Admin Web Portal (`admin-web/`)
* **Framework**: React (Vite-powered bundle)
* **Styling**: Tailwind CSS & Vanilla CSS modules
* **Iconography**: Material Icons / Feather Icons

---

## 📂 Codebase Folder Architecture

```
DESTIN8/
├── backend/
│   ├── app/
│   │   ├── core/           # Security, password hashing, token config
│   │   ├── routers/        # API route handlers (auth, packages, bookings, chat, admin)
│   │   ├── database.py     # SQLAlchemy connection session configurations
│   │   ├── dependencies.py # Endpoint dependencies (auth scopes)
│   │   ├── models.py       # DB tables & relationships (SQLAlchemy)
│   │   └── schemas.py      # Pydantic request/response models
│   ├── destin8.db          # Local SQLite Database file
│   ├── migrate.py          # Auto-migration script for schema updates
│   └── seed_data.py        # Seed script for initial DB testing states
│
├── users-app/
│   ├── src/
│   │   ├── components/     # AppHeader, CustomTabBar, common UI elements
│   │   ├── context/        # AuthState context wrapper
│   │   ├── navigation/     # AppNavigator configurations
│   │   ├── screens/        # Traveler, Agency, Auth, and Common screens
│   │   ├── services/       # api.js REST connector layer
│   │   └── theme/          # HSL design tokens, typography styles
│   └── App.js              # Entrypoint file
│
└── admin-web/
    ├── src/
    │   ├── components/     # Table lists, ticket cards
    │   ├── pages/          # Admin login, dashboard tabs
    │   └── App.jsx         # Dashboard tab controller
```

---

## 🛰️ Communication & Network Layer

* **Protocol**: RESTful JSON over HTTP.
* **Auto-Polling Network Engine**: Used in the Chat Detail screen (`ChatDetailScreen.js`) to fetch incoming messages every 3 seconds, keeping chats synced without WebSocket overhead.
* **Image Streaming**: Images picked via `expo-image-picker` are uploaded using `multipart/form-data` via an `XMLHttpRequest` wrapper to bypass typical React Native `fetch` FormData issues.
