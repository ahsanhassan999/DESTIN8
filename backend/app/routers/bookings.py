from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
import uuid
import random
from datetime import datetime

from app.database import get_db
from app.models import Booking, BookingStatus, Package, AgencyProfile, SavedCard, PaymentTransaction, User
from app.dependencies import get_current_user, get_current_approved_agency, get_current_traveler
from app.schemas import BankDetailsUpdateRequest

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
    cancel_reason: str = Query(..., min_length=3, description="Reason for cancellation is required"),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")
    if booking.traveler_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized.")
    if booking.status == BookingStatus.cancelled:
        raise HTTPException(status_code=400, detail="Booking is already cancelled.")

    # Fetch associated package to read refund deadline and departure date
    pkg_res = await db.execute(select(Package).where(Package.id == booking.package_id))
    pkg = pkg_res.scalar_one_or_none()
    if not pkg:
        raise HTTPException(status_code=404, detail="Associated package not found.")

    # Check refund deadline
    refundable = True
    refund_details = "Cancelled within refund deadline."
    
    def parse_date(date_str: str) -> Optional[datetime]:
        if not date_str or date_str.upper() in ("TBD", "—", ""):
            return None
        for fmt in ("%b %d, %Y", "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y"):
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        return None

    target_date = booking.travel_date or pkg.departure_date
    travel_dt = parse_date(target_date)
    if travel_dt:
        days_until_travel = (travel_dt - datetime.utcnow()).days
        if days_until_travel < pkg.refund_deadline_days:
            refundable = False
            refund_details = f"Refund limit exceeded (trip is in {days_until_travel} days, limit is {pkg.refund_deadline_days} days)."

    # Fetch transaction to update status
    txn_res = await db.execute(
        select(PaymentTransaction).where(PaymentTransaction.booking_id == booking.id)
    )
    txn = txn_res.scalar_one_or_none()
    if txn:
        if refundable:
            txn.status = "refunded"
            txn.payout_status = "refunded"
        else:
            # Payout stays with agency since traveler cancelled late (deposit is non-refundable)
            # Do not change transaction status
            pass

    booking.status = BookingStatus.cancelled
    booking.cancel_reason = cancel_reason
    await db.commit()

    if refundable:
        return {
            "message": "Booking successfully cancelled. A full refund of your deposit has been initiated.",
            "refunded": True,
            "details": refund_details
        }
    else:
        return {
            "message": f"Booking cancelled. Deposit is non-refundable because {refund_details}",
            "refunded": False,
            "details": refund_details
        }


# ─── Payment Request Schema ──────────────────────────────────────────────────
class PaymentRequest(BaseModel):
    card_number: Optional[str] = None
    expiry_month: Optional[int] = None
    expiry_year: Optional[int] = None
    cvv: Optional[str] = None
    save_card: Optional[bool] = False
    saved_card_id: Optional[str] = None


# Luhn Algorithm check
def luhn_checksum(card_num: str) -> bool:
    try:
        digits = [int(c) for c in card_num if c.isdigit()]
        if not digits:
            return False
        odd_digits = digits[-1::-2]
        even_digits = digits[-2::-2]
        checksum = sum(odd_digits)
        for d in even_digits:
            checksum += sum(divmod(d * 2, 10))
        return checksum % 10 == 0
    except ValueError:
        return False


# ─── Traveler: Pay Booking ──────────────────────────────────────────────
@router.post("/{booking_id}/pay")
async def pay_booking(
    booking_id: str,
    data: PaymentRequest,
    current_user=Depends(get_current_traveler),
    db: AsyncSession = Depends(get_db),
):
    booking_res = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = booking_res.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")
    if booking.traveler_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to pay for this booking.")
    if booking.status == BookingStatus.confirmed:
        raise HTTPException(status_code=400, detail="Booking is already paid and confirmed.")

    # 1. Fetch the package to check the agency's bank verification status
    pkg_res = await db.execute(select(Package).where(Package.id == booking.package_id))
    pkg = pkg_res.scalar_one_or_none()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found.")

    # 2. Check the agency's bank verification status to determine payout status
    agency_profile_res = await db.execute(select(AgencyProfile).where(AgencyProfile.user_id == pkg.agency_id))
    agency_profile = agency_profile_res.scalar_one_or_none()
    
    # Traveler payment succeeds regardless of bank verification status
    # Payout is marked "paid" only if the bank details are verified by the admin; otherwise it is "pending" (withheld)
    is_verified = (
        agency_profile is not None 
        and agency_profile.bank_verification_status == "verified"
    )
    payout_status = "paid" if is_verified else "pending"

    card_brand = "Visa"
    last_four = "4242"
    exp_month = 12
    exp_year = 2030

    if data.saved_card_id:
        card_res = await db.execute(
            select(SavedCard).where(SavedCard.id == data.saved_card_id, SavedCard.user_id == current_user.id)
        )
        saved_card = card_res.scalar_one_or_none()
        if not saved_card:
            raise HTTPException(status_code=404, detail="Saved card not found.")
        card_brand = saved_card.card_brand
        last_four = saved_card.last_four
        exp_month = saved_card.exp_month
        exp_year = saved_card.exp_year
        
        if last_four == "0000":
            raise HTTPException(status_code=400, detail="Your card was declined. Transaction aborted.")
    else:
        if not data.card_number or not data.expiry_month or not data.expiry_year or not data.cvv:
            raise HTTPException(status_code=400, detail="Missing card details.")
        
        card_num_clean = "".join(c for c in data.card_number if c.isdigit())
        if len(card_num_clean) < 12 or len(card_num_clean) > 19:
            raise HTTPException(status_code=400, detail="Invalid card number length.")
        
        if not luhn_checksum(card_num_clean):
            raise HTTPException(status_code=400, detail="Card failed checksum validation.")

        cvv_clean = "".join(c for c in data.cvv if c.isdigit())
        if len(cvv_clean) not in (3, 4):
            raise HTTPException(status_code=400, detail="Invalid CVV length.")

        if data.expiry_month < 1 or data.expiry_month > 12:
            raise HTTPException(status_code=400, detail="Invalid expiry month.")
        
        year = data.expiry_year
        if year < 100:
            year += 2000
        now = datetime.utcnow()
        if year < now.year or (year == now.year and data.expiry_month < now.month):
            raise HTTPException(status_code=400, detail="Card has expired.")

        last_four = card_num_clean[-4:]
        
        if card_num_clean.startswith("4"):
            card_brand = "Visa"
        elif card_num_clean.startswith(("51", "52", "53", "54", "55")):
            card_brand = "Mastercard"
        elif card_num_clean.startswith(("34", "37")):
            card_brand = "Amex"
        elif card_num_clean.startswith("6"):
            card_brand = "Discover"
        else:
            card_brand = "Card"

        if last_four == "0000":
            raise HTTPException(status_code=400, detail="Your card was declined. Transaction aborted.")

        exp_month = data.expiry_month
        exp_year = year

        if data.save_card:
            existing_card_res = await db.execute(
                select(SavedCard).where(
                    SavedCard.user_id == current_user.id,
                    SavedCard.last_four == last_four,
                    SavedCard.card_brand == card_brand,
                    SavedCard.exp_month == exp_month,
                    SavedCard.exp_year == exp_year
                )
            )
            if not existing_card_res.scalar_one_or_none():
                new_saved_card = SavedCard(
                    user_id=current_user.id,
                    card_brand=card_brand,
                    last_four=last_four,
                    exp_month=exp_month,
                    exp_year=exp_year,
                    card_token=f"tok_{card_brand}_{last_four}_{uuid.uuid4().hex[:6]}"
                )
                db.add(new_saved_card)

    # pkg.price is the agency's original price (stored without markup in DB)
    # Traveler sees pkg.price * 1.10 (via API markup), so deposit_amount is also based on marked-up price
    original_total = pkg.price * booking.num_travelers          # e.g. 25,000
    traveler_total = original_total * 1.10                      # e.g. 27,500 (what traveler sees)
    deposit_percentage = pkg.deposit_percentage if pkg.deposit_percentage is not None else 50
    amount_paid = traveler_total * (deposit_percentage / 100.0) # e.g. 50% → 13,750
    commission_deducted = original_total * 0.10                 # 10% of ORIGINAL total → 2,500
    payout_amount = amount_paid - commission_deducted           # 13,750 - 2,500 = 11,250

    txn_ref = f"TXN-{random.randint(100000, 999999)}"
    payout_ref = f"PAY-{random.randint(100000, 999999)}"
    
    transaction = PaymentTransaction(
        booking_id=booking.id,
        transaction_ref=txn_ref,
        amount_paid=amount_paid,
        commission_deducted=commission_deducted,
        payout_amount=payout_amount,
        payment_method="credit_card",
        status="success",
        payout_status=payout_status,
        payout_ref=payout_ref,
    )
    db.add(transaction)
    
    booking.status = BookingStatus.confirmed
    
    await db.commit()
    await db.refresh(transaction)
    
    return {
        "message": "Payment successful.",
        "transaction_ref": txn_ref,
        "amount_paid": amount_paid,
        "commission_deducted": commission_deducted,
        "payout_amount": payout_amount,
        "payout_ref": payout_ref,
        "booking_status": booking.status.value
    }


# ─── Traveler: List Saved Cards ─────────────────────────────────────────────
@router.get("/saved-cards")
async def get_saved_cards(
    current_user=Depends(get_current_traveler),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(SavedCard).where(SavedCard.user_id == current_user.id))
    cards = result.scalars().all()
    return [
        {
            "id": c.id,
            "card_brand": c.card_brand,
            "last_four": c.last_four,
            "exp_month": c.exp_month,
            "exp_year": c.exp_year,
        }
        for c in cards
    ]


# ─── Traveler: Delete Saved Card ────────────────────────────────────────────
@router.delete("/saved-cards/{card_id}")
async def delete_saved_card(
    card_id: str,
    current_user=Depends(get_current_traveler),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SavedCard).where(SavedCard.id == card_id, SavedCard.user_id == current_user.id)
    )
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="Saved card not found.")
    await db.delete(card)
    await db.commit()
    return {"message": "Saved card deleted successfully."}


# ─── Traveler: Payment Receipts ─────────────────────────────────────────────
@router.get("/traveler/payments")
async def get_traveler_payments(
    current_user=Depends(get_current_traveler),
    db: AsyncSession = Depends(get_db),
):
    booking_ids_query = select(Booking.id).where(Booking.traveler_id == current_user.id)
    booking_ids_result = await db.execute(booking_ids_query)
    booking_ids = booking_ids_result.scalars().all()

    if not booking_ids:
        return []

    txns_query = select(PaymentTransaction).where(PaymentTransaction.booking_id.in_(booking_ids)).order_by(PaymentTransaction.created_at.desc())
    txns_result = await db.execute(txns_query)
    txns = txns_result.scalars().all()

    output = []
    for t in txns:
        booking_res = await db.execute(select(Booking).where(Booking.id == t.booking_id))
        booking = booking_res.scalar_one_or_none()
        
        package_title = "Unknown Package"
        if booking:
            pkg_res = await db.execute(select(Package).where(Package.id == booking.package_id))
            pkg = pkg_res.scalar_one_or_none()
            if pkg:
                package_title = pkg.title

        output.append({
            "id": t.id,
            "booking_id": t.booking_id,
            "package_title": package_title,
            "transaction_ref": t.transaction_ref,
            "amount_paid": t.amount_paid,
            "commission_deducted": t.commission_deducted,
            "payout_amount": t.payout_amount,
            "payment_method": t.payment_method,
            "status": t.status,
            "payout_status": t.payout_status,
            "payout_ref": t.payout_ref,
            "created_at": str(t.created_at)
        })
    return output


# ─── Agency: Get Bank Details ───────────────────────────────────────────────
@router.get("/agency/bank-details")
async def get_bank_details(
    current_user=Depends(get_current_approved_agency),
    db: AsyncSession = Depends(get_db),
):
    profile_res = await db.execute(select(AgencyProfile).where(AgencyProfile.user_id == current_user.id))
    profile = profile_res.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Agency profile not found.")
    return {
        "bank_name": profile.bank_name or "",
        "account_title": profile.account_title or "",
        "account_number": profile.account_number or "",
        "branch_code": profile.branch_code or "",
        "bank_verification_status": profile.bank_verification_status or "not_submitted",
        "bank_rejection_reason": profile.bank_rejection_reason or None,
    }


# ─── Agency: Link/Update Bank Details ──────────────────────────────────────
@router.patch("/agency/bank-details")
async def update_bank_details(
    data: BankDetailsUpdateRequest,
    current_user=Depends(get_current_approved_agency),
    db: AsyncSession = Depends(get_db),
):
    profile_res = await db.execute(select(AgencyProfile).where(AgencyProfile.user_id == current_user.id))
    profile = profile_res.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Agency profile not found.")

    profile.bank_name = data.bank_name
    profile.account_title = data.account_title
    profile.account_number = data.account_number
    profile.branch_code = data.branch_code
    # Reset verification to pending whenever bank details are updated
    profile.bank_verification_status = "pending"
    profile.bank_rejection_reason = None

    await db.commit()
    await db.refresh(profile)

    return {
        "message": "Bank details submitted for admin verification. You will be notified once approved.",
        "bank_name": profile.bank_name,
        "account_title": profile.account_title,
        "account_number": profile.account_number,
        "branch_code": profile.branch_code,
        "bank_verification_status": profile.bank_verification_status,
    }


# ─── Agency: Wallet and Payout History ───────────────────────────────────────
@router.get("/agency/wallet")
async def get_agency_wallet(
    current_user=Depends(get_current_approved_agency),
    db: AsyncSession = Depends(get_db),
):
    packages_query = select(Package.id).where(Package.agency_id == current_user.id)
    packages_result = await db.execute(packages_query)
    package_ids = packages_result.scalars().all()

    if not package_ids:
        return {
            "total_balance": 0.0,
            "platform_fees_paid": 0.0,
            "withdrawn_balance": 0.0,
            "payout_history": []
        }

    bookings_query = select(Booking.id).where(Booking.package_id.in_(package_ids), Booking.status == BookingStatus.confirmed)
    bookings_result = await db.execute(bookings_query)
    booking_ids = bookings_result.scalars().all()

    if not booking_ids:
        return {
            "total_balance": 0.0,
            "platform_fees_paid": 0.0,
            "withdrawn_balance": 0.0,
            "payout_history": []
        }

    txns_query = select(PaymentTransaction).where(PaymentTransaction.booking_id.in_(booking_ids)).order_by(PaymentTransaction.created_at.desc())
    txns_result = await db.execute(txns_query)
    txns = txns_result.scalars().all()

    total_balance = sum(t.payout_amount for t in txns if t.status == "success")
    platform_fees_paid = sum(t.commission_deducted for t in txns if t.status == "success")
    withdrawn_balance = sum(t.payout_amount for t in txns if t.status == "success" and t.payout_status == "paid")
    withheld_balance = sum(t.payout_amount for t in txns if t.status == "success" and t.payout_status == "pending")

    payout_history = []
    for t in txns:
        booking_res = await db.execute(select(Booking).where(Booking.id == t.booking_id))
        booking = booking_res.scalar_one_or_none()
        package_title = "Unknown Package"
        if booking:
            pkg_res = await db.execute(select(Package).where(Package.id == booking.package_id))
            pkg = pkg_res.scalar_one_or_none()
            if pkg:
                package_title = pkg.title

        payout_history.append({
            "id": t.id,
            "booking_id": t.booking_id,
            "package_title": package_title,
            "transaction_ref": t.transaction_ref,
            "amount_paid": t.amount_paid,
            "commission_deducted": t.commission_deducted,
            "payout_amount": t.payout_amount,
            "payment_method": t.payment_method,
            "status": t.status,
            "payout_status": t.payout_status,
            "payout_ref": t.payout_ref,
            "created_at": str(t.created_at)
        })

    return {
        "total_balance": total_balance,
        "platform_fees_paid": platform_fees_paid,
        "withdrawn_balance": withdrawn_balance,
        "withheld_balance": withheld_balance,
        "payout_history": payout_history
    }
