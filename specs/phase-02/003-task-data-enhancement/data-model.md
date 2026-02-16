# Data Model: Task Data Enhancement

**Feature**: Task Data Enhancement and Dashboard UI
**Date**: 2026-01-15
**Branch**: 003-task-data-enhancement

## Entity Definitions

### Task Entity

**Description**: Represents a user's task with title, description, completion status, and additional metadata for organization and scheduling.

**Fields**:
- `id` (UUID/Integer): Unique identifier for the task
- `title` (String): The main title of the task
- `description` (Text, Optional): Detailed description of the task
- `completed` (Boolean): Whether the task is completed
- `priority` (String/Enum): Priority level ('low', 'medium', 'high')
- `due_date` (DateTime, Optional): When the task is due
- `tags` (JSON Array, Optional): Array of string labels for categorization
- `recurrence_pattern` (String, Optional): Recurrence pattern ('daily', 'weekly', 'monthly', 'custom', etc.)
- `created_at` (DateTime): Timestamp when task was created
- `updated_at` (DateTime): Timestamp when task was last updated
- `user_id` (UUID/Integer): Foreign key to associate task with user

**Relationships**:
- Belongs to: User (many-to-one relationship)

**Validation Rules**:
- `title`: Required, maximum 255 characters
- `description`: Optional, maximum 1000 characters
- `priority`: Required if provided, must be one of 'low', 'medium', 'high'
- `due_date`: Optional, must be a valid date/time format
- `tags`: Optional, array of strings with maximum 10 tags, each tag maximum 50 characters
- `recurrence_pattern`: Optional, must be a valid recurrence pattern if provided
- `user_id`: Required, must reference an existing user

**State Transitions**:
- `completed` can transition from `false` to `true` (completed) and `true` to `false` (reopened)

### User Entity (Existing)

**Description**: Represents a registered user in the system.

**Fields**:
- `id` (UUID/Integer): Unique identifier for the user
- `email` (String): User's email address
- `username` (String, Optional): User's chosen username
- `created_at` (DateTime): Timestamp when user was created
- `updated_at` (DateTime): Timestamp when user was last updated

## Database Schema

### Tasks Table

```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')),
    due_date TIMESTAMP WITH TIME ZONE,
    tags JSONB,
    recurrence_pattern VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);
```

### Indexes

```sql
-- Index for user-based queries (common for multi-user isolation)
CREATE INDEX idx_tasks_user_id ON tasks(user_id);

-- Index for completed status (common filtering)
CREATE INDEX idx_tasks_completed ON tasks(completed);

-- Index for due date (common for sorting/filtering)
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Index for priority (common for sorting/filtering)
CREATE INDEX idx_tasks_priority ON tasks(priority);
```

## API Data Contracts

### Task Creation Request

```json
{
  "title": "string (required, max 255)",
  "description": "string (optional, max 1000)",
  "priority": "enum (optional, one of: 'low', 'medium', 'high')",
  "due_date": "ISO 8601 datetime string (optional)",
  "tags": "array of strings (optional, max 10 tags)",
  "recurrence_pattern": "string (optional, e.g., 'daily', 'weekly', 'monthly')"
}
```

### Task Response Object

```json
{
  "id": "integer or UUID",
  "title": "string",
  "description": "string or null",
  "completed": "boolean",
  "priority": "string or null",
  "due_date": "ISO 8601 datetime string or null",
  "tags": "array of strings or null",
  "recurrence_pattern": "string or null",
  "created_at": "ISO 8601 datetime string",
  "updated_at": "ISO 8601 datetime string",
  "user_id": "integer or UUID"
}
```

## Migration Plan

### From Existing Schema

1. Add new columns to existing tasks table:
   - `priority` VARCHAR(20) with CHECK constraint
   - `due_date` TIMESTAMP WITH TIME ZONE
   - `tags` JSONB
   - `recurrence_pattern` VARCHAR(50)

2. Update existing records with default values where appropriate:
   - Set default priority to 'medium' for existing tasks
   - Set other fields to NULL for existing tasks

3. Create indexes for performance optimization.

## Constraints

- All tasks must be associated with a valid user (foreign key constraint)
- All new fields must maintain data integrity through appropriate constraints
- Tags stored as JSONB for efficient querying and indexing
- Priority field constrained to valid values to prevent data inconsistency