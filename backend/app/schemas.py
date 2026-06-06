from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator
import re


# ─── Auth ────────────────────────────────────────────────────────────────────

class TravelerRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirm_password: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least 1 uppercase letter.")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least 1 number.")
        return v

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v, info):
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match.")
        return v


class AgencyRegisterRequest(BaseModel):
    agency_name: str
    owner_name: str
    email: EmailStr
    password: str
    confirm_password: str
    phone: str
    business_address: str
    license_number: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least 1 uppercase letter.")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least 1 number.")
        return v

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v, info):
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match.")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    role: str
    status: str


# ─── User ─────────────────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    status: str
    profile_image: Optional[str] = None
    suspension_reason: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None


# ─── Agency Profile ───────────────────────────────────────────────────────────

class AgencyProfileResponse(BaseModel):
    id: str
    user_id: str
    agency_name: str
    owner_name: str
    business_address: str
    license_number: str
    rejection_reason: Optional[str] = None

    class Config:
        from_attributes = True


class AgencyWithProfileResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    status: str
    created_at: str
    agency_profile: Optional[AgencyProfileResponse] = None

    class Config:
        from_attributes = True


# ─── Admin ────────────────────────────────────────────────────────────────────

class AgencyStatusUpdate(BaseModel):
    status: str  # "approved" or "rejected"
    reason: Optional[str] = None


class UserSuspendRequest(BaseModel):
    reason: str


class PackageTakedownRequest(BaseModel):
    reason: str


class AdminCreateUserRequest(BaseModel):
    role: str  # "traveler", "agency", "admin"
    email: EmailStr
    password: str
    name: str  # Full name for traveler/admin, or Agency Name for agency
    phone: Optional[str] = None

    # Agency profile specific fields
    owner_name: Optional[str] = None
    business_address: Optional[str] = None
    license_number: Optional[str] = None


class StatsResponse(BaseModel):
    total_travelers: int
    total_agencies: int
    approved_agencies: int
    pending_agencies: int
    total_packages: int
    active_packages: int


# ─── Package ──────────────────────────────────────────────────────────────────

class PackageCreateRequest(BaseModel):
    title: str
    destination: str
    price: float
    duration_days: int
    description: str
    included_services: Optional[str] = "[]"  # JSON string
    cover_image: Optional[str] = None
    departure_date: Optional[str] = None
    is_active: Optional[bool] = True
    itinerary: Optional[str] = "[]"  # JSON string


class PackageUpdateRequest(BaseModel):
    title: Optional[str] = None
    destination: Optional[str] = None
    price: Optional[float] = None
    duration_days: Optional[int] = None
    description: Optional[str] = None
    included_services: Optional[str] = None
    cover_image: Optional[str] = None
    departure_date: Optional[str] = None
    is_active: Optional[bool] = None
    itinerary: Optional[str] = None


class PackageResponse(BaseModel):
    id: str
    agency_id: str
    agency_name: str
    title: str
    destination: str
    price: float
    duration_days: int
    description: str
    included_services: str
    cover_image: Optional[str] = None
    departure_date: Optional[str] = None
    is_active: bool
    itinerary: str = "[]"
    is_takedown: bool = False
    takedown_reason: Optional[str] = None
    created_at: str
    average_rating: Optional[float] = None
    review_count: int = 0

    class Config:
        from_attributes = True


# ─── Review ───────────────────────────────────────────────────────────────────

class ReviewCreateRequest(BaseModel):
    rating: int
    comment: Optional[str] = None

    @field_validator("rating")
    @classmethod
    def rating_range(cls, v):
        if not 1 <= v <= 5:
            raise ValueError("Rating must be between 1 and 5.")
        return v


class ReviewResponse(BaseModel):
    id: str
    package_id: str
    user_id: str
    user_name: str
    rating: int
    comment: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True
