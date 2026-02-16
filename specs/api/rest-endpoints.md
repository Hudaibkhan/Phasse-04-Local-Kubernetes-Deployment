# REST API Endpoints Specification

## Status
📝 **Draft** - Phase II API Contract Definition

## Overview

RESTful API endpoints for the Evolution Todo application. All endpoints follow REST conventions and return consistent JSON responses.

## Base URL

- **Development**: `http://localhost:8000/api`
- **Production**: TBD (Phase III)

## API Conventions

### Request Headers

```
Content-Type: application/json
Cookie: auth_token=<jwt_token> (for authenticated endpoints)
```

### Response Format

**Success Response**:
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "message": "Operation completed successfully"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* optional field-specific errors */ }
  }
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
| ---- | ------- | ----- |
| 200 | OK | Successful GET, PUT, PATCH requests |
| 201 | Created | Successful POST request creating a resource |
| 204 | No Content | Successful DELETE request |
| 400 | Bad Request | Invalid request format or missing required fields |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Valid token but insufficient permissions (e.g., accessing another user's resource) |
| 404 | Not Found | Resource does not exist |
| 422 | Unprocessable Entity | Validation errors on input data |
| 500 | Internal Server Error | Unexpected server error |

### Authentication

Protected endpoints require a valid JWT token stored in HTTP-only cookie named `auth_token`. If token is missing, invalid, or expired, the API returns 401 Unauthorized.

---

## Authentication Endpoints

### POST /api/auth/register

Register a new user account.

**Access**: Public

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Validation Rules**:
- `email`: Required, valid email format, max 255 characters, not already registered
- `password`: Required, minimum 8 characters

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "created_at": "2026-01-07T12:00:00Z"
    }
  },
  "message": "Account created successfully"
}
```

**Error Responses**:

- 422 Validation Error:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": ["Email already registered"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

---

### POST /api/auth/login

Authenticate user and receive JWT token.

**Access**: Public

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com"
    }
  },
  "message": "Login successful"
}
```

**Note**: JWT token is set in HTTP-only cookie, not returned in response body.

**Error Responses**:

- 401 Unauthorized:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

---

### POST /api/auth/logout

Logout current user and invalidate token.

**Access**: Protected (requires authentication)

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Note**: HTTP-only cookie is cleared.

---

### GET /api/auth/me

Get current authenticated user profile.

**Access**: Protected (requires authentication)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "created_at": "2026-01-07T12:00:00Z"
    }
  }
}
```

**Error Responses**:

- 401 Unauthorized: Token missing or invalid

---

## Task Endpoints

### GET /api/tasks

List all tasks for authenticated user.

**Access**: Protected (requires authentication)

**Query Parameters**: None (Phase II - sorting/filtering deferred to Phase III)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "title": "Complete project documentation",
        "description": "Write comprehensive docs for Phase II",
        "completed": false,
        "created_at": "2026-01-07T12:00:00Z",
        "updated_at": "2026-01-07T12:00:00Z"
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440002",
        "title": "Review pull requests",
        "description": null,
        "completed": true,
        "created_at": "2026-01-06T10:00:00Z",
        "updated_at": "2026-01-07T09:30:00Z"
      }
    ],
    "count": 2
  }
}
```

**Note**: Tasks returned in reverse chronological order (newest first). Only returns tasks owned by authenticated user.

---

### POST /api/tasks

Create a new task.

**Access**: Protected (requires authentication)

**Request Body**:
```json
{
  "title": "New task title",
  "description": "Optional task description"
}
```

**Validation Rules**:
- `title`: Required, not empty/whitespace only, max 200 characters
- `description`: Optional, max 1000 characters

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "660e8400-e29b-41d4-a716-446655440003",
      "title": "New task title",
      "description": "Optional task description",
      "completed": false,
      "created_at": "2026-01-07T14:00:00Z",
      "updated_at": "2026-01-07T14:00:00Z"
    }
  },
  "message": "Task created successfully"
}
```

**Error Responses**:

- 422 Validation Error:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "title": ["Task title is required"],
      "description": ["Description cannot exceed 1000 characters"]
    }
  }
}
```

---

### GET /api/tasks/{id}

Get specific task details.

**Access**: Protected (requires authentication and task ownership)

**Path Parameters**:
- `id`: Task UUID

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "title": "Complete project documentation",
      "description": "Write comprehensive docs for Phase II",
      "completed": false,
      "created_at": "2026-01-07T12:00:00Z",
      "updated_at": "2026-01-07T12:00:00Z"
    }
  }
}
```

**Error Responses**:

- 404 Not Found:
```json
{
  "success": false,
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task not found"
  }
}
```

- 403 Forbidden (accessing another user's task):
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this task"
  }
}
```

---

### PUT /api/tasks/{id}

Update task details (full update).

**Access**: Protected (requires authentication and task ownership)

**Path Parameters**:
- `id`: Task UUID

**Request Body**:
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "completed": false
}
```

**Validation Rules**:
- `title`: Required, not empty/whitespace only, max 200 characters
- `description`: Optional, max 1000 characters, null to clear
- `completed`: Optional boolean

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "title": "Updated task title",
      "description": "Updated description",
      "completed": false,
      "created_at": "2026-01-07T12:00:00Z",
      "updated_at": "2026-01-07T15:00:00Z"
    }
  },
  "message": "Task updated successfully"
}
```

**Error Responses**: Same as GET /api/tasks/{id} plus validation errors

---

### PATCH /api/tasks/{id}

Partially update task (e.g., toggle completion status).

**Access**: Protected (requires authentication and task ownership)

**Path Parameters**:
- `id`: Task UUID

**Request Body** (any combination of fields):
```json
{
  "completed": true
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "title": "Complete project documentation",
      "description": "Write comprehensive docs for Phase II",
      "completed": true,
      "created_at": "2026-01-07T12:00:00Z",
      "updated_at": "2026-01-07T16:00:00Z"
    }
  },
  "message": "Task updated successfully"
}
```

**Error Responses**: Same as PUT /api/tasks/{id}

---

### DELETE /api/tasks/{id}

Delete a task permanently.

**Access**: Protected (requires authentication and task ownership)

**Path Parameters**:
- `id`: Task UUID

**Success Response** (204 No Content):

No response body. Status code 204 indicates successful deletion.

**Error Responses**:

- 404 Not Found: Task does not exist
- 403 Forbidden: User does not own the task

---

## Error Code Reference

| Error Code | HTTP Status | Description |
| ---------- | ----------- | ----------- |
| VALIDATION_ERROR | 422 | Input validation failed |
| INVALID_CREDENTIALS | 401 | Login credentials are incorrect |
| UNAUTHORIZED | 401 | Missing or invalid authentication token |
| FORBIDDEN | 403 | Valid authentication but insufficient permissions |
| TASK_NOT_FOUND | 404 | Requested task does not exist |
| USER_NOT_FOUND | 404 | User does not exist |
| EMAIL_ALREADY_EXISTS | 422 | Email is already registered |
| INTERNAL_ERROR | 500 | Unexpected server error |

## Security Considerations

### Authentication
- All protected endpoints validate JWT token from HTTP-only cookie
- Expired tokens return 401 Unauthorized
- Tampered tokens return 401 Unauthorized

### Authorization
- Task endpoints enforce user ownership at query level
- Attempting to access another user's task returns 403 Forbidden
- User ID extracted from validated JWT token, not from request body

### Input Validation
- All inputs sanitized and validated before processing
- SQL injection prevented via parameterized queries (SQLModel ORM)
- XSS prevented via proper output encoding in frontend

### Rate Limiting (Phase III)
- Not implemented in Phase II
- Future: Limit requests per IP/user to prevent abuse

## CORS Configuration

Development:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

Production: Configure for deployed frontend domain

## Notes

This API contract defines all endpoints required for Phase II. The design prioritizes:

1. **RESTful Conventions**: Standard HTTP methods and status codes
2. **Consistent Responses**: Uniform JSON structure across all endpoints
3. **Security**: Authentication, authorization, and input validation
4. **User Isolation**: Users can only access their own resources

**Implementation Notes**:
- Use FastAPI for automatic OpenAPI documentation generation
- SQLModel for type-safe database queries
- Pydantic models for request/response validation
- Better-Auth for JWT token handling

**Next Steps**:
- Implement endpoints in backend using FastAPI
- Generate OpenAPI documentation automatically
- Test all endpoints with Postman/Thunder Client
- Integrate with frontend API client
