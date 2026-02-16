# Data Model: Authentication and Task Management

**Feature**: 002-auth-db-fixes
**Date**: 2026-01-13

## User Entity

### Fields
- **id**: UUID (Primary Key, auto-generated)
- **username**: String (unique, 3-50 characters)
- **email**: String (unique, valid email format)
- **password_hash**: String (hashed using bcrypt)
- **created_at**: DateTime (auto-generated)
- **updated_at**: DateTime (auto-generated, updated on change)

### Validation Rules
- Username must be 3-50 alphanumeric characters with underscores/hyphens allowed
- Email must follow standard email format
- Password must be at least 8 characters with complexity requirements
- Both username and email must be unique across all users

### Relationships
- One-to-many with Task entity (user has many tasks)
- One-to-many with Session entity (user has many sessions)

## Task Entity

### Fields
- **id**: UUID (Primary Key, auto-generated)
- **title**: String (required, max 200 characters)
- **description**: Text (optional, max 1000 characters)
- **completed**: Boolean (default: false)
- **user_id**: UUID (Foreign Key to User.id, required)
- **created_at**: DateTime (auto-generated)
- **updated_at**: DateTime (auto-generated, updated on change)

### Validation Rules
- Title is required and cannot exceed 200 characters
- Task must belong to an existing user
- User can only access their own tasks

### Relationships
- Many-to-one with User entity (task belongs to one user)
- User has many tasks

## Session Entity (Optional - if needed)

### Fields
- **id**: UUID (Primary Key, auto-generated)
- **user_id**: UUID (Foreign Key to User.id, required)
- **token**: String (unique, JWT token or session ID)
- **expires_at**: DateTime (expiration timestamp)
- **created_at**: DateTime (auto-generated)

### Validation Rules
- Token must be unique
- Session must be associated with an existing user
- Session must not be expired

### Relationships
- Many-to-one with User entity (session belongs to one user)
- User can have multiple active sessions

## Business Logic Constraints

### User Isolation
- Users can only access their own tasks
- Authentication required for all task operations
- Database queries must include user_id filter for security

### Data Integrity
- Cascade deletion for user's tasks when user is deleted (optional - may want to archive instead)
- Foreign key constraints to maintain referential integrity
- Proper indexing for common query patterns (user_id, created_at)

## API Integration Points

### Authentication Integration
- User creation automatically hashes password
- Login validates credentials against stored hash
- Session management tracks active user sessions

### Task Management
- Task creation associates with authenticated user
- Task retrieval filters by authenticated user
- Task modification restricted to task owner