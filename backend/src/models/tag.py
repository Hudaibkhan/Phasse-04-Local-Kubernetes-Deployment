from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List
from .task_tag import TaskTagLink
from uuid import UUID, uuid4
import sqlalchemy.dialects.postgresql as pg
from enum import Enum


class TagBase(SQLModel):
    name: str = Field(min_length=1, max_length=50)
    color: Optional[str] = Field(default="gray", max_length=20)  # Color for UI display


class Tag(TagBase, table=True):
    __tablename__ = "tags"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    name: str = Field(min_length=1, max_length=50)
    color: str = Field(default="gray", max_length=20)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationship
    user: "User" = Relationship(back_populates="tags")
    # Remove the tasks relationship since tags are now stored directly in the tasks table as JSON


class TagCreate(TagBase):
    name: str = Field(min_length=1, max_length=50)


class TagUpdate(SQLModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=50)
    color: Optional[str] = Field(default=None, max_length=20)


class TagRead(TagBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True