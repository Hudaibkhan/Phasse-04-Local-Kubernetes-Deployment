import asyncio
from datetime import datetime
from .notification_service import NotificationService
from ..db.session import SessionLocal

async def check_notifications_loop():
    """
    Background loop to check for tasks due soon or overdue and create notifications.
    Runs every 5 minutes.
    """
    while True:
        try:
            with SessionLocal() as session:
                due_soon_count = NotificationService.check_and_create_due_soon_notifications(session)
                overdue_count = NotificationService.check_and_create_overdue_notifications(session)
                print(f"[{datetime.utcnow()}] Scheduler: Created {due_soon_count} reminders and {overdue_count} overdue notifications.")
        except Exception as e:
            print(f"[{datetime.utcnow()}] Scheduler Error: {str(e)}")

        # Wait for 5 minutes
        await asyncio.sleep(300)

def start_scheduler():
    """Start the background scheduler."""
    asyncio.create_task(check_notifications_loop())
