"""
MCP tool for marking a task as complete.
Delegates to TaskService.update_task for business logic.
Handles recurring task creation automatically.

This tool provides a stateless interface for AI agents to complete tasks
while automatically handling recurring task logic (creating next occurrence).
"""
from uuid import UUID
from typing import Dict, Any
from ...db.session import SessionLocal
from ...services.task_service import TaskService
from ...schemas.task import TaskUpdate as TaskUpdateSchema
from ..schemas import CompleteTaskInput, TaskOutput


def complete_task(input_data: CompleteTaskInput) -> Dict[str, Any]:
    """
    Mark a task as completed for a user.

    This tool marks a task as complete and automatically handles recurring
    task logic. If the task is recurring, a new occurrence will be created
    with the next due date based on the recurrence pattern (daily, weekly, etc.).

    Args:
        input_data: CompleteTaskInput containing:
            - user_id (UUID): The user who owns the task
            - task_id (UUID): The task to mark as complete

    Returns:
        Dict containing:
            - task_id (str): UUID of the completed task
            - status (str): "completed"
            - title (str): Task title
            - completed (bool): Always True

        On error:
            - error (bool): True
            - message (str): Error description
            - status (str): "not_found" or "error"

    Raises:
        Exception: If task completion fails (database error, etc.)

    Notes:
        - User ownership is enforced - users can only complete their own tasks
        - If task not found or access denied, returns error response
        - Recurring tasks automatically create next occurrence
        - Original task is marked complete, new task is created as pending

    Example:
        >>> input_data = CompleteTaskInput(
        ...     user_id=UUID("..."),
        ...     task_id=UUID("...")
        ... )
        >>> result = complete_task(input_data)
        >>> print(result["status"])
        completed
    """
    try:
        with SessionLocal() as session:
            # Convert MCP input to TaskUpdateSchema
            task_update = TaskUpdateSchema(
                completed=True
            )

            # Delegate to TaskService (enforces user ownership and handles recurring tasks)
            task = TaskService.update_task(
                session=session,
                task_id=input_data.task_id,
                user_id=input_data.user_id,
                task_data=task_update
            )

            if not task:
                return {
                    "error": True,
                    "message": "Task not found or access denied",
                    "status": "not_found"
                }

            # Convert to MCP output format
            output = TaskOutput(
                task_id=task.id,
                status="completed",
                title=task.title,
                completed=task.completed
            )

            return output.model_dump(mode='json')

    except Exception as e:
        # Return structured error response
        return {
            "error": True,
            "message": f"Failed to complete task: {str(e)}",
            "status": "error"
        }
