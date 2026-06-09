import asyncio
import traceback
from sqlalchemy.future import select
from app.database import engine, get_db
from app.models import Package, Booking, BookingStatus, Conversation, Message, User
from app.schemas import PackageUpdateRequest

async def test_update():
    print("Running diagnostic package update...")
    async with engine.begin() as conn:
        # We can run in a session
        pass
    
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.ext.asyncio import AsyncSession
    
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as db:
        try:
            # Find a package
            pkg_res = await db.execute(select(Package))
            pkg = pkg_res.scalars().first()
            if not pkg:
                print("No packages found to test.")
                return
            
            print(f"Testing with Package ID: {pkg.id}, Title: {pkg.title}")
            
            # Find a traveler user
            traveler_res = await db.execute(select(User).where(User.role == "traveler"))
            traveler = traveler_res.scalars().first()
            if not traveler:
                print("No traveler found to test.")
                return
            
            print(f"Testing with Traveler ID: {traveler.id}, Name: {traveler.name}")
            
            # Let's create a confirmed booking for this traveler
            booking = Booking(
                traveler_id=traveler.id,
                package_id=pkg.id,
                status=BookingStatus.confirmed,
                num_travelers=1,
                travel_date="2026-09-01"
            )
            db.add(booking)
            await db.commit()
            print("Created a confirmed booking.")
            
            # Now run the logic inside update_package
            # Determine which traveler bookings are currently within their refund window
            # so they can receive system notification messages
            from datetime import datetime
            from typing import Optional
            def parse_date(date_str: str) -> Optional[datetime]:
                if not date_str or date_str.upper() in ("TBD", "—", ""):
                    return None
                for fmt in ("%b %d, %Y", "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y"):
                    try:
                        return datetime.strptime(date_str, fmt)
                    except ValueError:
                        continue
                return None

            bookings_res = await db.execute(
                select(Booking).where(
                    Booking.package_id == pkg.id,
                    Booking.status == BookingStatus.confirmed
                )
            )
            bookings = bookings_res.scalars().all()
            
            notified_travelers = []
            for b in bookings:
                target_date = b.travel_date or pkg.departure_date
                travel_dt = parse_date(target_date)
                if travel_dt:
                    days_until_travel = (travel_dt - datetime.utcnow()).days
                    if days_until_travel >= pkg.refund_deadline_days:
                        notified_travelers.append(b.traveler_id)

            print(f"Notified travelers list: {notified_travelers}")
            
            # Dispatch system warnings in chat logs
            for traveler_id in notified_travelers:
                conv_res = await db.execute(
                    select(Conversation).where(
                        Conversation.package_id == pkg.id,
                        Conversation.traveler_id == traveler_id
                    )
                )
                conv = conv_res.scalar_one_or_none()
                if not conv:
                    print("Creating new Conversation...")
                    conv = Conversation(
                        traveler_id=traveler_id,
                        agency_id=pkg.agency_id,
                        package_id=pkg.id
                    )
                    db.add(conv)
                    await db.flush()
                    print(f"Conversation created with ID: {conv.id}")
                    
                print("Creating new Message...")
                sys_msg = Message(
                    conversation_id=conv.id,
                    sender_role="system",
                    sender_id=None,
                    text="Notice: The agency has updated the package details. Since you are within the cancellation window, you may request a refund if you wish. Please state the reason for your refund request.",
                    is_warning=True
                )
                db.add(sys_msg)
                
            if notified_travelers:
                await db.commit()
            print("Diagnostic run completed successfully!")
            
        except Exception as e:
            print("\n--- ERROR CAUGHT ---")
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_update())
