from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID
from sqlmodel import Session, select
from croniter import croniter
from ..models.task import Task, TaskCreate
from ..services.notification_service import NotificationService


class RecurringTaskService:
    @staticmethod
    def parse_recurrence_pattern(pattern: str, base_datetime: Optional[datetime] = None) -> Optional[datetime]:
        """
        Parse a recurrence pattern and return the next occurrence datetime.
        Pattern format: 'daily', 'weekly', 'monthly', 'yearly', 'every_X_units', or cron-like string
        """
        if base_datetime is None:
            base_datetime = datetime.utcnow()

        pattern_lower = pattern.lower().strip()

        if pattern_lower == 'daily':
            return base_datetime + timedelta(days=1)
        elif pattern_lower == 'weekly':
            return base_datetime + timedelta(weeks=1)
        elif pattern_lower == 'monthly':
            # Add approximately one month (30 days)
            return base_datetime + timedelta(days=30)
        elif pattern_lower == 'yearly':
            return base_datetime + timedelta(days=365)
        elif pattern_lower.startswith('every_'):
            # Handle patterns like 'every_2_days', 'every_week', 'every_3_months'
            try:
                # Split the pattern to extract number and unit
                parts = pattern_lower.split('_')
                if len(parts) >= 3:
                    if parts[1].isdigit():
                        num = int(parts[1])
                        unit = parts[2]

                        if unit.startswith('day'):
                            return base_datetime + timedelta(days=num)
                        elif unit.startswith('week'):
                            return base_datetime + timedelta(weeks=num)
                        elif unit.startswith('month'):
                            return base_datetime + timedelta(days=num*30)  # Approximate
                        elif unit.startswith('year'):
                            return base_datetime + timedelta(days=num*365)
                    elif parts[1] == 'other':  # Handle "every_other" patterns
                        if len(parts) >= 3:
                            unit = parts[2]
                            if unit.startswith('day'):
                                return base_datetime + timedelta(days=2)
                            elif unit.startswith('week'):
                                return base_datetime + timedelta(weeks=2)
                            elif unit.startswith('month'):
                                return base_datetime + timedelta(days=60)  # Approximate
                else:
                    # Handle simple "every" patterns like "every_other_day"
                    if pattern_lower == 'every_other_day':
                        return base_datetime + timedelta(days=2)
                    elif pattern_lower == 'every_other_week':
                        return base_datetime + timedelta(weeks=2)
                    elif pattern_lower == 'every_other_month':
                        return base_datetime + timedelta(days=60)  # Approximate
            except:
                pass

        # Try to parse as cron expression if it has multiple parts
        try:
            if ' ' in pattern and len(pattern.split()) >= 5:
                # This is a simplified approach - in a real app you'd want to validate the cron expression
                # For now, just return the next daily occurrence if it looks like a cron
                next_run = croniter(pattern, base_datetime).get_next(datetime)
                return next_run
        except:
            pass

        return None

    @staticmethod
    def create_next_occurrence(session: Session, original_task: Task) -> Optional[Task]:
        """
        Create the next occurrence of a recurring task based on its pattern.
        """
        if not original_task.is_recurring or not original_task.recurrence_pattern:
            return None

        # Use the original task's due date as the base for calculating the next occurrence
        base_datetime = original_task.due_date if original_task.due_date else datetime.utcnow()
        next_due_date = RecurringTaskService.parse_recurrence_pattern(original_task.recurrence_pattern, base_datetime)
        if not next_due_date:
            return None

        # Create a new task with the same properties but updated due date
        new_task_data = TaskCreate(
            title=original_task.title,
            description=original_task.description,
            due_date=next_due_date,
            priority=original_task.priority,
            is_recurring=True,
            recurrence_pattern=original_task.recurrence_pattern,
            tags=original_task.tags if original_task.tags is not None else []  # Pass tags from original task
        )

        # Import TaskService locally to avoid circular import
        from ..services.task_service import TaskService
        new_task = TaskService.create_task(session, original_task.user_id, new_task_data)

        # Create a notification for the newly created recurring task
        if new_task:
            try:
                # Use the existing create_notification method instead of the non-existent create_recurring_task_notification
                from ..models.notification import NotificationCreate, NotificationType
                notification_data = NotificationCreate(
                    type=NotificationType.RECURRING_TASK_CREATED,
                    title=f"Recurring Task Created: {new_task.title}",
                    message=f"A new instance of '{new_task.title}' has been created.",
                    task_id=new_task.id,
                    due_date=new_task.due_date
                )
                NotificationService.create_notification(session, original_task.user_id, notification_data)
            except Exception as e:
                # Log the error but don't fail the main task completion
                print(f"Error creating notification for recurring task: {str(e)}")
                # Continue with the main task completion

        return new_task

    @staticmethod
    def process_completed_recurring_task(session: Session, task_id: UUID, user_id: UUID) -> Optional[Task]:
        """
        When a recurring task is completed, create the next occurrence.
        """
        task = session.get(Task, task_id)
        if not task or task.user_id != user_id:
            return None

        if not task.is_recurring or not task.recurrence_pattern:
            return None

        # Create the next occurrence
        next_task = RecurringTaskService.create_next_occurrence(session, task)

        # Optionally mark the original task as completed
        # In a real implementation, you might want to archive the completed instance
        # rather than keeping it and creating a new one

        return next_task