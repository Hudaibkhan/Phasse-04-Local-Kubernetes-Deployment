"""
MCP tool for adding a new task.
Delegates to TaskService.create_task for business logic.

This tool provides a stateless interface for AI agents to create tasks
while enforcing user ownership and maintaining data isolation.
"""
from uuid import UUID
from typing import Dict, Any
from datetime import datetime
from ...db.session import SessionLocal
from ...services.task_service import TaskService
from ...schemas.task import TaskCreate as TaskCreateSchema
from ..schemas import AddTaskInput, TaskOutput


def add_task(input_data: AddTaskInput) -> Dict[str, Any]:
    """
    Add a new task for a user (basic version).

    This tool creates a new task with default values (incomplete, medium priority)
    and delegates to the existing TaskService to maintain business logic consistency.

    Args:
        input_data: AddTaskInput containing:
            - user_id (UUID): The user creating the task
            - title (str): Task title (1-200 characters)
            - description (str, optional): Task description (max 1000 characters)

    Returns:
        Dict containing:
            - task_id (str): UUID of the created task
            - status (str): "created"
            - title (str): Task title
            - completed (bool): Always False for new tasks

    Raises:
        Exception: If task creation fails (database error, validation error, etc.)

    Example:
        >>> input_data = AddTaskInput(
        ...     user_id=UUID("..."),
        ...     title="Buy groceries",
        ...     description="Milk, eggs, bread"
        ... )
        >>> result = add_task(input_data)
        >>> print(result["task_id"])
        "a1b2c3d4-..."
    """
    try:
        with SessionLocal() as session:
            # Convert MCP input to TaskCreateSchema
            task_create = TaskCreateSchema(
                title=input_data.title,
                description=input_data.description,
                completed=False,  # New tasks are always incomplete
                priority="Medium",  # Default priority
                tags=[]  # Empty tags by default
            )

            # Delegate to TaskService (enforces user ownership)
            task = TaskService.create_task(
                session=session,
                user_id=input_data.user_id,
                task_data=task_create
            )

            # Convert to MCP output format
            output = TaskOutput(
                task_id=task.id,
                status="created",
                title=task.title,
                completed=task.completed
            )

            return output.model_dump(mode='json')

    except Exception as e:
        # Return structured error response
        return {
            "error": True,
            "message": f"Failed to create task: {str(e)}",
            "status": "error"
        }


def add_task_enhanced(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Add a new task with enhanced natural language parsing support.

    This enhanced version accepts additional fields extracted from natural language:
    - due_date: Parsed date string (YYYY-MM-DD)
    - tags: List of keywords/categories
    - priority: low/medium/high
    - is_recurring: Boolean for recurring tasks
    - recurrence_pattern: daily/weekly/monthly/yearly

    Args:
        input_data: Dict containing:
            - user_id (UUID): The user creating the task
            - title (str): Task title
            - description (str, optional): Task description
            - due_date (str, optional): Due date in YYYY-MM-DD format
            - tags (list, optional): List of tag strings
            - priority (str, optional): Priority level
            - is_recurring (bool, optional): Whether task recurs
            - recurrence_pattern (str, optional): Recurrence pattern

    Returns:
        Dict containing task details and status

    Example:
        >>> input_data = {
        ...     "user_id": UUID("..."),
        ...     "title": "Buy BMW",
        ...     "description": "buy bmw for drifting",
        ...     "due_date": "2027-01-01",
        ...     "tags": ["car", "black"],
        ...     "priority": "medium",
        ...     "is_recurring": False
        ... }
        >>> result = add_task_enhanced(input_data)
    """
    try:
        with SessionLocal() as session:
            # Parse due_date if provided
            due_date_obj = None
            if input_data.get("due_date"):
                try:
                    due_date_obj = datetime.strptime(input_data["due_date"], "%Y-%m-%d")
                except ValueError:
                    # If parsing fails, ignore the date
                    pass

            # Normalize priority
            priority = input_data.get("priority", "medium")
            if priority:
                priority = priority.capitalize()  # Convert to "Low", "Medium", "High"

            # Convert to TaskCreateSchema with all fields
            task_create = TaskCreateSchema(
                title=input_data["title"],
                description=input_data.get("description"),
                completed=False,
                priority=priority,
                due_date=due_date_obj,
                tags=input_data.get("tags", []),
                is_recurring=input_data.get("is_recurring", False),
                recurrence_pattern=input_data.get("recurrence_pattern")
            )

            # Delegate to TaskService
            task = TaskService.create_task(
                session=session,
                user_id=input_data["user_id"],
                task_data=task_create
            )

            # Return enhanced output
            return {
                "task_id": str(task.id),
                "status": "created",
                "title": task.title,
                "description": task.description,
                "completed": task.completed,
                "priority": task.priority,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "tags": task.tags or [],
                "is_recurring": task.is_recurring,
                "recurrence_pattern": task.recurrence_pattern
            }

    except Exception as e:
        return {
            "error": True,
            "message": f"Failed to create task: {str(e)}",
            "status": "error"
        }
