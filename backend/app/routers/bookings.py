from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.models import Booking, BookingStatus, Package, AgencyProfile
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


class BookingCreate(BaseModel):
    package_id: str
    num_travelers: int = 1
    travel_date: Optional[str] = None
    notes: Optional[str] = None


class BookingResponse(BaseModel):
    id: str
    package_id: str
    status: str
    num_travelers: int
    travel_date: Optional[str]
    notes: Optional[str]
    # Denormalized package fields for the UI
    package_title: Optional[str]
    package_destination: Optional[str]
    package_duration_days: Optional[int]
    package_price: Optional[float]
    package_image: Optional[str]
    agency_name: Optional[str]


# ─── Traveler: create a booking ───────────────────────────────────────────────
@router.post("", response_model=BookingResponse)
async def create_booking(
    data: BookingCreate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != "traveler":
        raise HTTPException(status_code=403, detail="Only travelers can book packages.")

    # Verify package exists and is active
    result = await db.execute(select(Package).where(Package.id == data.package_id))
    pkg = result.scalar_one_or_none()
    if not pkg or not pkg.is_active:
        raise HTTPException(status_code=404, detail="Package not found or unavailable.")

    booking = Booking(
        traveler_id=current_user.id,
        package_id=data.package_id,
        num_travelers=data.num_travelers,
        travel_date=data.travel_date,
        notes=data.notes,
        status=BookingStatus.pending,
    )
    db.add(booking)
    await db.commit()
    await db.refresh(booking)

    # Fetch agency name
    agency_name = None
    if pkg.agency_id:
        res = await db.execute(select(AgencyProfile).where(AgencyProfile.user_id == pkg.agency_id))
        agency = res.scalar_one_or_none()
        agency_name = agency.agency_name if agency else None

    return BookingResponse(
        id=booking.id,
        package_id=booking.package_id,
        status=booking.status.value,
        num_travelers=booking.num_travelers,
        travel_date=booking.travel_date,
        notes=booking.notes,
        package_title=pkg.title,
        package_destination=pkg.destination,
        package_duration_days=pkg.duration_days,
        package_price=pkg.price,
        package_image=pkg.cover_image,
        agency_name=agency_name,
    )


# ─── Traveler: list my bookings ──────────────────────────────────────────────
@router.get("/mine", response_model=list[BookingResponse])
async def get_my_bookings(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Booking).where(Booking.traveler_id == current_user.id).order_by(Booking.created_at.desc())
    )
    bookings = result.scalars().all()

    output = []
    for b in bookings:
        # Load package
        pkg_res = await db.execute(select(Package).where(Package.id == b.package_id))
        pkg = pkg_res.scalar_one_or_none()

        agency_name = None
        if pkg and pkg.agency_id:
            ag_res = await db.execute(select(AgencyProfile).where(AgencyProfile.user_id == pkg.agency_id))
            ag = ag_res.scalar_one_or_none()
            agency_name = ag.agency_name if ag else None

        output.append(BookingResponse(
            id=b.id,
            package_id=b.package_id,
            status=b.status.value,
            num_travelers=b.num_travelers,
            travel_date=b.travel_date,
            notes=b.notes,
            package_title=pkg.title if pkg else None,
            package_destination=pkg.destination if pkg else None,
            package_duration_days=pkg.duration_days if pkg else None,
            package_price=pkg.price if pkg else None,
            package_image=pkg.cover_image if pkg else None,
            agency_name=agency_name,
        ))

    return output


# ─── Traveler: cancel a booking ──────────────────────────────────────────────
@router.delete("/{booking_id}")
async def cancel_booking(
    booking_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")
    if booking.traveler_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized.")

    booking.status = BookingStatus.cancelled
    await db.commit()
    return {"message": "Booking cancelled."}
