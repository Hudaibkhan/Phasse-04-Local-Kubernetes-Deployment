"""
Message model for AI agent conversation history.

This model stores individual messages within conversations, supporting
both user inputs and AI assistant responses. Messages are ordered
chronologically and enforce validation rules for role and content.
"""
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

if TYPE_CHECKING:
    from .user import User
    from .conversation import Conversation

class Message(SQLModel, table=True):
    """
    Represents a single message in a conversation between user and AI agent.

    Messages are the atomic units of conversation history, containing either
    user input or AI assistant responses. They are ordered chronologically
    within a conversation and enforce strict validation rules.

    Attributes:
        id (UUID): Unique identifier for the message (primary key)
        conversation_id (UUID): Foreign key to the parent conversation
        user_id (UUID): Foreign key to the user who owns this conversation
        role (str): Message sender role - must be "user" or "assistant"
        content (str): Message text content (cannot be empty)
        created_at (datetime): Timestamp when message was created (UTC)

    Relationships:
        conversation (Conversation): The conversation this message belongs to
        user (User): The user who owns the conversation

    Database:
        Table: messages
        Indexes: conversation_id, user_id, created_at (for efficient queries)

    Validation:
        - role: Must be exactly "user" or "assistant" (case-sensitive)
        - content: Cannot be empty or whitespace-only
        - Validation occurs in __init__ and raises ValueError on failure

    Notes:
        - User isolation: Messages inherit user_id from conversation for efficient queries
        - Chronological ordering: created_at index enables efficient time-based retrieval
        - Cascade delete: Messages are deleted when parent conversation is deleted
        - Immutable: Messages should not be edited after creation (audit trail)

    Example:
        >>> from src.models.message import Message
        >>> from uuid import UUID
        >>>
        >>> # Create a user message
        >>> message = Message(
        ...     conversation_id=UUID("..."),
        ...     user_id=UUID("..."),
        ...     role="user",
        ...     content="What tasks do I have today?"
        ... )
        >>> session.add(message)
        >>> session.commit()
        >>>
        >>> # Query messages in chronological order
        >>> messages = session.exec(
        ...     select(Message)
        ...     .where(Message.conversation_id == conv_id)
        ...     .order_by(Message.created_at.asc())
        ... ).all()
        >>>
        >>> # Validation example (raises ValueError)
        >>> invalid = Message(
        ...     conversation_id=UUID("..."),
        ...     user_id=UUID("..."),
        ...     role="invalid",  # Must be "user" or "assistant"
        ...     content="test"
        ... )
        ValueError: Invalid role: invalid. Must be 'user' or 'assistant'
    """
    __tablename__ = "messages"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(
        foreign_key="conversations.id",
        nullable=False,
        index=True
    )
    user_id: UUID = Field(
        foreign_key="users.id",
        nullable=False,
        index=True
    )
    role: str = Field(max_length=20, nullable=False)
    content: str = Field(nullable=False)
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        index=True
    )

    # Relationships
    conversation: "Conversation" = Relationship(back_populates="messages")
    user: "User" = Relationship(back_populates="messages")

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True

    def __init__(self, **data):
        super().__init__(**data)
        # Validate role
        if self.role not in ("user", "assistant"):
            raise ValueError(f"Invalid role: {self.role}. Must be 'user' or 'assistant'")
        # Validate content
        if not self.content or not self.content.strip():
            raise ValueError("Message content cannot be empty")
