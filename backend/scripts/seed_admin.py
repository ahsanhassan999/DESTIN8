"""
Seed script: creates the default admin user.
Run from the backend/ directory:
    .\\venv\\Scripts\\python.exe scripts\\seed_admin.py
"""
import asyncio
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import AsyncSessionLocal, engine, Base
from app.models import User, UserRole, UserStatus
from app.core.security import hash_password
from sqlalchemy.future import select


async def seed():
    # Create tables first
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Check if admin already exists
        result = await db.execute(
            select(User).where(User.email == "admin@destin8.com")
        )
        if result.scalar_one_or_none():
            print("[!] Admin user already exists - skipping.")
            return

        admin = User(
            name="DESTIN8 Admin",
            email="admin@destin8.com",
            hashed_password=hash_password("Admin@123"),
            role=UserRole.admin,
            status=UserStatus.active,
        )
        db.add(admin)
        await db.commit()
        print("[OK] Admin user created!")
        print("   Email:    admin@destin8.com")
        print("   Password: Admin@123")


if __name__ == "__main__":
    asyncio.run(seed())
