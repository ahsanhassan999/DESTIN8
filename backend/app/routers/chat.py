from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.database import get_db
from app.models import Conversation, Message, Package, User, UserRole
from app.dependencies import get_current_user, get_current_traveler

router = APIRouter(prefix="/api/chat", tags=["Chat"])


# ─── Pydantic Schemas ─────────────────────────────────────────────────────────

class ConversationCreate(BaseModel):
    package_id: str


class MessageCreate(BaseModel):
    text: str


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_id: Optional[str]
    sender_role: str
    text: str
    is_me: bool
    time: str
    created_at: str


class ConversationResponse(BaseModel):
    id: str
    traveler_id: str
    agency_id: str
    package_id: str
    package: str
    traveler: str
    travelerInitials: str
    lastMsg: str
    time: str
    unread: int
    created_at: str
    updated_at: str


# ─── Helpers ──────────────────────────────────────────────────────────────────

def get_initials(name: str) -> str:
    if not name:
        return "TL"
    parts = name.strip().split()
    if len(parts) >= 2:
        return (parts[0][0] + parts[1][0]).upper()
    return name.strip()[:2].upper()


def format_time(dt: datetime) -> str:
    # Formats to e.g., "10:30 AM"
    return dt.strftime("%I:%M %p")


# ─── Endpoints ────────────────────────────────────────────────────────────────

# 1. Create a conversation (Traveler only)
@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(
    data: ConversationCreate,
    current_user: User = Depends(get_current_traveler),
    db: AsyncSession = Depends(get_db)
):
    # Verify package exists
    pkg_res = await db.execute(select(Package).where(Package.id == data.package_id))
    pkg = pkg_res.scalar_one_or_none()
    if not pkg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found."
        )

    agency_id = pkg.agency_id

    # Check if a conversation already exists for this traveler, agency, and package
    exist_res = await db.execute(
        select(Conversation).where(
            Conversation.traveler_id == current_user.id,
            Conversation.agency_id == agency_id,
            Conversation.package_id == pkg.id
        )
    )
    conv = exist_res.scalar_one_or_none()

    if conv is None:
        conv = Conversation(
            traveler_id=current_user.id,
            agency_id=agency_id,
            package_id=pkg.id
        )
        db.add(conv)
        await db.commit()
        await db.refresh(conv)

    # Fetch details for response enrichment
    traveler_name = current_user.name
    package_title = pkg.title

    return ConversationResponse(
        id=conv.id,
        traveler_id=conv.traveler_id,
        agency_id=conv.agency_id,
        package_id=conv.package_id,
        package=package_title,
        traveler=traveler_name,
        travelerInitials=get_initials(traveler_name),
        lastMsg="",
        time=format_time(conv.updated_at),
        unread=0,
        created_at=str(conv.created_at),
        updated_at=str(conv.updated_at)
    )


# 2. Get conversations of the current authenticated user
@router.get("/conversations", response_model=list[ConversationResponse])
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Find conversations where current user is traveler OR agency
    query = (
        select(Conversation)
        .where(
            or_(
                Conversation.traveler_id == current_user.id,
                Conversation.agency_id == current_user.id
            )
        )
        .order_by(Conversation.updated_at.desc())
    )
    res = await db.execute(query)
    conversations = res.scalars().all()

    output = []
    for conv in conversations:
        # Load Package
        p_res = await db.execute(select(Package).where(Package.id == conv.package_id))
        pkg = p_res.scalar_one_or_none()
        package_title = pkg.title if pkg else "Unknown Package"

        # Load Traveler
        t_res = await db.execute(select(User).where(User.id == conv.traveler_id))
        traveler = t_res.scalar_one_or_none()
        traveler_name = traveler.name if traveler else "Unknown Traveler"

        # Load Last Message
        msg_res = await db.execute(
            select(Message)
            .where(Message.conversation_id == conv.id)
            .order_by(Message.created_at.desc())
            .limit(1)
        )
        last_msg = msg_res.scalar_one_or_none()
        last_msg_text = last_msg.text if last_msg else "No messages yet"
        last_msg_time = format_time(last_msg.created_at) if last_msg else format_time(conv.updated_at)

        output.append(ConversationResponse(
            id=conv.id,
            traveler_id=conv.traveler_id,
            agency_id=conv.agency_id,
            package_id=conv.package_id,
            package=package_title,
            traveler=traveler_name,
            travelerInitials=get_initials(traveler_name),
            lastMsg=last_msg_text,
            time=last_msg_time,
            unread=0,
            created_at=str(conv.created_at),
            updated_at=str(conv.updated_at)
        ))

    return output


# 3. Get messages for a specific conversation
@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageResponse])
async def get_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify conversation exists and user is part of it
    conv_res = await db.execute(select(Conversation).where(Conversation.id == conversation_id))
    conv = conv_res.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    if conv.traveler_id != current_user.id and conv.agency_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")

    # Retrieve message history
    msg_res = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
    )
    messages = msg_res.scalars().all()

    return [
        MessageResponse(
            id=m.id,
            conversation_id=m.conversation_id,
            sender_id=m.sender_id,
            sender_role=m.sender_role,
            text=m.text,
            is_me=(m.sender_id == current_user.id),
            time=format_time(m.created_at),
            created_at=str(m.created_at)
        )
        for m in messages
    ]


# 4. Send a message in a conversation
@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse)
async def send_message(
    conversation_id: str,
    data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify conversation exists and user is part of it
    conv_res = await db.execute(select(Conversation).where(Conversation.id == conversation_id))
    conv = conv_res.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    if conv.traveler_id != current_user.id and conv.agency_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")

    sender_role = "traveler" if current_user.role == UserRole.traveler else "agency"

    # Create message
    msg = Message(
        conversation_id=conversation_id,
        sender_role=sender_role,
        sender_id=current_user.id,
        text=data.text
    )
    db.add(msg)

    # Update conversation's updated_at timestamp to bring it to top of list
    conv.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(msg)

    return MessageResponse(
        id=msg.id,
        conversation_id=msg.conversation_id,
        sender_id=msg.sender_id,
        sender_role=msg.sender_role,
        text=msg.text,
        is_me=True,
        time=format_time(msg.created_at),
        created_at=str(msg.created_at)
    )
