import sys
import os
# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from src.db.session import settings
from src.api.tasks import router as tasks_router
from src.api.auth import router as auth_router
from src.api.chat import router as chat_router
from src.middleware.auth import AuthMiddleware
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Evolution Todo API",
    description="RESTful API for Evolution Todo (Hackathon Phase II)",
    version="1.0.0",
    redirect_slashes=False
)

# Add rate limiter state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration - MUST be added before Auth middleware
origins = [org.strip() for org in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add authentication middleware after CORS middleware
app.add_middleware(AuthMiddleware)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(chat_router, prefix="/api", tags=["chat"])

@app.on_event('startup')
async def startup_event():
    # This event will be used to initialize database connections
    logger.info("Application startup complete")

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.get("/")
async def root():
    return {"message": "Backend is running successfully 🚀"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))

    uvicorn.run("main:app", host="0.0.0.0", port=port)