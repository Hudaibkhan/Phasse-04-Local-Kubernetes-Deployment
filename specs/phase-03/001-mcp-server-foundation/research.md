# Research: MCP Server Foundation with Task Tools

**Feature**: 001-mcp-server-foundation
**Date**: 2026-02-08
**Status**: Completed

## Overview

This document captures research findings for implementing an MCP (Model Context Protocol) server foundation in the Quantum Todo backend. All technical decisions and patterns are documented here to guide implementation.

## R1: MCP SDK Integration Patterns

### Decision

Use the **Official MCP Python SDK** (`mcp` package) with FastAPI integration pattern where the MCP server runs as a separate process/module alongside the existing FastAPI application.

### Rationale

1. **Official Support**: The MCP Python SDK is the canonical implementation maintained by Anthropic
2. **Separation of Concerns**: Running MCP server separately from FastAPI REST API maintains clear boundaries
3. **Stateless Design**: MCP SDK supports stateless tool execution, aligning with our requirements
4. **Standard Patterns**: SDK provides established patterns for tool registration and error handling

### Alternatives Considered

- **Custom MCP Implementation**: Rejected - reinventing the wheel, no benefit over official SDK
- **Embedding in FastAPI Routes**: Rejected - violates separation of concerns, complicates lifecycle management
- **Third-party MCP Libraries**: Rejected - official SDK is most reliable and well-documented

### Implementation Notes

**Installation**:
```bash
pip install mcp
```

**Server Initialization Pattern**:
```python
from mcp.server import Server
from mcp.server.stdio import stdio_server

# Initialize MCP server
server = Server("quantum-todo-mcp")

# Register tools
@server.tool()
async def add_task(user_id: str, title: str, description: str = None):
    # Tool implementation
    pass

# Run server
if __name__ == "__main__":
    stdio_server(server)
```

**Key Points**:
- MCP server communicates via stdio (standard input/output)
- Tools are registered using decorators
- Server runs independently from FastAPI app
- Can be invoked by MCP clients (like Claude Desktop or OpenAI Agents SDK)

## R2: Stateless Tool Design

### Decision

Implement tools as **pure functions** that:
1. Accept database session as a dependency
2. Call existing TaskService methods
3. Return structured responses
4. Handle errors with proper MCP error types

### Rationale

1. **Reuse Existing Logic**: TaskService already implements all business rules correctly
2. **No Duplication**: Tools are thin wrappers, not reimplementations
3. **Stateless**: Each tool invocation is independent, no shared state
4. **Testable**: Pure functions are easy to test in isolation

### Alternatives Considered

- **Stateful Tool Manager**: Rejected - violates stateless requirement, adds complexity
- **Direct Database Access**: Rejected - bypasses existing service layer, duplicates logic
- **Tool-Specific Services**: Rejected - unnecessary abstraction, violates DRY principle

### Implementation Notes

**Database Session Management**:
```python
from src.db.session import SessionLocal
from src.services.task_service import TaskService

@server.tool()
async def add_task(user_id: str, title: str, description: str = None):
    # Create session for this tool invocation
    with SessionLocal() as session:
        try:
            # Delegate to existing service
            task = TaskService.create_task(
                session=session,
                user_id=UUID(user_id),
                task_data=TaskCreateSchema(title=title, description=description)
            )

            # Return structured response
            return {
                "task_id": str(task.id),
                "status": "completed" if task.completed else "pending",
                "title": task.title
            }
        except Exception as e:
            # Handle errors appropriately
            raise McpError(f"Failed to create task: {str(e)}")
```

**Key Patterns**:
- Session created per tool invocation
- Automatic session cleanup via context manager
- Service layer handles all business logic
- Tools only handle input/output transformation

## R3: Tool Input/Output Schemas

### Decision

Define tool schemas using **Pydantic models** for input validation and **JSON-serializable dictionaries** for output, following MCP SDK conventions.

### Rationale

1. **Type Safety**: Pydantic provides runtime validation
2. **MCP Compatibility**: SDK expects JSON-compatible schemas
3. **Existing Patterns**: Backend already uses Pydantic extensively
4. **Clear Contracts**: Schemas serve as documentation

### Alternatives Considered

- **Plain Dictionaries**: Rejected - no validation, error-prone
- **Custom Validation**: Rejected - Pydantic is standard, well-tested
- **Protobuf/gRPC**: Rejected - MCP uses JSON, unnecessary complexity

### Implementation Notes

**Schema Definition**:
```python
from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional

class AddTaskInput(BaseModel):
    user_id: UUID
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)

class TaskOutput(BaseModel):
    task_id: UUID
    status: str
    title: str

    class Config:
        json_encoders = {
            UUID: str  # Serialize UUIDs as strings
        }
```

**Tool Registration with Schema**:
```python
@server.tool()
async def add_task(
    user_id: str,
    title: str,
    description: Optional[str] = None
) -> dict:
    """
    Create a new task for a user.

    Args:
        user_id: UUID of the user creating the task
        title: Task title (1-200 characters)
        description: Optional task description (max 1000 characters)

    Returns:
        dict with task_id, status, and title
    """
    # Validate input
    input_data = AddTaskInput(
        user_id=UUID(user_id),
        title=title,
        description=description
    )

    # Process and return
    # ...
```

**Error Response Format**:
```python
{
    "error": {
        "code": "TASK_NOT_FOUND",
        "message": "Task with id {task_id} not found for user {user_id}"
    }
}
```

## R4: Migration Safety for Neon PostgreSQL

### Decision

Use **Alembic migrations** with additive-only changes, tested on staging before production, with explicit rollback procedures.

### Rationale

1. **Existing Infrastructure**: Alembic already in use for migrations
2. **Neon Compatibility**: Alembic works seamlessly with Neon PostgreSQL
3. **Version Control**: Migrations tracked in git
4. **Rollback Support**: Alembic provides downgrade functionality

### Alternatives Considered

- **Manual SQL Scripts**: Rejected - error-prone, no version control
- **ORM Auto-migrations**: Rejected - too risky for production
- **Database-specific Tools**: Rejected - Alembic is database-agnostic

### Implementation Notes

**Migration Generation**:
```bash
# Generate migration
alembic revision --autogenerate -m "add_conversation_message_tables"

# Review generated migration
# Edit if needed to ensure safety

# Test on staging
alembic upgrade head

# Verify tables created
psql $DATABASE_URL -c "\dt conversations"
psql $DATABASE_URL -c "\dt messages"
```

**Migration Template**:
```python
"""add conversation and message tables

Revision ID: [auto-generated]
Revises: [previous-revision]
Create Date: 2026-02-08

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

def upgrade() -> None:
    # Create conversations table
    op.create_table(
        'conversations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_conversations_user_id', 'conversations', ['user_id'])

    # Create messages table
    op.create_table(
        'messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('conversation_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('role', sa.String(20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_messages_conversation_id', 'messages', ['conversation_id'])
    op.create_index('ix_messages_user_id', 'messages', ['user_id'])
    op.create_index('ix_messages_created_at', 'messages', ['created_at'])

def downgrade() -> None:
    op.drop_table('messages')
    op.drop_table('conversations')
```

**Safety Checklist**:
- [ ] Migration only adds tables (no modifications to existing tables)
- [ ] Foreign keys properly defined with CASCADE on delete
- [ ] Indexes created for query performance
- [ ] Tested on staging environment
- [ ] Rollback tested (downgrade works)
- [ ] No data loss risk (additive only)

**Neon-Specific Considerations**:
- Neon supports standard PostgreSQL migrations
- Connection pooling handled by existing configuration
- SSL mode already configured in DATABASE_URL
- No special Neon-specific migration syntax needed

## R5: Testing MCP Tools

### Decision

Implement **three-tier testing strategy**:
1. **Unit Tests**: Test tool logic in isolation with mocked services
2. **Integration Tests**: Test tools with real database (test database)
3. **Regression Tests**: Verify existing features still work

### Rationale

1. **Comprehensive Coverage**: Each tier catches different types of issues
2. **Fast Feedback**: Unit tests run quickly, integration tests verify real behavior
3. **Safety Net**: Regression tests ensure no breaking changes
4. **Existing Infrastructure**: pytest already in use

### Alternatives Considered

- **Integration Tests Only**: Rejected - slow, harder to debug
- **Manual Testing Only**: Rejected - not repeatable, error-prone
- **End-to-End Tests Only**: Rejected - too slow for development cycle

### Implementation Notes

**Unit Test Example**:
```python
import pytest
from unittest.mock import Mock, patch
from uuid import uuid4
from src.mcp_server.tools.add_task import add_task

@pytest.mark.asyncio
async def test_add_task_success():
    # Mock dependencies
    mock_session = Mock()
    mock_task = Mock(id=uuid4(), title="Test Task", completed=False)

    with patch('src.services.task_service.TaskService.create_task', return_value=mock_task):
        result = await add_task(
            user_id=str(uuid4()),
            title="Test Task",
            description="Test Description"
        )

    assert result["task_id"] == str(mock_task.id)
    assert result["status"] == "pending"
    assert result["title"] == "Test Task"

@pytest.mark.asyncio
async def test_add_task_unauthorized():
    # Test user ownership enforcement
    with pytest.raises(McpError, match="Unauthorized"):
        await add_task(
            user_id=str(uuid4()),
            title="Test Task"
        )
```

**Integration Test Example**:
```python
import pytest
from src.db.session import SessionLocal
from src.models.user import User
from src.mcp_server.tools.add_task import add_task

@pytest.mark.integration
@pytest.mark.asyncio
async def test_add_task_integration(test_db):
    # Create test user
    with SessionLocal() as session:
        user = User(email="test@example.com", username="testuser", password_hash="hash")
        session.add(user)
        session.commit()
        user_id = user.id

    # Test tool with real database
    result = await add_task(
        user_id=str(user_id),
        title="Integration Test Task",
        description="Testing with real DB"
    )

    # Verify task created
    with SessionLocal() as session:
        task = session.query(Task).filter_by(id=UUID(result["task_id"])).first()
        assert task is not None
        assert task.title == "Integration Test Task"
        assert task.user_id == user_id
```

**Regression Test Example**:
```python
import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.mark.regression
def test_existing_task_api_still_works():
    """Verify existing REST API endpoints unchanged"""
    client = TestClient(app)

    # Test existing endpoints
    response = client.post("/api/tasks", json={
        "title": "Test Task",
        "description": "Testing existing API"
    })
    assert response.status_code == 201

    response = client.get("/api/tasks")
    assert response.status_code == 200
```

**Test Organization**:
```
tests/
├── unit/
│   └── test_mcp_tools.py          # Unit tests for tools
├── integration/
│   └── test_mcp_integration.py    # Integration tests with DB
└── regression/
    └── test_existing_features.py  # Regression tests
```

**Test Execution**:
```bash
# Run all tests
pytest

# Run only unit tests (fast)
pytest tests/unit/

# Run integration tests
pytest tests/integration/ -m integration

# Run regression tests
pytest tests/regression/ -m regression
```

## R6: Dependency Management

### Decision

Add MCP SDK to `requirements.txt` with pinned version for reproducibility.

### Rationale

1. **Version Control**: Pinned versions ensure consistent environments
2. **Existing Pattern**: requirements.txt already in use
3. **Simple**: No need for more complex dependency management

### Alternatives Considered

- **Poetry/Pipenv**: Rejected - adds complexity, requirements.txt sufficient
- **Unpinned Versions**: Rejected - risks breaking changes
- **Git Submodules**: Rejected - unnecessary for PyPI packages

### Implementation Notes

**requirements.txt Addition**:
```
# Existing dependencies
fastapi==0.104.1
sqlmodel==0.0.14
alembic==1.12.1
# ... other existing deps

# NEW: MCP Server Foundation
mcp==1.0.0  # Official MCP Python SDK
```

**Installation**:
```bash
pip install -r requirements.txt
```

**Version Selection**:
- Use latest stable version of MCP SDK at time of implementation
- Pin to specific version to avoid breaking changes
- Document version in quickstart.md

## Summary of Decisions

| Research Area | Decision | Key Rationale |
|---------------|----------|---------------|
| MCP SDK Integration | Official MCP Python SDK with separate server process | Standard, well-supported, clean separation |
| Tool Architecture | Stateless functions delegating to TaskService | Reuses existing logic, no duplication |
| Schema Definition | Pydantic models for input, JSON dicts for output | Type safety, MCP compatibility |
| Database Migrations | Alembic with additive-only changes | Existing infrastructure, safe, version-controlled |
| Testing Strategy | Three-tier: unit, integration, regression | Comprehensive coverage, fast feedback |
| Dependencies | Pinned version in requirements.txt | Reproducible, simple |

## Implementation Readiness

All technical unknowns have been resolved. The implementation can proceed with:
- Clear patterns for MCP server setup
- Defined tool architecture
- Safe migration strategy
- Comprehensive testing approach
- Dependency management plan

**Next Step**: Proceed to Phase 1 (Design Artifacts) to create data-model.md, contracts/, and quickstart.md.
