from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse
from db.session import get_db
from db.models import User
from api.deps import get_current_user
from services.chat_assistant import generate_chat_stream
from pydantic import BaseModel

router = APIRouter()

class ChatPayload(BaseModel):
    message: str

@router.post("/stream")
async def chat_stream(payload: ChatPayload, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    return EventSourceResponse(generate_chat_stream(payload.message, user, db))
