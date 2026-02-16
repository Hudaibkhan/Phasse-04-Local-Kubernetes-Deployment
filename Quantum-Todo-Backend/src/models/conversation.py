"""
Conversation model for AI agent chat history persistence.

This model stores conversation sessions between users and AI agents,
enabling stateless agent execution with full conversation context.
Each conversation belongs to a single user and contains multiple messages.
"""
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import TYPE_CHECKING, List
from uuid import UUID, uuid4

if TYPE_CHECKING:
    from .user import User
    from .message import Message

class Conversation(SQLModel, table=True):
    """
    Represents a conversation session between a user and an AI agent.

    A conversation is a container for messages exchanged during an AI agent
    interaction. It provides context isolation and enables conversation history
    retrieval for stateless agent execution.

    Attributes:
        id (UUID): Unique identifier for the conversation (primary key)
        user_id (UUID): Foreign key to the user who owns this conversation
        created_at (datetime): Timestamp when conversation was created (UTC)
        updated_at (datetime): Timestamp when conversation was last modified (UTC)

    Relationships:
        user (User): The user who owns this conversation
        messages (List[Message]): All messages in this conversation (cascade delete)

    Database:
        Table: conversations
        Indexes: user_id (for efficient user-scoped queries)

    Notes:
        - User isolation: Each conversation belongs to exactly one user
        - Cascade delete: Deleting a conversation deletes all its messages
        - Timestamps: Automatically set on creation, updated_at should be
          updated when new messages are added (application logic)
        - UUID primary keys: Ensures globally unique identifiers

    Example:
        >>> from src.models.conversation import Conversation
        >>> from uuid import UUID
        >>>
        >>> # Create a new conversation
        >>> conversation = Conversation(user_id=UUID("..."))
        >>> session.add(conversation)
        >>> session.commit()
        >>>
        >>> # Query user's conversations
        >>> conversations = session.exec(
        ...     select(Conversation).where(Conversation.user_id == user_id)
        ... ).all()
    """
    __tablename__ = "conversations"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships
    user: "User" = Relationship(back_populates="conversations")
    messages: List["Message"] = Relationship(
        back_populates="conversation",
        cascade_delete=True
    )

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True
