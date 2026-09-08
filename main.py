import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(learner_router, prefix=f"{settings.API_V1_STR}/learner", tags=["learner"])
app.include_router(admin_quiz_router, prefix=f"{settings.API_V1_STR}/admin/quizzes", tags=["admin_quiz"])
app.include_router(admin_analytics_router, prefix=f"{settings.API_V1_STR}/admin/analytics", tags=["admin_analytics"])
app.include_router(chat_router, prefix=f"{settings.API_V1_STR}/chat", tags=["chat"])
app.include_router(notifications_router, prefix="/api/v1/notifications", tags=["notifications"])

@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok"}

# Static files & SPA mounting
DIST_DIR = os.path.join(os.path.dirname(__file__), "frontend", "dist")
ASSETS_DIR = os.path.join(DIST_DIR, "assets")

if os.path.exists(ASSETS_DIR):
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    candidate = os.path.join(DIST_DIR, full_path)
    if full_path and os.path.exists(candidate) and os.path.isfile(candidate):
        return FileResponse(candidate)
    
    index_file = os.path.join(DIST_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"status": "Frontend not built yet. Run 'npm run build' inside frontend directory."}

