import asyncio
import json
import uuid
from datetime import datetime
from dotenv import load_dotenv

# Load environmental variables from .env first
load_dotenv()

from sqlalchemy.future import select
from app.database import engine, AsyncSession, async_sessionmaker, Base
from app.models import User, AgencyProfile, Package, Review, Booking, UserRole, UserStatus, BookingStatus
from app.core.security import hash_password

async def seed_database():
    # Make sure all tables are created on the connected database
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async with async_session() as db:
        print("Checking existing seed data...")

        # 1. Seed Travelers
        travelers_data = [
            {
                "email": "traveler@destin8.com",
                "name": "Sarah Ahmed",
                "phone": "+92 300 1234567",
                "password": "password123",
            },
            {
                "email": "ali@destin8.com",
                "name": "Ali Raza",
                "phone": "+92 321 9876543",
                "password": "password123",
            },
            {
                "email": "zara@destin8.com",
                "name": "Zara Khan",
                "phone": "+92 333 4567890",
                "password": "password123",
            },
        ]

        traveler_users = {}
        for t in travelers_data:
            res = await db.execute(select(User).where(User.email == t["email"]))
            existing = res.scalar_one_or_none()
            if not existing:
                user = User(
                    name=t["name"],
                    email=t["email"],
                    hashed_password=hash_password(t["password"]),
                    phone=t["phone"],
                    role=UserRole.traveler,
                    status=UserStatus.active,
                )
                db.add(user)
                await db.flush()
                traveler_users[t["email"]] = user
                print(f"Created traveler: {t['email']}")
            else:
                traveler_users[t["email"]] = existing
                print(f"Traveler exists: {t['email']}")

        # 2. Seed Agencies
        agencies_data = [
            {
                "email": "odyssey@destin8.com",
                "name": "Odyssey Travels",
                "owner": "Kamran Shah",
                "phone": "+92 301 5551234",
                "license": "PKG-2024-8901",
                "address": "Suite 402, Blue Area, Islamabad",
                "password": "password123",
                "bank_name": "Meezan Bank",
                "account_title": "Odyssey Travels Pvt Ltd",
                "account_number": "01020104889102",
                "branch_code": "0102",
            },
            {
                "email": "northland@destin8.com",
                "name": "Northland Adventures",
                "owner": "Tariq Malik",
                "phone": "+92 302 4445678",
                "license": "PKG-2024-4412",
                "address": "Main Bazar, Karimabad, Hunza",
                "password": "password123",
                "bank_name": "Bank Alfalah",
                "account_title": "Northland Adventures",
                "account_number": "09912004881122",
                "branch_code": "0991",
            },
            {
                "email": "k2expeditions@destin8.com",
                "name": "K2 Alpine Expeditions",
                "owner": "Hassan Baig",
                "phone": "+92 304 8889012",
                "license": "PKG-2024-9910",
                "address": "Yadgar Chowk, Skardu, Gilgit-Baltistan",
                "password": "password123",
                "bank_name": "Habib Bank Limited",
                "account_title": "K2 Alpine Expeditions",
                "account_number": "00427901182703",
                "branch_code": "0042",
            },
        ]

        agency_users = {}
        for a in agencies_data:
            res = await db.execute(select(User).where(User.email == a["email"]))
            existing = res.scalar_one_or_none()
            if not existing:
                user = User(
                    name=a["name"],
                    email=a["email"],
                    hashed_password=hash_password(a["password"]),
                    phone=a["phone"],
                    role=UserRole.agency,
                    status=UserStatus.approved,
                )
                db.add(user)
                await db.flush()

                profile = AgencyProfile(
                    user_id=user.id,
                    agency_name=a["name"],
                    owner_name=a["owner"],
                    business_address=a["address"],
                    license_number=a["license"],
                    bank_name=a["bank_name"],
                    account_title=a["account_title"],
                    account_number=a["account_number"],
                    branch_code=a["branch_code"],
                    bank_verification_status="verified",
                )
                db.add(profile)
                await db.flush()
                agency_users[a["email"]] = user
                print(f"Created agency: {a['name']} ({a['email']})")
            else:
                agency_users[a["email"]] = existing
                print(f"Agency exists: {a['name']}")

        await db.commit()

        # 3. Seed Packages
        packages_list = [
            {
                "agency_email": "odyssey@destin8.com",
                "title": "Kashmir Valley & Neelum Expedition",
                "destination": "Kashmir",
                "price": 45000.0,
                "duration_days": 5,
                "description": "Experience the majestic valleys of Azad Kashmir. Visit Muzaffarabad, Kutton Waterfalls, Upper Neelum, Keran, and take the thrilling Arang Kel chairlift over pine-covered forests.",
                "included_services": json.dumps(["Hotels", "Guided Tours", "Transport", "Breakfast", "Jeep Safari"]),
                "cover_image": "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1000&q=80",
                "departure_date": "2026-08-15",
                "deposit_percentage": 50,
                "refund_deadline_days": 7,
                "best_season": "Summer & Autumn",
                "categories": json.dumps(["mountains", "family"]),
                "itinerary": json.dumps([
                    {"day": 1, "title": "Arrival in Muzaffarabad", "desc": "Departure from Islamabad, briefing and evening stroll along Neelum River."},
                    {"day": 2, "title": "Drive to Kutton & Keran", "desc": "Visit Kutton waterfall, Jagran valley hydropower plant and check-in at riverside resort."},
                    {"day": 3, "title": "Upper Neelum & Sharda Ruins", "desc": "Explore ancient Sharda Peeth university site and enjoy panoramic valley views."},
                    {"day": 4, "title": "Arang Kel Cable Car & Hiking", "desc": "Take the Kel cable car and hike to lush green meadows of Arang Kel."},
                    {"day": 5, "title": "Return Journey via Murree Expressway", "desc": "Souvenir shopping and comfortable AC coaster return to Islamabad."}
                ]),
            },
            {
                "agency_email": "northland@destin8.com",
                "title": "Hunza & Skardu Autumn Deluxe Tour",
                "destination": "Hunza",
                "price": 68000.0,
                "duration_days": 7,
                "description": "Journey through the Karakoram Highway during peak golden autumn foliage. Includes visits to Baltit Fort, Attabad Lake, Passu Cones, Khunjerab Pass, Shangrila Resort, and Deosai Plains.",
                "included_services": json.dumps(["Hotels", "Transport", "Meals", "Photography Guide", "Cultural Night"]),
                "cover_image": "https://images.unsplash.com/photo-1627894099065-921d17ef4770?auto=format&fit=crop&w=1000&q=80",
                "departure_date": "2026-10-01",
                "deposit_percentage": 40,
                "refund_deadline_days": 10,
                "best_season": "Autumn",
                "categories": json.dumps(["mountains", "cultural"]),
                "itinerary": json.dumps([
                    {"day": 1, "title": "Islamabad to Naran / Hunza", "desc": "Scenic drive via Hazara Motorway and Babusar Pass."},
                    {"day": 2, "title": "Altit & Baltit Fort Exploration", "desc": "Guided heritage tour of 800-year-old Baltit Fort and Karimabad Market."},
                    {"day": 3, "title": "Attabad Lake & Passu Cones", "desc": "Boating on turquoise Attabad Lake and photo session at Passu Cathedral."},
                    {"day": 4, "title": "Khunjerab Pass (Pak-China Border)", "desc": "Excursion to the highest paved international border at 4,693 meters."},
                    {"day": 5, "title": "Transfer to Skardu & Shangrila Resort", "desc": "Drive along Indus river to Lower Kachura Lake and Shangrila Resort."},
                    {"day": 6, "title": "Deosai National Park & Sheosar Lake", "desc": "4x4 Jeep safari across the world's second highest plateau."},
                    {"day": 7, "title": "Flight / Drive Return", "desc": "Morning flight from Skardu airport or luxury coaster return."}
                ]),
            },
            {
                "agency_email": "odyssey@destin8.com",
                "title": "Gwadar Coastal Highway & Beach Escape",
                "destination": "Gwadar",
                "price": 38000.0,
                "duration_days": 3,
                "description": "Explore the untouched coastal beauty of Balochistan along the Makran Coastal Highway. Experience beach camping under the stars, speedboat cruises to Hammerhead cliff, and fresh seafood.",
                "included_services": json.dumps(["Transport", "Meals", "Beach Camping", "Speedboat Ride", "Bonfire"]),
                "cover_image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
                "departure_date": "2026-11-20",
                "deposit_percentage": 50,
                "refund_deadline_days": 5,
                "best_season": "Winter",
                "categories": json.dumps(["beaches", "solo"]),
                "itinerary": json.dumps([
                    {"day": 1, "title": "Karachi to Kund Malir & Ormara", "desc": "Scenic coastal drive passing Hingol National Park and Princess of Hope rock formation."},
                    {"day": 2, "title": "Gwadar City Tour & Koh-e-Batil", "desc": "Climb Koh-e-Batil steps for twin bay panorama and take a private speedboat tour around Hammerhead."},
                    {"day": 3, "title": "Sunset Beach relaxation & Return", "desc": "Morning sea bathing, local fish market visit and comfortable return ride."}
                ]),
            },
            {
                "agency_email": "northland@destin8.com",
                "title": "Swat & Kalam Alpine Paradise Expedition",
                "destination": "Swat",
                "price": 32000.0,
                "duration_days": 4,
                "description": "Discover the Switzerland of the East! Enjoy Malam Jabba ski slopes, ziplining, Kalam pine forests, and a 4x4 Jeep adventure to the crystal-clear glacial waters of Mahodand Lake.",
                "included_services": json.dumps(["Hotels", "Transport", "Breakfast", "Jeep Safari"]),
                "cover_image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
                "departure_date": "2026-08-25",
                "deposit_percentage": 50,
                "refund_deadline_days": 7,
                "best_season": "Summer",
                "categories": json.dumps(["mountains", "family"]),
                "itinerary": json.dumps([
                    {"day": 1, "title": "Islamabad to Mingora Swat", "desc": "Travel via Swat Expressway, check-in at Fiza Ghat resort."},
                    {"day": 2, "title": "Malam Jabba Ski Resort & Zipline", "desc": "Chairlift ride, cable car adventure, and panoramic valley views."},
                    {"day": 3, "title": "Kalam & Mahodand Lake Jeep Safari", "desc": "Jeep ride through Ushu Forest and Matiltan Waterfall to Mahodand Lake."},
                    {"day": 4, "title": "White Palace Marghazar & Return", "desc": "Visit historical Marble White Palace of Swat State before heading back."}
                ]),
            },
            {
                "agency_email": "odyssey@destin8.com",
                "title": "Lahore Heritage & Walled City Cultural Trail",
                "destination": "Lahore",
                "price": 22000.0,
                "duration_days": 3,
                "description": "Immerse yourself in Mughal architecture and Punjabi hospitality. Includes guided heritage walks through Wazir Khan Mosque, Badshahi Mosque, Shahi Hammam, Haveli dining, and Wagah Border flag ceremony.",
                "included_services": json.dumps(["Hotels", "Guided Tours", "Meals", "Heritage Entry Pass"]),
                "cover_image": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1000&q=80",
                "departure_date": "2026-10-15",
                "deposit_percentage": 30,
                "refund_deadline_days": 3,
                "best_season": "Winter & Spring",
                "categories": json.dumps(["cultural", "family"]),
                "itinerary": json.dumps([
                    {"day": 1, "title": "Badshahi Mosque & Lahore Fort", "desc": "Explore Sheesh Mahal, Alamgiri Gate and evening dinner at Fort Road Food Street."},
                    {"day": 2, "title": "Walled City Heritage Walk", "desc": "Guided walking tour through Delhi Gate, Shahi Hammam, Wazir Khan Mosque, and spice bazaars."},
                    {"day": 3, "title": "Shalimar Gardens & Wagah Border", "desc": "Morning at UNESCO-listed Shalimar Gardens and afternoon trip to Wagah Border ceremony."}
                ]),
            },
            {
                "agency_email": "k2expeditions@destin8.com",
                "title": "K2 Base Camp & Concordia Trekking Challenge",
                "destination": "Skardu",
                "price": 145000.0,
                "duration_days": 14,
                "description": "The ultimate high-altitude mountain trek on Earth! Trek across Baltoro Glacier to Concordia - the Throne Room of the Mountain Gods - offering unmatched views of K2 (8611m), Broad Peak, and Gasherbrum.",
                "included_services": json.dumps(["Porters", "Camping Gear", "All Meals", "Mountain Guide", "First Aid Kit"]),
                "cover_image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
                "departure_date": "2026-08-01",
                "deposit_percentage": 50,
                "refund_deadline_days": 14,
                "best_season": "Summer",
                "categories": json.dumps(["mountains", "solo"]),
                "itinerary": json.dumps([
                    {"day": 1, "title": "Skardu Arrival & Safety Briefing", "desc": "Equipment check and briefing with certified high-altitude guides."},
                    {"day": 2, "title": "4x4 Jeep Drive to Askole", "desc": "Thrilling drive along Shigar river valley to Askole village."},
                    {"day": 3, "title": "Trek to Jhola & Paiju", "desc": "Trek alongside Braldu river towards Baltoro glacier snout."},
                    {"day": 4, "title": "Trek to Concordia (Throne Room)", "desc": "Traverse Baltoro glacier to Concordia surrounded by 8000m peaks."},
                    {"day": 5, "title": "K2 Base Camp Excursion (5,135m)", "desc": "Day hike to K2 Base Camp and Gilkey Memorial."},
                    {"day": 6, "title": "Return Trek & Descent to Skardu", "desc": "Return journey with celebratory dinner in Skardu."}
                ]),
            },
        ]

        created_packages = []
        for p in packages_list:
            agency_user = agency_users[p["agency_email"]]
            res = await db.execute(select(Package).where(Package.title == p["title"]))
            existing = res.scalar_one_or_none()
            if not existing:
                pkg = Package(
                    agency_id=agency_user.id,
                    title=p["title"],
                    destination=p["destination"],
                    price=p["price"],
                    duration_days=p["duration_days"],
                    description=p["description"],
                    included_services=p["included_services"],
                    cover_image=p["cover_image"],
                    departure_date=p["departure_date"],
                    deposit_percentage=p["deposit_percentage"],
                    refund_deadline_days=p["refund_deadline_days"],
                    best_season=p["best_season"],
                    categories=p["categories"],
                    itinerary=p["itinerary"],
                )
                db.add(pkg)
                await db.flush()
                created_packages.append(pkg)
                print(f"Created package: {pkg.title}")
            else:
                created_packages.append(existing)
                print(f"Package exists: {existing.title}")

        await db.commit()

        # 4. Seed Reviews
        reviews_data = [
            (created_packages[0].id, traveler_users["traveler@destin8.com"].id, 5, "Absolute paradise! The Arang Kel cable car and lush meadows were unforgettable."),
            (created_packages[0].id, traveler_users["ali@destin8.com"].id, 5, "Well organized by Odyssey Travels. Comfortable coasters and excellent food."),
            (created_packages[1].id, traveler_users["zara@destin8.com"].id, 5, "Golden autumn in Hunza is breathtaking. Great guide and hotel stay."),
            (created_packages[2].id, traveler_users["ali@destin8.com"].id, 4, "Awesome beach camping in Gwadar! Speedboat cruise was the highlight."),
            (created_packages[3].id, traveler_users["traveler@destin8.com"].id, 5, "Malam Jabba zipline was super fun. Kids loved Mahodand lake jeep ride!"),
        ]

        for pkg_id, user_id, rating, comment in reviews_data:
            res = await db.execute(select(Review).where(Review.package_id == pkg_id, Review.user_id == user_id))
            if not res.scalar_one_or_none():
                rev = Review(
                    package_id=pkg_id,
                    user_id=user_id,
                    rating=rating,
                    comment=comment,
                )
                db.add(rev)

        # 5. Seed Sample Bookings
        sample_bookings = [
            {
                "package_id": created_packages[0].id, # Kashmir Family
                "traveler_id": traveler_users["traveler@destin8.com"].id,
                "num_travelers": 4,
                "male_count": 2,
                "female_count": 2,
                "status": BookingStatus.confirmed,
                "total_price": 45000.0 * 4,
            },
            {
                "package_id": created_packages[2].id, # Gwadar Solo
                "traveler_id": traveler_users["ali@destin8.com"].id,
                "num_travelers": 1,
                "male_count": 1,
                "female_count": 0,
                "status": BookingStatus.confirmed,
                "total_price": 38000.0 * 1,
            },
        ]

        for b in sample_bookings:
            res = await db.execute(select(Booking).where(Booking.package_id == b["package_id"], Booking.traveler_id == b["traveler_id"]))
            if not res.scalar_one_or_none():
                booking = Booking(
                    package_id=b["package_id"],
                    traveler_id=b["traveler_id"],
                    num_travelers=b["num_travelers"],
                    male_count=b["male_count"],
                    female_count=b["female_count"],
                    travel_date="2026-08-15",
                    status=b["status"],
                    notes="Sample verified booking",
                )
                db.add(booking)

        await db.commit()
        print("\nSeed data populating finished successfully!")

if __name__ == "__main__":
    asyncio.run(seed_database())
