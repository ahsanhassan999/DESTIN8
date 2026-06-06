import asyncio
import json
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import AsyncSessionLocal, engine, Base
from app.models import User, AgencyProfile, Package, UserRole, UserStatus, Review
from app.core.security import hash_password
from sqlalchemy.future import select


async def seed():
    # Make sure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # 1. Create a traveler user
        traveler_result = await db.execute(select(User).where(User.email == "traveler@test.com"))
        traveler = traveler_result.scalar_one_or_none()
        if not traveler:
            traveler = User(
                name="Ahmed Hassan",
                email="traveler@test.com",
                hashed_password=hash_password("Traveler@123"),
                role=UserRole.traveler,
                status=UserStatus.active,
            )
            db.add(traveler)
            print("[OK] Traveler user created: traveler@test.com / Traveler@123")
        else:
            print("[!] Traveler user already exists.")

        # 2. Create an approved agency user
        agency_result = await db.execute(select(User).where(User.email == "agency@test.com"))
        agency = agency_result.scalar_one_or_none()
        if not agency:
            agency = User(
                name="Odyssey Travels",
                email="agency@test.com",
                hashed_password=hash_password("Agency@123"),
                role=UserRole.agency,
                status=UserStatus.approved,  # Must be approved to publish packages
            )
            db.add(agency)
            await db.flush()

            profile = AgencyProfile(
                user_id=agency.id,
                agency_name="Odyssey Travels",
                owner_name="Ahmed Hassan",
                business_address="123 Odyssey Blvd, Karachi",
                license_number="LIC-12345-OT",
            )
            db.add(profile)
            print("[OK] Agency user created: agency@test.com / Agency@123")
        else:
            # Make sure it's approved
            agency.status = UserStatus.approved
            print("[!] Agency user already exists (ensured status is approved).")

        await db.flush()

        # 3. Create Packages
        mock_pkgs = [
            {
                "title": "Hunza Valley Luxury Retreat",
                "destination": "Hunza, Gilgit-Baltistan",
                "price": 85000.0,
                "duration_days": 7,
                "description": "Experience the breathtaking beauty of Hunza Valley with our premium 7-day retreat. Includes luxury accommodation, guided treks to Eagle's Nest, Baltit Fort visits, and authentic Hunzai cuisine.",
                "included_services": json.dumps(["Return transport", "All meals", "Professional guide", "3-star+ lodging"]),
                "cover_image": "https://lh3.googleusercontent.com/aida-public/AB6AXuDE9xajh-roQLam_xXLRv2C2zcJ_4OwQuMyoFJlbVdn27acZZanRhSr__1YZKJy17-voIPaRPlBOmjFm91qOHJpn-EpCWrPAon_vakVR96MM5Tetd8a6nD1OWMKwipM6SYJCPKr2_A_h9_Id4f5hpqAdS6wlTRmnmWcCB2PFFs99MTZHG1AeUxYoY5zUaKPxcuh-ptQ_jahepZTpcrh-bNL6b5ziOWgOa2p21vFXr1kfmdjLMEeYt0VlQyNhjAp8vMqXPKlD2vmxbmJ",
                "departure_date": "Oct 12, 2026"
            },
            {
                "title": "K2 Base Camp Trek",
                "destination": "Skardu, Gilgit-Baltistan",
                "price": 125000.0,
                "duration_days": 14,
                "description": "The ultimate mountaineering challenge — trek to the base of the world's second highest peak. A once-in-a-lifetime journey through the Karakoram range.",
                "included_services": json.dumps(["Full porter & guide team", "All camping gear", "Meals on trail", "Permits & fees"]),
                "cover_image": "https://lh3.googleusercontent.com/aida-public/AB6AXuAr9N4r2pQIG8XJBvWb16F6nvhEXPgYZWTQ4Hru5477Lyf6_bv5TFmbZsowTHQc2Z7em1tZ_oDLZOxdwIdVbNFbMccFtMgQ-bkLP0jrFZ6_M0QEEMVWIKIhzd4TmSHAZr-wdKfi7CiSb6Dw7nlNWAST-oiM2bxZPvZj1__Z_D7KDbjWwp5Xei7qDMxGvq_I_WgKu9z27buIpPiUJud-6ZxTXqHQmHCSGvOBjEUmPqv-D9CszcFkRTrTP8VoSeiOilDAS_0lUPvGnbNv",
                "departure_date": "Dec 05, 2026"
            },
            {
                "title": "Swat Valley Spring Bloom",
                "destination": "Swat, KPK",
                "price": 32000.0,
                "duration_days": 3,
                "description": "A refreshing 3-day escape to the lush green valleys of Swat during peak spring season. Cherry blossoms, waterfalls, and mountain villages await.",
                "included_services": json.dumps(["Transport from Islamabad", "Hotel stay", "Breakfast & dinner"]),
                "cover_image": "https://lh3.googleusercontent.com/aida-public/AB6AXuDE9xajh-roQLam_xXLRv2C2zcJ_4OwQuMyoFJlbVdn27acZZanRhSr__1YZKJy17-voIPaRPlBOmjFm91qOHJpn-EpCWrPAon_vakVR96MM5Tetd8a6nD1OWMKwipM6SYJCPKr2_A_h9_Id4f5hpqAdS6wlTRmnmWcCB2PFFs99MTZHG1AeUxYoY5zUaKPxcuh-ptQ_jahepZTpcrh-bNL6b5ziOWgOa2p21vFXr1kfmdjLMEeYt0VlQyNhjAp8vMqXPKlD2vmxbmJ",
                "departure_date": "Oct 20, 2026"
            },
            {
                "title": "Maldives Luxury Escape",
                "destination": "Maldives",
                "price": 320000.0,
                "duration_days": 5,
                "description": "Indulge in 5 nights of pure luxury at a private overwater bungalow in the Maldives. Crystal clear lagoons, world-class dining, and unparalleled serenity.",
                "included_services": json.dumps(["Business class flights", "All-inclusive stay", "Seaplane transfers"]),
                "cover_image": "https://lh3.googleusercontent.com/aida-public/AB6AXuCLcOL5_Md5WsCR1-4sEBqmH7uckkSerjpIzQ_5ggTe_VGVYv9kcvUERbTzSArXBi89ouiKLq2Vxz_6EN6MKfnfYYalUSqFgrYhR7dsouwmcoh5k3Jty8YDZnahU57q6RS8oXOXfkcNUN6cDUfgYhIZi0NDg15ZxfSpfZUpDv4tFQUQYXeg7iyHhEJ6GpjeYhtwfNqqBjbjdm69kd7IG1K2ep1hT6xC3l3GLGDvAs2Ymj0OBMurinZ4fFRbm2rzh7gwuZUSjrbQ8p3x",
                "departure_date": "Nov 15, 2026"
            },
            {
                "title": "Fairy Meadows Trek",
                "destination": "Nanga Parbat Base, GB",
                "price": 45000.0,
                "duration_days": 4,
                "description": "Trek through one of Pakistan's most legendary meadows with direct views of Nanga Parbat, the 9th highest mountain in the world.",
                "included_services": json.dumps(["Jeep from Raikot Bridge", "Camping gear", "Local guide", "Meals"]),
                "cover_image": "https://lh3.googleusercontent.com/aida-public/AB6AXuAr9N4r2pQIG8XJBvWb16F6nvhEXPgYZWTQ4Hru5477Lyf6_bv5TFmbZsowTHQc2Z7em1tZ_oDLZOxdwIdVbNFbMccFtMgQ-bkLP0jrFZ6_M0QEEMVWIKIhzd4TmSHAZr-wdKfi7CiSb6Dw7nlNWAST-oiM2bxZPvZj1__Z_D7KDbjWwp5Xei7qDMxGvq_I_WgKu9z27buIpPiUJud-6ZxTXqHQmHCSGvOBjEUmPqv-D9CszcFkRTrTP8VoSeiOilDAS_0lUPvGnbNv",
                "departure_date": "Sep 10, 2026"
            }
        ]

        for pkg in mock_pkgs:
            # Check duplicate package by title
            exists = await db.execute(select(Package).where(Package.title == pkg["title"]))
            if not exists.scalar_one_or_none():
                p = Package(
                    agency_id=agency.id,
                    title=pkg["title"],
                    destination=pkg["destination"],
                    price=pkg["price"],
                    duration_days=pkg["duration_days"],
                    description=pkg["description"],
                    included_services=pkg["included_services"],
                    cover_image=pkg["cover_image"],
                    departure_date=pkg["departure_date"],
                )
                db.add(p)
                print(f"[OK] Seeded package: {p.title}")
            else:
                print(f"[!] Package '{pkg['title']}' already exists.")

        await db.commit()
        print("[OK] Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed())
