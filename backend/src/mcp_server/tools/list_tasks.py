"""
MCP tool for listing tasks with optional status filtering.
Delegates to TaskService.get_tasks_with_total for business logic.

This tool provides a stateless interface for AI agents to retrieve tasks
with filtering capabilities while enforcing user ownership and data isolation.
"""
from uuid import UUID
from typing import Dict, Any, List
from ...db.session import SessionLocal
from ...services.task_service import TaskService
from ..schemas import ListTasksInput, ListTasksOutput, TaskDetail


def list_tasks(input_data: ListTasksInput) -> Dict[str, Any]:
    """
    List tasks for a user with optional status filtering and search.

    This tool retrieves tasks with comprehensive details including priority,
    due dates, recurring status, and tags. Results are ordered by creation
    date (newest first) and limited to 100 tasks per request.

    Args:
        input_data: ListTasksInput containing:
            - user_id (UUID): The user whose tasks to retrieve
            - status (str, optional): Filter by status
                - "all": Return all tasks (default)
                - "pending": Return only incomplete tasks
                - "completed": Return only completed tasks
            - search (str, optional): Search term to filter by title/description

    Returns:
        Dict containing:
            - tasks (List[Dict]): Array of task objects with full details
            - count (int): Number of tasks returned

        Each task object includes:
            - task_id (str): UUID of the task
            - title (str): Task title
            - description (str|None): Task description
            - status (str): "pending" or "completed"
            - completed (bool): Completion status
            - created_at (str): ISO 8601 timestamp
            - due_date (str|None): ISO 8601 timestamp
            - priority (str): "High", "Medium", or "Low"
            - is_recurring (bool): Whether task repeats
            - tags (List[str]): Associated tags

    Raises:
        Exception: If task retrieval fails (database error, invalid user, etc.)

    Example:
        >>> input_data = ListTasksInput(
        ...     user_id=UUID("..."),
        ...     status="pending",
        ...     search="BMW"
        ... )
        >>> result = list_tasks(input_data)
        >>> print(f"Found {result['count']} pending tasks matching 'BMW'")
        Found 2 pending tasks matching 'BMW'
    """
    try:
        with SessionLocal() as session:
            # Map status filter to completed boolean
            completed_filter = None
            if input_data.status == "completed":
                completed_filter = True
            elif input_data.status == "pending":
                completed_filter = False
            # "all" or None means no filter

            # Delegate to TaskService (enforces user ownership)
            tasks, total_count = TaskService.get_tasks_with_total(
                session=session,
                user_id=input_data.user_id,
                skip=0,
                limit=100,  # Default limit
                completed=completed_filter
            )

            # Apply search filter if provided
            if input_data.search:
                search_term = input_data.search.lower()
                tasks = [
                    task for task in tasks
                    if (search_term in task.title.lower()) or
                       (task.description and search_term in task.description.lower()) or
                       (task.tags and any(search_term in tag.lower() for tag in task.tags))
                ]

            # Convert to MCP output format
            task_details: List[TaskDetail] = []
            for task in tasks:
                task_detail = TaskDetail(
                    task_id=task.id,
                    title=task.title,
                    description=task.description,
                    status="completed" if task.completed else "pending",
                    completed=task.completed,
                    created_at=task.created_at,
                    due_date=task.due_date,
                    priority=task.priority,
                    is_recurring=task.is_recurring,
                    tags=task.tags if task.tags else []
                )
                task_details.append(task_detail)

            output = ListTasksOutput(
                tasks=task_details,
                count=len(task_details)
            )

            return output.model_dump(mode='json')

    except Exception as e:
        # Return structured error response
        return {
            "error": True,
            "message": f"Failed to list tasks: {str(e)}",
            "status": "error",
            "tasks": [],
            "count": 0
        }
