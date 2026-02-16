---
name: neon-postgresql-sqlmodel
description: |
  Provides authoritative guidance for implementing persistent data storage using
  Neon serverless PostgreSQL with SQLModel. This skill should be used when designing
  database schemas, implementing data access layers, or migrating from in-memory storage
  to persistent storage. Enforces Neon serverless best practices, user-scoped queries,
  and data isolation patterns.
---

# Neon PostgreSQL Persistence with SQLModel

Production-grade guidance for persistent data storage with Neon serverless PostgreSQL and SQLModel.

## What This Skill Does

- **Teaches Neon connection patterns**: Serverless-optimized connection handling, pool management
- **Defines SQLModel table design**: Schema design, relationships, indexes, constraints
- **Enforces data isolation**: User-scoped queries, row-level security, authorization
- **Ensures persistence**: Replace in-memory logic with durable database storage
- **Provides migration patterns**: Schema migrations, data migrations, versioning
- **Optimizes for serverless**: Short-lived connections, connection pooling, edge deployment

## What This Skill Does NOT Do

- Frontend implementation (use Next.js skill for that)
- API endpoint design (use FastAPI skill for that)
- Authentication implementation (provides data isolation patterns only)
- Infrastructure deployment (focuses on application code)

---

## Before Implementation

Gather context to ensure successful implementation:

| Source | Gather |
|--------|--------|
| **Codebase** | Existing database models, query patterns, connection setup |
| **Conversation** | User's specific data requirements, relationships, access patterns |
| **Skill References** | Neon patterns from `references/` (connection pooling, SQLModel schemas) |
| **User Guidelines** | Project-specific conventions, team standards |

Ensure all required context is gathered before implementing.
Only ask user for THEIR specific requirements (domain expertise is in this skill).

---

## Core Principles

### 1. Serverless-First Connection Handling

**Neon is serverless** - connections must be short-lived and properly managed.

**Key Differences from Traditional PostgreSQL**:
- **No long-lived connections** - serverless functions are ephemeral
- **Connection pooling critical** - avoid connection exhaustion
- **Create connections per request** - not globally
- **Always close connections** - use try/finally or context managers

**Neon Serverless Driver**: `@neondatabase/serverless` (for TypeScript/JavaScript)
**Python Equivalent**: `psycopg2` or `asyncpg` with proper pooling

**Connection Pattern**:
```python
from sqlmodel import create_engine, Session
from contextlib import contextmanager

# ✅ GOOD: Connection pool (reusable)
DATABASE_URL = "postgresql://user:password@ep-xxx.neon.tech/db?sslmode=require"

engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_size=5,          # Small pool for serverless
    max_overflow=10,      # Allow temporary overflow
    pool_pre_ping=True,   # Check connection health
    pool_recycle=300      # Recycle connections every 5 minutes
)

# ✅ GOOD: Session per request
@contextmanager
def get_db_session():
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

# Usage in FastAPI
from fastapi import Depends

def get_db():
    with get_db_session() as session:
        yield session

@router.get("/tasks")
async def list_tasks(db: Session = Depends(get_db)):
    tasks = db.query(Task).all()
    return tasks
```

**❌ BAD: Long-lived global session**:
```python
# ❌ WRONG: Global session (memory leak, connection exhaustion)
db = Session(engine)

@router.get("/tasks")
async def list_tasks():
    tasks = db.query(Task).all()  # ❌ Never closed
    return tasks
```

### 2. SQLModel for Type-Safe Schemas

**SQLModel** combines Pydantic validation with SQLAlchemy ORM.

**Benefits**:
- Type safety (Python type hints)
- Automatic validation
- JSON serialization
- ORM capabilities
- Alembic migration support

**Basic Model**:
```python
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    # Primary key
    id: Optional[int] = Field(default=None, primary_key=True)

    # Required fields
    title: str = Field(max_length=200, index=True)
    user_id: str = Field(foreign_key="users.id", index=True)

    # Optional fields
    description: Optional[str] = Field(default=None, max_length=2000)
    status: str = Field(default="todo", max_length=20)
    priority: str = Field(default="medium", max_length=20)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Indexes for common queries
    __table_args__ = (
        Index("idx_task_user_status", "user_id", "status"),
        Index("idx_task_user_created", "user_id", "created_at"),
    )
```

### 3. User-Scoped Queries (Data Isolation)

**Always filter by user_id** - prevent data leakage.

**Pattern**: Every query must include user ownership check.

```python
# ✅ GOOD: User-scoped query
def get_tasks(db: Session, user_id: str):
    return db.query(Task).filter(Task.user_id == user_id).all()

def get_task_by_id(db: Session, task_id: int, user_id: str) -> Optional[Task]:
    return db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user_id  # ✅ Ownership check
    ).first()

def update_task(db: Session, task_id: int, user_id: str, data: dict):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user_id  # ✅ Ownership check
    ).first()

    if not task:
        raise ValueError("Task not found or access denied")

    for key, value in data.items():
        setattr(task, key, value)

    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return task
```

```python
# ❌ BAD: No user check (data leak!)
def get_task_by_id(db: Session, task_id: int):  # ❌ Missing user_id
    return db.query(Task).filter(Task.id == task_id).first()
```

### 4. Replace In-Memory with Persistence

**In-memory data is ephemeral** - use database for durability.

**Before (In-Memory)**:
```python
# ❌ BAD: In-memory storage (lost on restart)
tasks = {}

def create_task(task_data):
    task_id = str(uuid.uuid4())
    tasks[task_id] = {
        "id": task_id,
        "title": task_data["title"],
        "user_id": task_data["user_id"]
    }
    return tasks[task_id]

def get_tasks(user_id):
    return [t for t in tasks.values() if t["user_id"] == user_id]
```

**After (Database)**:
```python
# ✅ GOOD: Persistent storage
def create_task(db: Session, task_data: TaskCreate, user_id: str):
    task = Task(
        title=task_data.title,
        description=task_data.description,
        user_id=user_id
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

def get_tasks(db: Session, user_id: str):
    return db.query(Task).filter(Task.user_id == user_id).all()
```

---

## Neon Connection Setup

### Environment Configuration

```python
# app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Neon connection string format:
    # postgresql://user:password@ep-xxx-xxx.region.neon.tech/dbname?sslmode=require
    DATABASE_URL: str

    # Connection pool settings (for serverless)
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_RECYCLE: int = 300  # 5 minutes
    DB_POOL_PRE_PING: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
```

### Database Engine

```python
# app/core/database.py
from sqlmodel import create_engine, Session, SQLModel
from app.core.config import settings

# Create engine with Neon-optimized settings
engine = create_engine(
    settings.DATABASE_URL,
    echo=False,  # Set to True for SQL logging in development
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_recycle=settings.DB_POOL_RECYCLE,
    pool_pre_ping=settings.DB_POOL_PRE_PING,
    connect_args={"sslmode": "require"}  # Required for Neon
)

def create_db_and_tables():
    """
    Create all tables defined in SQLModel.
    Call this on application startup.
    """
    SQLModel.metadata.create_all(engine)

def get_session():
    """
    Dependency for FastAPI routes.
    Provides a database session per request.
    """
    with Session(engine) as session:
        yield session
```

### FastAPI Integration

```python
# app/main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.database import create_db_and_tables

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables
    create_db_and_tables()
    yield
    # Shutdown: Clean up if needed
    pass

app = FastAPI(lifespan=lifespan)
```

---

## SQLModel Table Design

### Basic Model

```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from enum import Enum

class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    # Primary Key
    id: Optional[int] = Field(default=None, primary_key=True)

    # Required Fields
    title: str = Field(max_length=200, index=True)
    user_id: str = Field(foreign_key="users.id", index=True, nullable=False)

    # Optional Fields
    description: Optional[str] = Field(default=None, max_length=2000)
    status: str = Field(default=TaskStatus.TODO, max_length=20)
    priority: str = Field(default=TaskPriority.MEDIUM, max_length=20)
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Soft Delete
    deleted_at: Optional[datetime] = None

    # Indexes for common queries
    __table_args__ = (
        Index("idx_task_user_status", "user_id", "status"),
        Index("idx_task_user_created", "user_id", "created_at"),
        Index("idx_task_due_date", "due_date"),
    )
```

### Relationships

```python
class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(primary_key=True, max_length=100)
    email: str = Field(unique=True, index=True, max_length=255)
    name: str = Field(max_length=200)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship (one-to-many)
    tasks: List["Task"] = Relationship(back_populates="user")

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200)
    user_id: str = Field(foreign_key="users.id", index=True)

    # Relationship (many-to-one)
    user: Optional[User] = Relationship(back_populates="tasks")
```

### Many-to-Many Relationships

```python
# Link table for many-to-many
class TaskTagLink(SQLModel, table=True):
    __tablename__ = "task_tag_links"

    task_id: int = Field(foreign_key="tasks.id", primary_key=True)
    tag_id: int = Field(foreign_key="tags.id", primary_key=True)

class Tag(SQLModel, table=True):
    __tablename__ = "tags"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, max_length=50)
    user_id: str = Field(foreign_key="users.id", index=True)

    # Relationship
    tasks: List["Task"] = Relationship(
        back_populates="tags",
        link_model=TaskTagLink
    )

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200)
    user_id: str = Field(foreign_key="users.id", index=True)

    # Relationship
    tags: List[Tag] = Relationship(
        back_populates="tasks",
        link_model=TaskTagLink
    )
```

---

## Repository Pattern

### Base Repository

```python
# app/repositories/base.py
from sqlmodel import Session, select
from typing import Generic, TypeVar, Type, Optional, List
from sqlmodel import SQLModel

ModelType = TypeVar("ModelType", bound=SQLModel)

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], session: Session):
        self.model = model
        self.session = session

    def create(self, obj: ModelType) -> ModelType:
        self.session.add(obj)
        self.session.commit()
        self.session.refresh(obj)
        return obj

    def get_by_id(self, id: int) -> Optional[ModelType]:
        return self.session.get(self.model, id)

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        statement = select(self.model).offset(skip).limit(limit)
        return self.session.exec(statement).all()

    def update(self, obj: ModelType) -> ModelType:
        self.session.add(obj)
        self.session.commit()
        self.session.refresh(obj)
        return obj

    def delete(self, obj: ModelType) -> None:
        self.session.delete(obj)
        self.session.commit()
```

### Task Repository (User-Scoped)

```python
# app/repositories/task_repository.py
from sqlmodel import Session, select, and_
from typing import Optional, List
from datetime import datetime

from app.models.task import Task, TaskStatus
from app.repositories.base import BaseRepository

class TaskRepository(BaseRepository[Task]):
    def __init__(self, session: Session):
        super().__init__(Task, session)

    def get_by_user(
        self,
        user_id: str,
        status: Optional[TaskStatus] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Task]:
        """
        Get tasks for a specific user with optional filtering.
        """
        conditions = [Task.user_id == user_id, Task.deleted_at.is_(None)]

        if status:
            conditions.append(Task.status == status)

        statement = (
            select(Task)
            .where(and_(*conditions))
            .order_by(Task.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        return self.session.exec(statement).all()

    def get_by_id_and_user(
        self,
        task_id: int,
        user_id: str
    ) -> Optional[Task]:
        """
        Get task by ID, ensuring it belongs to the user.
        """
        statement = select(Task).where(
            and_(
                Task.id == task_id,
                Task.user_id == user_id,
                Task.deleted_at.is_(None)
            )
        )
        return self.session.exec(statement).first()

    def count_by_user(self, user_id: str) -> int:
        """
        Count tasks for a user.
        """
        statement = select(Task).where(
            and_(
                Task.user_id == user_id,
                Task.deleted_at.is_(None)
            )
        )
        return len(self.session.exec(statement).all())

    def create_for_user(self, task: Task, user_id: str) -> Task:
        """
        Create task with user_id enforcement.
        """
        task.user_id = user_id
        task.created_at = datetime.utcnow()
        task.updated_at = datetime.utcnow()
        return self.create(task)

    def soft_delete(self, task: Task) -> None:
        """
        Soft delete (mark as deleted instead of removing).
        """
        task.deleted_at = datetime.utcnow()
        self.session.commit()
```

---

## Query Patterns

### Simple Queries

```python
from sqlmodel import Session, select

def get_task(db: Session, task_id: int, user_id: str):
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == user_id
    )
    return db.exec(statement).first()
```

### Filtering

```python
def get_tasks_by_status(db: Session, user_id: str, status: str):
    statement = select(Task).where(
        Task.user_id == user_id,
        Task.status == status
    ).order_by(Task.created_at.desc())

    return db.exec(statement).all()
```

### Pagination

```python
def get_tasks_paginated(
    db: Session,
    user_id: str,
    page: int = 1,
    per_page: int = 10
):
    skip = (page - 1) * per_page

    statement = (
        select(Task)
        .where(Task.user_id == user_id)
        .order_by(Task.created_at.desc())
        .offset(skip)
        .limit(per_page)
    )

    tasks = db.exec(statement).all()

    # Count total
    count_statement = select(Task).where(Task.user_id == user_id)
    total = len(db.exec(count_statement).all())

    return tasks, total
```

### Joins and Relationships

```python
def get_tasks_with_tags(db: Session, user_id: str):
    statement = (
        select(Task)
        .where(Task.user_id == user_id)
        .options(selectinload(Task.tags))
    )
    return db.exec(statement).all()
```

---

## Migrations with Alembic

### Initial Setup

```bash
# Install Alembic
pip install alembic

# Initialize Alembic
alembic init alembic
```

### Configuration

```python
# alembic/env.py
from sqlmodel import SQLModel
from app.models.task import Task
from app.models.user import User
from app.core.config import settings

# Set target metadata
target_metadata = SQLModel.metadata

# Set database URL
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
```

### Create Migration

```bash
# Auto-generate migration from models
alembic revision --autogenerate -m "Create tasks table"

# Create empty migration (for data migrations)
alembic revision -m "Add default priorities"
```

### Run Migrations

```bash
# Apply all pending migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Show current version
alembic current

# Show migration history
alembic history
```

---

## Data Isolation Patterns

### Service Layer with User Scope

```python
# app/services/task_service.py
from sqlmodel import Session
from typing import List, Optional

from app.repositories.task_repository import TaskRepository
from app.models.task import Task
from app.models.schemas.task import TaskCreate, TaskUpdate

class TaskService:
    def __init__(self, db: Session):
        self.repository = TaskRepository(db)

    def get_tasks(
        self,
        user_id: str,
        status: Optional[str] = None,
        page: int = 1,
        per_page: int = 10
    ) -> tuple[List[Task], int]:
        """
        Get tasks for user with pagination.
        """
        tasks = self.repository.get_by_user(
            user_id=user_id,
            status=status,
            skip=(page - 1) * per_page,
            limit=per_page
        )

        total = self.repository.count_by_user(user_id)

        return tasks, total

    def get_task(self, task_id: int, user_id: str) -> Optional[Task]:
        """
        Get task ensuring ownership.
        """
        return self.repository.get_by_id_and_user(task_id, user_id)

    def create_task(self, data: TaskCreate, user_id: str) -> Task:
        """
        Create task for user.
        """
        task = Task(**data.dict(), user_id=user_id)
        return self.repository.create_for_user(task, user_id)

    def update_task(
        self,
        task_id: int,
        data: TaskUpdate,
        user_id: str
    ) -> Optional[Task]:
        """
        Update task ensuring ownership.
        """
        task = self.repository.get_by_id_and_user(task_id, user_id)

        if not task:
            return None

        # Update only provided fields
        for key, value in data.dict(exclude_unset=True).items():
            setattr(task, key, value)

        task.updated_at = datetime.utcnow()

        return self.repository.update(task)

    def delete_task(self, task_id: int, user_id: str) -> bool:
        """
        Delete task ensuring ownership.
        """
        task = self.repository.get_by_id_and_user(task_id, user_id)

        if not task:
            return False

        self.repository.soft_delete(task)
        return True
```

---

## Best Practices Summary

### Connection Management

✅ **DO**:
- Use connection pooling
- Create sessions per request
- Close sessions in finally blocks
- Set pool_recycle for Neon
- Use pool_pre_ping for health checks

❌ **DON'T**:
- Create global sessions
- Keep connections open indefinitely
- Forget to close sessions
- Use large pool sizes in serverless

### Schema Design

✅ **DO**:
- Add indexes on foreign keys
- Add indexes on frequently queried columns
- Use appropriate column types
- Set max_length on strings
- Include timestamps (created_at, updated_at)
- Use soft deletes (deleted_at)

❌ **DON'T**:
- Skip indexes on filtered columns
- Use TEXT for everything
- Forget user_id indexes
- Omit constraints

### Data Isolation

✅ **DO**:
- Always filter by user_id
- Check ownership on updates/deletes
- Use user-scoped repositories
- Validate access in service layer

❌ **DON'T**:
- Query without user_id filter
- Trust client-provided user_id
- Skip ownership checks
- Expose other users' data

### Query Optimization

✅ **DO**:
- Use pagination for large result sets
- Add indexes for common queries
- Use select() for type-safe queries
- Eager load relationships when needed

❌ **DON'T**:
- Return entire tables
- Perform N+1 queries
- Skip indexes
- Lazy load in loops

---

## Quick Reference

### Model Definition

```python
class MyModel(SQLModel, table=True):
    __tablename__ = "my_table"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

### Query Patterns

```python
# Get one
task = session.exec(select(Task).where(Task.id == id)).first()

# Get many
tasks = session.exec(select(Task).where(Task.user_id == user_id)).all()

# With filter
tasks = session.exec(
    select(Task)
    .where(Task.user_id == user_id, Task.status == "todo")
    .order_by(Task.created_at.desc())
).all()
```

### Session Usage

```python
with Session(engine) as session:
    task = Task(title="Test", user_id=user_id)
    session.add(task)
    session.commit()
    session.refresh(task)
```

---

## References

See `references/` for detailed documentation:
- `sqlmodel-patterns.md` - Advanced SQLModel patterns and examples
- `query-optimization.md` - Query performance and optimization
- `migration-guide.md` - Database migration strategies
- `data-isolation.md` - User-scoping and security patterns
