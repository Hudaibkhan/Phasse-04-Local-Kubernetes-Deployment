from sqlmodel import SQLModel, Field
from uuid import UUID
import sqlalchemy.dialects.postgresql as pg


class TaskTagLink(SQLModel, table=True):
    __tablename__ = "task_tags"

    task_id: UUID = Field(foreign_key="tasks.id", primary_key=True)
    tag_id: UUID = Field(foreign_key="tags.id", primary_key=True)