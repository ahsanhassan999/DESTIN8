import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Text, Float, Integer, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    traveler = "traveler"
    agency = "agency"
    admin = "admin"


class UserStatus(str, enum.Enum):
    active = "active"
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    suspended = "suspended"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole), default=UserRole.traveler)
    status: Mapped[UserStatus] = mapped_column(SAEnum(UserStatus), default=UserStatus.active)
    profile_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    agency_profile: Mapped["AgencyProfile | None"] = relationship("AgencyProfile", back_populates="user", uselist=False)
    packages: Mapped[list["Package"]] = relationship("Package", back_populates="agency", foreign_keys="Package.agency_id")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="user")
    wishlist: Mapped[list["Wishlist"]] = relationship("Wishlist", back_populates="user")


class AgencyProfile(Base):
    __tablename__ = "agency_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), unique=True)
    agency_name: Mapped[str] = mapped_column(String(100))
    owner_name: Mapped[str] = mapped_column(String(100))
    business_address: Mapped[str] = mapped_column(Text)
    license_number: Mapped[str] = mapped_column(String(50))
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="agency_profile")


class Package(Base):
    __tablename__ = "packages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    agency_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(100))
    destination: Mapped[str] = mapped_column(String(50))
    price: Mapped[float] = mapped_column(Float)
    duration_days: Mapped[int] = mapped_column(Integer)
    description: Mapped[str] = mapped_column(Text)
    included_services: Mapped[str] = mapped_column(Text, default="[]")  # JSON string
    cover_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    departure_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    agency: Mapped["User"] = relationship("User", back_populates="packages", foreign_keys=[agency_id])
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="package")
    wishlist: Mapped[list["Wishlist"]] = relationship("Wishlist", back_populates="package")


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    package_id: Mapped[str] = mapped_column(String(36), ForeignKey("packages.id"))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    rating: Mapped[int] = mapped_column(Integer)  # 1-5
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    package: Mapped["Package"] = relationship("Package", back_populates="reviews")
    user: Mapped["User"] = relationship("User", back_populates="reviews")


class Wishlist(Base):
    __tablename__ = "wishlist"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    package_id: Mapped[str] = mapped_column(String(36), ForeignKey("packages.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="wishlist")
    package: Mapped["Package"] = relationship("Package", back_populates="wishlist")
