from sqlmodel import Session, select, func
from sqlalchemy import or_, text
from ..models.user import User
from typing import List, Optional
from uuid import UUID

# Import Pydantic models for the service methods
from ..schemas.task import TaskCreate as TaskCreateSchema, TaskUpdate as TaskUpdateSchema
from ..models.task import Task

class TaskService:
    @staticmethod
    def create_task(session: Session, user_id: UUID, task_data: TaskCreateSchema) -> Task:
        # Extract tags from task_data before creating the task
        tags_data = task_data.tags if hasattr(task_data, 'tags') and task_data.tags is not None else []

        # Handle priority conversion from lowercase to capitalized
        priority_value = task_data.priority if hasattr(task_data, 'priority') and task_data.priority is not None else 'Medium'
        if isinstance(priority_value, str):
            # Convert lowercase to capitalized priority
            if priority_value.lower() == 'high':
                priority_value = 'High'
            elif priority_value.lower() == 'medium':
                priority_value = 'Medium'
            elif priority_value.lower() == 'low':
                priority_value = 'Low'
            else:
                priority_value = 'Medium'  # default fallback

        # Create task with all attributes explicitly, including tags as array
        task = Task(
            title=task_data.title,
            description=task_data.description,
            completed=task_data.completed if hasattr(task_data, 'completed') and task_data.completed is not None else False,
            priority=priority_value,
            due_date=task_data.due_date if hasattr(task_data, 'due_date') and task_data.due_date is not None else None,
            is_recurring=task_data.is_recurring if hasattr(task_data, 'is_recurring') and task_data.is_recurring is not None else False,
            recurrence_pattern=task_data.recurrence_pattern if hasattr(task_data, 'recurrence_pattern') and task_data.recurrence_pattern is not None else None,
            tags=tags_data,  # Store tags directly as array
            user_id=user_id
        )

        session.add(task)
        session.commit()
        session.refresh(task)

        return task

    @staticmethod
    def get_tasks(session: Session, user_id: UUID, skip: int = 0, limit: int = 100) -> List[Task]:
        tasks = session.exec(
            select(Task)
            .where(Task.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .order_by(Task.created_at.desc())
        ).all()

        return tasks

    @staticmethod
    def get_tasks_with_total(session: Session, user_id: UUID, skip: int = 0, limit: int = 100,
                           search: Optional[str] = None, completed: Optional[bool] = None,
                           priority: Optional[str] = None, tag: Optional[str] = None,
                           sort_field: Optional[str] = None, sort_order: Optional[str] = None) -> tuple[List[Task], int]:
        from sqlalchemy.orm import selectinload

        # Build the base query
        query = select(Task).where(Task.user_id == user_id)

        # Apply filters
        if search:
            search_filter = f"%{search}%"
            # Properly handle nullable description for search using SQLAlchemy functions
            query = query.where(
                or_(
                    Task.title.ilike(search_filter),
                    Task.description.ilike(search_filter)  # SQLAlchemy will handle NULL appropriately
                )
            )

        if completed is not None:
            query = query.where(Task.completed == completed)

        if priority:
            query = query.where(Task.priority == priority)

        # Apply tag filter if specified - filter tasks where tags array contains the specified tag
        if tag:
            # For PostgreSQL JSON arrays, use the @> operator to check if array contains the value
            from sqlalchemy import text
            query = query.where(text("tasks.tags @> :tag_json").bindparam(tag_json=[tag]))

        # Apply sorting
        if sort_field:
            if sort_field == "created_at":
                order_by_clause = Task.created_at
            elif sort_field == "priority":
                order_by_clause = Task.priority
            elif sort_field == "title":
                order_by_clause = Task.title
            elif sort_field == "due_date":
                order_by_clause = Task.due_date
            else:
                order_by_clause = Task.created_at  # default

            if sort_order == "desc":
                query = query.order_by(order_by_clause.desc())
            else:
                query = query.order_by(order_by_clause.asc())
        else:
            # Default sorting
            query = query.order_by(Task.created_at.desc())

        # Get the paginated tasks
        tasks = session.exec(
            query.offset(skip).limit(limit)
        ).all()

        # Get the total count (without pagination)
        count_query = select(func.count(Task.id)).where(Task.user_id == user_id)

        # Apply same filters to count query
        if search:
            search_filter = f"%{search}%"
            # Properly handle nullable description for search in count query using SQLAlchemy functions
            count_query = count_query.where(
                or_(
                    Task.title.ilike(search_filter),
                    Task.description.ilike(search_filter)  # SQLAlchemy will handle NULL appropriately
                )
            )

        if completed is not None:
            count_query = count_query.where(Task.completed == completed)

        if priority:
            count_query = count_query.where(Task.priority == priority)

        if tag:
            # For PostgreSQL JSON arrays, use the @> operator to check if array contains the value
            from sqlalchemy import text
            count_query = count_query.where(text("tasks.tags @> :tag_json").bindparam(tag_json=[tag]))
        count_query = count_query.where(Task.user_id == user_id)

        total_count = session.exec(count_query).one()

        return tasks, total_count

    @staticmethod
    def get_task_by_id(session: Session, task_id: UUID, user_id: UUID) -> Optional[Task]:
        task = session.exec(
            select(Task)
            .where(Task.id == task_id)
            .where(Task.user_id == user_id)
        ).first()

        return task

    @staticmethod
    def update_task(session: Session, task_id: UUID, user_id: UUID, task_data: TaskUpdateSchema) -> Optional[Task]:
        task = TaskService.get_task_by_id(session, task_id, user_id)

        if not task:
            return None

        # Check if the task is being marked as completed and if it's a recurring task
        is_being_completed = hasattr(task_data, 'completed') and task_data.completed is True
        was_not_already_completed = not task.completed
        is_recurring = task.is_recurring and task.recurrence_pattern

        # Convert the update data to dict and handle priority conversion
        update_data = task_data.model_dump(exclude_unset=True)  # Use model_dump for Pydantic v2

        # Handle priority conversion from lowercase to capitalized if present
        if 'priority' in update_data and isinstance(update_data['priority'], str):
            priority_str = update_data['priority'].lower()
            if priority_str == 'high':
                update_data['priority'] = 'High'
            elif priority_str == 'medium':
                update_data['priority'] = 'Medium'
            elif priority_str == 'low':
                update_data['priority'] = 'Low'
            # else keep the existing behavior for other values

        # Check if tags are being updated
        tags_data = update_data.pop('tags', None) if 'tags' in update_data else None

        for field, value in update_data.items():
            setattr(task, field, value)

        # Handle tags update if provided
        if tags_data is not None:
            task.tags = tags_data  # Update tags directly as array

        session.add(task)
        session.commit()
        session.refresh(task)

        # After updating the task, check if it was just marked as completed and is recurring
        # If so, create the next occurrence
        if is_being_completed and was_not_already_completed and is_recurring:
            try:
                from ..services.recurring_tasks_service import RecurringTaskService
                RecurringTaskService.process_completed_recurring_task(session, task.id, user_id)
            except Exception as e:
                # Log the error but don't fail the main task completion
                print(f"Error processing recurring task: {str(e)}")
                # Continue with the main task completion

        return task

    @staticmethod
    def delete_task(session: Session, task_id: UUID, user_id: UUID) -> bool:
        task = TaskService.get_task_by_id(session, task_id, user_id)

        if not task:
            return False

        session.delete(task)
        session.commit()

        return True

    @staticmethod
    def add_tag_to_task(session: Session, task_id: UUID, tag_name: str, user_id: UUID) -> bool:
        """Add a tag to a task by updating the tags array directly."""
        # Verify user owns the task
        task = TaskService.get_task_by_id(session, task_id, user_id)
        if not task:
            return False

        # Get current tags or initialize empty array
        current_tags = task.tags if task.tags else []

        # Check if tag already exists
        if tag_name in current_tags:
            return True  # Already exists

        # Add the new tag to the array
        updated_tags = current_tags + [tag_name]
        task.tags = updated_tags

        session.add(task)
        session.commit()
        session.refresh(task)

        return True

    @staticmethod
    def remove_tag_from_task(session: Session, task_id: UUID, tag_name: str, user_id: UUID) -> bool:
        """Remove a tag from a task by updating the tags array directly."""
        # Verify user owns the task
        task = TaskService.get_task_by_id(session, task_id, user_id)
        if not task:
            return False

        # Get current tags
        current_tags = task.tags if task.tags else []

        # Check if tag exists
        if tag_name not in current_tags:
            return False  # Tag doesn't exist

        # Remove the tag from the array
        updated_tags = [tag for tag in current_tags if tag != tag_name]
        task.tags = updated_tags

        session.add(task)
        session.commit()
        session.refresh(task)

        return True

    @staticmethod
    def get_tags_for_task(session: Session, task_id: UUID, user_id: UUID) -> List[str]:
        """Get all tags for a specific task as a list of tag names, ensuring user owns the task."""
        # Verify user owns the task
        task = TaskService.get_task_by_id(session, task_id, user_id)
        if not task:
            return []

        # Return the tags array directly (stored as JSON in the tasks table)
        return task.tags if task.tags else []
