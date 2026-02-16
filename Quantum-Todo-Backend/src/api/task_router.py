from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from sqlmodel import Session
from backend.src.models.task_model import TaskCreate, TaskUpdate, TaskPublic
from backend.src.services.task_service import TaskService
from backend.src.database.database import get_session
from uuid import UUID
from backend.src.schemas.task import TaskUpdate as TaskUpdateSchema

router = APIRouter(prefix="/tasks", tags=["tasks"])
task_service = TaskService()


@router.post("/", response_model=TaskPublic, status_code=201)
def create_task(
    *,
    task_data: TaskCreate,
    current_user_id: UUID = Depends(get_current_user_id),  # Assuming authentication function exists
    db_session: Session = Depends(get_session)
) -> TaskPublic:
    """
    Create a new task with enhanced metadata fields.

    Request body should include:
    - title (required, max 255 characters)
    - description (optional, max 1000 characters)
    - priority (optional, one of: 'low', 'medium', 'high')
    - due_date (optional, ISO 8601 datetime string)
    - tags (optional, array of strings, max 10 tags)
    - recurrence_pattern (optional, string)
    """
    try:
        # Convert UUID to int for user_id (assuming the existing system uses integers for user IDs)
        user_id_int = int(str(current_user_id)[:10])  # Simplified conversion - adjust as needed

        created_task = task_service.create_task(
            session=db_session,
            user_id=user_id_int,
            task_data=task_data
        )
        return created_task
    except ValueError as e:
        raise HTTPException(status_code=422, detail=f"Validation error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/", response_model=dict)  # Using dict since we need both tasks and total count
def get_tasks(
    *,
    current_user_id: UUID = Depends(get_current_user_id),
    db_session: Session = Depends(get_session),
    completed: Optional[bool] = Query(None, description="Filter by completion status"),
    priority: Optional[str] = Query(None, description="Filter by priority level"),
    due_before: Optional[datetime] = Query(None, description="Filter tasks due before this date"),
    tag: Optional[str] = Query(None, description="Filter by specific tag"),
    limit: int = Query(50, ge=1, le=100, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Number of results to skip")
) -> dict:
    """
    Retrieve all tasks for the authenticated user with optional filtering.

    Query parameters:
    - completed: Filter by completion status
    - priority: Filter by priority level (low, medium, high)
    - due_before: Filter tasks due before this date (ISO 8601 format)
    - tag: Filter by specific tag
    - limit: Number of results to return (default: 50, max: 100)
    - offset: Number of results to skip (default: 0)
    """
    try:
        # Convert UUID to int for user_id
        user_id_int = int(str(current_user_id)[:10])

        # Use the existing get_tasks_with_total method instead of the non-existent get_tasks_by_user
        tasks, total_count = task_service.get_tasks_with_total(
            session=db_session,
            user_id=user_id_int,
            skip=offset,
            limit=limit,
            completed=completed,
            priority=priority,
            tag=tag
        )

        return {
            "tasks": tasks,
            "total": total_count,
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{task_id}", response_model=TaskPublic)
def get_task(
    *,
    task_id: int,
    current_user_id: UUID = Depends(get_current_user_id),
    db_session: Session = Depends(get_session)
) -> TaskPublic:
    """
    Retrieve a specific task by its ID.
    """
    try:
        # Convert UUID to int for user_id
        user_id_int = int(str(current_user_id)[:10])

        task = task_service.get_task_by_id(
            db_session=db_session,
            task_id=task_id,
            user_id=user_id_int
        )

        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        return task
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.put("/{task_id}", response_model=TaskPublic)
def update_task(
    *,
    task_id: int,
    task_data: TaskUpdate,
    current_user_id: UUID = Depends(get_current_user_id),
    db_session: Session = Depends(get_session)
) -> TaskPublic:
    """
    Update an existing task with new data.

    Request body can include any of the following fields:
    - title (optional, max 255 characters)
    - description (optional, max 1000 characters)
    - priority (optional, one of: 'low', 'medium', 'high')
    - due_date (optional, ISO 8601 datetime string)
    - tags (optional, array of strings, max 10 tags)
    - recurrence_pattern (optional, string)
    - completed (optional, boolean)
    """
    try:
        # Convert UUID to int for user_id
        user_id_int = int(str(current_user_id)[:10])

        updated_task = task_service.update_task(
            session=db_session,
            task_id=task_id,
            user_id=user_id_int,
            task_data=task_data
        )

        if not updated_task:
            raise HTTPException(status_code=404, detail="Task not found")

        return updated_task
    except ValueError as e:
        raise HTTPException(status_code=422, detail=f"Validation error: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.patch("/{task_id}/complete", response_model=TaskPublic)
def patch_task_completion(
    *,
    task_id: int,
    completed: bool = Query(..., description="New completion status"),
    current_user_id: UUID = Depends(get_current_user_id),
    db_session: Session = Depends(get_session)
) -> TaskPublic:
    """
    Toggle the completion status of a task.

    Query parameters:
    - completed: New completion status (required)
    """
    try:
        # Convert UUID to int for user_id
        user_id_int = int(str(current_user_id)[:10])

        # Import TaskService to handle the update
        from backend.src.services.task_service import TaskService
        from backend.src.schemas.task import TaskUpdate

        # Create task update data
        task_update_data = TaskUpdate(completed=completed)

        # Update the task using the existing update_task method
        updated_task = TaskService.update_task(
            session=db_session,
            task_id=task_id,
            user_id=user_id_int,
            task_data=task_update_data
        )

        if not updated_task:
            raise HTTPException(status_code=404, detail="Task not found")

        return updated_task
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/{task_id}", status_code=204)
def delete_task(
    *,
    task_id: int,
    current_user_id: UUID = Depends(get_current_user_id),
    db_session: Session = Depends(get_session)
):
    """
    Delete a task permanently.
    """
    try:
        # Convert UUID to int for user_id
        user_id_int = int(str(current_user_id)[:10])

        success = task_service.delete_task(
            session=db_session,
            task_id=task_id,
            user_id=user_id_int
        )

        if not success:
            raise HTTPException(status_code=404, detail="Task not found")

        return None  # 204 No Content
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


from ..middleware.auth import get_current_user_id