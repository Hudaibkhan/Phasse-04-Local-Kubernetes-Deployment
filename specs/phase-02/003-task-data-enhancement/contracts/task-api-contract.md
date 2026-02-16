# API Contract: Task Management with Enhanced Metadata

**Feature**: Task Data Enhancement and Dashboard UI
**Date**: 2026-01-15
**Service**: Task Management API
**Version**: 1.0

## Overview

This document defines the API contract for task management with enhanced metadata support including priority, due date, tags, and recurrence patterns. The API follows RESTful principles and uses standard HTTP methods and status codes.

## Base URL

```
https://api.example.com/v1
```

## Authentication

All endpoints require authentication using Bearer tokens:
```
Authorization: Bearer {jwt_token}
```

## Common Headers

- `Content-Type: application/json`
- `Accept: application/json`

## Task Resource

### Create Task

**Endpoint**: `POST /tasks`

**Description**: Creates a new task with optional metadata fields.

**Request Body**:
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

**Success Response (201 Created)**:
```json
{
  "id": "integer",
  "title": "string",
  "description": "string or null",
  "completed": "boolean (default: false)",
  "priority": "string or null",
  "due_date": "ISO 8601 datetime string or null",
  "tags": "array of strings or null",
  "recurrence_pattern": "string or null",
  "created_at": "ISO 8601 datetime string",
  "updated_at": "ISO 8601 datetime string",
  "user_id": "integer"
}
```

**Validation Errors (422 Unprocessable Entity)**:
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "Field required",
      "type": "value_error.missing"
    }
  ]
}
```

### Get All Tasks

**Endpoint**: `GET /tasks`

**Description**: Retrieves all tasks for the authenticated user with optional filtering.

**Query Parameters**:
- `completed` (boolean, optional): Filter by completion status
- `priority` (string, optional): Filter by priority level
- `due_before` (datetime, optional): Filter tasks due before this date
- `tag` (string, optional): Filter by specific tag
- `limit` (integer, optional): Number of results to return (default: 50)
- `offset` (integer, optional): Number of results to skip (default: 0)

**Success Response (200 OK)**:
```json
{
  "tasks": [
    {
      "id": "integer",
      "title": "string",
      "description": "string or null",
      "completed": "boolean",
      "priority": "string or null",
      "due_date": "ISO 8601 datetime string or null",
      "tags": "array of strings or null",
      "recurrence_pattern": "string or null",
      "created_at": "ISO 8601 datetime string",
      "updated_at": "ISO 8601 datetime string",
      "user_id": "integer"
    }
  ],
  "total": "integer",
  "limit": "integer",
  "offset": "integer"
}
```

### Get Task by ID

**Endpoint**: `GET /tasks/{id}`

**Description**: Retrieves a specific task by its ID.

**Path Parameters**:
- `id` (integer): Task ID

**Success Response (200 OK)**:
```json
{
  "id": "integer",
  "title": "string",
  "description": "string or null",
  "completed": "boolean",
  "priority": "string or null",
  "due_date": "ISO 8601 datetime string or null",
  "tags": "array of strings or null",
  "recurrence_pattern": "string or null",
  "created_at": "ISO 8601 datetime string",
  "updated_at": "ISO 8601 datetime string",
  "user_id": "integer"
}
```

**Not Found (404 Not Found)**:
```json
{
  "detail": "Task not found"
}
```

### Update Task

**Endpoint**: `PUT /tasks/{id}`

**Description**: Updates an existing task with new data.

**Path Parameters**:
- `id` (integer): Task ID

**Request Body**:
```json
{
  "title": "string (optional, max 255)",
  "description": "string (optional, max 1000)",
  "priority": "enum (optional, one of: 'low', 'medium', 'high')",
  "due_date": "ISO 8601 datetime string (optional)",
  "tags": "array of strings (optional, max 10 tags)",
  "recurrence_pattern": "string (optional, e.g., 'daily', 'weekly', 'monthly')",
  "completed": "boolean (optional)"
}
```

**Success Response (200 OK)**:
```json
{
  "id": "integer",
  "title": "string",
  "description": "string or null",
  "completed": "boolean",
  "priority": "string or null",
  "due_date": "ISO 8601 datetime string or null",
  "tags": "array of strings or null",
  "recurrence_pattern": "string or null",
  "created_at": "ISO 8601 datetime string",
  "updated_at": "ISO 8601 datetime string",
  "user_id": "integer"
}
```

### Patch Task Completion Status

**Endpoint**: `PATCH /tasks/{id}/complete`

**Description**: Toggles the completion status of a task.

**Path Parameters**:
- `id` (integer): Task ID

**Request Body**:
```json
{
  "completed": "boolean (required)"
}
```

**Success Response (200 OK)**:
```json
{
  "id": "integer",
  "title": "string",
  "description": "string or null",
  "completed": "boolean",
  "priority": "string or null",
  "due_date": "ISO 8601 datetime string or null",
  "tags": "array of strings or null",
  "recurrence_pattern": "string or null",
  "created_at": "ISO 8601 datetime string",
  "updated_at": "ISO 8601 datetime string",
  "user_id": "integer"
}
```

### Delete Task

**Endpoint**: `DELETE /tasks/{id}`

**Description**: Deletes a task permanently.

**Path Parameters**:
- `id` (integer): Task ID

**Success Response (204 No Content)**: Empty response body

**Not Found (404 Not Found)**:
```json
{
  "detail": "Task not found"
}
```

## Error Responses

### Common Error Formats

**Validation Error (422)**:
```json
{
  "detail": [
    {
      "loc": ["string"],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

**Unauthorized (401)**:
```json
{
  "detail": "Not authenticated"
}
```

**Forbidden (403)**:
```json
{
  "detail": "Access denied"
}
```

**Not Found (404)**:
```json
{
  "detail": "Resource not found"
}
```

**Server Error (500)**:
```json
{
  "detail": "Internal server error"
}
```

## Rate Limiting

- Requests are limited to 1000 per hour per user
- Exceeding limits returns 429 Too Many Requests with retry-after header

## Data Types

- `integer`: 32-bit signed integer
- `string`: UTF-8 encoded text
- `boolean`: true/false values
- `datetime`: ISO 8601 formatted date-time string with timezone
- `array`: JSON array of specified type
- `enum`: String value restricted to specific allowed values