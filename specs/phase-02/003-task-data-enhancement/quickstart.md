# Quickstart Guide: Task Data Enhancement and Dashboard UI

**Feature**: Task Data Enhancement and Dashboard UI
**Date**: 2026-01-15
**Branch**: 003-task-data-enhancement

## Overview

This guide provides instructions for setting up and running the enhanced task management system with rich metadata support (priority, due date, tags, recurrence patterns), improved dashboard UI, and fixed input visibility issues.

## Prerequisites

- Node.js 18+ for frontend
- Python 3.11+ for backend
- PostgreSQL 12+ for database
- pnpm or npm for frontend package management
- Poetry or pip for backend package management

## Setup Instructions

### 1. Environment Configuration

1. Copy the environment template files:
   ```bash
   cp .env.example .env
   ```

2. Update the environment variables in `.env`:
   - `DATABASE_URL`: PostgreSQL connection string
   - `FRONTEND_URL`: Frontend application URL
   - `BACKEND_URL`: Backend API URL
   - `AUTH_SECRET`: Secret for authentication

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   # Using poetry
   poetry install

   # Or using pip with requirements.txt
   pip install -r requirements.txt
   ```

3. Run database migrations:
   ```bash
   python -m src.database.migrate
   ```

4. Start the backend server:
   ```bash
   # Using uvicorn
   uvicorn src.main:app --reload --port 8000
   ```

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install JavaScript dependencies:
   ```bash
   pnpm install
   # or
   npm install
   ```

3. Start the frontend development server:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

## Key Features

### Enhanced Task Creation

Tasks can now be created with the following metadata:
- Priority levels (low, medium, high)
- Due dates with timezone support
- Tags for categorization
- Recurrence patterns

### Improved Dashboard UI

The dashboard now includes:
- Visual indicators for task priority
- Due date warnings for upcoming deadlines
- Tag-based filtering and organization
- Recurrence pattern visualization

### Fixed Input Visibility

Input fields now properly display text with appropriate contrast in both light and dark modes.

## API Endpoints

### Task Management

- `GET /api/tasks` - Retrieve all tasks for the authenticated user
- `POST /api/tasks` - Create a new task with metadata
- `PUT /api/tasks/{id}` - Update a task with new metadata
- `DELETE /api/tasks/{id}` - Delete a task
- `PATCH /api/tasks/{id}/complete` - Toggle task completion status

### Request/Response Examples

#### Create Task with Metadata
```json
POST /api/tasks
{
  "title": "Implement user authentication",
  "description": "Add login and signup functionality",
  "priority": "high",
  "due_date": "2026-01-30T10:00:00Z",
  "tags": ["security", "authentication", "frontend"],
  "recurrence_pattern": null
}
```

#### Response
```json
{
  "id": 1,
  "title": "Implement user authentication",
  "description": "Add login and signup functionality",
  "completed": false,
  "priority": "high",
  "due_date": "2026-01-30T10:00:00Z",
  "tags": ["security", "authentication", "frontend"],
  "recurrence_pattern": null,
  "created_at": "2026-01-15T10:00:00Z",
  "updated_at": "2026-01-15T10:00:00Z",
  "user_id": 1
}
```

## Development Commands

### Running Tests

Backend tests:
```bash
cd backend
pytest
```

Frontend tests:
```bash
cd frontend
pnpm test
```

### Building for Production

Backend:
```bash
cd backend
python -m build
```

Frontend:
```bash
cd frontend
pnpm build
```

## Troubleshooting

### Input Visibility Issues

If text is still not visible in input fields:
1. Check browser developer tools for CSS conflicts
2. Verify Tailwind CSS configuration
3. Ensure theme provider is properly configured

### Database Connection Issues

If the backend cannot connect to the database:
1. Verify DATABASE_URL in environment variables
2. Ensure PostgreSQL server is running
3. Run migrations if schema changes exist

## Next Steps

1. Review the detailed API documentation
2. Set up authentication if not already configured
3. Configure monitoring and logging
4. Deploy to your preferred hosting platform