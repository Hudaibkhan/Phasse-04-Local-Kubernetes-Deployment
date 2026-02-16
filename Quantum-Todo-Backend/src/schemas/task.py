from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from enum import Enum

class PriorityEnum(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    completed: Optional[bool] = False
    priority: Optional[str] = "Medium"  # Use string instead of enum to handle lowercase values
    due_date: Optional[datetime] = None
    is_recurring: Optional[bool] = False
    recurrence_pattern: Optional[str] = None
    tags: Optional[List[str]] = []  # List of tag names to associate with the task

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None  # Use string instead of enum to handle lowercase values
    due_date: Optional[datetime] = None
    is_recurring: Optional[bool] = None
    recurrence_pattern: Optional[str] = None
    tags: Optional[List[str]] = None  # List of tag names to associate with the task

class TaskResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    completed: bool
    priority: str  # Use string instead of enum to handle consistent values
    due_date: Optional[datetime] = None
    is_recurring: bool
    recurrence_pattern: Optional[str] = None
    tags: List[str] = []  # List of tag names associated with the task
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        # Allow population by field name even if it doesn't match exactly
        populate_by_name = True

class TaskListResponse(BaseModel):
    tasks: list[TaskResponse]
    total: int

class TaskCompleteResponse(BaseModel):
    task: TaskResponse
    new_task: Optional[TaskResponse] = None

    class Config:
        from_attributes = True
        populate_by_name = True
