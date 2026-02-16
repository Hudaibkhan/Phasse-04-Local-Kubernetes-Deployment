from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlmodel import Session
from uuid import UUID
from ..db.session import get_session
from ..models.notification import Notification, NotificationRead
from ..models.user import User
from ..auth import get_current_user
from ..services.notification_service import NotificationService


router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.post("/generate")
def generate_notifications(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Generate notifications based on the user's current tasks."""
    notifications = NotificationService.generate_notifications_for_user(
        session=session,
        user_id=current_user.id
    )

    # Convert notifications to NotificationRead format manually
    notification_reads = []
    for notification in notifications:
        notification_reads.append(NotificationRead(
            id=notification.id,
            user_id=notification.user_id,
            task_id=notification.task_id,
            type=notification.type,
            title=notification.title,
            message=notification.message,
            due_date=notification.due_date,
            created_at=notification.created_at
        ))

    return {"notifications": notification_reads}


@router.get("/", response_model=List[NotificationRead])
def get_notifications(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
):
    """Get all notifications for the current user."""
    notifications = NotificationService.get_user_notifications(
        session=session,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    return notifications


@router.delete("/")
def delete_all_notifications(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Delete all notifications for the current user."""
    count = NotificationService.delete_all_user_notifications(
        session=session,
        user_id=current_user.id
    )
    return {"message": f"Deleted {count} notifications successfully"}


@router.delete("/{notification_id}")
def delete_notification(
    *,
    notification_id: UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Delete a single notification for the current user."""
    success = NotificationService.delete_notification(
        session=session,
        notification_id=notification_id,
        user_id=current_user.id
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found or access denied"
        )

    return {"message": "Notification deleted successfully"}