import asyncio
import logging
from datetime import datetime
from sqlmodel import Session, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from ..models.task import Task
from ..services.recurring_tasks_service import RecurringTaskService
from ..db.session import DATABASE_URL


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TaskScheduler:
    def __init__(self):
        self.engine = create_engine(DATABASE_URL)
        self.running = False

    def get_session(self) -> Session:
        return sessionmaker(bind=self.engine)()

    async def process_recurring_tasks(self):
        """
        Find all completed recurring tasks and create their next occurrences.
        This function would typically be run periodically by a scheduler.
        """
        logger.info("Starting recurring task processing...")

        session = self.get_session()
        try:
            # Find all completed recurring tasks
            completed_recurring_tasks = session.exec(
                select(Task)
                .where(Task.completed == True)
                .where(Task.is_recurring == True)
                .where(Task.recurrence_pattern.is_not(None))
            ).all()

            created_tasks = 0
            for task in completed_recurring_tasks:
                # Check if a next occurrence should be created
                # For recurring tasks, we create a new task when the current one is completed
                # but only if enough time has passed since the due date
                next_task = RecurringTaskService.create_next_occurrence(session, task)
                if next_task:
                    created_tasks += 1
                    logger.info(f"Created next occurrence for recurring task {task.id}: new task {next_task.id}")

            logger.info(f"Completed recurring task processing. Created {created_tasks} new tasks.")

        except Exception as e:
            logger.error(f"Error processing recurring tasks: {e}")
        finally:
            session.close()

    async def run_scheduler(self):
        """
        Main loop for the task scheduler.
        In a real implementation, you might use a library like APScheduler
        or integrate with Celery/RQ for distributed task processing.
        """
        self.running = True
        logger.info("Task scheduler started")

        while self.running:
            try:
                await self.process_recurring_tasks()
            except Exception as e:
                logger.error(f"Error in scheduler loop: {e}")

            # Wait for 1 hour before next check (in a real app, you might want more sophisticated scheduling)
            await asyncio.sleep(3600)  # 1 hour

    def stop(self):
        """Stop the scheduler"""
        self.running = False
        logger.info("Task scheduler stopped")


# Global scheduler instance
scheduler = TaskScheduler()


async def start_scheduler():
    """Start the task scheduler"""
    await scheduler.run_scheduler()


if __name__ == "__main__":
    # This would typically be run as a separate process
    asyncio.run(start_scheduler())