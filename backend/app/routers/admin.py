from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, delete
from typing import Optional

from app.database import get_db
from app.models import User, AgencyProfile, Package, UserRole, UserStatus, Wishlist, Review, Booking, BookingStatus, PaymentTransaction, Conversation, Message, ChatTag, ConversationTagLink, SupportTicket
from pydantic import BaseModel
from app.schemas import (
    AgencyWithProfileResponse,
    AgencyProfileResponse,
    AgencyStatusUpdate,
    UserResponse,
    AdminCreateUserRequest,
    UserSuspendRequest,
    PackageTakedownRequest,
    StatsResponse,
    SupportTicketResponse,
    SupportTicketAction,
)
from app.core.security import hash_password
from app.dependencies import get_current_admin_user

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# ─── Stats ────────────────────────────────────────────────────────────────────

@router.get("/stats", response_model=StatsResponse)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    travelers = await db.execute(select(func.count(User.id)).where(User.role == UserRole.traveler))
    agencies = await db.execute(select(func.count(User.id)).where(User.role == UserRole.agency))
    approved = await db.execute(select(func.count(User.id)).where(User.role == UserRole.agency, User.status == UserStatus.approved))
    pending = await db.execute(select(func.count(User.id)).where(User.role == UserRole.agency, User.status == UserStatus.pending))
    total_pkgs = await db.execute(select(func.count(Package.id)))
    active_pkgs = await db.execute(select(func.count(Package.id)).where(Package.is_active == True))

    return StatsResponse(
        total_travelers=travelers.scalar() or 0,
        total_agencies=agencies.scalar() or 0,
        approved_agencies=approved.scalar() or 0,
        pending_agencies=pending.scalar() or 0,
        total_packages=total_pkgs.scalar() or 0,
        active_packages=active_pkgs.scalar() or 0,
    )


# ─── Agencies ─────────────────────────────────────────────────────────────────

@router.get("/agencies")
async def list_agencies(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    query = select(User).where(User.role == UserRole.agency)
    if status:
        query = query.where(User.status == status)
    result = await db.execute(query)
    agencies = result.scalars().all()

    output = []
    for a in agencies:
        profile_result = await db.execute(
            select(AgencyProfile).where(AgencyProfile.user_id == a.id)
        )
        profile = profile_result.scalar_one_or_none()
        output.append({
            "id": a.id,
            "name": a.name,
            "email": a.email,
            "phone": a.phone,
            "status": a.status.value,
            "created_at": str(a.created_at),
            "agency_profile": {
                "agency_name": profile.agency_name if profile else "",
                "owner_name": profile.owner_name if profile else "",
                "business_address": profile.business_address if profile else "",
                "license_number": profile.license_number if profile else "",
                "rejection_reason": profile.rejection_reason if profile else None,
            } if profile else None,
        })
    return output


@router.patch("/agencies/{agency_id}/status")
async def update_agency_status(
    agency_id: str,
    data: AgencyStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    result = await db.execute(select(User).where(User.id == agency_id, User.role == UserRole.agency))
    agency = result.scalar_one_or_none()
    if not agency:
        raise HTTPException(status_code=404, detail="Agency not found.")

    agency.status = data.status

    # Save rejection reason in profile if provided
    if data.status == "rejected" and data.reason:
        profile_result = await db.execute(
            select(AgencyProfile).where(AgencyProfile.user_id == agency_id)
        )
        profile = profile_result.scalar_one_or_none()
        if profile:
            profile.rejection_reason = data.reason

    await db.commit()
    return {"message": f"Agency status updated to {data.status}."}


# ─── Users ────────────────────────────────────────────────────────────────────

@router.get("/users")
async def list_users(
    role: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    query = select(User)
    if role:
        query = query.where(User.role == role)
    result = await db.execute(query)
    users = result.scalars().all()

    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "phone": u.phone,
            "role": u.role.value,
            "status": u.status.value,
            "is_active": u.is_active,
            "suspension_reason": u.suspension_reason,
            "created_at": str(u.created_at),
        }
        for u in users
    ]


@router.patch("/users/{user_id}/suspend")
async def suspend_user(
    user_id: str,
    data: UserSuspendRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot suspend your own account.")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.is_active = False
    user.status = UserStatus.suspended
    user.suspension_reason = data.reason
    await db.commit()
    return {"message": "User suspended.", "suspension_reason": data.reason}


@router.patch("/users/{user_id}/activate")
async def activate_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.is_active = True
    user.status = UserStatus.active if user.role != UserRole.agency else UserStatus.approved
    user.suspension_reason = None
    await db.commit()
    return {"message": "User activated."}


@router.post("/users/create-admin", status_code=201)
async def create_admin_user(
    data: AdminCreateUserRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already in use.")

    # Determine status
    if data.role == "agency":
        status = UserStatus.approved
    else:
        status = UserStatus.active

    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        phone=data.phone,
        role=UserRole(data.role),
        status=status,
    )
    db.add(user)
    await db.flush()

    if data.role == "agency":
        profile = AgencyProfile(
            user_id=user.id,
            agency_name=data.name,
            owner_name=data.owner_name or data.name,
            business_address=data.business_address or "",
            license_number=data.license_number or "",
        )
        db.add(profile)

    await db.commit()
    return {"message": f"{data.role.capitalize()} user created.", "id": user.id}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account.")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Verification conditions
    if user.status != UserStatus.suspended:
        raise HTTPException(status_code=400, detail="Account must be suspended before deletion.")
    if not user.suspension_reason or not user.suspension_reason.strip():
        raise HTTPException(status_code=400, detail="Account must have a suspension reason to be deleted.")

    # Cascade delete associated records
    await db.execute(delete(Wishlist).where(Wishlist.user_id == user.id))
    await db.execute(delete(Review).where(Review.user_id == user.id))
    await db.execute(delete(Booking).where(Booking.traveler_id == user.id))

    if user.role == UserRole.agency:
        pkg_res = await db.execute(select(Package).where(Package.agency_id == user.id))
        pkgs = pkg_res.scalars().all()
        pkg_ids = [p.id for p in pkgs]
        if pkg_ids:
            await db.execute(delete(Booking).where(Booking.package_id.in_(pkg_ids)))
            await db.execute(delete(Review).where(Review.package_id.in_(pkg_ids)))
            await db.execute(delete(Wishlist).where(Wishlist.package_id.in_(pkg_ids)))
            for p in pkgs:
                await db.delete(p)

        profile_res = await db.execute(select(AgencyProfile).where(AgencyProfile.user_id == user.id))
        profile = profile_res.scalar_one_or_none()
        if profile:
            await db.delete(profile)

    await db.delete(user)
    await db.commit()
    return {"message": "User account successfully deleted."}


# ─── Package Moderation ───────────────────────────────────────────────────────

@router.get("/packages")
async def list_all_packages(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    result = await db.execute(select(Package))
    packages = result.scalars().all()

    output = []
    for p in packages:
        agency_result = await db.execute(select(User).where(User.id == p.agency_id))
        agency = agency_result.scalar_one_or_none()
        output.append({
            "id": p.id,
            "agency_id": p.agency_id,
            "title": p.title,
            "destination": p.destination,
            "price": p.price,
            "duration_days": p.duration_days,
            "description": p.description,
            "included_services": p.included_services,
            "cover_image": p.cover_image,
            "departure_date": p.departure_date,
            "is_active": p.is_active,
            "is_takedown": p.is_takedown,
            "takedown_reason": p.takedown_reason,
            "itinerary": p.itinerary,
            "agency_name": agency.name if agency else "Unknown",
            "created_at": str(p.created_at),
        })
    return output


@router.patch("/packages/{package_id}/takedown")
async def takedown_package(
    package_id: str,
    data: PackageTakedownRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    result = await db.execute(select(Package).where(Package.id == package_id))
    pkg = result.scalar_one_or_none()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found.")
    pkg.is_active = False
    pkg.is_takedown = True
    pkg.takedown_reason = data.reason
    await db.commit()
    return {"message": "Package taken down."}


@router.patch("/packages/{package_id}/restore")
async def restore_package(
    package_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    result = await db.execute(select(Package).where(Package.id == package_id))
    pkg = result.scalar_one_or_none()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found.")
    pkg.is_active = True
    pkg.is_takedown = False
    pkg.takedown_reason = None
    await db.commit()
    return {"message": "Package restored."}




# ─── Payments: Revenue Overview Stats ─────────────────────────────────────────
@router.get("/payments/stats")
async def get_payment_stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    txns_res = await db.execute(select(PaymentTransaction))
    txns = txns_res.scalars().all()
    success_txns = [t for t in txns if t.status == "success"]

    total_revenue = sum(t.commission_deducted for t in success_txns)
    total_deposits = sum(t.amount_paid for t in success_txns)
    total_payouts = sum(t.payout_amount for t in success_txns)
    pending_payouts_amount = sum(t.payout_amount for t in success_txns if t.payout_status == "pending")
    pending_payout_count = sum(1 for t in success_txns if t.payout_status == "pending")
    total_transactions = len(success_txns)

    return {
        "total_platform_revenue": round(total_revenue, 2),
        "total_deposits_collected": round(total_deposits, 2),
        "total_agency_payouts_sent": round(total_payouts, 2),
        "pending_payout_amount": round(pending_payouts_amount, 2),
        "pending_payout_count": pending_payout_count,
        "total_transactions": total_transactions,
    }


# ─── Payments: All Transactions Table ─────────────────────────────────────────
@router.get("/payments/transactions")
async def get_all_transactions(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    txns_res = await db.execute(select(PaymentTransaction).order_by(PaymentTransaction.created_at.desc()))
    txns = txns_res.scalars().all()

    output = []
    for t in txns:
        booking_res = await db.execute(select(Booking).where(Booking.id == t.booking_id))
        booking = booking_res.scalar_one_or_none()

        package_title = "Unknown"
        agency_name = "Unknown"
        traveler_name = "Unknown"
        traveler_email = ""

        if booking:
            pkg_res = await db.execute(select(Package).where(Package.id == booking.package_id))
            pkg = pkg_res.scalar_one_or_none()
            if pkg:
                package_title = pkg.title
                ag_res = await db.execute(select(AgencyProfile).where(AgencyProfile.user_id == pkg.agency_id))
                ag = ag_res.scalar_one_or_none()
                agency_name = ag.agency_name if ag else "Unknown"

            traveler_res = await db.execute(select(User).where(User.id == booking.traveler_id))
            traveler = traveler_res.scalar_one_or_none()
            if traveler:
                traveler_name = traveler.name
                traveler_email = traveler.email

        output.append({
            "id": t.id,
            "booking_id": t.booking_id,
            "package_title": package_title,
            "agency_name": agency_name,
            "traveler_name": traveler_name,
            "traveler_email": traveler_email,
            "transaction_ref": t.transaction_ref,
            "amount_paid": t.amount_paid,
            "commission_deducted": t.commission_deducted,
            "payout_amount": t.payout_amount,
            "payment_method": t.payment_method,
            "status": t.status,
            "payout_status": t.payout_status,
            "payout_ref": t.payout_ref,
            "created_at": str(t.created_at),
        })
    return output


# ─── Payments: Per-Agency Payouts Breakdown ────────────────────────────────────
@router.get("/payments/agency-payouts")
async def get_agency_payouts(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    agencies_res = await db.execute(
        select(User, AgencyProfile)
        .join(AgencyProfile, AgencyProfile.user_id == User.id)
        .where(User.role == UserRole.agency)
    )
    agency_rows = agencies_res.all()

    output = []
    for user_obj, profile in agency_rows:
        packages_res = await db.execute(select(Package.id).where(Package.agency_id == user_obj.id))
        pkg_ids = packages_res.scalars().all()

        total_earned = 0.0
        total_fees = 0.0
        txn_count = 0

        if pkg_ids:
            bookings_res = await db.execute(
                select(Booking.id).where(Booking.package_id.in_(pkg_ids), Booking.status == "confirmed")
            )
            booking_ids = bookings_res.scalars().all()
            if booking_ids:
                txns_res = await db.execute(
                    select(PaymentTransaction).where(
                        PaymentTransaction.booking_id.in_(booking_ids),
                        PaymentTransaction.status == "success"
                    )
                )
                txns = txns_res.scalars().all()
                total_earned = sum(t.payout_amount for t in txns)
                total_fees = sum(t.commission_deducted for t in txns)
                txn_count = len(txns)

        output.append({
            "agency_id": user_obj.id,
            "agency_name": profile.agency_name,
            "owner_name": profile.owner_name,
            "email": user_obj.email,
            "bank_name": profile.bank_name or "",
            "account_number": profile.account_number or "",
            "branch_code": profile.branch_code or "",
            "bank_verification_status": profile.bank_verification_status or "not_submitted",
            "total_earned": round(total_earned, 2),
            "total_fees_paid": round(total_fees, 2),
            "transaction_count": txn_count,
        })
    return output


# ─── Payments: Mark Pending Payout as Paid ────────────────────────────────────
@router.patch("/payments/transactions/{txn_id}/mark-paid")
async def mark_payout_paid(
    txn_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    txn_res = await db.execute(select(PaymentTransaction).where(PaymentTransaction.id == txn_id))
    txn = txn_res.scalar_one_or_none()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found.")
    if txn.payout_status == "paid":
        raise HTTPException(status_code=400, detail="Payout already marked as paid.")
    txn.payout_status = "paid"
    await db.commit()
    return {"message": "Payout marked as paid."}


# ─── Payments: Bank Account Verification Queue ─────────────────────────────────
@router.get("/payments/bank-verifications")
async def get_bank_verifications(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    result = await db.execute(
        select(User, AgencyProfile)
        .join(AgencyProfile, AgencyProfile.user_id == User.id)
        .where(User.role == UserRole.agency)
        .where(AgencyProfile.bank_name.isnot(None))
    )
    rows = result.all()

    output = []
    for user_obj, profile in rows:
        output.append({
            "agency_id": user_obj.id,
            "agency_name": profile.agency_name,
            "owner_name": profile.owner_name,
            "email": user_obj.email,
            "bank_name": profile.bank_name or "",
            "account_title": profile.account_title or "",
            "account_number": profile.account_number or "",
            "branch_code": profile.branch_code or "",
            "bank_verification_status": profile.bank_verification_status or "not_submitted",
            "bank_rejection_reason": profile.bank_rejection_reason or None,
            "submitted_at": str(profile.updated_at),
        })
    return output


# ─── Payments: Verify or Reject Bank Account ──────────────────────────────────
class BankVerifyRequest(BaseModel):
    action: str   # "verify" or "reject"
    reason: Optional[str] = None


@router.patch("/payments/bank-verifications/{agency_id}")
async def verify_bank_account(
    agency_id: str,
    data: BankVerifyRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    profile_res = await db.execute(select(AgencyProfile).where(AgencyProfile.user_id == agency_id))
    profile = profile_res.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Agency profile not found.")

    if data.action == "verify":
        profile.bank_verification_status = "verified"
        profile.bank_rejection_reason = None
        msg = "Bank account verified successfully."
        
        # Release withheld payouts:
        # Find all package IDs for this agency
        pkg_ids_res = await db.execute(select(Package.id).where(Package.agency_id == agency_id))
        pkg_ids = pkg_ids_res.scalars().all()
        if pkg_ids:
            # Find all bookings for these packages
            booking_ids_res = await db.execute(select(Booking.id).where(Booking.package_id.in_(pkg_ids)))
            booking_ids = booking_ids_res.scalars().all()
            if booking_ids:
                # Find all transactions for these bookings with pending payout status
                txns_res = await db.execute(
                    select(PaymentTransaction).where(
                        PaymentTransaction.booking_id.in_(booking_ids),
                        PaymentTransaction.payout_status == "pending",
                        PaymentTransaction.status == "success"
                    )
                )
                txns_to_update = txns_res.scalars().all()
                import random
                for t in txns_to_update:
                    t.payout_status = "paid"
                    if not t.payout_ref:
                        t.payout_ref = f"PAY-{random.randint(100000, 999999)}"
    elif data.action == "reject":
        if not data.reason:
            raise HTTPException(status_code=400, detail="Rejection reason is required.")
        profile.bank_verification_status = "rejected"
        profile.bank_rejection_reason = data.reason
        msg = "Bank account rejected."
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'verify' or 'reject'.")

    await db.commit()
    return {"message": msg, "bank_verification_status": profile.bank_verification_status}


# ─── Chat Supervision Endpoints ───────────────────────────────────────────────

class ChatTagResponse(BaseModel):
    id: str
    name: str
    color: str

    class Config:
        from_attributes = True


class ConversationResponseAdmin(BaseModel):
    id: str
    traveler_id: str
    traveler: str
    agency_id: str
    agency: str
    package_id: str
    package: str
    is_flagged: bool
    flag_reason: Optional[str]
    lastMsg: str
    time: str
    unread: bool
    tags: list[ChatTagResponse]
    sale_stage: str  # "presale" | "postsale"



class AdminMessageResponse(BaseModel):
    id: str
    sender: str  # "traveler" | "agency" | "system"
    text: str
    time: str
    isWarning: bool


class SystemWarningRequest(BaseModel):
    text: str


class FlagToggleRequest(BaseModel):
    is_flagged: bool
    reason: Optional[str] = None


class TagCreateRequest(BaseModel):
    name: str
    color: str


class ConversationTagsRequest(BaseModel):
    tag_ids: list[str]


@router.get("/chat/conversations", response_model=list[ConversationResponseAdmin])
async def get_admin_conversations(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    from sqlalchemy.orm import selectinload

    # Load all conversations with relationships
    query = (
        select(Conversation)
        .options(
            selectinload(Conversation.traveler),
            selectinload(Conversation.agency),
            selectinload(Conversation.package),
            selectinload(Conversation.tags),
        )
        .order_by(Conversation.updated_at.desc())
    )
    res = await db.execute(query)
    conversations = res.scalars().all()

    output = []
    for conv in conversations:
        # Get Last Message
        msg_res = await db.execute(
            select(Message)
            .where(Message.conversation_id == conv.id)
            .order_by(Message.created_at.desc())
            .limit(1)
        )
        last_msg = msg_res.scalar_one_or_none()
        
        if last_msg:
            if last_msg.sender_role == "system":
                last_msg_text = f"⚠ {last_msg.text}"
            else:
                last_msg_text = last_msg.text
            last_msg_time = last_msg.created_at.strftime("%I:%M %p")
        else:
            last_msg_text = "No messages yet"
            last_msg_time = conv.updated_at.strftime("%I:%M %p")

        traveler_name = conv.traveler.name if conv.traveler else "Unknown"
        agency_name = conv.agency.name if conv.agency else "Unknown"
        package_title = conv.package.title if conv.package else "Unknown Package"

        tags_list = [
            ChatTagResponse(id=t.id, name=t.name, color=t.color)
            for t in conv.tags
        ]

        # Check if traveler has a paid/confirmed booking for this package
        booking_query = select(Booking).where(
            Booking.traveler_id == conv.traveler_id,
            Booking.package_id == conv.package_id,
            Booking.status == BookingStatus.confirmed
        )
        booking_res = await db.execute(booking_query)
        confirmed_booking = booking_res.scalars().first()
        sale_stage = "postsale" if confirmed_booking else "presale"

        output.append(
            ConversationResponseAdmin(
                id=conv.id,
                traveler_id=conv.traveler_id,
                traveler=traveler_name,
                agency_id=conv.agency_id,
                agency=agency_name,
                package_id=conv.package_id,
                package=package_title,
                is_flagged=conv.is_flagged,
                flag_reason=conv.flag_reason,
                lastMsg=last_msg_text,
                time=last_msg_time,
                unread=False,
                tags=tags_list,
                sale_stage=sale_stage,
            )
        )

    return output


@router.get("/chat/conversations/{conversation_id}/messages", response_model=list[AdminMessageResponse])
async def get_admin_conversation_messages(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    # Retrieve message history
    msg_res = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
    )
    messages = msg_res.scalars().all()

    return [
        AdminMessageResponse(
            id=m.id,
            sender=m.sender_role,
            text=m.text,
            time=m.created_at.strftime("%I:%M %p"),
            isWarning=m.is_warning,
        )
        for m in messages
    ]


@router.post("/chat/conversations/{conversation_id}/system-warning", response_model=AdminMessageResponse)
async def send_admin_system_warning(
    conversation_id: str,
    data: SystemWarningRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    # Verify conversation exists
    conv_res = await db.execute(select(Conversation).where(Conversation.id == conversation_id))
    conv = conv_res.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    # Create system warning message
    msg = Message(
        conversation_id=conversation_id,
        sender_role="system",
        sender_id=admin.id,
        text=data.text,
        is_warning=True,
    )
    db.add(msg)
    
    # Update conversation's updated_at timestamp to bring it to top of list
    from datetime import datetime
    conv.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(msg)

    return AdminMessageResponse(
        id=msg.id,
        sender=msg.sender_role,
        text=msg.text,
        time=msg.created_at.strftime("%I:%M %p"),
        isWarning=msg.is_warning,
    )


@router.patch("/chat/conversations/{conversation_id}/flag")
async def toggle_conversation_flag(
    conversation_id: str,
    data: FlagToggleRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    # Verify conversation exists
    conv_res = await db.execute(select(Conversation).where(Conversation.id == conversation_id))
    conv = conv_res.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    conv.is_flagged = data.is_flagged
    conv.flag_reason = data.reason if data.is_flagged else None
    await db.commit()

    return {"message": "Conversation flag status updated.", "is_flagged": conv.is_flagged}


@router.get("/chat/tags", response_model=list[ChatTagResponse])
async def get_admin_tags(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    # Check if any tags exist. If not, seed default tags
    tag_res = await db.execute(select(ChatTag))
    tags = tag_res.scalars().all()
    if not tags:
        default_tags = [
            {"name": "Off-Platform Payment", "color": "#ef4444"},
            {"name": "Refund Request", "color": "#f59e0b"},
            {"name": "Suspicious Activity", "color": "#8b5cf6"},
            {"name": "Resolved", "color": "#10b981"},
            {"name": "Needs Follow-up", "color": "#0ea5e9"},
        ]
        for dt in default_tags:
            new_tag = ChatTag(name=dt["name"], color=dt["color"])
            db.add(new_tag)
        await db.commit()
        tag_res = await db.execute(select(ChatTag))
        tags = tag_res.scalars().all()

    return [
        ChatTagResponse(id=t.id, name=t.name, color=t.color)
        for t in tags
    ]


@router.post("/chat/tags", response_model=ChatTagResponse, status_code=201)
async def create_admin_chat_tag(
    data: TagCreateRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    # Check if name unique
    exist_res = await db.execute(select(ChatTag).where(ChatTag.name == data.name))
    if exist_res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Tag with this name already exists.")

    new_tag = ChatTag(name=data.name, color=data.color)
    db.add(new_tag)
    await db.commit()
    await db.refresh(new_tag)

    return ChatTagResponse(id=new_tag.id, name=new_tag.name, color=new_tag.color)


@router.delete("/chat/tags/{tag_id}")
async def delete_admin_chat_tag(
    tag_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    tag_res = await db.execute(select(ChatTag).where(ChatTag.id == tag_id))
    tag = tag_res.scalar_one_or_none()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found.")

    await db.delete(tag)
    await db.commit()
    return {"message": "Tag deleted successfully."}


@router.patch("/chat/conversations/{conversation_id}/tags")
async def update_conversation_tags(
    conversation_id: str,
    data: ConversationTagsRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    # Verify conversation exists with tags eager loaded
    from sqlalchemy.orm import selectinload
    conv_res = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.tags))
        .where(Conversation.id == conversation_id)
    )
    conv = conv_res.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    # Fetch selected tags
    if data.tag_ids:
        tags_res = await db.execute(select(ChatTag).where(ChatTag.id.in_(data.tag_ids)))
        selected_tags = tags_res.scalars().all()
    else:
        selected_tags = []

    # Assign new tags list
    conv.tags = selected_tags
    await db.commit()

    return {
        "message": "Conversation tags updated successfully.",
        "tag_ids": [t.id for t in selected_tags]
    }


# ─── Support Tickets ──────────────────────────────────────────────────────────

@router.get("/tickets")
async def list_admin_tickets(
    status: Optional[str] = None,
    ticket_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    query = select(SupportTicket).order_by(SupportTicket.created_at.desc())
    if status:
        query = query.where(SupportTicket.status == status)
    if ticket_type:
        query = query.where(SupportTicket.ticket_type == ticket_type)
        
    res = await db.execute(query)
    tickets = res.scalars().all()
    
    output = []
    for t in tickets:
        user_res = await db.execute(select(User).where(User.id == t.user_id))
        user = user_res.scalar_one_or_none()
        
        package_title = None
        if t.package_id:
            pkg_res = await db.execute(select(Package).where(Package.id == t.package_id))
            pkg = pkg_res.scalar_one_or_none()
            if pkg:
                package_title = pkg.title
                
        output.append({
            "id": t.id,
            "user_id": t.user_id,
            "user_name": user.name if user else "Unknown",
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


@router.patch("/tickets/{ticket_id}/action")
async def action_admin_ticket(
    ticket_id: str,
    data: SupportTicketAction,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    res = await db.execute(select(SupportTicket).where(SupportTicket.id == ticket_id))
    ticket = res.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found.")
        
    action = data.action
    if action not in ("approve", "reject", "close"):
        raise HTTPException(status_code=400, detail="Invalid action. Must be 'approve', 'reject', or 'close'.")
        
    ticket.admin_notes = data.notes
    
    if action == "approve":
        if ticket.ticket_type != "compensation_request":
            raise HTTPException(status_code=400, detail="Only compensation_request tickets can be approved.")
        if not ticket.package_id:
            raise HTTPException(status_code=400, detail="Ticket is missing package_id.")
            
        pkg_res = await db.execute(select(Package).where(Package.id == ticket.package_id))
        pkg = pkg_res.scalar_one_or_none()
        if not pkg:
            raise HTTPException(status_code=404, detail="Associated package not found.")
            
        import json
        try:
            changes = json.loads(ticket.proposed_changes) if ticket.proposed_changes else {}
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid proposed changes JSON format.")
            
        allowed_fields = {
            "title", "destination", "price", "duration_days", "description",
            "included_services", "cover_image", "departure_date", "is_active",
            "itinerary", "deposit_percentage", "refund_deadline_days"
        }
        for key, value in changes.items():
            if key in allowed_fields:
                setattr(pkg, key, value)
                
        ticket.status = "approved"
        
    elif action == "reject":
        ticket.status = "rejected"
    elif action == "close":
        ticket.status = "closed"
        
    await db.commit()
    return {"message": f"Ticket marked as {ticket.status}."}


