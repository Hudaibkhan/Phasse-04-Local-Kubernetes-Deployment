# Quickstart Guide: OpenAI Agents SDK Integration

**Feature**: 002-openai-agent-integration
**Date**: 2026-02-08
**Audience**: Developers implementing the AI agent feature

## Overview

This guide provides step-by-step instructions for implementing the OpenAI Agents SDK integration to enable natural language task management in Evolution Todo.

**What You'll Build**:
- AI agent that understands natural language task commands
- Integration with 5 existing MCP tools
- REST API endpoint for agent chat
- Multi-step operation support
- Comprehensive error handling

**Prerequisites**:
- Phase III Step 1 (MCP Server Foundation) complete
- Python 3.11+ installed
- OpenAI API key with sufficient quota
- Existing backend running successfully

---

## Step 1: Install Dependencies

### 1.1 Update requirements.txt

Add the following dependencies to `Quantum-Todo-Backend/requirements.txt`:

```txt
# OpenAI Assistants API
openai>=1.59.4

# MCP SDK upgrade (from 1.0.0 to 1.8.0+)
mcp>=1.8.0
```

### 1.2 Install packages

```bash
cd Quantum-Todo-Backend
pip install -r requirements.txt
```

### 1.3 Verify installation

```bash
python -c "import openai; print(f'OpenAI SDK version: {openai.__version__}')"
python -c "import mcp; print('MCP SDK installed successfully')"
```

**Expected output**:
```
OpenAI SDK version: 1.59.4 (or higher)
MCP SDK installed successfully
```

---

## Step 2: Configure Environment Variables

### 2.1 Add OpenAI API key

Edit `Quantum-Todo-Backend/.env` and add:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=sk-proj-...your-api-key-here...
```

**Security Notes**:
- Never commit `.env` to version control
- Use a dedicated API key for this project
- Rotate keys regularly
- Monitor usage to avoid unexpected costs

### 2.2 Verify environment variable

```bash
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('API key loaded' if os.getenv('OPENAI_API_KEY') else 'API key missing')"
```

---

## Step 3: Validate MCP SDK Upgrade

### 3.1 Run regression tests

Before proceeding, verify that upgrading from mcp==1.0.0 to mcp>=1.8.0 doesn't break existing MCP tools:

```bash
cd Quantum-Todo-Backend
pytest tests/test_mcp_tools.py -v
pytest tests/test_regression.py -v
```

**Expected result**: All tests pass (0 failures)

### 3.2 If tests fail

If any tests fail after the MCP SDK upgrade:

1. Review error messages for schema validation issues
2. Check if tool input/output schemas need updates
3. Verify UUID serialization still works (`model_dump(mode='json')`)
4. Consult MCP SDK changelog for breaking changes
5. Update tool implementations as needed

**Rollback if needed**:
```bash
pip install mcp==1.0.0
```

---

## Step 4: Create Agent Module

### 4.1 Create directory structure

```bash
cd Quantum-Todo-Backend/src
mkdir -p ai
touch ai/__init__.py
touch ai/agent.py
touch ai/config.py
touch ai/tool_registry.py
```

### 4.2 Implement agent configuration (src/ai/config.py)

```python
"""
Agent configuration for OpenAI Assistants API.
"""
import os
from typing import Dict, Any

# Agent configuration
AGENT_CONFIG = {
    "model": "gpt-4o",
    "temperature": 0.3,
    "name": "Task Management Assistant",
    "instructions": """You are a helpful task management assistant for Evolution Todo.

You help users manage their tasks through natural language commands.
Always confirm actions with friendly, conversational responses.
When users reference tasks by name, use list_tasks to find the task ID first.
If multiple tasks match, ask the user to clarify which one they mean.
If a task is not found, offer to show the user their current tasks.
For ambiguous requests, ask clarifying questions rather than guessing.
Keep responses concise and helpful."""
}

# Runtime configuration
RUNTIME_CONFIG = {
    "max_iterations": 3,  # Maximum tool invocation cycles
    "poll_interval": 0.5,  # Seconds between status checks
    "timeout": 30,  # Total timeout for agent operation (seconds)
}

# OpenAI API key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable not set")
```

### 4.3 Implement tool registry (src/ai/tool_registry.py)

```python
"""
Tool registry for MCP tools with user context injection.
"""
from uuid import UUID
import json
import logging
from typing import Dict, Any

from src.mcp_server.tools import (
    add_task, list_tasks, complete_task, update_task, delete_task
)
from src.mcp_server.schemas import (
    AddTaskInput, ListTasksInput, CompleteTaskInput,
    UpdateTaskInput, DeleteTaskInput
)

logger = logging.getLogger(__name__)

# Tool schemas for OpenAI Assistants API
TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "add_task",
            "description": "Create a new task with a title and optional description",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "Task title (e.g., 'Buy groceries', 'Finish report')"
                    },
                    "description": {
                        "type": "string",
                        "description": "Optional detailed description of the task"
                    }
                },
                "required": ["title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_tasks",
            "description": "Retrieve tasks, optionally filtered by status or search term",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "enum": ["pending", "completed", "all"],
                        "description": "Filter by completion status (default: all)"
                    },
                    "search": {
                        "type": "string",
                        "description": "Optional search term to filter tasks by title"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "complete_task",
            "description": "Mark a task as completed",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "UUID of the task to complete"
                    }
                },
                "required": ["task_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_task",
            "description": "Update a task's title or description",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "UUID of the task to update"
                    },
                    "title": {
                        "type": "string",
                        "description": "New task title (optional)"
                    },
                    "description": {
                        "type": "string",
                        "description": "New task description (optional)"
                    }
                },
                "required": ["task_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "delete_task",
            "description": "Permanently delete a task",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "UUID of the task to delete"
                    }
                },
                "required": ["task_id"]
            }
        }
    }
]


def invoke_mcp_tool_with_user_context(
    tool_name: str,
    arguments: Dict[str, Any],
    user_id: UUID
) -> Dict[str, Any]:
    """
    Invoke MCP tool with user_id context injected.

    Args:
        tool_name: Name of the MCP tool to invoke
        arguments: Tool arguments from assistant (without user_id)
        user_id: Authenticated user's ID from JWT token

    Returns:
        Tool result as dictionary (JSON-serializable)
    """
    try:
        if tool_name == "add_task":
            input_data = AddTaskInput(
                user_id=user_id,
                title=arguments["title"],
                description=arguments.get("description")
            )
            return add_task(input_data)

        elif tool_name == "list_tasks":
            input_data = ListTasksInput(
                user_id=user_id,
                status=arguments.get("status", "all"),
                search=arguments.get("search")
            )
            return list_tasks(input_data)

        elif tool_name == "complete_task":
            input_data = CompleteTaskInput(
                user_id=user_id,
                task_id=UUID(arguments["task_id"])
            )
            return complete_task(input_data)

        elif tool_name == "update_task":
            input_data = UpdateTaskInput(
                user_id=user_id,
                task_id=UUID(arguments["task_id"]),
                title=arguments.get("title"),
                description=arguments.get("description")
            )
            return update_task(input_data)

        elif tool_name == "delete_task":
            input_data = DeleteTaskInput(
                user_id=user_id,
                task_id=UUID(arguments["task_id"])
            )
            return delete_task(input_data)

        else:
            logger.error(f"Unknown tool: {tool_name}")
            return {
                "error": True,
                "message": f"Unknown tool: {tool_name}"
            }

    except ValueError as e:
        logger.error(f"Invalid UUID in tool {tool_name}: {str(e)}")
        return {
            "error": True,
            "message": f"Invalid task ID format: {str(e)}"
        }
    except Exception as e:
        logger.error(f"Tool invocation error: {tool_name}, {str(e)}")
        return {
            "error": True,
            "message": "Failed to execute operation"
        }
```

### 4.4 Implement agent logic (src/ai/agent.py)

```python
"""
OpenAI Assistants API agent for natural language task management.
"""
import time
import json
import logging
from uuid import UUID
from typing import Dict, Any
from openai import OpenAI
from openai.types.beta.threads import Run

from .config import AGENT_CONFIG, RUNTIME_CONFIG, OPENAI_API_KEY
from .tool_registry import TOOL_SCHEMAS, invoke_mcp_tool_with_user_context

logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

# Cache assistant (created once, reused)
_assistant_cache = None


def get_or_create_assistant():
    """Get cached assistant or create new one."""
    global _assistant_cache

    if _assistant_cache is None:
        logger.info("Creating new assistant")
        _assistant_cache = client.beta.assistants.create(
            name=AGENT_CONFIG["name"],
            instructions=AGENT_CONFIG["instructions"],
            model=AGENT_CONFIG["model"],
            tools=TOOL_SCHEMAS
        )
        logger.info(f"Assistant created: {_assistant_cache.id}")

    return _assistant_cache


def process_message(message: str, user_id: UUID) -> Dict[str, Any]:
    """
    Process user message with AI agent.

    Args:
        message: Natural language input from user
        user_id: Authenticated user's ID

    Returns:
        Dictionary with 'response' and optional 'tool_calls'
    """
    try:
        assistant = get_or_create_assistant()

        # Create ephemeral thread
        thread = client.beta.threads.create()
        logger.info(f"Thread created: {thread.id}")

        # Add user message
        client.beta.threads.messages.create(
            thread_id=thread.id,
            role="user",
            content=message
        )

        # Create run
        run = client.beta.threads.runs.create(
            thread_id=thread.id,
            assistant_id=assistant.id
        )

        # Poll and handle tool calls
        iteration_count = 0
        tool_calls_log = []
        start_time = time.time()

        while run.status in ["queued", "in_progress", "requires_action"]:
            # Check timeout
            if time.time() - start_time > RUNTIME_CONFIG["timeout"]:
                logger.error(f"Timeout for user {user_id}")
                return {
                    "error": True,
                    "message": "Request timed out. Please try again."
                }

            if run.status == "requires_action":
                # Check iteration limit
                if iteration_count >= RUNTIME_CONFIG["max_iterations"]:
                    logger.warning(f"Iteration limit reached for user {user_id}")
                    return {
                        "error": True,
                        "message": "Operation too complex. Please break it into smaller requests."
                    }

                # Process tool calls
                tool_calls = run.required_action.submit_tool_outputs.tool_calls
                tool_outputs = []

                for tool_call in tool_calls:
                    args = json.loads(tool_call.function.arguments)
                    logger.info(f"Tool call: {tool_call.function.name}, args: {args}")

                    # Invoke MCP tool
                    result = invoke_mcp_tool_with_user_context(
                        tool_name=tool_call.function.name,
                        arguments=args,
                        user_id=user_id
                    )

                    # Log for response
                    tool_calls_log.append({
                        "tool": tool_call.function.name,
                        "arguments": args,
                        "result": result
                    })

                    tool_outputs.append({
                        "tool_call_id": tool_call.id,
                        "output": json.dumps(result)
                    })

                # Submit outputs
                run = client.beta.threads.runs.submit_tool_outputs(
                    thread_id=thread.id,
                    run_id=run.id,
                    tool_outputs=tool_outputs
                )
                iteration_count += 1

            else:
                # Poll for status update
                time.sleep(RUNTIME_CONFIG["poll_interval"])
                run = client.beta.threads.runs.retrieve(
                    thread_id=thread.id,
                    run_id=run.id
                )

        # Check final status
        if run.status == "completed":
            messages = client.beta.threads.messages.list(thread_id=thread.id)
            response_text = messages.data[0].content[0].text.value

            logger.info(f"Agent response for user {user_id}: {response_text[:100]}...")

            return {
                "response": response_text,
                "tool_calls": tool_calls_log
            }
        else:
            logger.error(f"Run ended with status: {run.status}")
            return {
                "error": True,
                "message": f"Agent processing failed with status: {run.status}"
            }

    except Exception as e:
        logger.error(f"Agent error for user {user_id}: {str(e)}")
        return {
            "error": True,
            "message": "I encountered an issue processing your request. Please try again later."
        }
```

---

## Step 5: Create Chat API Endpoint

### 5.1 Create chat router (src/api/chat.py)

```python
"""
Chat API endpoint for AI agent interaction.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from src.middleware.auth import get_current_user
from src.ai.agent import process_message
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    response: str
    tool_calls: list = []


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user=Depends(get_current_user)
):
    """
    Send a message to the AI agent and receive a response.

    The agent processes natural language commands and invokes
    appropriate MCP tools to manage tasks.
    """
    try:
        result = process_message(
            message=request.message,
            user_id=current_user.id
        )

        if isinstance(result, dict) and result.get("error"):
            raise HTTPException(
                status_code=500,
                detail=result.get("message", "Failed to process message")
            )

        return ChatResponse(
            response=result["response"],
            tool_calls=result.get("tool_calls", [])
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat endpoint error for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process message. Please try again."
        )
```

### 5.2 Register router in main.py

Edit `Quantum-Todo-Backend/main.py` (or `src/main.py`):

```python
from src.api.chat import router as chat_router

# ... existing code ...

# Register chat router
app.include_router(chat_router, prefix="/api", tags=["chat"])
```

---

## Step 6: Test the Implementation

### 6.1 Start the backend

```bash
cd Quantum-Todo-Backend
uvicorn main:app --reload
```

### 6.2 Test with curl

```bash
# Get JWT token first
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.access_token')

# Test agent
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Add a task to buy groceries"}' \
  | jq
```

**Expected response**:
```json
{
  "response": "I've created a task 'Buy groceries' for you. The task ID is abc-123.",
  "tool_calls": [
    {
      "tool": "add_task",
      "arguments": {"title": "Buy groceries"},
      "result": {"task_id": "abc-123", "status": "created"}
    }
  ]
}
```

### 6.3 Run automated tests

```bash
pytest tests/test_agent.py -v
pytest tests/test_agent_integration.py -v
```

---

## Step 7: Verify Zero Regression

Run the full regression test suite to ensure existing features still work:

```bash
pytest tests/test_regression.py -v
pytest tests/test_mcp_tools.py -v
```

**Success criteria**: All tests pass (0 failures)

---

## Troubleshooting

### Issue: "OPENAI_API_KEY environment variable not set"

**Solution**:
1. Verify `.env` file exists in `Quantum-Todo-Backend/`
2. Check that `OPENAI_API_KEY=sk-...` is present
3. Restart the backend server
4. Verify with: `python -c "import os; from dotenv import load_dotenv; load_dotenv(); print(os.getenv('OPENAI_API_KEY'))"`

### Issue: "Assistant creation failed"

**Solution**:
1. Check OpenAI API key is valid
2. Verify API key has sufficient quota
3. Check network connectivity to OpenAI servers
4. Review logs for specific error message

### Issue: "MCP tool tests failing after upgrade"

**Solution**:
1. Review MCP SDK changelog for breaking changes
2. Check tool schema validation errors
3. Verify UUID serialization: `model_dump(mode='json')`
4. Update tool implementations if needed
5. Rollback to mcp==1.0.0 if issues persist

### Issue: "Agent responses are slow (>5 seconds)"

**Solution**:
1. Check OpenAI API status: https://status.openai.com
2. Verify network latency to OpenAI servers
3. Consider using GPT-3.5-turbo for faster responses (lower accuracy)
4. Check if multiple tool calls are being made (review tool_calls in response)

### Issue: "Rate limit exceeded"

**Solution**:
1. Implement per-user rate limiting (10 requests/minute recommended)
2. Add exponential backoff retry logic
3. Upgrade OpenAI API tier if needed
4. Cache common responses (future enhancement)

### Issue: "Agent misinterprets user intent"

**Solution**:
1. Review system instructions in `src/ai/config.py`
2. Add more specific examples to instructions
3. Improve tool descriptions in `src/ai/tool_registry.py`
4. Consider lowering temperature (currently 0.3)
5. Test with GPT-4o (better than GPT-3.5-turbo)

---

## Performance Optimization

### Caching Assistant

The assistant is cached on first request and reused:

```python
# Already implemented in src/ai/agent.py
_assistant_cache = None

def get_or_create_assistant():
    global _assistant_cache
    if _assistant_cache is None:
        _assistant_cache = client.beta.assistants.create(...)
    return _assistant_cache
```

### Monitoring Token Usage

Add logging to track token consumption:

```python
# In src/ai/agent.py, after run completes
logger.info(f"Tokens used: {run.usage.total_tokens if run.usage else 'N/A'}")
```

### Rate Limiting

Implement per-user rate limiting in `src/api/chat.py`:

```python
from fastapi_limiter.depends import RateLimiter

@router.post("/chat", dependencies=[Depends(RateLimiter(times=10, seconds=60))])
async def chat(...):
    ...
```

---

## Next Steps

1. **Run `/sp.tasks 002-openai-agent-integration`** to generate implementation tasks
2. **Implement unit tests** for agent functionality
3. **Implement integration tests** for agent + MCP tools
4. **Deploy to staging** and test with real users
5. **Monitor performance** and optimize as needed

---

## References

- Feature Specification: `specs/002-openai-agent-integration/spec.md`
- Implementation Plan: `specs/002-openai-agent-integration/plan.md`
- Research Findings: `specs/002-openai-agent-integration/research.md`
- Data Model: `specs/002-openai-agent-integration/data-model.md`
- API Contract: `specs/002-openai-agent-integration/contracts/agent-api.yaml`
- OpenAI Assistants API: https://platform.openai.com/docs/assistants
- MCP Server Foundation: `Quantum-Todo-Backend/HANDOFF_PHASE_III_STEP_2.md`
