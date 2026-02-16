"""
Pydantic schemas for MCP tool input/output validation.
"""
from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional, List
from datetime import datetime

# ============================================================================
# Input Schemas
# ============================================================================

class AddTaskInput(BaseModel):
    """Input schema for add_task tool."""
    user_id: UUID = Field(..., description="UUID of the user creating the task")
    title: str = Field(..., min_length=1, max_length=200, description="Task title")
    description: Optional[str] = Field(None, max_length=1000, description="Optional task description")

class ListTasksInput(BaseModel):
    """Input schema for list_tasks tool."""
    user_id: UUID = Field(..., description="UUID of the user whose tasks to retrieve")
    status: Optional[str] = Field("all", description="Filter by status: all, pending, or completed")
    search: Optional[str] = Field(None, description="Optional search term to filter tasks by title or description")

class CompleteTaskInput(BaseModel):
    """Input schema for complete_task tool."""
    user_id: UUID = Field(..., description="UUID of the user who owns the task")
    task_id: UUID = Field(..., description="UUID of the task to complete")

class UpdateTaskInput(BaseModel):
    """Input schema for update_task tool."""
    user_id: UUID = Field(..., description="UUID of the user who owns the task")
    task_id: UUID = Field(..., description="UUID of the task to update")
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="New task title")
    description: Optional[str] = Field(None, max_length=1000, description="New task description")

class DeleteTaskInput(BaseModel):
    """Input schema for delete_task tool."""
    user_id: UUID = Field(..., description="UUID of the user who owns the task")
    task_id: UUID = Field(..., description="UUID of the task to delete")

# ============================================================================
# Output Schemas
# ============================================================================

class TaskOutput(BaseModel):
    """Output schema for task operations."""
    task_id: UUID = Field(..., description="UUID of the task")
    status: str = Field(..., description="Current status of the task")
    title: str = Field(..., description="Title of the task")
    completed: Optional[bool] = Field(None, description="Whether the task is completed")

    class Config:
        json_encoders = {
            UUID: str  # Serialize UUIDs as strings
        }

class TaskDetail(BaseModel):
    """Detailed task information for list operations."""
    task_id: UUID
    title: str
    description: Optional[str] = None
    status: str
    completed: bool
    created_at: datetime
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    is_recurring: Optional[bool] = None
    tags: Optional[List[str]] = None

    class Config:
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat()
        }

class ListTasksOutput(BaseModel):
    """Output schema for list_tasks tool."""
    tasks: List[TaskDetail] = Field(..., description="Array of task objects")
    count: int = Field(..., description="Total number of tasks returned")

    class Config:
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat()
        }

class DeleteTaskOutput(BaseModel):
    """Output schema for delete_task tool."""
    task_id: UUID = Field(..., description="UUID of the deleted task")
    status: str = Field(..., description="Status indicating successful deletion")
    message: str = Field(..., description="Confirmation message")

    class Config:
        json_encoders = {
            UUID: str
        }
