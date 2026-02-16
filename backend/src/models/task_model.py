from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, DateTime, Boolean, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB


class TaskBase(SQLModel):
    """Base class containing shared fields for Task."""
    title: str = Field(sa_column=Column(String(255), nullable=False))
    description: Optional[str] = Field(default=None, sa_column=Column(Text))
    completed: bool = Field(default=False, sa_column=Column(Boolean, default=False))
    priority: Optional[str] = Field(
        default=None,
        sa_column=Column(String(20), check_constraint="priority IN ('low', 'medium', 'high')")
    )
    due_date: Optional[datetime] = Field(default=None, sa_column=Column(DateTime(timezone=True)))
    tags: Optional[List[str]] = Field(default=None, sa_column=Column(JSONB))
    recurrence_pattern: Optional[str] = Field(default=None, sa_column=Column(String(50)))


class Task(TaskBase, table=True):
    """Task model with all required fields and relationships."""
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True, sa_column=Column(Integer, primary_key=True))
    user_id: int = Field(sa_column=Column(Integer, nullable=False))

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True), default=datetime.utcnow))
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True), default=datetime.utcnow))


class TaskCreate(TaskBase):
    """Schema for creating a new task."""
    title: str = Field(sa_column=Column(String(255), nullable=False))


class TaskUpdate(TaskBase):
    """Schema for updating an existing task."""
    title: Optional[str] = Field(default=None, sa_column=Column(String(255), nullable=True))
    description: Optional[str] = Field(default=None, sa_column=Column(Text))


class TaskPublic(TaskBase):
    """Public schema for returning task data."""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime