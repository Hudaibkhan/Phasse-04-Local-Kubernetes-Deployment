# Data Model: MCP Server Foundation

**Feature**: 001-mcp-server-foundation
**Date**: 2026-02-08
**Status**: Design Complete

## Overview

This document defines the data model for chat persistence in the MCP Server Foundation. Two new entities are introduced: Conversation and Message. These entities enable stateless AI agent execution by storing full conversation history in the database.

## Entity Definitions

### Conversation

**Purpose**: Represents a chat session between a user and the AI agent. Each conversation is owned by a single user and contains multiple messages.

**Table Name**: `conversations`

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, NOT NULL, DEFAULT uuid_generate_v4() | Unique identifier for the conversation |
| user_id | UUID | FOREIGN KEY (users.id), NOT NULL, INDEXED | Owner of the conversation |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() | When the conversation was created |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT now() | When the conversation was last updated |

**Relationships**:
- **One-to-Many with Message**: A conversation can have many messages
- **Many-to-One with User**: A conversation belongs to one user

**Indexes**:
- `PRIMARY KEY (id)` - Fast lookup by conversation ID
- `INDEX ix_conversations_user_id (user_id)` - Fast user-scoped queries

**Validation Rules**:
- `user_id` must reference an existing user in the `users` table
- `created_at` must be <= `updated_at`
- `updated_at` is automatically updated when messages are added (application logic)

**Cascade Behavior**:
- When a user is deleted, all their conversations are deleted (CASCADE)
- When a conversation is deleted, all its messages are deleted (CASCADE)

**SQLModel Definition**:
```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, TYPE_CHECKING, List
from uuid import UUID, uuid4

if TYPE_CHECKING:
    from .user import User
    from .message import Message

class Conversation(SQLModel, table=True):
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
```

**State Transitions**:
1. **Created**: Conversation record created when user initiates chat
2. **Active**: Has one or more messages
3. **Inactive**: No messages added recently (application-defined threshold)

**Business Rules**:
- A user can have multiple conversations
- Conversations are never shared between users
- Conversations are immutable once created (no title/metadata updates in Phase III)
- Messages within a conversation are append-only

---

### Message

**Purpose**: Represents a single message within a conversation. Messages can be from the user or the AI assistant. Messages are immutable and stored in chronological order.

**Table Name**: `messages`

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, NOT NULL, DEFAULT uuid_generate_v4() | Unique identifier for the message |
| conversation_id | UUID | FOREIGN KEY (conversations.id), NOT NULL, INDEXED | Conversation this message belongs to |
| user_id | UUID | FOREIGN KEY (users.id), NOT NULL, INDEXED | User who owns this conversation |
| role | VARCHAR(20) | NOT NULL, CHECK (role IN ('user', 'assistant')) | Who sent the message |
| content | TEXT | NOT NULL | Message content |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now(), INDEXED | When the message was created |

**Relationships**:
- **Many-to-One with Conversation**: A message belongs to one conversation
- **Many-to-One with User**: A message is associated with one user (for isolation)

**Indexes**:
- `PRIMARY KEY (id)` - Fast lookup by message ID
- `INDEX ix_messages_conversation_id (conversation_id)` - Fast retrieval of all messages in a conversation
- `INDEX ix_messages_user_id (user_id)` - User isolation enforcement
- `INDEX ix_messages_created_at (created_at)` - Chronological ordering

**Validation Rules**:
- `conversation_id` must reference an existing conversation
- `user_id` must match the `user_id` of the referenced conversation (enforced in application logic)
- `role` must be exactly "user" or "assistant" (case-sensitive)
- `content` cannot be empty string (enforced in application logic)
- `created_at` is immutable after creation

**Cascade Behavior**:
- When a conversation is deleted, all its messages are deleted (CASCADE)
- When a user is deleted, all their messages are deleted (CASCADE)

**SQLModel Definition**:
```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from uuid import UUID, uuid4

if TYPE_CHECKING:
    from .user import User
    from .conversation import Conversation

class Message(SQLModel, table=True):
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
```

**State Transitions**:
1. **Created**: Message record created and stored
2. **Immutable**: Messages are never updated or deleted (in Phase III)

**Business Rules**:
- Messages are append-only (no updates or deletes)
- Messages must belong to a conversation owned by the same user
- Messages are ordered chronologically by `created_at`
- Role alternation is not enforced (multiple consecutive messages from same role allowed)
- Content length is unlimited (TEXT field)

---

## Entity Relationships Diagram

```
┌─────────────────┐
│     User        │
│  (existing)     │
│─────────────────│
│ id (PK)         │
│ email           │
│ username        │
│ password_hash   │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐
│  Conversation   │
│     (NEW)       │
│─────────────────│
│ id (PK)         │
│ user_id (FK)    │◄────┐
│ created_at      │     │
│ updated_at      │     │
└────────┬────────┘     │
         │              │
         │ 1:N          │
         │              │
         ▼              │
┌─────────────────┐     │
│    Message      │     │
│     (NEW)       │     │
│─────────────────│     │
│ id (PK)         │     │
│ conversation_id │─────┘
│ user_id (FK)    │
│ role            │
│ content         │
│ created_at      │
└─────────────────┘
```

## Data Access Patterns

### Pattern 1: Create New Conversation
```python
# When user initiates chat
conversation = Conversation(user_id=user_id)
session.add(conversation)
session.commit()
```

### Pattern 2: Add Message to Conversation
```python
# When user or assistant sends message
message = Message(
    conversation_id=conversation_id,
    user_id=user_id,
    role="user",  # or "assistant"
    content="Message content"
)
session.add(message)
session.commit()

# Update conversation timestamp
conversation.updated_at = datetime.utcnow()
session.commit()
```

### Pattern 3: Retrieve Conversation History
```python
# Get all messages for a conversation (chronological order)
messages = session.exec(
    select(Message)
    .where(Message.conversation_id == conversation_id)
    .where(Message.user_id == user_id)  # User isolation
    .order_by(Message.created_at.asc())
).all()
```

### Pattern 4: List User's Conversations
```python
# Get all conversations for a user
conversations = session.exec(
    select(Conversation)
    .where(Conversation.user_id == user_id)
    .order_by(Conversation.updated_at.desc())
).all()
```

## Storage Estimates

**Assumptions**:
- Average conversation: 20 messages
- Average message length: 500 characters
- 1000 active users
- Each user has 5 conversations on average

**Calculations**:

**Conversations Table**:
- Row size: ~80 bytes (UUID + UUID + 2 timestamps)
- Total rows: 1000 users × 5 conversations = 5,000 rows
- Storage: 5,000 × 80 bytes = 400 KB

**Messages Table**:
- Row size: ~650 bytes (UUID + UUID + UUID + role + 500 char content + timestamp)
- Total rows: 5,000 conversations × 20 messages = 100,000 rows
- Storage: 100,000 × 650 bytes = 65 MB

**Total Storage**: ~65.4 MB for estimated usage

**Index Overhead**: ~20% additional = ~13 MB

**Total with Indexes**: ~78 MB

**Scalability**: At 10,000 users with same patterns = ~780 MB (well within Neon limits)

## Migration Strategy

**Migration File**: `alembic/versions/[timestamp]_add_conversation_message_tables.py`

**Upgrade Steps**:
1. Create `conversations` table with indexes
2. Create `messages` table with indexes
3. Add foreign key constraints
4. Verify table creation

**Downgrade Steps**:
1. Drop `messages` table (CASCADE removes foreign keys)
2. Drop `conversations` table (CASCADE removes foreign keys)

**Safety Checks**:
- No modifications to existing tables
- Additive only (no data loss risk)
- Foreign keys ensure referential integrity
- Indexes created for performance

## User Model Updates

The existing `User` model needs to be updated to include relationships to the new entities:

```python
# In src/models/user.py
from typing import TYPE_CHECKING, List

if TYPE_CHECKING:
    from .conversation import Conversation
    from .message import Message

class User(UserBase, table=True):
    # ... existing fields ...

    # NEW: Add relationships
    conversations: List["Conversation"] = Relationship(back_populates="user")
    messages: List["Message"] = Relationship(back_populates="user")
```

**Note**: This is a code-only change. No database migration needed for relationships.

## Validation and Constraints Summary

| Constraint | Enforcement Level | Description |
|------------|-------------------|-------------|
| user_id exists | Database (FK) | Foreign key constraint |
| conversation_id exists | Database (FK) | Foreign key constraint |
| role in ('user', 'assistant') | Application | Validated in SQLModel __init__ |
| content not empty | Application | Validated in SQLModel __init__ |
| user_id matches conversation owner | Application | Enforced in tool logic |
| created_at <= updated_at | Application | Managed by application logic |
| Messages are immutable | Application | No update/delete operations provided |

## Testing Considerations

**Unit Tests**:
- Validate SQLModel field constraints
- Test relationship definitions
- Verify cascade behavior

**Integration Tests**:
- Create conversation and verify in database
- Add messages and verify ordering
- Test user isolation (user A cannot access user B's conversations)
- Test cascade deletes

**Performance Tests**:
- Query performance with 1000+ messages in a conversation
- Index effectiveness for user-scoped queries
- Concurrent message creation

## Future Considerations (Out of Scope for Phase III)

- Conversation metadata (title, summary, tags)
- Message editing/deletion capabilities
- Message search and filtering
- Conversation archiving
- Message attachments or rich content
- Conversation sharing between users
- Message reactions or annotations

## Summary

The data model introduces two new entities (Conversation and Message) that enable persistent chat history for AI agent interactions. The design prioritizes:
- **User Isolation**: All data is user-scoped with proper foreign keys
- **Immutability**: Messages are append-only for audit trail
- **Performance**: Indexes on all query paths
- **Safety**: Cascade deletes prevent orphaned records
- **Simplicity**: Minimal fields, clear relationships

The model integrates cleanly with the existing User entity and follows established patterns in the codebase.
