"""
MCP tool for updating task title and/or description.
Delegates to TaskService.update_task for business logic.

This tool provides a stateless interface for AI agents to modify task
details while enforcing user ownership and data isolation.
"""
from uuid import UUID
from typing import Dict, Any
from ...db.session import SessionLocal
from ...services.task_service import TaskService
from ...schemas.task import TaskUpdate as TaskUpdateSchema
from ..schemas import UpdateTaskInput, TaskOutput


def update_task(input_data: UpdateTaskInput) -> Dict[str, Any]:
    """
    Update a task's title and/or description for a user.

    This tool allows partial updates - you can update just the title,
    just the description, or both. At least one field must be provided.
    Other task properties (completed, priority, due_date) are not modified.

    Args:
        input_data: UpdateTaskInput containing:
            - user_id (UUID): The user who owns the task
            - task_id (UUID): The task to update
            - title (str, optional): New task title (1-200 characters)
            - description (str, optional): New task description (max 1000 characters)

    Returns:
        Dict containing:
            - task_id (str): UUID of the updated task
            - status (str): "updated"
            - title (str): Current task title (after update)
            - completed (bool): Current completion status

        On error:
            - error (bool): True
            - message (str): Error description
            - status (str): "not_found", "invalid_input", or "error"

    Raises:
        Exception: If task update fails (database error, etc.)

    Notes:
        - User ownership is enforced - users can only update their own tasks
        - At least one field (title or description) must be provided
        - If task not found or access denied, returns error response
        - Partial updates are supported (update only what you need)

    Example:
        >>> # Update only title
        >>> input_data = UpdateTaskInput(
        ...     user_id=UUID("..."),
        ...     task_id=UUID("..."),
        ...     title="Updated Title"
        ... )
        >>> result = update_task(input_data)
        >>> print(result["status"])
        updated

        >>> # Update both title and description
        >>> input_data = UpdateTaskInput(
        ...     user_id=UUID("..."),
        ...     task_id=UUID("..."),
        ...     title="New Title",
        ...     description="New description"
        ... )
        >>> result = update_task(input_data)
    """
    try:
        with SessionLocal() as session:
            # Convert MCP input to TaskUpdateSchema (only include provided fields)
            update_data = {}
            if input_data.title is not None:
                update_data["title"] = input_data.title
            if input_data.description is not None:
                update_data["description"] = input_data.description

            # Ensure at least one field is being updated
            if not update_data:
                return {
                    "error": True,
                    "message": "No fields provided for update",
                    "status": "invalid_input"
                }

            task_update = TaskUpdateSchema(**update_data)

            # Delegate to TaskService (enforces user ownership)
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
                status="updated",
                title=task.title,
                completed=task.completed
            )

            return output.model_dump(mode='json')

    except Exception as e:
        # Return structured error response
        return {
            "error": True,
            "message": f"Failed to update task: {str(e)}",
            "status": "error"
        }
