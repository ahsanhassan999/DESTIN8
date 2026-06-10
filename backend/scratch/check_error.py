import asyncio
from sqlalchemy.future import select
from app.database import AsyncSessionLocal
from app.models import Conversation, Booking, BookingStatus

async def main():
    async with AsyncSessionLocal() as db:
        try:
            # Query all conversations
            res = await db.execute(select(Conversation))
            convs = res.scalars().all()
            print(f"Found {len(convs)} conversations.")
            
            for conv in convs:
                print(f"Checking conv {conv.id} - traveler: {conv.traveler_id}, package: {conv.package_id}")
                booking_query = select(Booking).where(
                    Booking.traveler_id == conv.traveler_id,
                    Booking.package_id == conv.package_id,
                    Booking.status == BookingStatus.confirmed
                )
                booking_res = await db.execute(booking_query)
                confirmed_booking = booking_res.scalars().first()
                sale_stage = "postsale" if confirmed_booking else "presale"
                print(f"Conv {conv.id} sale_stage: {sale_stage}")
            print("Query logic ran successfully!")
        except Exception as e:
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
