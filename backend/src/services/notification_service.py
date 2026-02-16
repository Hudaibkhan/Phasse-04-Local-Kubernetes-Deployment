from sqlmodel import Session, select
from typing import List
from uuid import UUID
from datetime import datetime, timedelta
from ..models.notification import Notification, NotificationCreate, NotificationUpdate, NotificationType
from ..models.task import Task
from ..models.user import User


class NotificationService:
    @staticmethod
    def create_notification(session: Session, user_id: UUID, notification_data: NotificationCreate) -> Notification:
        """Create a new notification for a user."""
        # Convert the notification_data to a dictionary using model_dump for Pydantic v2
        notification_dict = notification_data.model_dump()

        notification = Notification(
            user_id=user_id,
            **notification_dict
        )

        session.add(notification)
        session.commit()
        session.refresh(notification)

        return notification

    @staticmethod
    def get_user_notifications(session: Session, user_id: UUID, skip: int = 0, limit: int = 100) -> List[Notification]:
        """Get all notifications for a user."""
        notifications = session.exec(
            select(Notification)
            .where(Notification.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .order_by(Notification.created_at.desc())
        ).all()

        return notifications

    @staticmethod
    def delete_notification(session: Session, notification_id: UUID, user_id: UUID) -> bool:
        """Delete a notification for a user."""
        notification = session.get(Notification, notification_id)
        if not notification or notification.user_id != user_id:
            return False

        session.delete(notification)
        session.commit()

        return True

    @staticmethod
    def delete_all_user_notifications(session: Session, user_id: UUID) -> int:
        """Delete all notifications for a user."""
        notifications = session.exec(
            select(Notification)
            .where(Notification.user_id == user_id)
        ).all()

        deleted_count = len(notifications)
        for notification in notifications:
            session.delete(notification)

        session.commit()
        return deleted_count

    @staticmethod
    def generate_notifications_for_user(session: Session, user_id: UUID) -> List[Notification]:
        """Generate notifications based on the user's current tasks."""
        # First, delete all existing notifications for the user to avoid duplicates
        NotificationService.delete_all_user_notifications(session, user_id)

        # Get all tasks for the user that are not completed
        user_tasks = session.exec(
            select(Task)
            .where(Task.user_id == user_id)
            .where(Task.completed == False)
        ).all()

        created_notifications = []

        # Get today's date for comparison
        today = datetime.utcnow().date()

        for task in user_tasks:
            if task.due_date:
                task_date = task.due_date.date()

                # due_today: Tasks with due_date on today and not completed
                if task_date == today:
                    title = f"Due Today: {task.title}"
                    message = f"'{task.title}' is due today."

                    notification_data = NotificationCreate(
                        type=NotificationType.TASK_REMINDER,
                        title=title,
                        message=message,
                        task_id=task.id,
                        due_date=task.due_date
                    )
                    notification = NotificationService.create_notification(session, user_id, notification_data)
                    created_notifications.append(notification)

                # overdue: Tasks with due_date in the past and not completed
                elif task_date < today:
                    title = f"Overdue: {task.title}"
                    message = f"'{task.title}' was due on {task.due_date.strftime('%Y-%m-%d')} and is overdue."

                    notification_data = NotificationCreate(
                        type=NotificationType.TASK_OVERDUE,
                        title=title,
                        message=message,
                        task_id=task.id,
                        due_date=task.due_date
                    )
                    notification = NotificationService.create_notification(session, user_id, notification_data)
                    created_notifications.append(notification)

                # upcoming_due_date: Tasks with due_date within the next 3 days and not completed
                elif task_date > today and (task_date - today).days <= 3:
                    title = f"Upcoming Due Date: {task.title}"
                    message = f"'{task.title}' is due on {task.due_date.strftime('%Y-%m-%d')}."

                    notification_data = NotificationCreate(
                        type=NotificationType.TASK_REMINDER,
                        title=title,
                        message=message,
                        task_id=task.id,
                        due_date=task.due_date
                    )
                    notification = NotificationService.create_notification(session, user_id, notification_data)
                    created_notifications.append(notification)

            # recurring_reminder: Tasks where is_recurring = true and not completed
            if task.is_recurring:
                title = f"Recurring Reminder: {task.title}"
                message = f"'{task.title}' is a recurring task."

                notification_data = NotificationCreate(
                    type=NotificationType.RECURRING_TASK_CREATED,
                    title=title,
                    message=message,
                    task_id=task.id,
                    due_date=task.due_date
                )
                notification = NotificationService.create_notification(session, user_id, notification_data)
                created_notifications.append(notification)

        return created_notifications