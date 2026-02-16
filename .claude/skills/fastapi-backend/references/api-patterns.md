# FastAPI RESTful API Patterns

Complete guide to RESTful API design patterns and best practices for FastAPI.

## Table of Contents

1. [RESTful Principles](#restful-principles)
2. [CRUD Operations](#crud-operations)
3. [Query Parameters and Filtering](#query-parameters-and-filtering)
4. [Pagination](#pagination)
5. [Nested Resources](#nested-resources)
6. [Bulk Operations](#bulk-operations)
7. [File Uploads](#file-uploads)
8. [Webhooks](#webhooks)
9. [API Versioning](#api-versioning)
10. [Rate Limiting](#rate-limiting)

---

## RESTful Principles

### Resource-Based URLs

URLs should represent resources (nouns), not actions (verbs).

```python
# ✅ GOOD: Resource-based
GET    /api/v1/users           # List users
GET    /api/v1/users/{id}      # Get user
POST   /api/v1/users           # Create user
PUT    /api/v1/users/{id}      # Replace user
PATCH  /api/v1/users/{id}      # Update user
DELETE /api/v1/users/{id}      # Delete user

# ❌ BAD: Action-based
GET    /api/v1/getUsers
POST   /api/v1/createUser
POST   /api/v1/deleteUser/{id}
```

### HTTP Methods

Use HTTP methods to represent actions:

| Method | Purpose | Idempotent | Safe | Request Body | Response Body |
|--------|---------|------------|------|--------------|---------------|
| GET | Retrieve resource(s) | ✓ | ✓ | ❌ | ✓ |
| POST | Create resource | ❌ | ❌ | ✓ | ✓ |
| PUT | Replace resource | ✓ | ❌ | ✓ | ✓ |
| PATCH | Partial update | ❌ | ❌ | ✓ | ✓ |
| DELETE | Remove resource | ✓ | ❌ | ❌ | Optional |

### Status Codes

Return appropriate HTTP status codes:

**Success (2xx)**:
- `200 OK` - Successful GET, PUT, PATCH
- `201 Created` - Successful POST with resource creation
- `202 Accepted` - Request accepted, processing async
- `204 No Content` - Successful DELETE or update with no response body

**Client Errors (4xx)**:
- `400 Bad Request` - Malformed request or generic validation error
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Authenticated but lacking permissions
- `404 Not Found` - Resource doesn't exist
- `405 Method Not Allowed` - HTTP method not supported for endpoint
- `409 Conflict` - Resource conflict (duplicate, constraint violation)
- `422 Unprocessable Entity` - Semantic validation error
- `429 Too Many Requests` - Rate limit exceeded

**Server Errors (5xx)**:
- `500 Internal Server Error` - Unexpected server error
- `502 Bad Gateway` - Upstream service error
- `503 Service Unavailable` - Server temporarily unavailable
- `504 Gateway Timeout` - Upstream service timeout

---

## CRUD Operations

### Complete CRUD Example

```python
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

router = APIRouter(prefix="/tasks", tags=["tasks"])

# CREATE
@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new task.

    Returns:
        201: Task created successfully
        401: Unauthorized
        422: Validation error
    """
    return await service.create_task(task_data, current_user.id)

# READ (List)
@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user)
):
    """
    List all tasks for the current user.

    Returns:
        200: List of tasks
        401: Unauthorized
    """
    return await service.list_tasks(current_user.id)

# READ (Single)
@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific task by ID.

    Returns:
        200: Task found
        401: Unauthorized
        404: Task not found
    """
    task = await service.get_task(task_id, current_user.id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found"
        )

    return task

# UPDATE (Full replacement)
@router.put("/{task_id}", response_model=TaskResponse)
async def replace_task(
    task_id: str,
    task_data: TaskCreate,  # Full object required
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user)
):
    """
    Replace a task entirely (all fields required).

    Returns:
        200: Task replaced
        401: Unauthorized
        404: Task not found
        422: Validation error
    """
    task = await service.replace_task(task_id, task_data, current_user.id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found"
        )

    return task

# UPDATE (Partial update)
@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_data: TaskUpdate,  # Optional fields
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user)
):
    """
    Partially update a task (only provided fields are updated).

    Returns:
        200: Task updated
        401: Unauthorized
        404: Task not found
        422: Validation error
    """
    task = await service.update_task(task_id, task_data, current_user.id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found"
        )

    return task

# DELETE
@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a task.

    Returns:
        204: Task deleted (no content)
        401: Unauthorized
        404: Task not found
    """
    success = await service.delete_task(task_id, current_user.id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found"
        )

    return None
```

### Schemas for CRUD

```python
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Base schema with shared fields
class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    priority: str = Field("medium", pattern="^(low|medium|high|urgent)$")

# CREATE - all required fields
class TaskCreate(TaskBase):
    pass

# UPDATE (PATCH) - all fields optional
class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    priority: Optional[str] = Field(None, pattern="^(low|medium|high|urgent)$")
    status: Optional[str] = Field(None, pattern="^(todo|in_progress|completed)$")

# RESPONSE - includes computed/server fields
class TaskResponse(TaskBase):
    id: str
    status: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

---

## Query Parameters and Filtering

### Basic Filtering

```python
from typing import Optional
from fastapi import Query

@router.get("/tasks", response_model=List[TaskResponse])
async def list_tasks(
    status: Optional[str] = Query(None, regex="^(todo|in_progress|completed)$"),
    priority: Optional[str] = Query(None, regex="^(low|medium|high|urgent)$"),
    search: Optional[str] = Query(None, min_length=3, max_length=100),
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user)
):
    """
    List tasks with optional filtering.

    Query Parameters:
        - status: Filter by status (todo, in_progress, completed)
        - priority: Filter by priority (low, medium, high, urgent)
        - search: Search in title and description (min 3 chars)
    """
    return await service.list_tasks(
        user_id=current_user.id,
        status=status,
        priority=priority,
        search=search
    )
```

### Sorting

```python
@router.get("/tasks", response_model=List[TaskResponse])
async def list_tasks(
    sort_by: str = Query("created_at", regex="^(created_at|updated_at|title|priority)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user)
):
    """
    List tasks with sorting.

    Query Parameters:
        - sort_by: Field to sort by (created_at, updated_at, title, priority)
        - sort_order: Sort order (asc, desc)
    """
    return await service.list_tasks(
        user_id=current_user.id,
        sort_by=sort_by,
        sort_order=sort_order
    )
```

### Date Range Filtering

```python
from datetime import date

@router.get("/tasks", response_model=List[TaskResponse])
async def list_tasks(
    created_after: Optional[date] = None,
    created_before: Optional[date] = None,
    due_after: Optional[date] = None,
    due_before: Optional[date] = None,
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user)
):
    """
    List tasks with date range filtering.

    Query Parameters:
        - created_after: Show tasks created after this date
        - created_before: Show tasks created before this date
        - due_after: Show tasks due after this date
        - due_before: Show tasks due before this date
    """
    return await service.list_tasks(
        user_id=current_user.id,
        created_after=created_after,
        created_before=created_before,
        due_after=due_after,
        due_before=due_before
    )
```

---

## Pagination

### Offset-Based Pagination

```python
from pydantic import BaseModel

class PaginatedResponse(BaseModel):
    items: List[TaskResponse]
    total: int
    page: int
    per_page: int
    total_pages: int

@router.get("/tasks", response_model=PaginatedResponse)
async def list_tasks(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user)
):
    """
    List tasks with offset-based pagination.

    Query Parameters:
        - page: Page number (default: 1, min: 1)
        - per_page: Items per page (default: 10, min: 1, max: 100)

    Returns:
        Paginated list with metadata
    """
    skip = (page - 1) * per_page

    tasks, total = await service.list_tasks(
        user_id=current_user.id,
        skip=skip,
        limit=per_page
    )

    total_pages = (total + per_page - 1) // per_page

    return PaginatedResponse(
        items=tasks,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages
    )
```

### Cursor-Based Pagination

```python
from typing import Optional

class CursorPaginatedResponse(BaseModel):
    items: List[TaskResponse]
    next_cursor: Optional[str]
    has_more: bool

@router.get("/tasks", response_model=CursorPaginatedResponse)
async def list_tasks(
    cursor: Optional[str] = None,
    limit: int = Query(10, ge=1, le=100),
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user)
):
    """
    List tasks with cursor-based pagination (better for large datasets).

    Query Parameters:
        - cursor: Pagination cursor (from previous response)
        - limit: Number of items to return (default: 10, max: 100)

    Returns:
        Paginated list with next cursor
    """
    tasks, next_cursor = await service.list_tasks_cursor(
        user_id=current_user.id,
        cursor=cursor,
        limit=limit
    )

    return CursorPaginatedResponse(
        items=tasks,
        next_cursor=next_cursor,
        has_more=next_cursor is not None
    )
```

---

## Nested Resources

### Pattern: /parent/{parent_id}/child

```python
# Get comments for a specific task
@router.get("/tasks/{task_id}/comments", response_model=List[CommentResponse])
async def list_task_comments(
    task_id: str,
    service: CommentService = Depends(get_comment_service),
    current_user: User = Depends(get_current_user)
):
    """
    List all comments for a task.
    """
    return await service.list_comments(task_id, current_user.id)

# Create comment on a task
@router.post("/tasks/{task_id}/comments", response_model=CommentResponse, status_code=201)
async def create_task_comment(
    task_id: str,
    comment_data: CommentCreate,
    service: CommentService = Depends(get_comment_service),
    current_user: User = Depends(get_current_user)
):
    """
    Add a comment to a task.
    """
    return await service.create_comment(task_id, comment_data, current_user.id)

# Get specific comment
@router.get("/tasks/{task_id}/comments/{comment_id}", response_model=CommentResponse)
async def get_task_comment(
    task_id: str,
    comment_id: str,
    service: CommentService = Depends(get_comment_service),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific comment from a task.
    """
    comment = await service.get_comment(task_id, comment_id, current_user.id)

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    return comment

# Delete comment
@router.delete("/tasks/{task_id}/comments/{comment_id}", status_code=204)
async def delete_task_comment(
    task_id: str,
    comment_id: str,
    service: CommentService = Depends(get_comment_service),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a comment from a task.
    """
    success = await service.delete_comment(task_id, comment_id, current_user.id)

    if not success:
        raise HTTPException(status_code=404, detail="Comment not found")

    return None
```

---

## Bulk Operations

### Bulk Create

```python
@router.post("/tasks/bulk", response_model=List[TaskResponse], status_code=201)
async def create_tasks_bulk(
    tasks_data: List[TaskCreate],
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user)
):
    """
    Create multiple tasks at once.

    Limit: Maximum 100 tasks per request
    """
    if len(tasks_data) > 100:
        raise HTTPException(
            status_code=400,
            detail="Maximum 100 tasks allowed per bulk create"
        )

    return await service.create_tasks_bulk(tasks_data, current_user.id)
```

### Bulk Update

```python
class BulkUpdateRequest(BaseModel):
    task_ids: List[str] = Field(..., max_items=100)
    updates: TaskUpdate

@router.patch("/tasks/bulk", response_model=List[TaskResponse])
async def update_tasks_bulk(
    bulk_data: BulkUpdateRequest,
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user)
):
    """
    Update multiple tasks with the same changes.

    Limit: Maximum 100 tasks per request
    """
    return await service.update_tasks_bulk(
        bulk_data.task_ids,
        bulk_data.updates,
        current_user.id
    )
```

### Bulk Delete

```python
class BulkDeleteRequest(BaseModel):
    task_ids: List[str] = Field(..., max_items=100)

@router.delete("/tasks/bulk", status_code=204)
async def delete_tasks_bulk(
    bulk_data: BulkDeleteRequest,
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user)
):
    """
    Delete multiple tasks.

    Limit: Maximum 100 tasks per request
    """
    await service.delete_tasks_bulk(bulk_data.task_ids, current_user.id)
    return None
```

---

## File Uploads

### Single File Upload

```python
from fastapi import File, UploadFile

@router.post("/tasks/{task_id}/attachments", response_model=AttachmentResponse, status_code=201)
async def upload_attachment(
    task_id: str,
    file: UploadFile = File(...),
    service: AttachmentService = Depends(get_attachment_service),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a file attachment to a task.

    Supported formats: PDF, PNG, JPG, DOCX
    Max size: 10MB
    """
    # Validate file type
    allowed_types = ["application/pdf", "image/png", "image/jpeg", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file.content_type} not allowed"
        )

    # Validate file size (10MB)
    max_size = 10 * 1024 * 1024
    contents = await file.read()
    if len(contents) > max_size:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds 10MB limit"
        )

    await file.seek(0)  # Reset file pointer

    return await service.upload_attachment(
        task_id,
        file,
        current_user.id
    )
```

### Multiple File Upload

```python
@router.post("/tasks/{task_id}/attachments/bulk", response_model=List[AttachmentResponse], status_code=201)
async def upload_attachments(
    task_id: str,
    files: List[UploadFile] = File(...),
    service: AttachmentService = Depends(get_attachment_service),
    current_user: User = Depends(get_current_user)
):
    """
    Upload multiple file attachments to a task.

    Limit: Maximum 5 files per request
    Max size per file: 10MB
    """
    if len(files) > 5:
        raise HTTPException(
            status_code=400,
            detail="Maximum 5 files allowed per upload"
        )

    return await service.upload_attachments_bulk(
        task_id,
        files,
        current_user.id
    )
```

---

## API Versioning

### URL Path Versioning (Recommended)

```python
# app/main.py
from fastapi import FastAPI

app = FastAPI()

# Version 1
from app.api.v1 import router as v1_router
app.include_router(v1_router, prefix="/api/v1")

# Version 2
from app.api.v2 import router as v2_router
app.include_router(v2_router, prefix="/api/v2")
```

### Versioned Routers

```python
# app/api/v1/tasks.py
from fastapi import APIRouter

router = APIRouter(prefix="/tasks", tags=["tasks-v1"])

@router.get("")
async def list_tasks_v1():
    # V1 implementation
    pass

# app/api/v2/tasks.py
from fastapi import APIRouter

router = APIRouter(prefix="/tasks", tags=["tasks-v2"])

@router.get("")
async def list_tasks_v2():
    # V2 implementation with breaking changes
    pass
```

---

## Rate Limiting

### Basic Rate Limiting with slowapi

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@router.post("/tasks")
@limiter.limit("5/minute")
async def create_task(request: Request, task_data: TaskCreate):
    """
    Create task with rate limiting (5 requests per minute).
    """
    return await service.create_task(task_data)
```

### User-Based Rate Limiting

```python
from fastapi import Request

def get_user_id(request: Request) -> str:
    """Extract user ID from request for rate limiting."""
    # Get from JWT token
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    payload = verify_token(token)
    return payload.get("sub", get_remote_address(request))

limiter = Limiter(key_func=get_user_id)

@router.post("/tasks")
@limiter.limit("100/hour")
async def create_task(request: Request, task_data: TaskCreate):
    """
    Create task with user-based rate limiting (100 per hour per user).
    """
    return await service.create_task(task_data)
```

---

This covers the most common RESTful API patterns for FastAPI. See the main SKILL.md for architectural guidance.
