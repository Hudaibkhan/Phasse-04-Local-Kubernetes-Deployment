import sys
import os
# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.tasks import router as tasks_router  # This is the updated file with fixes
from src.api.auth import router as auth_router   # Use the auth from src
from src.api.tags import router as tags_router   # Add the tags router
from src.backend.database.database import settings  # Use existing database settings
from src.middleware.auth import get_current_user_id, AuthMiddleware
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Evolution Todo API",
    description="RESTful API for Evolution Todo (Hackathon Phase II)",
    version="1.0.0"
)

# CORS configuration - this should be added FIRST in the middleware stack
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001", "http://localhost:8080"],  # Allow frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Auth Middleware after CORS
app.add_middleware(AuthMiddleware)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(tags_router, prefix="/api")  # Include the tags router

@app.on_event('startup')
async def startup_event():
    # This event will be used to initialize database connections
    logger.info("Application startup complete")

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("minimal_main:app", host="0.0.0.0", port=8000, reload=True)