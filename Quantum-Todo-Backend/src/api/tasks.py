from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from ..db.session import get_session
from ..services.task_service import TaskService
from ..services.recurring_tasks_service import RecurringTaskService
from ..schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse, TaskCompleteResponse
from ..middleware.auth import get_current_user_id
from uuid import UUID
from typing import Optional, List

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreate,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    user_id = UUID(current_user_id)
    task = TaskService.create_task(session, user_id, task_data)

    # Refresh the task to ensure tags are loaded
    session.refresh(task)

    # Create TaskResponse manually to ensure proper tag serialization
    # Now task.tags is a JSON array of strings directly
    tag_names = task.tags if task.tags is not None else []
    due_date_value = task.due_date if task.due_date is not None else None
    recurrence_pattern_value = task.recurrence_pattern if task.recurrence_pattern is not None else None

    task_response = TaskResponse(
        id=task.id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        priority=task.priority,
        due_date=due_date_value,
        is_recurring=task.is_recurring,
        recurrence_pattern=recurrence_pattern_value,
        tags=tag_names,
        created_at=task.created_at,
        updated_at=task.updated_at
    )

    return task_response

@router.get("/", response_model=TaskListResponse)
def get_tasks(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    completed: Optional[bool] = None,
    priority: Optional[str] = None,
    tag: Optional[str] = None,
    sort: Optional[str] = None,
    order: Optional[str] = None,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    user_id = UUID(current_user_id)
    tasks, total = TaskService.get_tasks_with_total(
        session, user_id, skip, limit,
        search=search, completed=completed,
        priority=priority, tag=tag,
        sort_field=sort, sort_order=order
    )

    # Prepare response with proper tag serialization
    task_responses = []
    for task in tasks:
        # Get tag names from the task's tags field (now a JSON array of strings)
        tag_names = task.tags if task.tags else []

        # Create TaskResponse manually to ensure proper tag serialization
        task_response = TaskResponse(
            id=task.id,
            user_id=task.user_id,
            title=task.title,
            description=task.description,
            completed=task.completed,
            priority=task.priority,
            due_date=task.due_date,
            is_recurring=task.is_recurring,
            recurrence_pattern=task.recurrence_pattern,
            tags=tag_names,
            created_at=task.created_at,
            updated_at=task.updated_at
        )
        task_responses.append(task_response)

    return TaskListResponse(tasks=task_responses, total=total)

@router.get("/{id}", response_model=TaskResponse)
def get_task(
    id: UUID,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    user_id = UUID(current_user_id)
    task = TaskService.get_task_by_id(session, id, user_id)

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    # Create TaskResponse manually to ensure proper tag serialization
    # Now task.tags is a JSON array of strings directly
    tag_names = task.tags if task.tags is not None else []
    due_date_value = task.due_date if task.due_date is not None else None
    recurrence_pattern_value = task.recurrence_pattern if task.recurrence_pattern is not None else None

    task_response = TaskResponse(
        id=task.id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        priority=task.priority,
        due_date=due_date_value,
        is_recurring=task.is_recurring,
        recurrence_pattern=recurrence_pattern_value,
        tags=tag_names,
        created_at=task.created_at,
        updated_at=task.updated_at
    )

    return task_response

@router.put("/{id}", response_model=TaskResponse)
def update_task(
    id: UUID,
    task_data: TaskUpdate,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    user_id = UUID(current_user_id)
    updated_task = TaskService.update_task(session, id, user_id, task_data)

    if not updated_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    # Create TaskResponse manually to ensure proper tag serialization
    # Now updated_task.tags is a JSON array of strings directly
    tag_names = updated_task.tags if updated_task.tags else []

    task_response = TaskResponse(
        id=updated_task.id,
        user_id=updated_task.user_id,
        title=updated_task.title,
        description=updated_task.description,
        completed=updated_task.completed,
        priority=updated_task.priority,
        due_date=updated_task.due_date,
        is_recurring=updated_task.is_recurring,
        recurrence_pattern=updated_task.recurrence_pattern,
        tags=tag_names,
        created_at=updated_task.created_at,
        updated_at=updated_task.updated_at
    )

    return task_response

@router.patch("/{id}", response_model=TaskResponse)
def partial_update_task(
    id: UUID,
    task_data: TaskUpdate,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    user_id = UUID(current_user_id)
    updated_task = TaskService.update_task(session, id, user_id, task_data)

    if not updated_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    # Create TaskResponse manually to ensure proper tag serialization
    # Now updated_task.tags is a JSON array of strings directly
    tag_names = updated_task.tags if updated_task.tags else []

    task_response = TaskResponse(
        id=updated_task.id,
        user_id=updated_task.user_id,
        title=updated_task.title,
        description=updated_task.description,
        completed=updated_task.completed,
        priority=updated_task.priority,
        due_date=updated_task.due_date,
        is_recurring=updated_task.is_recurring,
        recurrence_pattern=updated_task.recurrence_pattern,
        tags=tag_names,
        created_at=updated_task.created_at,
        updated_at=updated_task.updated_at
    )

    return task_response

@router.delete("/{id}")
def delete_task(
    id: UUID,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    user_id = UUID(current_user_id)
    success = TaskService.delete_task(session, id, user_id)

    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    return {"message": "Task deleted successfully"}


@router.post("/{id}/tags/{tag_name}")
def add_tag_to_task(
    id: UUID,
    tag_name: str,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    user_id = UUID(current_user_id)
    success = TaskService.add_tag_to_task(session, id, tag_name, user_id)

    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found, or access denied")

    return {"message": "Tag added to task successfully"}


@router.delete("/{id}/tags/{tag_name}")
def remove_tag_from_task(
    id: UUID,
    tag_name: str,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    user_id = UUID(current_user_id)
    success = TaskService.remove_tag_from_task(session, id, tag_name, user_id)

    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found, or tag doesn't exist on task")

    return {"message": "Tag removed from task successfully"}


@router.get("/{id}/tags", response_model=List[str])
def get_tags_for_task(
    id: UUID,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    user_id = UUID(current_user_id)
    tag_names = TaskService.get_tags_for_task(session, id, user_id)

    return tag_names


@router.patch("/{id}/complete", response_model=TaskCompleteResponse)
def complete_task(
    id: UUID,
    completed: bool = None,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Mark a task as completed/incompleted.

    Query Parameters:
    - completed: Boolean indicating the new completion status (required)
    """
    try:
        if completed is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Parameter 'completed' is required")

        user_id = UUID(current_user_id)

        # Check if the original task is recurring before updating
        original_task = TaskService.get_task_by_id(session, id, user_id)
        if not original_task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

        # Remember if this was a recurring task before update
        was_recurring = original_task.is_recurring and original_task.recurrence_pattern
        was_not_completed = not original_task.completed
        is_being_completed = completed

        # Create a TaskUpdate object with just the completed status
        task_update_data = TaskUpdate(completed=completed)

        # This will update the task and handle recurring task creation if needed
        # (via the logic already in TaskService.update_task)
        updated_task = TaskService.update_task(session, id, user_id, task_update_data)

        if not updated_task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

        # Create TaskResponse for the updated task
        tag_names = updated_task.tags if updated_task.tags else []
        updated_task_response = TaskResponse(
            id=updated_task.id,
            user_id=updated_task.user_id,
            title=updated_task.title,
            description=updated_task.description,
            completed=updated_task.completed,
            priority=updated_task.priority,
            due_date=updated_task.due_date,
            is_recurring=updated_task.is_recurring,
            recurrence_pattern=updated_task.recurrence_pattern,
            tags=tag_names,
            created_at=updated_task.created_at,
            updated_at=updated_task.updated_at
        )

        # Find the new recurring task if one was created
        # We need to find the most recently created task with the same title
        # that was created after the original task was updated
        new_task_response = None
        if was_recurring and is_being_completed and was_not_completed:
            try:
                from sqlmodel import select
                from ..models.task import Task

                # Query for the most recently created task for this user with the same title
                # that is not the same task ID and is not completed (the new recurring one)
                new_task = session.exec(
                    select(Task)
                    .where(Task.user_id == user_id)
                    .where(Task.title == original_task.title)
                    .where(Task.id != original_task.id)
                    .where(Task.created_at > original_task.updated_at)
                    .where(Task.completed == False)
                    .order_by(Task.created_at.desc())
                    .limit(1)
                ).first()

                if new_task:
                    # Create TaskResponse for the new recurring task
                    new_task_tag_names = new_task.tags if new_task.tags else []
                    new_task_response = TaskResponse(
                        id=new_task.id,
                        user_id=new_task.user_id,
                        title=new_task.title,
                        description=new_task.description,
                        completed=new_task.completed,
                        priority=new_task.priority,
                        due_date=new_task.due_date,
                        is_recurring=new_task.is_recurring,
                        recurrence_pattern=new_task.recurrence_pattern,
                        tags=new_task_tag_names,
                        created_at=new_task.created_at,
                        updated_at=new_task.updated_at
                    )
            except Exception as e:
                # Log the error but don't fail the completion of the original task
                print(f"Error retrieving new recurring task: {str(e)}")
                # Continue with just the completed task

        # Return both the updated task and the new recurring task (if any)
        return TaskCompleteResponse(
            task=updated_task_response,
            new_task=new_task_response
        )
    except HTTPException:
        # Re-raise HTTP exceptions as they are
        raise
    except Exception as e:
        # Log the unexpected error and raise a 500
        print(f"Unexpected error in complete_task: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
### TASK REMINDER LOGIC INTEGRATED ###
