# Full-Stack Tech Stack Reference

This document provides quick reference for the specific technologies used in the monorepo.

## Frontend: Next.js

### App Router Patterns

**Server Components** (default):
```typescript
// app/tasks/page.tsx
export default async function TasksPage() {
  const tasks = await getTasks()
  return <TaskList tasks={tasks} />
}
```

**Client Components** (interactive):
```typescript
'use client'
// components/TaskForm.tsx
import { useState } from 'react'

export function TaskForm() {
  const [title, setTitle] = useState('')
  // Interactive logic here
}
```

**Server Actions**:
```typescript
'use server'
// app/actions/tasks.ts
export async function createTask(formData: FormData) {
  const title = formData.get('title')
  await db.task.create({ data: { title } })
  revalidatePath('/tasks')
}
```

### Common Spec Validations

When spec says "real-time updates" → Check plan for:
- Server-sent events (SSE)
- Polling strategy
- WebSocket requirements

When spec says "optimistic UI" → Implement:
- Client-side state update
- Server action call
- Rollback on error

## Backend: FastAPI

### Route Handler Patterns

**Basic endpoint**:
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.get("/")
async def list_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
    return tasks
```

**With validation**:
```python
from pydantic import BaseModel, Field

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    priority: Literal["low", "medium", "high"] = "medium"

@router.post("/", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = Task(**task_data.dict(), user_id=current_user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task
```

### Common Spec Validations

When spec says "validate X" → Use Pydantic models
When spec says "require authentication" → Use Depends(get_current_user)
When spec says "role-based access" → Check user.role in handler

## Database: Neon (Postgres)

### Connection Pattern

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Migration Pattern (Alembic)

```bash
# Create migration
alembic revision --autogenerate -m "Add priority to tasks"

# Apply migration
alembic upgrade head
```

### Common Spec Validations

When spec says "cascade delete" → Define relationship with cascade
When spec says "soft delete" → Add deleted_at column, filter queries
When spec says "audit trail" → Add created_at, updated_at, created_by

## Authentication: Better Auth

### Setup Pattern

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"

export const auth = betterAuth({
  database: prismaAdapter(prisma),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
})
```

### Protected Route Pattern

```typescript
// middleware.ts
import { auth } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/tasks/:path*"],
}
```

### Common Spec Validations

When spec says "email verification" → Enable emailVerification plugin
When spec says "password reset" → Implement forgot-password flow
When spec says "session expiry" → Configure session.expiresIn

## API Contracts (OpenAPI)

### Contract-First Development

1. Define contract in `contracts/api.yaml`
2. Generate types from contract
3. Implement backend matching contract
4. Implement frontend using generated types

### Example Contract

```yaml
paths:
  /api/tasks:
    post:
      summary: Create a new task
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [title]
              properties:
                title:
                  type: string
                  minLength: 1
                  maxLength: 200
                priority:
                  type: string
                  enum: [low, medium, high]
      responses:
        201:
          description: Task created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Task'
        401:
          description: Unauthorized
        422:
          description: Validation error
```

## Cross-Cutting Patterns

### Error Handling

**Frontend**:
```typescript
'use client'
import { useActionState } from 'react'

export function TaskForm() {
  const [state, formAction] = useActionState(createTask, null)

  return (
    <form action={formAction}>
      {state?.error && <ErrorMessage>{state.error}</ErrorMessage>}
      {/* form fields */}
    </form>
  )
}
```

**Backend**:
```python
from fastapi import HTTPException

@router.post("/tasks")
async def create_task(task_data: TaskCreate):
    try:
        # Create task
        pass
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to create task: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
```

### Logging

**Frontend** (server actions):
```typescript
'use server'
export async function createTask(formData: FormData) {
  console.log('[TaskCreate]', { title: formData.get('title') })
  // implementation
}
```

**Backend**:
```python
import logging

logger = logging.getLogger(__name__)

@router.post("/tasks")
async def create_task(task_data: TaskCreate):
    logger.info(f"Creating task: {task_data.title}")
    # implementation
```

### Environment Variables

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
DATABASE_URL=...
AUTH_SECRET=...
```

**Backend** (`.env`):
```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
CORS_ORIGINS=http://localhost:3000
```

## Performance Patterns

### Frontend Optimization

When spec says "fast page loads":
- Use Server Components for static content
- Use dynamic imports for client components
- Implement proper caching headers
- Use Next.js Image component

### Backend Optimization

When spec says "handle high load":
- Use connection pooling (SQLAlchemy pool_size)
- Implement query pagination
- Add database indexes
- Use caching (Redis)

### Database Optimization

When spec says "complex queries":
- Add indexes on foreign keys
- Add indexes on frequently queried columns
- Use database-level aggregations
- Consider materialized views for reports

## Security Patterns

### Input Validation

**Always validate**:
- User input (Pydantic models)
- File uploads (size, type, content)
- Query parameters (sanitize for SQL)
- URL parameters (validate format)

### Authentication Checks

**Always verify**:
- User is authenticated (middleware/dependencies)
- User has permission (role checks)
- Resource belongs to user (ownership checks)
- Token is valid and not expired

### Data Protection

**Always protect**:
- Passwords (hash with bcrypt)
- Sensitive data (encrypt at rest)
- API keys (environment variables)
- Session tokens (HTTP-only cookies)

## Testing Patterns

### Frontend Tests

```typescript
// __tests__/TaskForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskForm } from '@/components/TaskForm'

test('creates task on submit', async () => {
  render(<TaskForm />)
  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: 'New task' }
  })
  fireEvent.click(screen.getByText('Create'))
  // Assert task created
})
```

### Backend Tests

```python
# tests/test_tasks.py
from fastapi.testclient import TestClient

def test_create_task(client: TestClient, auth_headers: dict):
    response = client.post(
        "/api/tasks",
        json={"title": "Test task"},
        headers=auth_headers
    )
    assert response.status_code == 201
    assert response.json()["title"] == "Test task"
```

### Integration Tests

```typescript
// __tests__/integration/task-flow.test.ts
test('complete task flow', async () => {
  // Create task via API
  const task = await createTask({ title: 'Test' })

  // Verify in database
  const dbTask = await db.task.findUnique({ where: { id: task.id } })
  expect(dbTask).toBeTruthy()

  // Verify in UI
  render(<TaskList />)
  expect(screen.getByText('Test')).toBeInTheDocument()
})
```

## Spec-to-Code Examples

### Example 1: Spec Says "Users can filter tasks"

**Spec requirement**:
> Users can filter tasks by status (all, active, completed) and priority (low, medium, high)

**Plan architecture**:
- Use URL search params for filters
- Server component for rendering
- No client-side JavaScript needed

**Implementation**:
```typescript
// app/tasks/page.tsx
export default async function TasksPage({
  searchParams
}: {
  searchParams: { status?: string; priority?: string }
}) {
  const tasks = await getTasks({
    status: searchParams.status,
    priority: searchParams.priority
  })

  return (
    <>
      <FilterBar />
      <TaskList tasks={tasks} />
    </>
  )
}
```

### Example 2: Spec Says "Validate email format"

**Spec requirement**:
> System validates email addresses follow standard RFC 5322 format

**Plan validation**:
- Backend: Pydantic EmailStr validator
- Frontend: HTML5 email input type
- Display helpful error messages

**Implementation**:

Backend:
```python
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str
```

Frontend:
```typescript
<input
  type="email"
  name="email"
  required
  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
/>
```

### Example 3: Spec Says "Admin-only feature"

**Spec requirement**:
> Only users with 'admin' role can delete any task

**Plan authorization**:
- Check user.role in API endpoint
- Return 403 if not admin
- Hide delete buttons in UI for non-admins

**Implementation**:

Backend:
```python
@router.delete("/tasks/{task_id}")
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin access required")

    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")

    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}
```

Frontend:
```typescript
{session.user.role === 'admin' && (
  <button onClick={() => deleteTask(task.id)}>
    Delete
  </button>
)}
```
