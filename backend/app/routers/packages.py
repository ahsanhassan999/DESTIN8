import os
import uuid
import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import Optional
from datetime import datetime

from app.database import get_db
from app.models import Package, Review, Wishlist, User, AgencyProfile, UserStatus, Booking, BookingStatus, Message, Conversation, SupportTicket
from app.schemas import (
    PackageCreateRequest,
    PackageUpdateRequest,
    PackageResponse,
    ReviewCreateRequest,
    ReviewResponse,
    SupportTicketCreate,
    SupportTicketResponse,
)
from app.dependencies import get_current_user, get_current_approved_agency, get_current_traveler

router = APIRouter(prefix="/api/packages", tags=["Packages"])


def _package_to_dict(pkg: Package, agency_name: str, avg_rating: float, review_count: int, markup: bool = False) -> dict:
    price = pkg.price * 1.10 if markup else pkg.price
    import json
    gallery_raw = getattr(pkg, "gallery_images", "[]") or "[]"
    try:
        gallery_list = json.loads(gallery_raw) if isinstance(gallery_raw, str) else (gallery_raw or [])
    except Exception:
        gallery_list = []
    if not gallery_list and pkg.cover_image:
        gallery_list = [pkg.cover_image]

    return {
        "id": pkg.id,
        "agency_id": pkg.agency_id,
        "agency_name": agency_name,
        "title": pkg.title,
        "destination": pkg.destination,
        "price": price,
        "duration_days": pkg.duration_days,
        "description": pkg.description,
        "included_services": pkg.included_services,
        "cover_image": pkg.cover_image,
        "gallery_images": gallery_raw,
        "imageUrls": gallery_list,
        "departure_date": pkg.departure_date,
        "is_active": pkg.is_active,
        "itinerary": pkg.itinerary,
        "is_takedown": pkg.is_takedown,
        "takedown_reason": pkg.takedown_reason,
        "deposit_percentage": pkg.deposit_percentage,
        "refund_deadline_days": pkg.refund_deadline_days,
        "best_season": pkg.best_season,
        "categories": pkg.categories or '["mountains"]',
        "created_at": str(pkg.created_at),
        "average_rating": avg_rating,
        "review_count": review_count,
    }


async def _enrich_package(pkg: Package, db: AsyncSession, markup: bool = False, for_agency: bool = False) -> dict:
    agency_result = await db.execute(select(User).where(User.id == pkg.agency_id))
    agency = agency_result.scalar_one_or_none()
    agency_name = agency.name if agency else "Unknown"

    reviews_result = await db.execute(
        select(func.avg(Review.rating), func.count(Review.id))
        .where(Review.package_id == pkg.id)
    )
    avg_rating, review_count = reviews_result.one()

    pkg_dict = _package_to_dict(pkg, agency_name, round(avg_rating, 1) if avg_rating else None, review_count or 0, markup=markup)

    # Check for pending approval edits
    ticket_res = await db.execute(
        select(SupportTicket).where(
            SupportTicket.package_id == pkg.id,
            SupportTicket.status.in_(["open", "pending_approval"]),
            SupportTicket.ticket_type.in_(["compensation_request", "package_edit_request"])
        )
    )
    pending_ticket = ticket_res.scalar_one_or_none()
    
    if pending_ticket:
        pkg_dict["has_pending_approval"] = True
        pkg_dict["pending_ticket_id"] = pending_ticket.id
        try:
            import json
            changes = json.loads(pending_ticket.proposed_changes) if pending_ticket.proposed_changes else {}
            pkg_dict["pending_changes"] = changes
            # Save original live values before overriding
            pkg_dict["live_version"] = {
                "title": pkg_dict.get("title"),
                "destination": pkg_dict.get("destination"),
                "price": pkg_dict.get("price"),
                "duration_days": pkg_dict.get("duration_days"),
                "description": pkg_dict.get("description"),
                "included_services": pkg_dict.get("included_services"),
                "cover_image": pkg_dict.get("cover_image"),
                "itinerary": pkg_dict.get("itinerary"),
                "deposit_percentage": pkg_dict.get("deposit_percentage"),
                "best_season": pkg_dict.get("best_season"),
            }
            if for_agency:
                # Merge proposed changes so the agency views the updated version in their screens
                for k, v in changes.items():
                    if v is not None:
                        pkg_dict[k] = v
        except Exception:
            pkg_dict["pending_changes"] = None
    else:
        pkg_dict["has_pending_approval"] = False
        pkg_dict["pending_changes"] = None

    return pkg_dict


# ─── Public / Traveler Browse ─────────────────────────────────────────────────

@router.get("/")
async def browse_packages(
    search: Optional[str] = None,
    destination: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Package).where(Package.is_active == True)

    # Only show packages from approved agencies
    query = query.join(User, Package.agency_id == User.id).where(User.status == UserStatus.approved)

    if search:
        pattern = f"%{search}%"
        query = query.where(
            Package.title.ilike(pattern) |
            Package.destination.ilike(pattern) |
            Package.description.ilike(pattern) |
            Package.best_season.ilike(pattern) |
            Package.included_services.ilike(pattern)
        )

    if destination:
        query = query.where(Package.destination.ilike(f"%{destination}%"))

    if category and category.lower() != 'all':
        cat_pattern = f"%{category}%"
        query = query.where(
            Package.title.ilike(cat_pattern) |
            Package.destination.ilike(cat_pattern) |
            Package.description.ilike(cat_pattern) |
            Package.included_services.ilike(cat_pattern)
        )

    if min_price is not None:
        query = query.where(Package.price >= min_price)
    if max_price is not None:
        query = query.where(Package.price <= max_price)

    result = await db.execute(query.order_by(Package.created_at.desc()))
    packages = result.scalars().all()

    return [await _enrich_package(p, db, markup=True) for p in packages]


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
    return [await _enrich_package(p, db, for_agency=True) for p in packages]


@router.get("/agency/my-reviews")
async def get_my_agency_reviews(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_approved_agency),
):
    pkg_res = await db.execute(select(Package.id, Package.title).where(Package.agency_id == current_user.id))
    packages = pkg_res.all()
    if not packages:
        return []

    pkg_dict = {p.id: p.title for p in packages}
    pkg_ids = list(pkg_dict.keys())

    reviews_res = await db.execute(
        select(Review, User.name)
        .join(User, Review.user_id == User.id)
        .where(Review.package_id.in_(pkg_ids))
        .order_by(Review.created_at.desc())
    )
    reviews_data = reviews_res.all()

    output = []
    for r, user_name in reviews_data:
        output.append({
            "id": r.id,
            "package_id": r.package_id,
            "package_title": pkg_dict.get(r.package_id, "Package"),
            "user_id": r.user_id,
            "user_name": user_name,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": str(r.created_at),
        })
    return output


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
        
    is_traveler = (current_user.role == "traveler")
    for_agency = (current_user.role == "agency" and pkg.agency_id == current_user.id)
    
    enrich_data = await _enrich_package(pkg, db, markup=is_traveler, for_agency=for_agency)
    
    has_booked = False
    has_reviewed = False
    if is_traveler:
        booking_result = await db.execute(
            select(Booking).where(
                Booking.package_id == package_id,
                Booking.traveler_id == current_user.id,
                Booking.status != BookingStatus.cancelled
            )
        )
        if booking_result.scalars().first():
            has_booked = True
            
        review_result = await db.execute(
            select(Review).where(
                Review.package_id == package_id,
                Review.user_id == current_user.id
            )
        )
        if review_result.scalars().first():
            has_reviewed = True
            
    enrich_data["has_booked"] = has_booked
    enrich_data["has_reviewed"] = has_reviewed
    
    return enrich_data


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
        gallery_images=data.gallery_images or "[]",
        departure_date=data.departure_date,
        is_active=data.is_active if data.is_active is not None else True,
        itinerary=data.itinerary or "[]",
        deposit_percentage=data.deposit_percentage if data.deposit_percentage is not None else 50,
        refund_deadline_days=data.refund_deadline_days if data.refund_deadline_days is not None else 7,
        best_season=data.best_season or "Year-round",
        categories=data.categories or '["mountains"]',
    )
    db.add(pkg)
    await db.commit()
    await db.refresh(pkg)
    return await _enrich_package(pkg, db)


async def is_package_locked(package_id: str, db: AsyncSession) -> bool:
    pkg_res = await db.execute(select(Package).where(Package.id == package_id))
    pkg = pkg_res.scalar_one_or_none()
    if not pkg:
        return False
        
    bookings_res = await db.execute(
        select(Booking).where(
            Booking.package_id == package_id,
            Booking.status == BookingStatus.confirmed
        )
    )
    bookings = bookings_res.scalars().all()
    if not bookings:
        return False
        
    def parse_date(date_str: str) -> Optional[datetime]:
        if not date_str or date_str.upper() in ("TBD", "—", ""):
            return None
        for fmt in ("%b %d, %Y", "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y"):
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        return None
        
    for b in bookings:
        target_date = b.travel_date or pkg.departure_date
        travel_dt = parse_date(target_date)
        if travel_dt:
            days_until_travel = (travel_dt - datetime.utcnow()).days
            if days_until_travel < pkg.refund_deadline_days:
                return True
    return False


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

    # Determine if this request modifies details (excluding active status toggle)
    is_detail_edit = any(
        v is not None for k, v in data.dict().items() if k != "is_active"
    )

    if is_detail_edit:
        # Check if package has any active traveler bookings
        booking_check = await db.execute(
            select(Booking).where(
                Booking.package_id == package_id,
                Booking.status != BookingStatus.cancelled
            )
        )
        has_any_bookings = booking_check.scalars().first() is not None

        if not has_any_bookings:
            # NO TRAVELER BOOKINGS: Direct live edit with no admin review!
            for k, v in data.dict().items():
                if v is not None:
                    setattr(pkg, k, v)
            await db.commit()
            await db.refresh(pkg)
            return await _enrich_package(pkg, db, for_agency=True)

        # HAS TRAVELER BOOKINGS: Requires Admin review / ticket workflow
        if await is_package_locked(package_id, db):
            raise HTTPException(
                status_code=400,
                detail="This package is locked because it has confirmed bookings past the refund deadline. Direct edits are not allowed. Please submit a compensation request ticket."
            )
            
        # Extract proposed changes
        proposed = {}
        for k, v in data.dict().items():
            if v is not None:
                proposed[k] = v
                
        import json
        ticket_res = await db.execute(
            select(SupportTicket).where(
                SupportTicket.package_id == package_id,
                SupportTicket.status.in_(["open", "pending_approval"]),
                SupportTicket.ticket_type == "package_edit_request"
            )
        )
        ticket = ticket_res.scalar_one_or_none()
        
        if ticket:
            try:
                existing_changes = json.loads(ticket.proposed_changes) if ticket.proposed_changes else {}
            except Exception:
                existing_changes = {}
            existing_changes.update(proposed)
            ticket.proposed_changes = json.dumps(existing_changes)
            ticket.status = "pending_approval"
        else:
            ticket = SupportTicket(
                user_id=current_user.id,
                package_id=package_id,
                ticket_type="package_edit_request",
                subject=f"Package Update Request: {pkg.title}",
                description=f"Agency '{current_user.name}' requested updates to package '{pkg.title}'.",
                proposed_changes=json.dumps(proposed),
                status="pending_approval"
            )
            db.add(ticket)
            
        await db.commit()
        return await _enrich_package(pkg, db, for_agency=True)
        
    else:
        # Apply toggling active status directly
        if data.is_active is not None:
            if data.is_active and pkg.is_takedown:
                raise HTTPException(
                    status_code=400,
                    detail=f"This package has been taken down by the administrator. Reason: {pkg.takedown_reason or 'No reason provided'}. Please contact support."
                )
            pkg.is_active = data.is_active
            
        await db.commit()
        await db.refresh(pkg)
        return await _enrich_package(pkg, db, for_agency=True)


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

    if await is_package_locked(package_id, db):
        raise HTTPException(
            status_code=400,
            detail="This package is locked because it has confirmed bookings past the refund deadline. Direct deletions are not allowed. Please submit a support/compensation ticket."
        )

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

    # Check that user has booked this package (not cancelled status)
    booking_result = await db.execute(
        select(Booking).where(
            Booking.package_id == package_id,
            Booking.traveler_id == current_user.id,
            Booking.status != BookingStatus.cancelled
        )
    )
    if not booking_result.scalars().first():
        raise HTTPException(status_code=403, detail="You can only review packages you have booked.")

    # Check no duplicate review
    existing = await db.execute(
        select(Review).where(Review.package_id == package_id, Review.user_id == current_user.id)
    )
    if existing.scalars().first():
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
            output.append(await _enrich_package(pkg, db, markup=True))
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


# ─── Support Tickets ──────────────────────────────────────────────────────────

@router.post("/tickets", status_code=201)
async def create_support_ticket(
    data: SupportTicketCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_approved_agency),
):
    if data.ticket_type == "compensation_request":
        if not data.package_id:
            raise HTTPException(status_code=400, detail="package_id is required for compensation requests.")
        # Verify package exists and belongs to agency
        pkg_res = await db.execute(
            select(Package).where(Package.id == data.package_id, Package.agency_id == current_user.id)
        )
        pkg = pkg_res.scalar_one_or_none()
        if not pkg:
            raise HTTPException(status_code=404, detail="Associated package not found or not yours.")
            
    ticket = SupportTicket(
        user_id=current_user.id,
        package_id=data.package_id,
        ticket_type=data.ticket_type,
        subject=data.subject,
        description=data.description,
        proposed_changes=data.proposed_changes,
        compensation_offer=data.compensation_offer,
        status="pending_approval" if data.ticket_type == "compensation_request" else "open",
    )
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)
    
    # Enrich response
    package_title = None
    if ticket.package_id:
        pkg_res = await db.execute(select(Package).where(Package.id == ticket.package_id))
        pkg = pkg_res.scalar_one_or_none()
        if pkg:
            package_title = pkg.title
            
    return {
        "id": ticket.id,
        "user_id": ticket.user_id,
        "user_name": current_user.name,
        "package_id": ticket.package_id,
        "package_title": package_title,
        "ticket_type": ticket.ticket_type,
        "subject": ticket.subject,
        "description": ticket.description,
        "proposed_changes": ticket.proposed_changes,
        "compensation_offer": ticket.compensation_offer,
        "status": ticket.status,
        "admin_notes": ticket.admin_notes,
        "created_at": str(ticket.created_at),
    }


@router.get("/tickets")
async def get_agency_tickets(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_approved_agency),
):
    result = await db.execute(
        select(SupportTicket)
        .where(SupportTicket.user_id == current_user.id)
        .order_by(SupportTicket.created_at.desc())
    )
    tickets = result.scalars().all()
    
    output = []
    for t in tickets:
        package_title = None
        if t.package_id:
            pkg_res = await db.execute(select(Package).where(Package.id == t.package_id))
            pkg = pkg_res.scalar_one_or_none()
            if pkg:
                package_title = pkg.title
                
        output.append({
            "id": t.id,
            "user_id": t.user_id,
            "user_name": current_user.name,
            "package_id": t.package_id,
            "package_title": package_title,
            "ticket_type": t.ticket_type,
            "subject": t.subject,
            "description": t.description,
            "proposed_changes": t.proposed_changes,
            "compensation_offer": t.compensation_offer,
            "status": t.status,
            "admin_notes": t.admin_notes,
            "created_at": str(t.created_at),
        })
    return output


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")
    
    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1] or ".jpg"
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    
    file_bytes = await file.read()
    
    if supabase_url and supabase_key:
        supabase_url = supabase_url.rstrip("/")
        upload_url = f"{supabase_url}/storage/v1/object/destin8-media/{unique_filename}"
        
        headers = {
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": file.content_type or "image/jpeg"
        }
        
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(upload_url, content=file_bytes, headers=headers)
                if resp.status_code == 200:
                    public_url = f"{supabase_url}/storage/v1/object/public/destin8-media/{unique_filename}"
                    return {"url": public_url}
                else:
                    print(f"Supabase upload failed: {resp.status_code} {resp.text}")
        except Exception as e:
            print(f"Supabase upload exception: {e}")
            
    # Fallback to local storage (e.g. local dev)
    uploads_dir = os.getenv("UPLOADS_DIR", "uploads")
    os.makedirs(uploads_dir, exist_ok=True)
    local_path = os.path.join(uploads_dir, unique_filename)
    
    try:
        with open(local_path, "wb") as f:
            f.write(file_bytes)
        return {"url": f"/uploads/{unique_filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file locally: {str(e)}")

