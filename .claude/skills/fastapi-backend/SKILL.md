---
name: fastapi-backend
description: |
  Provides authoritative guidance for building production-grade FastAPI backend
  services with clean architecture. This skill should be used when designing,
  architecting, or implementing FastAPI APIs, ensuring proper separation of concerns,
  RESTful design, error handling, validation, and scalability. Enforces stateless
  API design with authentication and database integration support.
---

# FastAPI Backend Service Architecture

Production-grade guidance for building scalable, maintainable FastAPI backend services.

## What This Skill Does

- **Defines clean architecture**: Proper project structure with routers, models, services, dependencies
- **Teaches RESTful design**: HTTP methods, status codes, resource naming, API versioning
- **Enforces separation of concerns**: Clear boundaries between layers (routes, services, data)
- **Provides error handling patterns**: Structured exceptions, validation errors, HTTP exceptions
- **Implements middleware**: Request logging, CORS, authentication, rate limiting
- **Supports scalability**: Dependency injection, async operations, connection pooling

## What This Skill Does NOT Do

- Frontend implementation (use Next.js skill for that)
- Database schema design specifics (provides integration patterns only)
- Infrastructure deployment (focuses on application code)
- Authentication provider implementation (provides integration patterns)

---

## Before Implementation

Gather context to ensure successful implementation:

| Source | Gather |
|--------|--------|
| **Codebase** | Existing FastAPI structure, database models, API patterns |
| **Conversation** | User's specific requirements, endpoints needed, business logic |
| **Skill References** | FastAPI patterns from `references/` (architecture, best practices) |
| **User Guidelines** | Project-specific conventions, team standards |

Ensure all required context is gathered before implementing.
Only ask user for THEIR specific requirements (domain expertise is in this skill).

---

## Core Principles

### 1. Stateless API Design

**All APIs must be stateless** - no session storage on server.

**Why stateless**:
- Horizontal scalability
- Load balancer friendly
- Cloud-native architecture
- Microservices compatibility

**Authentication**:
- Use JWT tokens (passed in headers)
- No server-side sessions
- Token contains all necessary claims
- Validate token on every request

**Example**:
```python
# ✅ GOOD: Stateless with JWT
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    payload = verify_jwt_token(token)
    return payload["user_id"]

@router.get("/profile")
async def get_profile(user_id: str = Depends(get_current_user)):
    return await db.users.find_one({"id": user_id})
```

```python
# ❌ BAD: Stateful with sessions
from fastapi import Request

@router.get("/profile")
async def get_profile(request: Request):
    # ❌ Relies on server-side session
    user_id = request.session.get("user_id")
    return await db.users.find_one({"id": user_id})
```

### 2. Separation of Concerns

**Clear boundaries between layers**:
- **Routes** → HTTP handling, request/response
- **Services** → Business logic
- **Repositories** → Database operations
- **Models** → Data structures

**Architecture**:
```
app/
├── api/              # HTTP layer
│   ├── routes/       # Route handlers
│   ├── dependencies/ # Dependency injection
│   └── middleware/   # Request/response middleware
├── core/             # Core configuration
│   ├── config.py     # Settings
│   ├── security.py   # Auth utilities
│   └── database.py   # DB connection
├── models/           # Data models
│   ├── domain/       # Business entities
│   └── schemas/      # Pydantic schemas
├── services/         # Business logic
└── repositories/     # Data access
```

**Example**:
```python
# ✅ GOOD: Proper separation

# routes/tasks.py - HTTP layer
@router.post("/tasks", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    service: TaskService = Depends(get_task_service)
):
    return await service.create_task(task_data, current_user.id)

# services/tasks.py - Business logic
class TaskService:
    def __init__(self, repository: TaskRepository):
        self.repository = repository

    async def create_task(self, data: TaskCreate, user_id: str) -> Task:
        # Business logic: validate, transform, apply rules
        if data.priority == "urgent":
            data.due_date = datetime.now() + timedelta(hours=24)

        return await self.repository.create(data, user_id)

# repositories/tasks.py - Data access
class TaskRepository:
    def __init__(self, db: Database):
        self.db = db

    async def create(self, data: TaskCreate, user_id: str) -> Task:
        task_dict = data.dict()
        task_dict["user_id"] = user_id
        result = await self.db.tasks.insert_one(task_dict)
        return await self.db.tasks.find_one({"_id": result.inserted_id})
```

### 3. RESTful Design

**Follow REST principles**:
- Use HTTP methods correctly
- Resource-based URLs
- Proper status codes
- Idempotent operations (PUT, DELETE)

**HTTP Methods**:
- `GET` → Retrieve resource(s)
- `POST` → Create resource
- `PUT` → Replace resource (idempotent)
- `PATCH` → Partial update
- `DELETE` → Remove resource (idempotent)

**URL Structure**:
```
✅ GOOD:
  GET    /api/v1/tasks           # List tasks
  GET    /api/v1/tasks/{id}      # Get task
  POST   /api/v1/tasks           # Create task
  PUT    /api/v1/tasks/{id}      # Replace task
  PATCH  /api/v1/tasks/{id}      # Update task
  DELETE /api/v1/tasks/{id}      # Delete task

❌ BAD:
  GET    /api/v1/getTasks        # ❌ Verb in URL
  POST   /api/v1/task/create     # ❌ Verb in URL
  GET    /api/v1/deleteTask      # ❌ Wrong method for delete
```

**Status Codes**:
- `200 OK` → Successful GET, PUT, PATCH
- `201 Created` → Successful POST
- `204 No Content` → Successful DELETE
- `400 Bad Request` → Validation error
- `401 Unauthorized` → Missing/invalid auth
- `403 Forbidden` → Valid auth, insufficient permissions
- `404 Not Found` → Resource doesn't exist
- `409 Conflict` → Resource conflict (duplicate)
- `422 Unprocessable Entity` → Semantic validation error
- `500 Internal Server Error` → Server error

### 4. Dependency Injection

**Use FastAPI's dependency injection system**:

```python
from fastapi import Depends
from sqlalchemy.orm import Session

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Service dependency
def get_task_service(db: Session = Depends(get_db)):
    repository = TaskRepository(db)
    return TaskService(repository)

# Route using dependencies
@router.get("/tasks")
async def list_tasks(
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user)
):
    return await service.list_tasks(current_user.id)
```

---

## Project Structure

### Recommended Layout

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry
│   │
│   ├── api/                    # API layer
│   │   ├── __init__.py
│   │   ├── dependencies/       # Dependency injection
│   │   │   ├── __init__.py
│   │   │   ├── auth.py         # Authentication dependencies
│   │   │   ├── database.py     # Database dependencies
│   │   │   └── services.py     # Service dependencies
│   │   │
│   │   ├── middleware/         # Middleware
│   │   │   ├── __init__.py
│   │   │   ├── cors.py         # CORS configuration
│   │   │   ├── logging.py      # Request logging
│   │   │   └── error_handler.py # Global error handling
│   │   │
│   │   └── routes/             # Route handlers
│   │       ├── __init__.py
│   │       ├── auth.py         # /auth endpoints
│   │       ├── users.py        # /users endpoints
│   │       ├── tasks.py        # /tasks endpoints
│   │       └── health.py       # /health endpoint
│   │
│   ├── core/                   # Core configuration
│   │   ├── __init__.py
│   │   ├── config.py           # Settings & environment
│   │   ├── security.py         # JWT, password hashing
│   │   └── database.py         # Database connection
│   │
│   ├── models/                 # Data models
│   │   ├── __init__.py
│   │   ├── domain/             # Domain entities (ORM)
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   └── task.py
│   │   │
│   │   └── schemas/            # Pydantic schemas (API)
│   │       ├── __init__.py
│   │       ├── user.py         # UserCreate, UserResponse
│   │       ├── task.py         # TaskCreate, TaskResponse
│   │       └── common.py       # Shared schemas
│   │
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   └── task_service.py
│   │
│   ├── repositories/           # Data access layer
│   │   ├── __init__.py
│   │   ├── base.py             # Base repository
│   │   ├── user_repository.py
│   │   └── task_repository.py
│   │
│   └── utils/                  # Utilities
│       ├── __init__.py
│       ├── validators.py       # Custom validators
│       └── helpers.py          # Helper functions
│
├── tests/                      # Tests
│   ├── __init__.py
│   ├── conftest.py             # Pytest fixtures
│   ├── test_auth.py
│   ├── test_tasks.py
│   └── test_users.py
│
├── alembic/                    # Database migrations
│   ├── versions/
│   ├── env.py
│   └── alembic.ini
│
├── .env                        # Environment variables
├── .env.example                # Example environment file
├── requirements.txt            # Dependencies
├── pyproject.toml              # Poetry/project config
└── README.md                   # Documentation
```

---

## Main Application Setup

### app/main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import create_db_and_tables
from app.api.routes import auth, users, tasks, health
from app.api.middleware.logging import log_requests
from app.api.middleware.error_handler import add_exception_handlers

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await create_db_and_tables()
    yield
    # Shutdown
    # Clean up resources if needed

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom middleware
app.middleware("http")(log_requests)

# Exception handlers
add_exception_handlers(app)

# Routes
app.include_router(health.router, prefix=settings.API_V1_STR, tags=["health"])
app.include_router(auth.router, prefix=settings.API_V1_STR, tags=["auth"])
app.include_router(users.router, prefix=settings.API_V1_STR, tags=["users"])
app.include_router(tasks.router, prefix=settings.API_V1_STR, tags=["tasks"])

@app.get("/")
async def root():
    return {
        "message": "FastAPI Backend",
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_STR}/docs"
    }
```

---

## Configuration

### app/core/config.py

```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # App
    PROJECT_NAME: str = "FastAPI Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]

    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

### app/core/security.py

```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})

    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt

def verify_token(token: str, token_type: str = "access") -> dict:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        if payload.get("type") != token_type:
            raise JWTError("Invalid token type")

        return payload
    except JWTError:
        raise
```

---

## Pydantic Schemas

### app/models/schemas/task.py

```python
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None

class TaskResponse(TaskBase):
    id: str
    status: TaskStatus
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TaskList(BaseModel):
    tasks: list[TaskResponse]
    total: int
    page: int
    per_page: int
```

---

## Dependencies

### app/api/dependencies/auth.py

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError

from app.core.security import verify_token
from app.services.user_service import UserService
from app.api.dependencies.services import get_user_service

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    user_service: UserService = Depends(get_user_service)
):
    """
    Validates JWT token and returns current user.
    """
    token = credentials.credentials

    try:
        payload = verify_token(token, token_type="access")
        user_id: str = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await user_service.get_by_id(user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user

async def get_current_active_user(
    current_user = Depends(get_current_user)
):
    """
    Validates user is active.
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user

async def require_admin(
    current_user = Depends(get_current_active_user)
):
    """
    Validates user has admin role.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user
```

---

## Route Handlers

### app/api/routes/tasks.py

```python
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional

from app.models.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskList,
    TaskStatus
)
from app.services.task_service import TaskService
from app.api.dependencies.services import get_task_service
from app.api.dependencies.auth import get_current_active_user

router = APIRouter(prefix="/tasks")

@router.get("", response_model=TaskList)
async def list_tasks(
    status: Optional[TaskStatus] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    service: TaskService = Depends(get_task_service),
    current_user = Depends(get_current_active_user)
):
    """
    List tasks for current user with optional filtering and pagination.
    """
    tasks, total = await service.list_tasks(
        user_id=current_user.id,
        status=status,
        page=page,
        per_page=per_page
    )

    return TaskList(
        tasks=tasks,
        total=total,
        page=page,
        per_page=per_page
    )

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    service: TaskService = Depends(get_task_service),
    current_user = Depends(get_current_active_user)
):
    """
    Get a specific task by ID.
    """
    task = await service.get_task(task_id, current_user.id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    service: TaskService = Depends(get_task_service),
    current_user = Depends(get_current_active_user)
):
    """
    Create a new task.
    """
    return await service.create_task(task_data, current_user.id)

@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    service: TaskService = Depends(get_task_service),
    current_user = Depends(get_current_active_user)
):
    """
    Update an existing task (partial update).
    """
    task = await service.update_task(task_id, task_data, current_user.id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    service: TaskService = Depends(get_task_service),
    current_user = Depends(get_current_active_user)
):
    """
    Delete a task.
    """
    success = await service.delete_task(task_id, current_user.id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return None
```

---

## Services (Business Logic)

### app/services/task_service.py

```python
from datetime import datetime
from typing import Optional, Tuple, List

from app.models.schemas.task import TaskCreate, TaskUpdate, TaskStatus
from app.repositories.task_repository import TaskRepository

class TaskService:
    def __init__(self, repository: TaskRepository):
        self.repository = repository

    async def list_tasks(
        self,
        user_id: str,
        status: Optional[TaskStatus] = None,
        page: int = 1,
        per_page: int = 10
    ) -> Tuple[List, int]:
        """
        List tasks with filtering and pagination.
        """
        filters = {"user_id": user_id}
        if status:
            filters["status"] = status

        tasks = await self.repository.find_many(
            filters=filters,
            skip=(page - 1) * per_page,
            limit=per_page,
            sort=[("created_at", -1)]
        )

        total = await self.repository.count(filters)

        return tasks, total

    async def get_task(self, task_id: str, user_id: str):
        """
        Get a single task, ensuring it belongs to the user.
        """
        task = await self.repository.find_one({
            "id": task_id,
            "user_id": user_id
        })
        return task

    async def create_task(self, data: TaskCreate, user_id: str):
        """
        Create a new task with business rules applied.
        """
        task_dict = data.dict()
        task_dict["user_id"] = user_id
        task_dict["status"] = TaskStatus.TODO
        task_dict["created_at"] = datetime.utcnow()
        task_dict["updated_at"] = datetime.utcnow()

        # Business rule: urgent tasks default to 24h deadline if no due_date
        if data.priority == "urgent" and not data.due_date:
            from datetime import timedelta
            task_dict["due_date"] = datetime.utcnow() + timedelta(hours=24)

        return await self.repository.create(task_dict)

    async def update_task(
        self,
        task_id: str,
        data: TaskUpdate,
        user_id: str
    ):
        """
        Update an existing task (partial update).
        """
        # Verify ownership
        existing = await self.get_task(task_id, user_id)
        if not existing:
            return None

        update_dict = data.dict(exclude_unset=True)
        update_dict["updated_at"] = datetime.utcnow()

        return await self.repository.update(
            {"id": task_id, "user_id": user_id},
            update_dict
        )

    async def delete_task(self, task_id: str, user_id: str) -> bool:
        """
        Delete a task, ensuring it belongs to the user.
        """
        result = await self.repository.delete({
            "id": task_id,
            "user_id": user_id
        })
        return result
```

---

## Error Handling

### app/api/middleware/error_handler.py

```python
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError

def add_exception_handlers(app: FastAPI):

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request,
        exc: RequestValidationError
    ):
        """
        Handle Pydantic validation errors.
        """
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "detail": exc.errors(),
                "body": exc.body
            }
        )

    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError):
        """
        Handle ValueError exceptions.
        """
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": str(exc)}
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        """
        Handle all other exceptions.
        """
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": "Internal server error",
                "type": type(exc).__name__
            }
        )
```

### Custom Exceptions

```python
# app/core/exceptions.py
from fastapi import HTTPException, status

class NotFoundException(HTTPException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail
        )

class UnauthorizedException(HTTPException):
    def __init__(self, detail: str = "Unauthorized"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"}
        )

class ForbiddenException(HTTPException):
    def __init__(self, detail: str = "Forbidden"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )

class ConflictException(HTTPException):
    def __init__(self, detail: str = "Resource conflict"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail
        )
```

---

## Middleware

### Request Logging

```python
# app/api/middleware/logging.py
import time
import logging
from fastapi import Request

logger = logging.getLogger(__name__)

async def log_requests(request: Request, call_next):
    """
    Log all requests with timing information.
    """
    start_time = time.time()

    # Log request
    logger.info(f"Request: {request.method} {request.url.path}")

    # Process request
    response = await call_next(request)

    # Calculate duration
    duration = time.time() - start_time

    # Log response
    logger.info(
        f"Response: {response.status_code} "
        f"Duration: {duration:.3f}s"
    )

    # Add custom header
    response.headers["X-Process-Time"] = str(duration)

    return response
```

---

## Best Practices Summary

### API Design

✅ **DO**:
- Use plural nouns for resources (`/tasks`, `/users`)
- Use HTTP methods correctly (GET, POST, PUT, PATCH, DELETE)
- Return proper status codes
- Version your API (`/api/v1`)
- Implement pagination for list endpoints
- Use query parameters for filtering/sorting
- Document with OpenAPI/Swagger

❌ **DON'T**:
- Use verbs in URLs (`/getTask`, `/createUser`)
- Return 200 for all responses
- Use GET for mutations
- Skip validation
- Expose internal errors to clients

### Security

✅ **DO**:
- Use HTTPS in production
- Validate all inputs
- Use JWT for authentication
- Hash passwords (bcrypt)
- Implement rate limiting
- Use CORS appropriately
- Keep secrets in environment variables

❌ **DON'T**:
- Store passwords in plain text
- Trust client input without validation
- Expose sensitive data in responses
- Use session-based auth (breaks stateless)
- Commit secrets to version control

### Performance

✅ **DO**:
- Use async/await for I/O operations
- Implement database connection pooling
- Use indexes on frequently queried fields
- Cache expensive operations
- Paginate large result sets
- Use background tasks for slow operations

❌ **DON'T**:
- Make blocking calls in async functions
- Return entire collections without pagination
- Perform N+1 queries
- Skip database indexes

---

## Quick Reference

### Common Imports

```python
from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
```

### Dependency Pattern

```python
def get_service(db = Depends(get_db)):
    return Service(Repository(db))

@router.get("/")
async def endpoint(service = Depends(get_service)):
    return await service.do_something()
```

### Response Models

```python
@router.post("/tasks", response_model=TaskResponse, status_code=201)
async def create_task(data: TaskCreate):
    return await service.create(data)
```

### Error Raising

```python
if not resource:
    raise HTTPException(status_code=404, detail="Not found")
```

---

## References

See `references/` for detailed documentation:
- `project-structure.md` - Complete project organization guide
- `api-patterns.md` - RESTful patterns and examples
- `database-integration.md` - Database patterns and migrations
- `authentication.md` - Auth implementation patterns
- `testing.md` - Testing strategies and fixtures
