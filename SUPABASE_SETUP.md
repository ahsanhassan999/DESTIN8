# Supabase Integration & Migration Guide

This developer guide details how to switch the DESTIN8 database engine from local SQLite to cloud-based **Supabase (PostgreSQL)**.

---

## 🛠️ Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com/) and sign up for a free account.
2. Click **New Project** and select your organization.
3. Enter a project name (e.g., `DESTIN8-Web`) and set a secure **Database Password** (keep this password safe, you'll need it in the connection string).
4. Select a region close to you and click **Create New Project**.
5. Wait 2–3 minutes for the PostgreSQL database container to finish provisioning.

---

## 🔗 Step 2: Retrieve the Connection String

1. In the Supabase Sidebar, navigate to **Project Settings** (gear icon) ➔ **Database**.
2. Scroll down to **Connection string**.
3. Select **URI** (for SQLAlchemy integration).
4. Copy the connection string. It will look like this:
   ```text
   postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
   *(Note: Ensure you replace `[YOUR-PASSWORD]` with the database password you created in Step 1).*

---

## ⚙️ Step 3: Update local FastAPI Configuration

Your backend is already programmed with transaction pooler (pgBouncer) configurations. You only need to swap the database target in the environmental configuration.

1. Open [backend/.env](file:///d:/DESTIN8/DESTIN8/backend/.env#L7).
2. Replace the local SQLite URI with your copied Supabase Connection String:
   ```env
   # ── Database ──
   DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```
3. Save the `.env` file.

---

## 🚀 Step 4: Run Tables Creation & Seeding

Since the backend connects to an empty Supabase cloud database, you need to create the table structure and populate it with initial data.

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Activate your virtual environment:
   ```bash
   .\venv\Scripts\activate
   ```
3. Run the schema migrations (this creates all 13 database tables on Supabase):
   ```bash
   python migrate.py
   ```
4. Run the seed script to populate the Supabase DB with default traveler accounts, verified agencies, tour packages, review scores, and dummy booking records:
   ```bash
   python seed_data.py
   ```

---

## 🔍 Step 5: Verify Deployment in Supabase Studio

1. In your Supabase Dashboard, click the **Table Editor** (grid icon) in the sidebar.
2. Select database tables like `users`, `packages`, or `bookings`.
3. You should see all the data seeded from `seed_data.py` (e.g. travelers Ahmed Hassan, agency Odyssey Travels, etc.) populated inside the cloud table view!

Your local FastAPI server is now writing and reading data from the cloud Supabase database!
