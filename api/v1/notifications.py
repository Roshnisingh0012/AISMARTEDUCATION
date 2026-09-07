from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
import uuid
from typing import List
from db.session import get_db
from db.models import User, Notification
from api.deps import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class NotificationResponse(BaseModel):
    id: uuid.UUID
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("", response_model=List[NotificationResponse])
async def get_notifications(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == user.id)
        .order_by(Notification.created_at.desc())
    )
    return result.scalars().all()

@router.patch("/{notif_id}/read")
async def mark_read(notif_id: uuid.UUID, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Notification)
        .where(Notification.id == notif_id, Notification.user_id == user.id)
    )
    notif = result.scalars().first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    await db.commit()
    return {"status": "success"}

@router.post("/mark-all-read")
async def mark_all_read(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    await db.execute(
        update(Notification)
        .where(Notification.user_id == user.id)
        .values(is_read=True)
    )
    await db.commit()
    return {"status": "success"}
