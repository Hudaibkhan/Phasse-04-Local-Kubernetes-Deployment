from sqlmodel import create_engine, Session, SQLModel
from pydantic_settings import BaseSettings
from typing import Generator
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@localhost/neondb"
    JWT_SECRET: str = "your_super_secret_jwt_key_at_least_32_chars"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    CORS_ORIGINS: str = "http://localhost:3000"
    ENVIRONMENT: str = "development"
    OPENAI_API_KEY: str = "sk-placeholder"
    GEMINI_API_KEY: str = ""  # Gemini API key for OpenAI Agents SDK
    GROQ_API_KEY: str = ""  # Groq API key for fallback LLM

    class Config:
        env_file = ".env"

settings = Settings()

try:
    # Determine if we're using PostgreSQL or SQLite
    if "postgresql" in settings.DATABASE_URL.lower():
        # PostgreSQL-specific connection arguments
        connect_args = {
            "sslmode": "require",
            "connect_timeout": 10
        }
    else:
        # SQLite-specific connection arguments
        connect_args = {}

    engine = create_engine(
        settings.DATABASE_URL,
        echo=True,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,
        pool_recycle=300,
        connect_args=connect_args
    )
    logger.info("Database engine created successfully")
except Exception as e:
    logger.error(f"Failed to create database engine: {str(e)}")
    raise

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


# Create a session class for direct use
def SessionLocal():
    return Session(bind=engine)
