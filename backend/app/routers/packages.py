from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import Optional

from app.database import get_db
from app.models import Package, Review, Wishlist, User, AgencyProfile, UserStatus
from app.schemas import (
    PackageCreateRequest,
    PackageUpdateRequest,
    PackageResponse,
    ReviewCreateRequest,
    ReviewResponse,
)
from app.dependencies import get_current_user, get_current_approved_agency, get_current_traveler

router = APIRouter(prefix="/api/packages", tags=["Packages"])


def _package_to_dict(pkg: Package, agency_name: str, avg_rating: float, review_count: int) -> dict:
    return {
        "id": pkg.id,
        "agency_id": pkg.agency_id,
        "agency_name": agency_name,
        "title": pkg.title,
        "destination": pkg.destination,
        "price": pkg.price,
        "duration_days": pkg.duration_days,
        "description": pkg.description,
        "included_services": pkg.included_services,
        "cover_image": pkg.cover_image,
        "departure_date": pkg.departure_date,
        "is_active": pkg.is_active,
        "itinerary": pkg.itinerary,
        "is_takedown": pkg.is_takedown,
        "takedown_reason": pkg.takedown_reason,
        "created_at": str(pkg.created_at),
        "average_rating": avg_rating,
        "review_count": review_count,
    }


async def _enrich_package(pkg: Package, db: AsyncSession) -> dict:
    agency_result = await db.execute(select(User).where(User.id == pkg.agency_id))
    agency = agency_result.scalar_one_or_none()
    agency_name = agency.name if agency else "Unknown"

    reviews_result = await db.execute(
        select(func.avg(Review.rating), func.count(Review.id))
        .where(Review.package_id == pkg.id)
    )
    avg_rating, review_count = reviews_result.one()

    return _package_to_dict(pkg, agency_name, round(avg_rating, 1) if avg_rating else None, review_count or 0)


# ─── Public / Traveler Browse ─────────────────────────────────────────────────

@router.get("/")
async def browse_packages(
    destination: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Package).where(Package.is_active == True)

    # Only show packages from approved agencies
    query = query.join(User, Package.agency_id == User.id).where(User.status == UserStatus.approved)

    if destination:
        query = query.where(Package.destination.ilike(f"%{destination}%"))
    if min_price is not None:
        query = query.where(Package.price >= min_price)
    if max_price is not None:
        query = query.where(Package.price <= max_price)

    result = await db.execute(query.order_by(Package.created_at.desc()))
    packages = result.scalars().all()

    return [await _enrich_package(p, db) for p in packages]


@router.get("/{package_id}")
async def get_package(
    package_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Package).where(Package.id == package_id))
    pkg = result.scalar_one_or_none()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found.")
    return await _enrich_package(pkg, db)


# ─── Agency Package Management ────────────────────────────────────────────────

@router.get("/agency/my-packages")
async def get_my_packages(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_approved_agency),
):
    result = await db.execute(
        select(Package).where(Package.agency_id == current_user.id)
        .order_by(Package.created_at.desc())
    )
    packages = result.scalars().all()
    return [await _enrich_package(p, db) for p in packages]


@router.post("/agency/create", status_code=201)
async def create_package(
    data: PackageCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_approved_agency),
):
    pkg = Package(
        agency_id=current_user.id,
        title=data.title,
        destination=data.destination,
        price=data.price,
        duration_days=data.duration_days,
        description=data.description,
        included_services=data.included_services or "[]",
        cover_image=data.cover_image,
        departure_date=data.departure_date,
        is_active=data.is_active if data.is_active is not None else True,
        itinerary=data.itinerary or "[]",
    )
    db.add(pkg)
    await db.commit()
    await db.refresh(pkg)
    return await _enrich_package(pkg, db)


@router.patch("/agency/{package_id}")
async def update_package(
    package_id: str,
    data: PackageUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_approved_agency),
):
    result = await db.execute(
        select(Package).where(Package.id == package_id, Package.agency_id == current_user.id)
    )
    pkg = result.scalar_one_or_none()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found or not yours.")

    if data.title is not None: pkg.title = data.title
    if data.destination is not None: pkg.destination = data.destination
    if data.price is not None: pkg.price = data.price
    if data.duration_days is not None: pkg.duration_days = data.duration_days
    if data.description is not None: pkg.description = data.description
    if data.included_services is not None: pkg.included_services = data.included_services
    if data.cover_image is not None: pkg.cover_image = data.cover_image
    if data.departure_date is not None: pkg.departure_date = data.departure_date
    if data.is_active is not None:
        if data.is_active and pkg.is_takedown:
            raise HTTPException(
                status_code=400,
                detail=f"This package has been taken down by the administrator. Reason: {pkg.takedown_reason or 'No reason provided'}. Please contact support."
            )
        pkg.is_active = data.is_active
    if data.itinerary is not None: pkg.itinerary = data.itinerary

    await db.commit()
    await db.refresh(pkg)
    return await _enrich_package(pkg, db)


@router.delete("/agency/{package_id}")
async def delete_package(
    package_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_approved_agency),
):
    result = await db.execute(
        select(Package).where(Package.id == package_id, Package.agency_id == current_user.id)
    )
    pkg = result.scalar_one_or_none()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found or not yours.")

    await db.delete(pkg)
    await db.commit()
    return {"message": "Package deleted."}


# ─── Reviews ──────────────────────────────────────────────────────────────────

@router.get("/{package_id}/reviews")
async def get_reviews(
    package_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Review).where(Review.package_id == package_id).order_by(Review.created_at.desc())
    )
    reviews = result.scalars().all()

    output = []
    for r in reviews:
        user_result = await db.execute(select(User).where(User.id == r.user_id))
        user = user_result.scalar_one_or_none()
        output.append({
            "id": r.id,
            "package_id": r.package_id,
            "user_id": r.user_id,
            "user_name": user.name if user else "Unknown",
            "rating": r.rating,
            "comment": r.comment,
            "created_at": str(r.created_at),
        })
    return output


@router.post("/{package_id}/reviews", status_code=201)
async def create_review(
    package_id: str,
    data: ReviewCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_traveler),
):
    # Check package exists
    pkg_result = await db.execute(select(Package).where(Package.id == package_id))
    if not pkg_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Package not found.")

    # Check no duplicate review
    existing = await db.execute(
        select(Review).where(Review.package_id == package_id, Review.user_id == current_user.id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You have already reviewed this package.")

    review = Review(
        package_id=package_id,
        user_id=current_user.id,
        rating=data.rating,
        comment=data.comment,
    )
    db.add(review)
    await db.commit()
    return {"message": "Review submitted."}


# ─── Wishlist ─────────────────────────────────────────────────────────────────

@router.get("/wishlist/my")
async def get_my_wishlist(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_traveler),
):
    result = await db.execute(
        select(Wishlist).where(Wishlist.user_id == current_user.id)
    )
    wishlist_items = result.scalars().all()

    output = []
    for item in wishlist_items:
        pkg_result = await db.execute(select(Package).where(Package.id == item.package_id))
        pkg = pkg_result.scalar_one_or_none()
        if pkg:
            output.append(await _enrich_package(pkg, db))
    return output


@router.post("/wishlist/{package_id}", status_code=201)
async def add_to_wishlist(
    package_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_traveler),
):
    existing = await db.execute(
        select(Wishlist).where(Wishlist.user_id == current_user.id, Wishlist.package_id == package_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already in wishlist.")

    item = Wishlist(user_id=current_user.id, package_id=package_id)
    db.add(item)
    await db.commit()
    return {"message": "Added to wishlist."}


@router.delete("/wishlist/{package_id}")
async def remove_from_wishlist(
    package_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_traveler),
):
    result = await db.execute(
        select(Wishlist).where(Wishlist.user_id == current_user.id, Wishlist.package_id == package_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Not in wishlist.")

    await db.delete(item)
    await db.commit()
    return {"message": "Removed from wishlist."}
