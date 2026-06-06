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
    suspension_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    agency_profile: Mapped["AgencyProfile | None"] = relationship("AgencyProfile", back_populates="user", uselist=False)
    packages: Mapped[list["Package"]] = relationship("Package", back_populates="agency", foreign_keys="Package.agency_id")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="user")
    wishlist: Mapped[list["Wishlist"]] = relationship("Wishlist", back_populates="user")
    bookings: Mapped[list["Booking"]] = relationship("Booking", back_populates="traveler", foreign_keys="Booking.traveler_id")
    saved_cards: Mapped[list["SavedCard"]] = relationship("SavedCard", back_populates="user", cascade="all, delete-orphan")


class AgencyProfile(Base):
    __tablename__ = "agency_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), unique=True)
    agency_name: Mapped[str] = mapped_column(String(100))
    owner_name: Mapped[str] = mapped_column(String(100))
    business_address: Mapped[str] = mapped_column(Text)
    license_number: Mapped[str] = mapped_column(String(50))
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    bank_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    account_title: Mapped[str | None] = mapped_column(String(100), nullable=True)
    account_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    branch_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    bank_verification_status: Mapped[str] = mapped_column(String(20), default="not_submitted")  # not_submitted | pending | verified | rejected
    bank_rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
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
    is_takedown: Mapped[bool] = mapped_column(Boolean, default=False)
    takedown_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    itinerary: Mapped[str] = mapped_column(Text, default="[]")  # JSON string
    deposit_percentage: Mapped[int] = mapped_column(Integer, default=50)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    agency: Mapped["User"] = relationship("User", back_populates="packages", foreign_keys=[agency_id])
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="package")
    wishlist: Mapped[list["Wishlist"]] = relationship("Wishlist", back_populates="package")
    bookings: Mapped[list["Booking"]] = relationship("Booking", back_populates="package")


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


class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    traveler_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    package_id: Mapped[str] = mapped_column(String(36), ForeignKey("packages.id"))
    status: Mapped[BookingStatus] = mapped_column(SAEnum(BookingStatus), default=BookingStatus.pending)
    num_travelers: Mapped[int] = mapped_column(Integer, default=1)
    travel_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    traveler: Mapped["User"] = relationship("User", back_populates="bookings", foreign_keys=[traveler_id])
    package: Mapped["Package"] = relationship("Package", back_populates="bookings")


class SavedCard(Base):
    __tablename__ = "saved_cards"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    card_brand: Mapped[str] = mapped_column(String(20))
    last_four: Mapped[str] = mapped_column(String(4))
    exp_month: Mapped[int] = mapped_column(Integer)
    exp_year: Mapped[int] = mapped_column(Integer)
    card_token: Mapped[str] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="saved_cards")


class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id: Mapped[str] = mapped_column(String(36), ForeignKey("bookings.id"))
    transaction_ref: Mapped[str] = mapped_column(String(50))
    amount_paid: Mapped[float] = mapped_column(Float)
    commission_deducted: Mapped[float] = mapped_column(Float)
    payout_amount: Mapped[float] = mapped_column(Float)
    payment_method: Mapped[str] = mapped_column(String(20))
    status: Mapped[str] = mapped_column(String(20))
    payout_status: Mapped[str] = mapped_column(String(20), default="pending")
    payout_ref: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    booking: Mapped["Booking"] = relationship("Booking")


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    traveler_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    agency_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    package_id: Mapped[str] = mapped_column(String(36), ForeignKey("packages.id"))
    is_flagged: Mapped[bool] = mapped_column(Boolean, default=False)
    flag_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    traveler: Mapped["User"] = relationship("User", foreign_keys=[traveler_id])
    agency: Mapped["User"] = relationship("User", foreign_keys=[agency_id])
    package: Mapped["Package"] = relationship("Package")
    messages: Mapped[list["Message"]] = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    tags: Mapped[list["ChatTag"]] = relationship("ChatTag", secondary="conversation_tag_links", back_populates="conversations")


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id: Mapped[str] = mapped_column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"))
    sender_role: Mapped[str] = mapped_column(String(20))  # "traveler" | "agency" | "system"
    sender_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    text: Mapped[str] = mapped_column(Text)
    is_warning: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    conversation: Mapped["Conversation"] = relationship("Conversation", back_populates="messages")
    sender: Mapped["User | None"] = relationship("User")


class ChatTag(Base):
    __tablename__ = "chat_tags"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(50), unique=True)
    color: Mapped[str] = mapped_column(String(20), default="#967BB6")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    conversations: Mapped[list["Conversation"]] = relationship("Conversation", secondary="conversation_tag_links", back_populates="tags")


class ConversationTagLink(Base):
    __tablename__ = "conversation_tag_links"

    conversation_id: Mapped[str] = mapped_column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), primary_key=True)
    tag_id: Mapped[str] = mapped_column(String(36), ForeignKey("chat_tags.id", ondelete="CASCADE"), primary_key=True)
