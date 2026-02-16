from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add the src directory to the path to ensure imports work correctly
src_dir = os.path.dirname(os.path.abspath(__file__))  # This is the 'src' directory
if src_dir not in sys.path:
    sys.path.insert(0, src_dir)

from .db.session import settings
from .api.auth import router as auth_router
from .api.tasks import router as tasks_router
from .api.notifications import router as notifications_router
from .middleware.auth import AuthMiddleware
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Evolution Todo API",
    description="RESTful API for Evolution Todo (Hackathon Phase II)",
    version="1.0.0"
)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")

# CORS configuration
origins = [org.strip() for org in settings.CORS_ORIGINS.split(",")] if settings.CORS_ORIGINS else []
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add middlewares - CORSMiddleware should come before other middlewares to handle preflight requests
app.add_middleware(AuthMiddleware)

@app.on_event('startup')
async def startup_event():
    # This event will be used to initialize database connections
    logger.info("Application startup complete")

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}