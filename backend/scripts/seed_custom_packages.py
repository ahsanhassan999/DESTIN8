import asyncio
import json
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import AsyncSessionLocal, engine, Base
from app.models import User, AgencyProfile, Package, UserRole, UserStatus
from app.core.security import hash_password
from sqlalchemy.future import select


async def seed():
    # Make sure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # 1. Fetch or create approved agency user
        agency_result = await db.execute(select(User).where(User.email == "agency@test.com"))
        agency = agency_result.scalar_one_or_none()
        if not agency:
            agency = User(
                name="Odyssey Travels",
                email="agency@test.com",
                hashed_password=hash_password("Agency@123"),
                role=UserRole.agency,
                status=UserStatus.approved,
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
            print("[OK] Agency user agency@test.com created.")
        else:
            agency.status = UserStatus.approved
            print("[!] Agency user agency@test.com exists.")

        await db.flush()

        # 2. Define custom realistic packages
        custom_pkgs = [
            {
                "title": "Hunza Valley Autumn Adventure",
                "destination": "Hunza, Gilgit-Baltistan",
                "price": 68000.0,
                "duration_days": 5,
                "description": "Explore Altit/Baltit forts, boating at Attabad Lake, and trekking near Passu Cones during the vibrant golden autumn season. Features authentic local cuisine and luxury lakeside resort stays.",
                "included_services": json.dumps(["Transport", "3-Star Lodging", "All Meals", "Local Guide"]),
                "cover_image": "https://lh3.googleusercontent.com/aida-public/AB6AXuDE9xajh-roQLam_xXLRv2C2zcJ_4OwQuMyoFJlbVdn27acZZanRhSr__1YZKJy17-voIPaRPlBOmjFm91qOHJpn-EpCWrPAon_vakVR96MM5Tetd8a6nD1OWMKwipM6SYJCPKr2_A_h9_Id4f5hpqAdS6wlTRmnmWcCB2PFFs99MTZHG1AeUxYoY5zUaKPxcuh-ptQ_jahepZTpcrh-bNL6b5ziOWgOa2p21vFXr1kfmdjLMEeYt0VlQyNhjAp8vMqXPKlD2vmxbmJ",
                "departure_date": "Oct 15, 2026",
                "itinerary": json.dumps([
                    {
                        "id": 1,
                        "title": "Arrival in Gilgit & Drive to Hunza",
                        "desc": "Arrive at Gilgit airport, meet your local guide, and enjoy a scenic drive along the Karakoram Highway to Hunza. Check-in to your hotel and take an evening walk by the Hunza River.",
                        "accommodation": "Luxus Grand Hunza",
                        "location": "Gilgit / Karimabad",
                        "transport": ["Private SUV"]
                    },
                    {
                        "id": 2,
                        "title": "Altit & Baltit Forts Tour",
                        "desc": "Visit the 800-year-old Baltit Fort and the 1100-year-old Altit Fort. Stroll through the local Karimabad bazaar for handicrafts and organic dried fruits.",
                        "accommodation": "Luxus Grand Hunza",
                        "location": "Karimabad",
                        "transport": ["Private SUV"]
                    },
                    {
                        "id": 3,
                        "title": "Attabad Lake & Passu Cones",
                        "desc": "Drive to Attabad Lake for a private boat ride on its turquoise waters. Continue to Passu to photograph the dramatic Passu Cones and enjoy fresh river trout dinner.",
                        "accommodation": "Attabad Lake Waterfront Resort",
                        "location": "Attabad / Passu",
                        "transport": ["Private SUV", "Motorboat"]
                    },
                    {
                        "id": 4,
                        "title": "Hussaini Bridge & Khunjerab Pass",
                        "desc": "Test your courage on the Hussaini Suspension Bridge. Then, drive up to the high-altitude China border at Khunjerab Pass (4,693 meters above sea level).",
                        "accommodation": "Luxus Grand Hunza",
                        "location": "Passu / Khunjerab",
                        "transport": ["Private SUV"]
                    },
                    {
                        "id": 5,
                        "title": "Farewell Gilgit",
                        "desc": "Drive back to Gilgit airport for your flight to Islamabad, enjoying a final view of Rakaposhi mountain along the way.",
                        "accommodation": "N/A",
                        "location": "Gilgit Airport",
                        "transport": ["Private SUV", "Flight"]
                    }
                ])
            },
            {
                "title": "Neelum Valley Spring Escape",
                "destination": "Neelum Valley, Azad Kashmir",
                "price": 38000.0,
                "duration_days": 3,
                "description": "Discover the emerald green waters of Neelum River, lush alpine meadows, and the ancient temple ruins of Sharda Peeth.",
                "included_services": json.dumps(["Coaster transport", "Hotel Stay", "Breakfast & Dinner", "Tour Coordinator"]),
                "cover_image": "https://lh3.googleusercontent.com/aida-public/AB6AXuBoCMJq2ZMf1oriN3XfyINSBW0uuiY_bxTzKEAlNXNqyGV55wx2BrDJV3j9XaZsKxPl4zg0HXeKElrN_tK2blgKq50DDrDUP3IA6WBLCytK7dr8VLQ28fsiUG9_uoDOsNc44rDPdSX_mXZci6e4D74-Z4-De8jvDL5zeDp1MCVVA9dml_HMtMSVCodqvWOJX3iOKYpz1QvqIc9TjfAw2e-z_5xjDNeza9Hn2VufdJKQSboLUfwlOHPTtLh6gZzRj7rXvADElHvOIkFA",
                "departure_date": "Sep 20, 2026",
                "itinerary": json.dumps([
                    {
                        "id": 1,
                        "title": "Islamabad to Keran",
                        "desc": "Depart Islamabad early via the Murree Expressway. Stop at Muzaffarabad for lunch, then drive along the scenic Neelum River to Keran.",
                        "accommodation": "Keran River Resort",
                        "location": "Keran, Neelum Valley",
                        "transport": ["Scenic Coaster"]
                    },
                    {
                        "id": 2,
                        "title": "Sharda Peeth & Hike to Arang Kel",
                        "desc": "Visit the historic Sharda Peeth ruins. Later, take the local chairlift and hike up to the fairy-tale village of Arang Kel.",
                        "accommodation": "Arang Kel Green Cabins",
                        "location": "Sharda / Kel",
                        "transport": ["Scenic Coaster", "Chairlift", "Trek"]
                    },
                    {
                        "id": 3,
                        "title": "Dhani Waterfall & Return",
                        "desc": "Drive back towards Islamabad, stopping to refresh at the cascading Dhani Waterfall and shop for Kashmiri shawls.",
                        "accommodation": "N/A",
                        "location": "Dhani / Islamabad",
                        "transport": ["Scenic Coaster"]
                    }
                ])
            },
            {
                "title": "Skardu Valley Wilderness Expedition",
                "destination": "Skardu, Gilgit-Baltistan",
                "price": 95000.0,
                "duration_days": 7,
                "description": "Tour the cold desert of Katpana, boat ride in Shangrila Resort, and trek through the high plains of Deosai National Park.",
                "included_services": json.dumps(["4x4 Land Cruiser", "4-Star Resort", "All Meals", "Professional Guide", "Deosai Entry Permits"]),
                "cover_image": "https://lh3.googleusercontent.com/aida-public/AB6AXuAr9N4r2pQIG8XJBvWb16F6nvhEXPgYZWTQ4Hru5477Lyf6_bv5TFmbZsowTHQc2Z7em1tZ_oDLZOxdwIdVbNFbMccFtMgQ-bkLP0jrFZ6_M0QEEMVWIKIhzd4TmSHAZr-wdKfi7CiSb6Dw7nlNWAST-oiM2bxZPvZj1__Z_D7KDbjWwp5Xei7qDMxGvq_I_WgKu9z27buIpPiUJud-6ZxTXqHQmHCSGvOBjEUmPqv-D9CszcFkRTrTP8VoSeiOilDAS_0lUPvGnbNv",
                "departure_date": "Aug 05, 2026",
                "itinerary": json.dumps([
                    {
                        "id": 1,
                        "title": "Welcome to Shangrila",
                        "desc": "Fly into Skardu airport, check into the world-famous Shangrila Resort, and enjoy a private boat ride on Lower Kachura Lake.",
                        "accommodation": "Shangrila Resort Skardu",
                        "location": "Lower Kachura",
                        "transport": ["Private SUV", "Rowboat"]
                    },
                    {
                        "id": 2,
                        "title": "Katpana Cold Desert Dune Ride",
                        "desc": "Experience high-altitude sand dunes in Katpana. Enjoy dune buggy rides and watch the sunset over the desert peaks.",
                        "accommodation": "Katpana Glamping Tents",
                        "location": "Katpana Desert",
                        "transport": ["Private SUV", "Dune Buggy"]
                    },
                    {
                        "id": 3,
                        "title": "Deosai National Park - Land of Giants",
                        "desc": "Ascend to the second-highest plateau in the world. Spot Himalayan brown bears and picnic by the pristine Sheosar Lake.",
                        "accommodation": "Deosai Wildlife Camp",
                        "location": "Deosai Plains",
                        "transport": ["4x4 Land Cruiser"]
                    },
                    {
                        "id": 4,
                        "title": "Sadpara Lake & Buddha Rock",
                        "desc": "Drive back down to view the deep blue Sadpara Lake, then visit the 8th-century Manthal Buddhist rock carving.",
                        "accommodation": "Shigar Fort Residence",
                        "location": "Sadpara / Manthal",
                        "transport": ["4x4 Land Cruiser"]
                    },
                    {
                        "id": 5,
                        "title": "Shigar Valley & Fort Exploration",
                        "desc": "Tour the organic orchards of Shigar and explore the historic 17th-century Shigar Fort (Fong-Khar) managed by Aga Khan Trust.",
                        "accommodation": "Shigar Fort Residence",
                        "location": "Shigar Valley",
                        "transport": ["Private SUV"]
                    },
                    {
                        "id": 6,
                        "title": "Mantokha Waterfall & Khaplu Palace",
                        "desc": "Witness the dramatic Mantokha Waterfall. Drive to Khaplu to explore the royal palace museum and terraced gardens.",
                        "accommodation": "Serena Khaplu Palace",
                        "location": "Mantokha / Khaplu",
                        "transport": ["Private SUV"]
                    },
                    {
                        "id": 7,
                        "title": "Flight back to Islamabad",
                        "desc": "Drive to Skardu airport for your flight back to Islamabad with breathtaking views of Nanga Parbat and K2.",
                        "accommodation": "N/A",
                        "location": "Skardu Airport",
                        "transport": ["Private SUV", "Flight"]
                    }
                ])
            }
        ]

        for pkg in custom_pkgs:
            # Delete if title already exists to allow re-runs
            delete_result = await db.execute(select(Package).where(Package.title == pkg["title"]))
            existing = delete_result.scalars().all()
            for ext in existing:
                await db.delete(ext)
            
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
                itinerary=pkg["itinerary"]
            )
            db.add(p)
            print(f"[OK] Seeded package: {p.title}")

        await db.commit()
        print("[SUCCESS] All custom travel packages seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
