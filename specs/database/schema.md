# Database Schema Specification

## Status
📝 **Draft** - Phase II Database Design

## Overview

PostgreSQL database schema using SQLModel (combining SQLAlchemy and Pydantic) for the Evolution Todo application. The schema enforces user isolation, data integrity, and supports all core features.

## Database Provider

- **Provider**: Neon (Serverless PostgreSQL)
- **Version**: PostgreSQL 15+
- **ORM**: SQLModel (SQLAlchemy + Pydantic)
- **Migrations**: Alembic
- **Connection Pool**: 10 min, 20 max connections

## Schema Design Principles

1. **User Isolation**: All user data must be scoped by user_id
2. **Data Integrity**: Foreign keys, constraints, and validations enforce consistency
3. **Audit Trail**: created_at and updated_at timestamps on all tables
4. **UUID Primary Keys**: For security and distributed system compatibility
5. **Indexed Queries**: Strategic indexes for common query patterns

---

## Tables

### users

Stores user accounts and authentication credentials.

**Table Definition**:

| Column | Type | Constraints | Description |
| ------ | ---- | ----------- | ----------- |
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique user identifier |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User email address (lowercase) |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes**:
- PRIMARY KEY on `id` (automatic)
- UNIQUE INDEX on `email` (automatic from UNIQUE constraint)
- INDEX `idx_users_email` on `email` for fast lookup during login

**Constraints**:
- Email must be unique across all users
- Email must match RFC 5322 format (validated at application layer)
- Password_hash is bcrypt format (validated at application layer)
- Emails stored in lowercase for case-insensitive comparison

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

### tasks

Stores todo items owned by users.

**Table Definition**:

| Column | Type | Constraints | Description |
| ------ | ---- | ----------- | ----------- |
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique task identifier |
| user_id | UUID | NOT NULL, FOREIGN KEY → users(id) ON DELETE CASCADE | Owner of the task |
| title | VARCHAR(200) | NOT NULL | Task title |
| description | TEXT | NULL | Optional task description |
| completed | BOOLEAN | NOT NULL, DEFAULT FALSE | Completion status |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Task creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes**:
- PRIMARY KEY on `id` (automatic)
- INDEX `idx_tasks_user_id` on `user_id` for filtering user's tasks
- INDEX `idx_tasks_user_created` on `(user_id, created_at DESC)` for sorted task lists
- INDEX `idx_tasks_user_completed` on `(user_id, completed)` for filtering by completion status (Phase III)

**Constraints**:
- `user_id` FOREIGN KEY references `users(id)` ON DELETE CASCADE
- `title` must not be empty or only whitespace (validated at application layer)
- `title` maximum 200 characters
- `description` maximum 1000 characters (validated at application layer)

**Foreign Key Behavior**:
- ON DELETE CASCADE: When a user is deleted, all their tasks are automatically deleted

**SQLModel Example**:
```python
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from uuid import UUID, uuid4
from typing import Optional

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    title: str = Field(max_length=200, nullable=False)
    description: Optional[str] = Field(default=None, nullable=True)
    completed: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationship (optional, for ORM convenience)
    # user: "User" = Relationship(back_populates="tasks")
```

---

## Relationships

### One-to-Many: User → Tasks

- Each **User** can have many **Tasks**
- Each **Task** belongs to exactly one **User**
- Enforced via `tasks.user_id` foreign key to `users.id`
- Cascade delete: Deleting a user deletes all their tasks

**Diagram**:
```
users (1) ────< (many) tasks
  id               user_id
```

---

## Indexes Strategy

### Query Patterns & Indexes

| Query Pattern | Index Used | Rationale |
| ------------- | ---------- | --------- |
| Login by email | `idx_users_email` (unique) | Fast user lookup during authentication |
| List user's tasks | `idx_tasks_user_id` | Filter tasks by ownership |
| List tasks sorted by date | `idx_tasks_user_created` (composite) | Efficient sorted retrieval |
| Filter by completion status | `idx_tasks_user_completed` (Phase III) | Enable completed/incomplete filters |

### Index Definitions

```sql
-- Automatically created by UNIQUE constraint
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Tasks ownership lookup
CREATE INDEX idx_tasks_user_id ON tasks(user_id);

-- Tasks sorted by creation date (newest first)
CREATE INDEX idx_tasks_user_created ON tasks(user_id, created_at DESC);

-- (Phase III) Filter by completion status
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, completed);
```

---

## Data Validation

### Application-Level Validation (via Pydantic/SQLModel)

**Users Table**:
- Email format: RFC 5322 regex validation
- Email uniqueness: Check before INSERT
- Email normalization: Convert to lowercase before storing
- Password: Minimum 8 characters (before hashing)
- Password hashing: Bcrypt with salt factor 12

**Tasks Table**:
- Title: Not empty, not only whitespace, max 200 chars
- Description: Max 1000 chars (optional)
- User_id: Must reference existing user

### Database-Level Constraints

- PRIMARY KEY constraints: Prevent duplicate IDs
- FOREIGN KEY constraints: Ensure referential integrity
- NOT NULL constraints: Enforce required fields
- UNIQUE constraints: Prevent duplicate emails
- CHECK constraints: (Future) Could add CHECK (title != '')

---

## Data Types Rationale

| Type | Usage | Rationale |
| ---- | ----- | --------- |
| UUID | Primary keys | Secure, non-sequential, distributed-system friendly |
| VARCHAR(n) | Email, title, password_hash | Fixed maximum length, efficient storage |
| TEXT | Description | Variable length, potentially long content |
| BOOLEAN | Completed flag | Binary state, efficient storage |
| TIMESTAMPTZ | Timestamps | Timezone-aware, crucial for global applications |

---

## Migration Strategy

### Initial Migration

Create tables in dependency order:

1. Create `users` table (no dependencies)
2. Create `tasks` table (depends on `users`)
3. Create indexes

### Migration Tools

- **Alembic**: Version control for database schema
- **Naming Convention**: `YYYYMMDD_HHMM_description.py` (e.g., `20260107_1200_initial_schema.py`)
- **Reversibility**: All migrations must have `upgrade()` and `downgrade()`

### Example Alembic Migration

```python
"""Initial schema: users and tasks tables

Revision ID: 001
Revises:
Create Date: 2026-01-07 12:00:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('NOW()'))
    )

    # Create tasks table
    op.create_table(
        'tasks',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('NOW()'))
    )

    # Create indexes
    op.create_index('idx_tasks_user_id', 'tasks', ['user_id'])
    op.create_index('idx_tasks_user_created', 'tasks', ['user_id', sa.text('created_at DESC')])

def downgrade():
    op.drop_table('tasks')
    op.drop_table('users')
```

---

## Seed Data (Development Only)

### Test Users

```sql
-- Password: password123 (bcrypt hashed)
INSERT INTO users (email, password_hash) VALUES
('alice@example.com', '$2b$12$KIXfF2.W8zvCKJmhxGh8/.example.hash'),
('bob@example.com', '$2b$12$KIXfF2.W8zvCKJmhxGh8/.example.hash');
```

### Test Tasks

```sql
-- Alice's tasks
INSERT INTO tasks (user_id, title, description, completed)
SELECT id, 'Write documentation', 'Complete Phase II specs', false
FROM users WHERE email = 'alice@example.com';

INSERT INTO tasks (user_id, title, description, completed)
SELECT id, 'Review pull requests', NULL, true
FROM users WHERE email = 'alice@example.com';

-- Bob's tasks
INSERT INTO tasks (user_id, title, description, completed)
SELECT id, 'Setup development environment', 'Install dependencies and configure tools', false
FROM users WHERE email = 'bob@example.com';
```

**Note**: Seed data is only for local development. Never seed production databases.

---

## Security Considerations

### Password Security
- Never store plain-text passwords
- Always hash with bcrypt (salt factor 12 or higher)
- Password validation happens before hashing at application layer

### User Isolation
- All queries for tasks MUST filter by `user_id`
- Enforce at ORM level with default scopes or explicit filters
- Backend validates user_id from JWT token, not from client request

### SQL Injection Prevention
- Use SQLModel/SQLAlchemy parameterized queries (no raw SQL)
- Validate and sanitize all inputs before queries
- Never concatenate user input into SQL strings

### Data Privacy
- No PII in logs (never log emails, passwords, or user content)
- Encrypt database connection in production (SSL/TLS)
- Database backups encrypted at rest

---

## Performance Considerations

### Connection Pooling
- Min connections: 10
- Max connections: 20
- Connection timeout: 30 seconds
- Recycling: 3600 seconds (1 hour)

### Query Optimization
- Use composite indexes for common filters (user_id + created_at)
- Limit result sets (e.g., paginate task lists in Phase III)
- Avoid N+1 queries with proper eager loading

### Monitoring (Phase III)
- Track slow queries (> 100ms)
- Monitor connection pool saturation
- Alert on deadlocks or lock timeouts

---

## Backup and Recovery (Phase III)

- **Neon**: Automatic continuous backup (Point-in-Time Recovery)
- **Retention**: 7 days for development, 30 days for production
- **Testing**: Quarterly restore tests

---

## Future Schema Changes (Phase III+)

Potential enhancements deferred to later phases:

- **Task categories**: New `categories` table with many-to-many relationship
- **Task priorities**: Add `priority` ENUM ('low', 'medium', 'high') to tasks
- **Due dates**: Add `due_date` TIMESTAMPTZ to tasks
- **Subtasks**: New `subtasks` table with parent_task_id foreign key
- **Soft delete**: Add `deleted_at` TIMESTAMPTZ for task archiving
- **Audit log**: New `audit_log` table tracking all changes
- **User profiles**: Add `name`, `avatar_url` columns to users
- **Sessions**: New `sessions` table for multi-device support

---

## Notes

This schema is designed for Phase II (MVP) with clear extension points for Phase III. The design prioritizes:

1. **User Isolation**: Strict enforcement via foreign keys and query patterns
2. **Data Integrity**: Foreign keys, constraints, and validation
3. **Performance**: Strategic indexes for common queries
4. **Security**: Password hashing, no PII exposure, SQL injection prevention
5. **Maintainability**: Clean schema with Alembic migrations

**Implementation Checklist**:
- [ ] Create Alembic migration for initial schema
- [ ] Define SQLModel models for users and tasks
- [ ] Configure database connection with pooling
- [ ] Create seed data script for development
- [ ] Test foreign key cascade behavior
- [ ] Verify indexes are created and used

**Next Steps**:
- Implement SQLModel models in backend
- Create and test Alembic migrations
- Setup database connection and pooling
- Write database utility functions (get_db, etc.)
