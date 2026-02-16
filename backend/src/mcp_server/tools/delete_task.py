"""
MCP tool for deleting a task.
Delegates to TaskService.delete_task for business logic.

This tool provides a stateless interface for AI agents to permanently
remove tasks while enforcing user ownership and data isolation.
"""
from uuid import UUID
from typing import Dict, Any
from ...db.session import SessionLocal
from ...services.task_service import TaskService
from ..schemas import DeleteTaskInput, DeleteTaskOutput


def delete_task(input_data: DeleteTaskInput) -> Dict[str, Any]:
    """
    Delete a task for a user.

    This tool permanently removes a task from the database. The operation
    is irreversible - deleted tasks cannot be recovered. Use with caution.

    Args:
        input_data: DeleteTaskInput containing:
            - user_id (UUID): The user who owns the task
            - task_id (UUID): The task to delete

    Returns:
        Dict containing:
            - task_id (str): UUID of the deleted task
            - status (str): "deleted"
            - message (str): Confirmation message

        On error:
            - error (bool): True
            - message (str): Error description
            - status (str): "not_found" or "error"

    Raises:
        Exception: If task deletion fails (database error, etc.)

    Notes:
        - User ownership is enforced - users can only delete their own tasks
        - If task not found or access denied, returns error response
        - Deletion is permanent and cannot be undone
        - Related notifications may be affected (check notification service)

    Example:
        >>> input_data = DeleteTaskInput(
        ...     user_id=UUID("..."),
        ...     task_id=UUID("...")
        ... )
        >>> result = delete_task(input_data)
        >>> print(result["message"])
        Task a1b2c3d4-... successfully deleted
    """
    try:
        with SessionLocal() as session:
            # Delegate to TaskService (enforces user ownership)
            success = TaskService.delete_task(
                session=session,
                task_id=input_data.task_id,
                user_id=input_data.user_id
            )

            if not success:
                return {
                    "error": True,
                    "message": "Task not found or access denied",
                    "status": "not_found"
                }

            # Convert to MCP output format
            output = DeleteTaskOutput(
                task_id=input_data.task_id,
                status="deleted",
                message=f"Task {input_data.task_id} successfully deleted"
            )

            return output.model_dump(mode='json')

    except Exception as e:
        # Return structured error response
        return {
            "error": True,
            "message": f"Failed to delete task: {str(e)}",
            "status": "error"
        }
