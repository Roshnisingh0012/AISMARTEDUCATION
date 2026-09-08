from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Skill Intelligence & Assessment Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "statcompetency-super-secret-production-key-2026"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    
    POSTGRES_SERVER: Optional[str] = None
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_DB: Optional[str] = None
    SQLALCHEMY_DATABASE_URI: Optional[str] = "sqlite+aiosqlite:///./aiskilldb.db"
    GEMINI_API_KEY: Optional[str] = None
    
    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True, extra="ignore")

settings = Settings()

