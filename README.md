# DESTIN8 - Travel Booking & Management Platform

DESTIN8 is a modern travel booking and agency management platform featuring a React Native mobile application for travelers and agencies, a FastAPI backend database service, and a web-based administrative management dashboard.

---

## 🏗️ Project Architecture & Components

```
DESTIN8/
├── backend/            # FastAPI Python Backend
├── users-app/          # Expo React Native Mobile Application
└── admin-web/          # React Vite Admin Dashboard
```

---

## 🚀 Getting Started on a New Machine

Follow these instructions to run the entire project locally.

### 1. Backend Service Setup 🐍
The backend uses **FastAPI** with **SQLite** for simple local development.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations to initialize the SQLite database:
   ```bash
   python migrate.py
   ```
5. Seed the database with high-quality test packages, reviews, active traveler bookings, and verified agency accounts:
   ```bash
   python seed_data.py
   ```
6. Start the local server:
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
   *The backend will now be live at `http://localhost:8000`.*

---

### 2. React Native Mobile App Setup 📱
The mobile app is built using **Expo Go**.

1. Navigate to the mobile app directory:
   ```bash
   cd users-app
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Configure the local environment variables in `users-app/.env`:
   ```env
   EXPO_PUBLIC_API_URL=http://<YOUR_IP_ADDRESS>:8000
   ```
   *Replace `<YOUR_IP_ADDRESS>` with your machine's local network IP address (e.g. `192.168.0.100`) so your physical device can connect to the server.*
4. Start the Expo builder:
   ```bash
   npx expo start --clear
   ```
5. Scan the QR code using the **Expo Go** app on your iOS or Android device.

---

### 3. Admin Web Dashboard Setup 💻
The admin portal manages agency verification requests, support tickets, and package status.

1. Navigate to the web dashboard directory:
   ```bash
   cd admin-web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser to access the dashboard.*

---

## 📦 How to Build the Standalone APK File 🤖

To generate a shareable Android APK for testing:

1. Install EAS CLI globally if you haven't already:
   ```bash
   npm install -g eas-cli
   ```
2. Log into your Expo account:
   ```bash
   eas login
   ```
3. Initialize EAS configuration in the mobile app directory:
   ```bash
   cd users-app
   eas build:configure
   ```
4. Build the APK locally using command-line tools (recommended for offline/fast compilation):
   ```bash
   eas build -p android --profile preview --local
   ```
   *Or build on Expo's cloud servers (requires active internet and Expo queue):*
   ```bash
   eas build -p android --profile preview
   ```
5. Once complete, download the `.apk` file to install it directly on any Android device.

---

## 🔑 Seeding / Testing Credentials

You can log into the system using the following seeded accounts:

* **Traveler Login**:
  - Email: `ahmed.hassan@voyage.com`
  - Password: `Traveler123!`
* **Agency Login**:
  - Email: `contact@odysseytravels.com`
  - Password: `Agency123!`
* **Admin Login**:
  - Email: `admin@destin8.com`
  - Password: `Admin123!`