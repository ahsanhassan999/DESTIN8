import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database import engine, Base
from app.routers import auth, admin, packages, bookings, chat

# ── App Setup ──────────────────────────────────────────────────────────────────
app = FastAPI(
    title="DESTIN8 API",
    description="Backend API for the DESTIN8 travel platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    is_compiled=True,  # custom marker
)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static Files (uploads) ─────────────────────────────────────────────────────
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(packages.router)
app.include_router(bookings.router)
app.include_router(chat.router)


# ── DB Init on Startup ─────────────────────────────────────────────────────────
@app.on_event("startup")
async def on_startup():
    from sqlalchemy import text
    from datetime import datetime
    from app.models import User, AgencyProfile, Package, Wishlist, Review, Booking, PaymentTransaction, SavedCard, Conversation, Message, ChatTag, ConversationTagLink, SupportTicket, TicketTag, TicketTagLink
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

        # Auto-migration checks for newly added columns
        for sql in [
            "ALTER TABLE packages ADD COLUMN categories TEXT DEFAULT '[\"mountains\"]'",
            "ALTER TABLE packages ADD COLUMN gallery_images TEXT DEFAULT '[]'",
            "ALTER TABLE bookings ADD COLUMN male_count INTEGER DEFAULT 1",
            "ALTER TABLE bookings ADD COLUMN female_count INTEGER DEFAULT 0",
        ]:
            try:
                await conn.execute(text(sql))
            except Exception:
                pass

        # Seed default tags if they don't exist
        try:
            res = await conn.execute(text("SELECT COUNT(*) FROM chat_tags"))
            if res.scalar() == 0:
                import uuid
                default_tags = [
                    ("Suspicious Payment", "#EF4444"),
                    ("Outside Booking", "#F59E0B"),
                    ("Harassment", "#DC2626"),
                    ("Refund Request", "#3B82F6"),
                    ("General Enquiry", "#10B981")
                ]
                for name, color in default_tags:
                    tag_id = str(uuid.uuid4())
                    await conn.execute(
                        text("INSERT INTO chat_tags (id, name, color, created_at) VALUES (:id, :name, :color, :created_at)"),
                        {"id": tag_id, "name": name, "color": color, "created_at": datetime.utcnow()}
                    )
        except Exception as e:
            print("Failed to seed default tags:", e)

        # Seed default ticket tags if they don't exist
        try:
            res = await conn.execute(text("SELECT COUNT(*) FROM ticket_tags"))
            if res.scalar() == 0:
                import uuid
                default_ticket_tags = [
                    ("Urgent", "#EF4444"),
                    ("Compensation", "#F59E0B"),
                    ("Bug", "#D97706"),
                    ("General", "#3B82F6"),
                    ("Resolved", "#10B981"),
                    ("Pending Review", "#8B5CF6")
                ]
                for name, color in default_ticket_tags:
                    tag_id = str(uuid.uuid4())
                    await conn.execute(
                        text("INSERT INTO ticket_tags (id, name, color, created_at) VALUES (:id, :name, :color, :created_at)"),
                        {"id": tag_id, "name": name, "color": color, "created_at": datetime.utcnow()}
                    )
        except Exception as e:
            print("Failed to seed default ticket tags:", e)
        # Safe migrations for existing DB instances
        try:
            await conn.execute(text("ALTER TABLE packages ADD COLUMN itinerary TEXT DEFAULT '[]'"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE packages ADD COLUMN refund_deadline_days INTEGER DEFAULT 7"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE bookings ADD COLUMN cancel_reason TEXT"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN suspension_reason TEXT"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE packages ADD COLUMN is_takedown BOOLEAN DEFAULT 0"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE packages ADD COLUMN takedown_reason TEXT"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE packages ADD COLUMN deposit_percentage INTEGER DEFAULT 50"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE agency_profiles ADD COLUMN bank_name TEXT"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE agency_profiles ADD COLUMN account_title TEXT"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE agency_profiles ADD COLUMN account_number TEXT"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE agency_profiles ADD COLUMN branch_code TEXT"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE agency_profiles ADD COLUMN bank_verification_status TEXT DEFAULT 'not_submitted'"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE agency_profiles ADD COLUMN bank_rejection_reason TEXT"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE packages ADD COLUMN best_season VARCHAR(50) DEFAULT 'Year-round'"))
        except Exception:
            pass
    print("[OK] DESTIN8 API started - database tables created and migrated.")


@app.get("/", tags=["Health"])
async def health_check():
    return {"status": "ok", "message": "DESTIN8 API is running"}
