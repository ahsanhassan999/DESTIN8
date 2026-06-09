import asyncio
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import AsyncSessionLocal
from app.models import User, Package, Conversation
from sqlalchemy.future import select

async def dump():
    async with AsyncSessionLocal() as db:
        print("=== USERS ===")
        res = await db.execute(select(User))
        for u in res.scalars().all():
            print(f"ID: {u.id} | Name: {u.name} | Email: {u.email} | Role: {u.role.value} | Status: {u.status.value}")
            
        print("\n=== PACKAGES ===")
        res = await db.execute(select(Package))
        for p in res.scalars().all():
            print(f"ID: {p.id} | Agency ID: {p.agency_id} | Title: {p.title} | Active: {p.is_active}")

        print("\n=== CONVERSATIONS ===")
        res = await db.execute(select(Conversation))
        for c in res.scalars().all():
            print(f"ID: {c.id} | Traveler ID: {c.traveler_id} | Agency ID: {c.agency_id} | Package ID: {c.package_id}")

if __name__ == "__main__":
    asyncio.run(dump())
