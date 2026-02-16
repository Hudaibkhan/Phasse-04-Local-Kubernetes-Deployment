import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from sqlmodel import SQLModel
from src.db.session import engine
from src.models.user import User
from src.models.task import Task
from src.models.tag import Tag
from src.models.notification import Notification
from src.models.task_tag import TaskTagLink
from src.db.session import Session

def create_tables():
    print("Creating database tables...")
    SQLModel.metadata.create_all(engine)
    print("Tables created successfully!")

if __name__ == "__main__":
    create_tables()