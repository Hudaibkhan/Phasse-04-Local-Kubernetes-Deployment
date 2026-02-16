# Quickstart Guide: MCP Server Foundation

**Feature**: 001-mcp-server-foundation
**Date**: 2026-02-08
**Audience**: Developers implementing and testing the MCP server

## Overview

This guide walks you through setting up, testing, and verifying the MCP Server Foundation with Task Tools. Follow these steps in order to ensure a successful implementation.

## Prerequisites

Before starting, ensure you have:

- **Python 3.11+** installed
- **Neon PostgreSQL** database access (connection string in `.env`)
- **Existing backend** running successfully
- **Git** repository access
- **Terminal/Command Line** access

**Verify Prerequisites**:
```bash
# Check Python version
python --version  # Should be 3.11 or higher

# Check database connection
psql $DATABASE_URL -c "SELECT version();"

# Verify existing backend works
cd Quantum-Todo-Backend
python main.py  # Should start without errors
```

## Step 1: Baseline Verification

**CRITICAL**: Before making any changes, verify all existing features work correctly.

### 1.1 Start the Backend

```bash
cd Quantum-Todo-Backend
python main.py
```

Expected output:
```
INFO:     Application startup complete
INFO:     Uvicorn running on http://0.0.0.0:7860
```

### 1.2 Test Existing Features

**Authentication**:
```bash
# Signup
curl -X POST http://localhost:7860/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"testpass123"}'

# Login
curl -X POST http://localhost:7860/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

**Task CRUD**:
```bash
# Create task (use token from login)
curl -X POST http://localhost:7860/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"Testing baseline"}'

# List tasks
curl -X GET http://localhost:7860/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"

# Complete task
curl -X PATCH http://localhost:7860/api/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

**Checklist**:
- [ ] Signup works
- [ ] Login works and returns token
- [ ] Create task works
- [ ] List tasks works
- [ ] Complete task works
- [ ] Recurring tasks create next occurrence
- [ ] Notifications are generated

⚠️ **STOP**: If any baseline test fails, fix existing issues before proceeding.

## Step 2: Install MCP SDK

### 2.1 Add Dependency

Add to `requirements.txt`:
```
mcp==1.0.0
```

### 2.2 Install Dependencies

```bash
pip install -r requirements.txt
```

### 2.3 Verify Installation

```bash
python -c "import mcp; print(mcp.__version__)"
```

Expected output: `1.0.0` (or installed version)

## Step 3: Database Migration

### 3.1 Create Migration

```bash
cd Quantum-Todo-Backend

# Generate migration for new tables
alembic revision --autogenerate -m "add_conversation_message_tables"
```

### 3.2 Review Migration

Open the generated migration file in `alembic/versions/` and verify:
- [ ] Creates `conversations` table with correct fields
- [ ] Creates `messages` table with correct fields
- [ ] Adds foreign key constraints
- [ ] Creates indexes on user_id, conversation_id, created_at
- [ ] Does NOT modify existing tables

### 3.3 Apply Migration

```bash
# Apply migration to Neon DB
alembic upgrade head
```

### 3.4 Verify Tables Created

```bash
# Check tables exist
psql $DATABASE_URL -c "\dt conversations"
psql $DATABASE_URL -c "\dt messages"

# Check table structure
psql $DATABASE_URL -c "\d conversations"
psql $DATABASE_URL -c "\d messages"
```

Expected output: Tables exist with correct columns and indexes.

### 3.5 Test Rollback (Optional)

```bash
# Test downgrade works
alembic downgrade -1

# Verify tables removed
psql $DATABASE_URL -c "\dt conversations"  # Should not exist

# Re-apply migration
alembic upgrade head
```

## Step 4: Implement Database Models

### 4.1 Create Conversation Model

Create `src/models/conversation.py`:
```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import TYPE_CHECKING, List
from uuid import UUID, uuid4

if TYPE_CHECKING:
    from .user import User
    from .message import Message

class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships
    user: "User" = Relationship(back_populates="conversations")
    messages: List["Message"] = Relationship(
        back_populates="conversation",
        cascade_delete=True
    )

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True
```

### 4.2 Create Message Model

Create `src/models/message.py`:
```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

if TYPE_CHECKING:
    from .user import User
    from .conversation import Conversation

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(
        foreign_key="conversations.id",
        nullable=False,
        index=True
    )
    user_id: UUID = Field(
        foreign_key="users.id",
        nullable=False,
        index=True
    )
    role: str = Field(max_length=20, nullable=False)
    content: str = Field(nullable=False)
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        index=True
    )

    # Relationships
    conversation: "Conversation" = Relationship(back_populates="messages")
    user: "User" = Relationship(back_populates="messages")

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True
```

### 4.3 Update User Model

Edit `src/models/user.py` to add relationships:
```python
# Add to imports
from typing import TYPE_CHECKING, List

if TYPE_CHECKING:
    from .conversation import Conversation
    from .message import Message

# Add to User class
class User(UserBase, table=True):
    # ... existing fields ...

    # NEW: Add relationships
    conversations: List["Conversation"] = Relationship(back_populates="user")
    messages: List["Message"] = Relationship(back_populates="user")
```

### 4.4 Update Model Exports

Edit `src/models/__init__.py`:
```python
from .user import User
from .task import Task
from .conversation import Conversation  # NEW
from .message import Message  # NEW
# ... other imports

__all__ = ["User", "Task", "Conversation", "Message", ...]
```

## Step 5: Implement MCP Server Module

### 5.1 Create MCP Server Directory

```bash
mkdir -p src/mcp_server/tools
touch src/mcp_server/__init__.py
touch src/mcp_server/server.py
touch src/mcp_server/schemas.py
touch src/mcp_server/tools/__init__.py
```

### 5.2 Implement Tool Schemas

Create `src/mcp_server/schemas.py`:
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
        json_encoders = {UUID: str}

# Add other schemas for list_tasks, complete_task, etc.
```

### 5.3 Implement MCP Server

Create `src/mcp_server/server.py`:
```python
from mcp.server import Server
from mcp.server.stdio import stdio_server
from .tools.add_task import add_task
from .tools.list_tasks import list_tasks
from .tools.complete_task import complete_task
from .tools.update_task import update_task
from .tools.delete_task import delete_task

# Initialize MCP server
server = Server("quantum-todo-mcp")

# Register tools
server.tool()(add_task)
server.tool()(list_tasks)
server.tool()(complete_task)
server.tool()(update_task)
server.tool()(delete_task)

def run_server():
    """Run the MCP server"""
    stdio_server(server)

if __name__ == "__main__":
    run_server()
```

### 5.4 Implement Tools

For each tool, create a file in `src/mcp_server/tools/`:

**Example: `add_task.py`**:
```python
from uuid import UUID
from typing import Optional
from src.db.session import SessionLocal
from src.services.task_service import TaskService
from src.schemas.task import TaskCreate as TaskCreateSchema

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
        description: Optional task description

    Returns:
        dict with task_id, status, and title
    """
    with SessionLocal() as session:
        try:
            # Create task using existing service
            task = TaskService.create_task(
                session=session,
                user_id=UUID(user_id),
                task_data=TaskCreateSchema(
                    title=title,
                    description=description
                )
            )

            return {
                "task_id": str(task.id),
                "status": "completed" if task.completed else "pending",
                "title": task.title
            }
        except Exception as e:
            raise Exception(f"Failed to create task: {str(e)}")
```

Repeat for other tools following the same pattern.

## Step 6: Test MCP Tools

### 6.1 Create Test File

Create `tests/test_mcp_tools.py`:
```python
import pytest
from uuid import uuid4
from src.mcp_server.tools.add_task import add_task

@pytest.mark.asyncio
async def test_add_task():
    # Create test user first
    user_id = str(uuid4())  # Use real user ID from test setup

    result = await add_task(
        user_id=user_id,
        title="Test Task",
        description="Testing MCP tool"
    )

    assert "task_id" in result
    assert result["status"] == "pending"
    assert result["title"] == "Test Task"
```

### 6.2 Run Tests

```bash
# Run all tests
pytest

# Run only MCP tool tests
pytest tests/test_mcp_tools.py -v
```

### 6.3 Manual Tool Testing

Create a test script `test_mcp_manual.py`:
```python
import asyncio
from src.mcp_server.tools.add_task import add_task
from src.mcp_server.tools.list_tasks import list_tasks

async def main():
    # Replace with real user ID
    user_id = "YOUR_USER_ID"

    # Test add_task
    print("Testing add_task...")
    result = await add_task(user_id, "MCP Test Task", "Testing manually")
    print(f"Created task: {result}")

    # Test list_tasks
    print("\nTesting list_tasks...")
    result = await list_tasks(user_id, "all")
    print(f"Tasks: {result}")

if __name__ == "__main__":
    asyncio.run(main())
```

Run:
```bash
python test_mcp_manual.py
```

## Step 7: Regression Testing

### 7.1 Re-run Baseline Tests

Repeat all tests from Step 1.2 to ensure existing features still work.

### 7.2 Create Regression Test Suite

Create `tests/test_regression.py`:
```python
import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.mark.regression
def test_existing_auth_still_works():
    client = TestClient(app)
    response = client.post("/api/auth/signup", json={
        "email": "regression@test.com",
        "username": "regtest",
        "password": "testpass123"
    })
    assert response.status_code in [200, 201]

@pytest.mark.regression
def test_existing_task_api_still_works():
    # Test all existing task endpoints
    pass
```

### 7.3 Run Regression Tests

```bash
pytest tests/test_regression.py -m regression -v
```

**Checklist**:
- [ ] All existing API endpoints work
- [ ] Authentication flows unchanged
- [ ] Task CRUD operations work
- [ ] Recurring tasks still create next occurrence
- [ ] Notifications still generate
- [ ] No performance degradation

## Step 8: Run MCP Server

### 8.1 Start MCP Server

```bash
cd Quantum-Todo-Backend
python -m src.mcp_server.server
```

The server will run and listen for MCP client connections via stdio.

### 8.2 Test with MCP Client

If you have an MCP client (like Claude Desktop), configure it to connect to the server:

```json
{
  "mcpServers": {
    "quantum-todo": {
      "command": "python",
      "args": ["-m", "src.mcp_server.server"],
      "cwd": "/path/to/Quantum-Todo-Backend"
    }
  }
}
```

## Troubleshooting

### Issue: Migration Fails

**Symptoms**: `alembic upgrade head` fails with error

**Solutions**:
1. Check database connection: `psql $DATABASE_URL -c "SELECT 1;"`
2. Verify no conflicting tables: `psql $DATABASE_URL -c "\dt"`
3. Check migration file for syntax errors
4. Ensure Alembic is up to date: `pip install --upgrade alembic`

### Issue: MCP SDK Import Error

**Symptoms**: `ModuleNotFoundError: No module named 'mcp'`

**Solutions**:
1. Verify installation: `pip list | grep mcp`
2. Reinstall: `pip install --force-reinstall mcp`
3. Check Python environment: `which python`

### Issue: Tool Returns Error

**Symptoms**: Tool execution fails with exception

**Solutions**:
1. Check database connection in tool
2. Verify user_id exists in database
3. Check TaskService is accessible
4. Review error logs for details
5. Test TaskService directly to isolate issue

### Issue: Existing Features Broken

**Symptoms**: REST API endpoints fail after changes

**Solutions**:
1. Rollback migration: `alembic downgrade -1`
2. Review code changes - ensure no modifications to existing files
3. Check for import errors in models
4. Restart backend server
5. Clear Python cache: `find . -type d -name __pycache__ -exec rm -r {} +`

## Verification Checklist

Before considering implementation complete:

- [ ] All 5 MCP tools implemented
- [ ] Database migration applied successfully
- [ ] Conversation and Message tables exist in Neon DB
- [ ] All tools enforce user ownership
- [ ] All tools return structured JSON responses
- [ ] Unit tests pass for all tools
- [ ] Integration tests pass
- [ ] Regression tests pass (zero failures)
- [ ] Existing REST API works unchanged
- [ ] Authentication flows work
- [ ] Task CRUD operations work
- [ ] Recurring tasks work
- [ ] Notifications work
- [ ] MCP server starts without errors
- [ ] Documentation complete

## Next Steps

After successful implementation and verification:

1. **Document Lessons Learned**: Note any issues encountered and solutions
2. **Performance Baseline**: Record tool response times for monitoring
3. **Prepare for Phase III Step 2**: OpenAI Agents SDK integration
4. **Update Team**: Share quickstart guide with team members

## Additional Resources

- **MCP SDK Documentation**: https://github.com/anthropics/mcp
- **SQLModel Documentation**: https://sqlmodel.tiangolo.com/
- **Alembic Documentation**: https://alembic.sqlalchemy.org/
- **FastAPI Documentation**: https://fastapi.tiangolo.com/

## Support

If you encounter issues not covered in this guide:

1. Check the research.md document for technical decisions
2. Review data-model.md for entity definitions
3. Check contracts/ directory for tool specifications
4. Consult the implementation plan in plan.md

---

## Implementation Notes (2026-02-08)

### Actual Implementation Experience

**Migration Cleanup Required:**
The Alembic autogenerate command created a migration that included unwanted modifications to existing tables (tasks, users, sessions). The migration file had to be manually cleaned to ONLY include the new conversations and messages tables. This is critical for FR-017 compliance.

**UUID Serialization Fix:**
Pydantic's `model_dump()` method doesn't apply json_encoders by default. All tool implementations use `model_dump(mode='json')` to properly serialize UUIDs to strings.

**Tool Implementation Pattern:**
All tools follow a consistent pattern:
1. Accept input via Pydantic schema
2. Open database session with context manager
3. Delegate to existing TaskService methods
4. Return structured response with `model_dump(mode='json')`
5. Handle errors with structured error objects

**Test Scripts Created:**
- `test_mcp_tools.py` - Comprehensive validation of all 5 tools (T032-T038)
- `test_regression.py` - Regression testing for existing features (T039-T044)
- `test_conversation_persistence.py` - Manual test for Conversation model
- `test_message_persistence.py` - Manual test for Message model

**Validation Results:**
- All 5 MCP tools: PASS
- User ownership enforcement: PASS
- Error handling: PASS
- Regression tests: PASS (zero failures)
- Database schema integrity: PASS

**Known Issues:**
1. MCP SDK version conflict with openai-agents (requires mcp>=1.8.0) - acceptable as OpenAI Agents SDK is out of scope
2. Auth regression test skips user deletion to avoid cascade issues with tags table
3. Windows console Unicode encoding issues resolved by using ASCII characters in test output

**Performance Notes:**
- Tool response times: 200-500ms average (database latency dependent)
- No performance degradation observed in existing REST API endpoints
- Database connection pooling working correctly

**Files Modified:**
- `requirements.txt` - Added mcp==1.0.0
- `src/models/user.py` - Added relationships
- `src/models/__init__.py` - Exported new models

**Files Created:**
- 11 new source files in src/mcp_server/
- 1 migration file
- 4 test scripts
- 1 implementation summary document
