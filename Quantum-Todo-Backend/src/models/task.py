from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, TYPE_CHECKING, List
from .task_tag import TaskTagLink
from uuid import UUID, uuid4
import sqlalchemy.dialects.postgresql as pg
from enum import Enum

if TYPE_CHECKING:
    from backend.src.models.user import User
    from .tag import Tag

class PriorityEnum(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)

class Task(TaskBase, table=True):
    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    completed: bool = Field(default=False)
    priority: str = Field(default="Medium", max_length=20)
    due_date: Optional[datetime] = Field(default=None)
    is_recurring: bool = Field(default=False)
    recurrence_pattern: Optional[str] = Field(default=None, max_length=100)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships
    user: "User" = Relationship(back_populates="tasks")
    # Remove the relationship to tags table - store tags as JSON in the tasks table directly

    # Store tags as JSON array directly in the tasks table
    tags: Optional[List[str]] = Field(default=[], sa_type=pg.JSON)

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True

class TaskCreate(TaskBase):
    title: str = Field(min_length=1, max_length=200)
    completed: Optional[bool] = Field(default=False)
    priority: Optional[str] = Field(default="Medium")
    due_date: Optional[datetime] = Field(default=None)
    is_recurring: Optional[bool] = Field(default=False)
    recurrence_pattern: Optional[str] = Field(default=None, max_length=100)
    # Add tags field for creation (accepts tag names)
    tags: Optional[List[str]] = Field(default=[])
    # Add tag_ids field to accept tag IDs from frontend
    tag_ids: Optional[List[str]] = Field(default=[])

class TaskUpdate(SQLModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: Optional[bool] = Field(default=None)
    priority: Optional[str] = Field(default=None)
    due_date: Optional[datetime] = Field(default=None)
    is_recurring: Optional[bool] = Field(default=None)
    recurrence_pattern: Optional[str] = Field(default=None, max_length=100)
    # Add tags field for update
    tags: Optional[List[str]] = None

class TaskRead(TaskBase):
    id: UUID
    user_id: UUID
    completed: bool
    priority: str
    due_date: Optional[datetime] = None
    is_recurring: bool
    recurrence_pattern: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    # Include tags in the response
    tags: Optional[List[str]] = []

    class Config:
        from_attributes = True
