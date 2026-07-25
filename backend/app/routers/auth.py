from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models import User, AgencyProfile, UserRole, UserStatus
from app.schemas import (
    TravelerRegisterRequest,
    AgencyRegisterRequest,
    LoginRequest,
    ChangePasswordRequest,
    TokenResponse,
    UserResponse,
    UserUpdateRequest,
)
from app.core.security import hash_password, verify_password, create_access_token
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/register/traveler", response_model=TokenResponse, status_code=201)
async def register_traveler(data: TravelerRegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check duplicate email
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered.")

    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=UserRole.traveler,
        status=UserStatus.active,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": user.id, "role": user.role.value})
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        name=user.name,
        role=user.role.value,
        status=user.status.value,
    )


@router.post("/register/agency", response_model=TokenResponse, status_code=201)
async def register_agency(data: AgencyRegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered.")

    user = User(
        name=data.agency_name,
        email=data.email,
        hashed_password=hash_password(data.password),
        phone=data.phone,
        role=UserRole.agency,
        status=UserStatus.pending,  # Agencies need admin approval
    )
    db.add(user)
    await db.flush()  # get user.id before creating profile

    profile = AgencyProfile(
        user_id=user.id,
        agency_name=data.agency_name,
        owner_name=data.owner_name,
        business_address=data.business_address,
        license_number=data.license_number,
    )
    db.add(profile)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": user.id, "role": user.role.value})
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        name=user.name,
        role=user.role.value,
        status=user.status.value,
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Your account has been suspended. Please contact support.",
        )

    token = create_access_token({"sub": user.id, "role": user.role.value})
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        name=user.name,
        role=user.role.value,
        status=user.status.value,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        phone=current_user.phone,
        role=current_user.role.value,
        status=current_user.status.value,
        profile_image=current_user.profile_image,
        created_at=str(current_user.created_at),
    )


@router.patch("/me", response_model=UserResponse)
async def update_me(
    data: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data.name:
        current_user.name = data.name
    if data.phone is not None:
        current_user.phone = data.phone
    await db.commit()
    await db.refresh(current_user)
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        phone=current_user.phone,
        role=current_user.role.value,
        status=current_user.status.value,
        profile_image=current_user.profile_image,
        created_at=str(current_user.created_at),
    )


@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(data.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password.")

    current_user.hashed_password = hash_password(data.new_password)
    await db.commit()
    return {"message": "Password changed successfully."}
