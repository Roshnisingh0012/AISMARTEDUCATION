from contextlib import asynccontextmanager
from fastapi import FastAPI
from core.config import settings
from db.session import engine, Base
from api.v1.auth import router as auth_router
from api.v1.learner import router as learner_router
from api.v1.admin_quiz import router as admin_quiz_router
from api.v1.admin_analytics import router as admin_analytics_router
from api.v1.chat import router as chat_router
from api.v1.notifications import router as notifications_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(learner_router, prefix=f"{settings.API_V1_STR}/learner", tags=["learner"])
app.include_router(admin_quiz_router, prefix=f"{settings.API_V1_STR}/admin/quizzes", tags=["admin_quiz"])
app.include_router(admin_analytics_router, prefix=f"{settings.API_V1_STR}/admin/analytics", tags=["admin_analytics"])
app.include_router(chat_router, prefix=f"{settings.API_V1_STR}/chat", tags=["chat"])

@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok"}

app.include_router(notifications_router, prefix="/api/v1/notifications", tags=["notifications"])
