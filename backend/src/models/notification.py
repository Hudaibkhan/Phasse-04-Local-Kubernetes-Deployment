from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field
from enum import Enum


class NotificationType(str, Enum):
    TASK_REMINDER = "TASK_REMINDER"
    TASK_DUE_SOON = "TASK_DUE_SOON"
    TASK_OVERDUE = "TASK_OVERDUE"
    RECURRING_TASK_CREATED = "RECURRING_TASK_CREATED"


class Notification(SQLModel, table=True):
    __tablename__ = "notifications"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(nullable=False, index=True)
    task_id: Optional[UUID] = Field(default=None)  # Not all notifications are tied to tasks
    type: NotificationType = Field(nullable=False)
    title: str = Field(max_length=200, nullable=False)
    message: str = Field(max_length=1000, nullable=False)
    due_date: Optional[datetime] = Field(default=None)  # The task's due date
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class NotificationCreate(SQLModel):
    type: NotificationType
    title: str = Field(max_length=200)
    message: str = Field(max_length=1000)
    task_id: Optional[UUID] = None
    due_date: Optional[datetime] = None


class NotificationUpdate(SQLModel):
    pass  # No fields for update since we don't have is_read functionality


class NotificationRead(SQLModel):
    id: UUID
    user_id: UUID
    task_id: Optional[UUID]
    type: NotificationType
    title: str
    message: str
    due_date: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True