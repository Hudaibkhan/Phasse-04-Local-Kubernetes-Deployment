# Data Model: Evolution Todo Phase II

**Feature**: 001-phase-2-specs
**Date**: 2026-01-07
**Status**: Complete
**Source**: Derived from specs/database/schema.md

## Overview

This document defines the core entities, their relationships, validation rules, and state transitions for the Evolution Todo application. All entities enforce strict user isolation at the database level.

---

## Entity Relationship Diagram

```text
┌─────────────────┐
│     User        │
│                 │
│  id: UUID (PK)  │
│  email: string  │
│  password_hash  │
│  created_at     │
│  updated_at     │
└────────┬────────┘
         │
         │ 1:N (owns)
         │
         ▼
┌─────────────────┐         N:M          ┌─────────────────┐
│     Task        │◄──────────────────────►│      Tag        │
│                 │                        │                 │
│  id: UUID (PK)  │      (TaskTag join)    │  id: UUID (PK)  │
│  user_id: UUID  │                        │  user_id: UUID  │
│  title: string  │                        │  name: string   │
│  description    │                        │  color: string  │
│  completed: bool│                        │  created_at     │
│  priority: enum │                        │  updated_at     │
│  due_date       │                        └─────────────────┘
│  due_time       │
│  is_recurring   │
│  recurrence     │
│  created_at     │
│  updated_at     │
└─────────────────┘
```

---

## Entities

### 1. User

**Purpose**: Represents a registered user account with authentication credentials.

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL, DEFAULT uuid_generate_v4() | Unique user identifier |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE, LOWERCASE | User email address (authentication identifier) |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hashed password (salt factor 12+) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last account update timestamp |

**Validation Rules**:
- Email MUST match RFC 5322 format (validated at application layer)
- Email MUST be unique across all users
- Email MUST be stored in lowercase for case-insensitive comparison
- Password MUST be minimum 8 characters before hashing
- Password MUST be hashed with bcrypt (salt factor 12+) before storage
- Password_hash MUST never be exposed in API responses

**Indexes**:
- PRIMARY KEY on `id` (automatic)
- UNIQUE INDEX on `email` (automatic from constraint)

**Relationships**:
- One User has many Tasks (1:N)
- One User has many Tags (1:N)

**SQLModel Example**:
```python
from sqlmodel import Field, SQLModel
from datetime import datetime
from uuid import UUID, uuid4

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(max_length=255, unique=True, index=True, nullable=False)
    password_hash: str = Field(max_length=255, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
```

---

### 2. Task

**Purpose**: Represents a todo item owned by a user with completion status, priority, and optional metadata.

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL, DEFAULT uuid_generate_v4() | Unique task identifier |
| `user_id` | UUID | NOT NULL, FOREIGN KEY → users(id) ON DELETE CASCADE | Owner of the task |
| `title` | VARCHAR(200) | NOT NULL | Task title (required) |
| `description` | TEXT | NULL | Optional detailed description |
| `completed` | BOOLEAN | NOT NULL, DEFAULT FALSE | Completion status |
| `priority` | ENUM('High', 'Medium', 'Low') | NOT NULL, DEFAULT 'Medium' | Task priority level (P2) |
| `due_date` | DATE | NULL | Optional due date (no time) (P3) |
| `due_time` | TIME | NULL | Optional due time (requires due_date) (P3) |
| `is_recurring` | BOOLEAN | NOT NULL, DEFAULT FALSE | Whether task repeats (P3) |
| `recurrence_pattern` | VARCHAR(100) | NULL | Recurrence rule (e.g., "daily", "weekly", "custom") (P3) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Task creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last task update timestamp |

**Validation Rules**:
- Title MUST NOT be empty or only whitespace
- Title MUST be ≤200 characters
- Description MUST be ≤1000 characters (if provided)
- User_id MUST reference existing user
- Due_time can only be set if due_date is set
- Recurrence_pattern can only be set if is_recurring is true
- Priority MUST be one of: 'High', 'Medium', 'Low'

**Indexes**:
- PRIMARY KEY on `id` (automatic)
- INDEX `idx_tasks_user_id` on `user_id` (filter tasks by user)
- INDEX `idx_tasks_user_created` on `(user_id, created_at DESC)` (sorted task lists)
- INDEX `idx_tasks_user_completed` on `(user_id, completed)` (filter by completion status)
- INDEX `idx_tasks_user_priority` on `(user_id, priority)` (filter/sort by priority) (P2)

**Relationships**:
- Each Task belongs to one User (N:1)
- Each Task can have many Tags (N:M via TaskTag join table)

**Foreign Key Behavior**:
- ON DELETE CASCADE: Deleting a user automatically deletes all their tasks

**State Transitions**:

```text
[incomplete] ──toggle──► [completed] ──toggle──► [incomplete]
                                │
                                └──► (if recurring) ──► create new [incomplete] task
```

**Business Rules**:
- User can only access/modify their own tasks (enforced at query level)
- Completed tasks maintain full edit capabilities (can be uncompleted)
- Recurring tasks generate next occurrence only when current instance is completed
- Overdue tasks (due_date < today) display visual warning but remain editable

**SQLModel Example**:
```python
from sqlmodel import Field, SQLModel
from datetime import datetime, date, time
from uuid import UUID, uuid4
from typing import Optional
from enum import Enum

class Priority(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    title: str = Field(max_length=200, nullable=False)
    description: Optional[str] = Field(default=None, nullable=True)
    completed: bool = Field(default=False, nullable=False)
    priority: Priority = Field(default=Priority.MEDIUM, nullable=False)
    due_date: Optional[date] = Field(default=None, nullable=True)
    due_time: Optional[time] = Field(default=None, nullable=True)
    is_recurring: bool = Field(default=False, nullable=False)
    recurrence_pattern: Optional[str] = Field(max_length=100, default=None, nullable=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
```

---

### 3. Tag

**Purpose**: Represents a custom category/label for organizing tasks (user-specific).

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL, DEFAULT uuid_generate_v4() | Unique tag identifier |
| `user_id` | UUID | NOT NULL, FOREIGN KEY → users(id) ON DELETE CASCADE | Owner of the tag |
| `name` | VARCHAR(50) | NOT NULL | Tag name (e.g., "Work", "Personal") |
| `color` | VARCHAR(7) | NOT NULL, DEFAULT '#3B82F6' | Hex color code for UI display |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Tag creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last tag update timestamp |

**Validation Rules**:
- Name MUST be ≤50 characters
- Name MUST be unique per user (user can't have duplicate tag names)
- Color MUST be valid hex format: `#RRGGBB`
- User_id MUST reference existing user

**Indexes**:
- PRIMARY KEY on `id` (automatic)
- INDEX `idx_tags_user_id` on `user_id` (filter tags by user)
- UNIQUE INDEX `idx_tags_user_name` on `(user_id, name)` (prevent duplicate tag names per user)

**Relationships**:
- Each Tag belongs to one User (N:1)
- Each Tag can be associated with many Tasks (N:M via TaskTag)

**Foreign Key Behavior**:
- ON DELETE CASCADE: Deleting a user automatically deletes all their tags

**Business Rules**:
- Tags are user-specific (not shared between users)
- Maximum 50 tags per user (enforced at application layer)
- Deleting a tag removes it from all associated tasks (cascade delete in TaskTag table)

**SQLModel Example**:
```python
from sqlmodel import Field, SQLModel
from datetime import datetime
from uuid import UUID, uuid4

class Tag(SQLModel, table=True):
    __tablename__ = "tags"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    name: str = Field(max_length=50, nullable=False)
    color: str = Field(max_length=7, default="#3B82F6", nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
```

---

### 4. TaskTag (Join Table)

**Purpose**: Many-to-many relationship between Tasks and Tags.

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `task_id` | UUID | PRIMARY KEY, FOREIGN KEY → tasks(id) ON DELETE CASCADE | Reference to task |
| `tag_id` | UUID | PRIMARY KEY, FOREIGN KEY → tags(id) ON DELETE CASCADE | Reference to tag |

**Validation Rules**:
- Both task_id and tag_id MUST reference existing records
- Task and tag MUST belong to the same user (enforced at application layer)
- Composite primary key prevents duplicate associations

**Indexes**:
- COMPOSITE PRIMARY KEY on `(task_id, tag_id)` (automatic)
- INDEX `idx_tasktag_task` on `task_id` (query tags for a task)
- INDEX `idx_tasktag_tag` on `tag_id` (query tasks for a tag)

**Relationships**:
- Links Task (N) ↔ Tag (M)

**Foreign Key Behavior**:
- ON DELETE CASCADE: Deleting a task removes all its tag associations
- ON DELETE CASCADE: Deleting a tag removes all its task associations

**SQLModel Example**:
```python
from sqlmodel import Field, SQLModel
from uuid import UUID

class TaskTag(SQLModel, table=True):
    __tablename__ = "task_tags"

    task_id: UUID = Field(foreign_key="tasks.id", primary_key=True)
    tag_id: UUID = Field(foreign_key="tags.id", primary_key=True)
```

---

## Data Flow Examples

### Example 1: User Creates a Task with Tags

```text
1. POST /api/tasks
   Body: { title: "Buy groceries", tags: ["Personal", "Urgent"] }

2. Backend validates JWT → extracts user_id

3. Create/fetch tags:
   - Check if "Personal" tag exists for user → fetch or create
   - Check if "Urgent" tag exists for user → fetch or create

4. Create task:
   - INSERT INTO tasks (user_id, title, ...)
   - Get task.id

5. Associate tags:
   - INSERT INTO task_tags (task_id, tag_id) for "Personal"
   - INSERT INTO task_tags (task_id, tag_id) for "Urgent"

6. Return task with populated tags in response
```

### Example 2: User Completes Recurring Task

```text
1. PATCH /api/tasks/{id}
   Body: { completed: true }

2. Backend validates JWT → user_id

3. Fetch task WHERE id = {id} AND user_id = {user_id}

4. Check if task.is_recurring = true
   → If true:
     a. Update current task: SET completed = true
     b. Parse recurrence_pattern (e.g., "daily")
     c. Calculate next_due_date = current_due_date + 1 day
     d. INSERT new task with same title/description, due_date = next_due_date, completed = false
     e. Copy tags from old task to new task (INSERT INTO task_tags)

5. Return updated task in response
```

### Example 3: User Filters Tasks by Tag and Priority

```text
1. GET /api/tasks?tag=Work&priority=High&completed=false

2. Backend validates JWT → user_id

3. Query:
   SELECT tasks.*
   FROM tasks
   JOIN task_tags ON tasks.id = task_tags.task_id
   JOIN tags ON task_tags.tag_id = tags.id
   WHERE tasks.user_id = {user_id}
     AND tags.name = 'Work'
     AND tasks.priority = 'High'
     AND tasks.completed = false
   ORDER BY tasks.created_at DESC

4. Return filtered task list
```

---

## Validation Summary

### User Entity
- ✅ Email format (RFC 5322 regex)
- ✅ Email uniqueness (database constraint)
- ✅ Password strength (min 8 chars, validated before hashing)
- ✅ Password hashing (bcrypt, salt factor 12+)

### Task Entity
- ✅ Title not empty (application validation)
- ✅ Title ≤200 chars (database constraint)
- ✅ Description ≤1000 chars (application validation)
- ✅ User ownership (foreign key constraint)
- ✅ Priority enum (database constraint)
- ✅ Due time requires due date (application validation)

### Tag Entity
- ✅ Name ≤50 chars (database constraint)
- ✅ Name unique per user (composite unique index)
- ✅ Color hex format (application validation)
- ✅ User ownership (foreign key constraint)

### TaskTag Entity
- ✅ No duplicate associations (composite primary key)
- ✅ User isolation (application validation: task.user_id == tag.user_id)

---

## User Isolation Enforcement

**Critical Principle**: All queries MUST filter by `user_id` extracted from authenticated JWT token.

### Query Patterns:

```sql
-- ✅ CORRECT: Filter by user_id
SELECT * FROM tasks WHERE user_id = {authenticated_user_id};

-- ❌ INCORRECT: No user filter (exposes all users' data)
SELECT * FROM tasks;

-- ✅ CORRECT: Join with user check
SELECT tasks.*, tags.name
FROM tasks
JOIN task_tags ON tasks.id = task_tags.task_id
JOIN tags ON task_tags.tag_id = tags.id
WHERE tasks.user_id = {authenticated_user_id}
  AND tags.user_id = {authenticated_user_id};
```

### Enforcement Layers:
1. **Database**: Foreign key constraints ensure referential integrity
2. **ORM**: Default scopes filter by user_id (SQLModel base query)
3. **API**: Middleware extracts user_id from JWT, injects into request context
4. **Service Layer**: All functions require user_id parameter

---

## Migration Strategy

### Initial Schema (Alembic Migration 001):

```python
def upgrade():
    # 1. Create users table
    op.create_table('users', ...)

    # 2. Create tasks table with user_id FK
    op.create_table('tasks', ...)

    # 3. Create tags table with user_id FK
    op.create_table('tags', ...)

    # 4. Create task_tags join table
    op.create_table('task_tags', ...)

    # 5. Create indexes
    op.create_index('idx_tasks_user_id', 'tasks', ['user_id'])
    op.create_index('idx_tasks_user_created', 'tasks', ['user_id', 'created_at DESC'])
    ...
```

### Future Migrations (Phase III Examples):

```python
# Migration 002: Add priority to tasks (P2 feature)
def upgrade():
    op.add_column('tasks', sa.Column('priority', sa.Enum('High', 'Medium', 'Low'), default='Medium'))

# Migration 003: Add due dates (P3 feature)
def upgrade():
    op.add_column('tasks', sa.Column('due_date', sa.Date, nullable=True))
    op.add_column('tasks', sa.Column('due_time', sa.Time, nullable=True))
```

---

## Notes

This data model enforces:
1. **User Isolation**: All data scoped by user_id with foreign key constraints
2. **Data Integrity**: Constraints, validations, and indexes ensure consistency
3. **Scalability**: UUID primary keys, proper indexes for common queries
4. **Security**: Password hashing, no sensitive data in logs
5. **Phase Compatibility**: P1 features required, P2/P3 features as optional columns

**Next Steps**:
- Generate API contracts from this data model (contracts/)
- Create quickstart.md for database setup
- Implement SQLModel models in backend/src/models/
