# Research: OpenAI Agents SDK Integration

**Feature**: 002-openai-agent-integration
**Date**: 2026-02-08
**Status**: Research Complete

## Overview

This document captures research findings and technology decisions for integrating OpenAI's agent capabilities with the Evolution Todo backend to enable natural language task management through MCP tools.

**Key Finding**: The term "OpenAI Agents SDK" in the specification refers to OpenAI's **Assistants API**, which is the production-ready solution for building agent-like experiences. The experimental Swarm framework has been replaced by the Assistants API.

## 1. OpenAI Assistants API Integration Patterns

### Decision: Use OpenAI Assistants API with Custom Function Tools

**Rationale**: The Assistants API is OpenAI's production-ready, stateful solution for building assistant-like experiences. It provides built-in support for custom function calling, thread management, and multi-step reasoning - all requirements for our natural language task management feature.

**Core Primitives**:
- **Assistants**: Encapsulate base model, instructions, tools, and context
- **Threads**: Represent conversation state (stateful on OpenAI's side)
- **Runs**: Power execution of an Assistant on a Thread, including multi-step tool use

**Integration Pattern**:
```python
from openai import OpenAI
import os

# Initialize client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Create assistant with custom function tools
assistant = client.beta.assistants.create(
    name="Task Management Assistant",
    instructions="""You are a helpful task management assistant for Evolution Todo.

    You help users manage their tasks through natural language commands.
    Always confirm actions with friendly, conversational responses.
    When users reference tasks by name, use list_tasks to find the task ID first.
    If multiple tasks match, ask the user to clarify which one they mean.""",
    model="gpt-4o",
    tools=[
        {
            "type": "function",
            "function": {
                "name": "add_task",
                "description": "Create a new task with a title and optional description",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string", "description": "Task title"},
                        "description": {"type": "string", "description": "Optional task description"}
                    },
                    "required": ["title"]
                }
            }
        },
        # ... other tools (list_tasks, complete_task, update_task, delete_task)
    ]
)

# Process user message
def process_message(user_message: str, user_id: str):
    # Create thread (ephemeral for stateless operation)
    thread = client.beta.threads.create()

    # Add user message
    client.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content=user_message
    )

    # Create run
    run = client.beta.threads.runs.create(
        thread_id=thread.id,
        assistant_id=assistant.id
    )

    # Poll until completion or requires_action
    iteration_count = 0
    max_iterations = 3

    while run.status in ["queued", "in_progress", "requires_action"]:
        if run.status == "requires_action":
            if iteration_count >= max_iterations:
                return {"error": True, "message": "Operation too complex"}

            # Extract tool calls
            tool_calls = run.required_action.submit_tool_outputs.tool_calls
            tool_outputs = []

            for tool_call in tool_calls:
                # Invoke MCP tool with user_id injected
                result = invoke_mcp_tool(
                    tool_name=tool_call.function.name,
                    arguments=json.loads(tool_call.function.arguments),
                    user_id=user_id
                )
                tool_outputs.append({
                    "tool_call_id": tool_call.id,
                    "output": json.dumps(result)
                })

            # Submit tool outputs
            run = client.beta.threads.runs.submit_tool_outputs(
                thread_id=thread.id,
                run_id=run.id,
                tool_outputs=tool_outputs
            )
            iteration_count += 1
        else:
            # Poll status
            time.sleep(0.5)
            run = client.beta.threads.runs.retrieve(
                thread_id=thread.id,
                run_id=run.id
            )

    # Retrieve final response
    messages = client.beta.threads.messages.list(thread_id=thread.id)
    return messages.data[0].content[0].text.value
```

**Key Characteristics**:
- **Stateful on OpenAI's side**: Threads maintain conversation history on OpenAI's servers
- **Stateless from our perspective**: We create ephemeral threads (not persisted in our database in this phase)
- **Asynchronous execution**: Runs are asynchronous, requiring polling or webhooks
- **Multi-step reasoning**: Assistant can call multiple tools in sequence automatically
- **Parallel tool calls**: Multiple tools can be invoked in a single step

**Alternatives Considered**:
1. **Chat Completions API with function calling**: Simpler but stateless, requires manual conversation management
   - Rejected: Assistants API provides better multi-step reasoning and built-in thread management
2. **Swarm framework**: Experimental multi-agent framework
   - Rejected: Explicitly marked as experimental and replaced by Assistants API
3. **Custom agent implementation**: Full control but significant development effort
   - Rejected: Violates "Deterministic over Clever" principle, reinventing existing solutions

**Best Practices**:
- Cache assistant configuration (create once, reuse)
- Implement exponential backoff for polling
- Set appropriate timeout values (30 seconds for agent operations)
- Use ephemeral threads for stateless operation (delete after response)
- Handle all run statuses: queued, in_progress, requires_action, completed, failed, cancelled, expired

## 2. MCP SDK Version Compatibility

### Decision: Upgrade to mcp>=1.8.0 and Validate Existing Tools

**Rationale**: While the OpenAI Python SDK doesn't directly depend on the MCP SDK, the user's initial guidance mentioned that "OpenAI Agents SDK requires mcp>=1.8.0". This likely refers to compatibility requirements for the overall system integration.

**Compatibility Analysis**:
- **Current Version**: mcp==1.0.0 (used in Phase III Step 1)
- **Target Version**: mcp>=1.8.0
- **Impact on Existing Tools**: All 5 MCP tools use Pydantic schemas which should be forward-compatible
- **Risk**: Potential breaking changes in tool registration or schema validation

**Migration Path**:
1. Update requirements.txt: `mcp>=1.8.0`
2. Install in isolated environment: `pip install mcp>=1.8.0`
3. Run full regression test suite:
   ```bash
   pytest tests/test_mcp_tools.py -v
   pytest tests/test_regression.py -v
   ```
4. Document any breaking changes in quickstart.md
5. Update tool implementations if validation errors occur

**Validation Strategy**:
- Test all 5 MCP tools individually
- Verify user ownership enforcement still works
- Check UUID serialization (model_dump(mode='json'))
- Validate error handling and structured responses

**Fallback Plan**:
- Keep mcp==1.0.0 in separate branch as rollback option
- Document all schema changes for future reference
- If upgrade fails, investigate whether mcp version is actually required

**Alternatives Considered**:
1. **Skip MCP upgrade**: Keep mcp==1.0.0
   - Rejected: User guidance explicitly mentioned version requirement
2. **Rewrite MCP tools**: Clean slate for new version
   - Rejected: Violates zero-regression requirement (FR-021 to FR-025)

## 3. Multi-Step Operation Patterns

### Decision: Assistants API Native Multi-Step with 3-Invocation Limit

**Rationale**: The Assistants API natively supports multi-step reasoning. When a run reaches `requires_action` status, it can invoke multiple tools. The assistant automatically determines which tools to call based on previous results. We enforce a 3-invocation limit by tracking iteration count.

**Implementation Pattern**:
```python
def process_agent_message(user_message: str, user_id: UUID, max_iterations: int = 3):
    """
    Process user message with multi-step tool invocation support.

    The Assistants API handles multi-step reasoning automatically:
    1. User sends message
    2. Assistant analyzes and calls tool(s)
    3. We submit tool outputs
    4. Assistant analyzes results and may call more tools
    5. Repeat until assistant generates final response or iteration limit reached

    Args:
        user_message: Natural language input from user
        user_id: Authenticated user's ID
        max_iterations: Maximum tool invocation cycles (default 3)

    Returns:
        Agent's final response after all tool invocations
    """
    thread = client.beta.threads.create()
    client.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content=user_message
    )

    run = client.beta.threads.runs.create(
        thread_id=thread.id,
        assistant_id=assistant.id
    )

    iteration_count = 0

    while run.status in ["queued", "in_progress", "requires_action"]:
        if run.status == "requires_action":
            # Check iteration limit
            if iteration_count >= max_iterations:
                return {
                    "error": True,
                    "message": "Operation too complex. Please break it into smaller requests."
                }

            # Process tool calls
            tool_calls = run.required_action.submit_tool_outputs.tool_calls
            tool_outputs = []

            for tool_call in tool_calls:
                # Inject user_id into arguments
                args = json.loads(tool_call.function.arguments)

                # Invoke MCP tool
                result = invoke_mcp_tool_with_user_context(
                    tool_name=tool_call.function.name,
                    arguments=args,
                    user_id=user_id
                )

                tool_outputs.append({
                    "tool_call_id": tool_call.id,
                    "output": json.dumps(result)
                })

            # Submit outputs back to assistant
            run = client.beta.threads.runs.submit_tool_outputs(
                thread_id=thread.id,
                run_id=run.id,
                tool_outputs=tool_outputs
            )

            iteration_count += 1
        else:
            # Poll for status update
            time.sleep(0.5)
            run = client.beta.threads.runs.retrieve(
                thread_id=thread.id,
                run_id=run.id
            )

    # Check final status
    if run.status == "completed":
        messages = client.beta.threads.messages.list(thread_id=thread.id)
        return messages.data[0].content[0].text.value
    else:
        return {
            "error": True,
            "message": f"Run ended with status: {run.status}"
        }
```

**Context Management**:
- Thread maintains full conversation context on OpenAI's servers
- Each tool invocation's results are automatically available to subsequent calls
- Assistant decides when to stop calling tools and generate final response
- Application tracks iteration count to prevent infinite loops

**Example Multi-Step Flow**:
User: "Delete the meeting task"
1. Assistant calls `list_tasks(search="meeting")`
2. We return: `[{"id": "abc-123", "title": "Team meeting"}]`
3. Assistant calls `delete_task(task_id="abc-123")`
4. We return: `{"status": "deleted", "message": "Task deleted"}`
5. Assistant generates: "I've deleted the 'Team meeting' task for you."

**Alternatives Considered**:
1. **Manual tool chaining**: Application determines tool sequence
   - Rejected: Duplicates assistant's reasoning, harder to maintain
2. **Unlimited iterations**: Let assistant decide when to stop
   - Rejected: Risk of infinite loops, violates FR-015
3. **Single-step only**: No multi-step support
   - Rejected: Violates User Story 2 (P2) requirement

## 4. Natural Language Intent Recognition

### Decision: Leverage Assistants API Built-in Intent Recognition with System Instructions

**Rationale**: The Assistants API uses GPT-4 models which excel at intent recognition when provided with clear instructions and well-defined function schemas. No custom NLP models needed.

**System Instructions**:
```text
You are a helpful task management assistant for Evolution Todo. Your role is to help users manage their tasks through natural language commands.

You have access to the following task operations:
- add_task: Create a new task with a title and optional description
- list_tasks: Retrieve tasks, optionally filtered by status (pending/completed/all)
- complete_task: Mark a task as completed
- update_task: Modify a task's title or description
- delete_task: Permanently remove a task

Guidelines:
1. Always confirm actions with friendly, conversational responses
2. When users reference tasks by name (e.g., "the meeting task"), use list_tasks to find the task ID first
3. If multiple tasks match a search, ask the user to clarify which one they mean
4. If a task is not found, offer to show the user their current tasks
5. For ambiguous requests, ask clarifying questions rather than guessing
6. Keep responses concise and helpful
7. Never expose internal IDs or technical details unless specifically asked

Examples:
- "Add a task to buy groceries" → add_task(title="Buy groceries")
- "Show my pending tasks" → list_tasks(status="pending")
- "Mark task abc-123 as done" → complete_task(task_id="abc-123")
- "Delete the meeting task" → list_tasks(search="meeting") then delete_task(task_id=found_id)
- "Rename the report task to 'Q4 Report'" → list_tasks(search="report") then update_task(task_id=found_id, title="Q4 Report")
```

**Function Schema Design**:
Each MCP tool is registered with a detailed JSON schema:

```json
{
    "type": "function",
    "function": {
        "name": "list_tasks",
        "description": "Retrieve the user's tasks, optionally filtered by status or search term",
        "parameters": {
            "type": "object",
            "properties": {
                "status": {
                    "type": "string",
                    "enum": ["pending", "completed", "all"],
                    "description": "Filter tasks by completion status (default: all)"
                },
                "search": {
                    "type": "string",
                    "description": "Optional search term to filter tasks by title"
                }
            },
            "required": []
        }
    }
}
```

**Handling Ambiguity**:
- Assistant asks clarifying questions when intent is unclear
- For partial task references, assistant searches and presents options
- For missing information, assistant prompts user to provide details
- Multiple matches trigger clarification request

**Alternatives Considered**:
1. **Custom NLP model**: Train domain-specific intent classifier
   - Rejected: Unnecessary complexity, GPT-4 already excels at this
2. **Rule-based intent matching**: Regex patterns for each intent
   - Rejected: Brittle, doesn't handle natural language variations
3. **Few-shot learning**: Provide many examples in prompt
   - Rejected: Token-expensive, system instructions sufficient

## 5. OpenAI API Configuration

### Decision: GPT-4o with Conservative Settings

**Model Selection**: `gpt-4o` (GPT-4 Optimized)

**Rationale**:
- Latest production model with superior intent recognition
- Better at following complex instructions than GPT-3.5
- More reliable function calling
- Optimized for speed while maintaining quality
- Acceptable latency for task management (<5 seconds target)

**Configuration Parameters**:
```python
AGENT_CONFIG = {
    "model": "gpt-4o",
    "temperature": 0.3,  # Low temperature for consistent responses
    "instructions": SYSTEM_INSTRUCTIONS,  # Defined above
    "tools": TOOL_SCHEMAS,  # 5 MCP tools
}

# Runtime configuration
RUNTIME_CONFIG = {
    "max_iterations": 3,  # Tool invocation limit
    "poll_interval": 0.5,  # Seconds between status checks
    "timeout": 30,  # Total timeout for agent operation
}
```

**Rate Limiting Strategy**:
```python
import time
from openai import RateLimitError, APITimeoutError, APIError

def call_openai_with_retry(func, max_retries=3):
    """Call OpenAI API with exponential backoff retry logic."""
    for attempt in range(max_retries):
        try:
            return func()
        except RateLimitError:
            if attempt == max_retries - 1:
                return {
                    "error": True,
                    "message": "Service is busy. Please try again in a moment."
                }
            wait_time = 2 ** attempt  # 1s, 2s, 4s
            time.sleep(wait_time)
        except APITimeoutError:
            return {
                "error": True,
                "message": "Request timed out. Please try again."
            }
        except APIError as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return {
                "error": True,
                "message": "I encountered an issue. Please try again later."
            }
```

**Cost Optimization**:
- Cache assistant configuration (create once, reuse)
- Use ephemeral threads (delete after response to avoid storage costs)
- Set reasonable max_tokens if needed
- Monitor token usage via logging
- Consider GPT-3.5-turbo for development/testing

**Alternatives Considered**:
1. **GPT-3.5-turbo**: Cheaper but less reliable for complex multi-step operations
   - Rejected: Accuracy requirements (90% intent recognition) favor GPT-4
2. **GPT-4-turbo**: Previous generation
   - Rejected: GPT-4o is newer, faster, and more cost-effective
3. **Fine-tuned model**: Custom model for task management
   - Rejected: Premature optimization, base GPT-4o sufficient

## 6. Tool Integration Approach

### Decision: Wrapper Functions with User Context Injection

**Rationale**: The Assistants API cannot directly access user_id from JWT tokens. We need a wrapper layer that:
1. Receives tool calls from the assistant
2. Injects authenticated user_id into arguments
3. Invokes MCP tools with proper context
4. Returns results in assistant-friendly format

**Implementation Pattern**:
```python
# src/ai/tool_registry.py

from uuid import UUID
import json
from src.mcp_server.tools import (
    add_task, list_tasks, complete_task, update_task, delete_task
)
from src.mcp_server.schemas import (
    AddTaskInput, ListTasksInput, CompleteTaskInput,
    UpdateTaskInput, DeleteTaskInput
)

def invoke_mcp_tool_with_user_context(
    tool_name: str,
    arguments: dict,
    user_id: UUID
) -> dict:
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
            return {
                "error": True,
                "message": f"Unknown tool: {tool_name}"
            }

    except ValueError as e:
        # UUID parsing errors
        return {
            "error": True,
            "message": f"Invalid task ID format: {str(e)}"
        }
    except Exception as e:
        # Unexpected errors
        logger.error(f"Tool invocation error: {tool_name}, {str(e)}")
        return {
            "error": True,
            "message": "Failed to execute operation"
        }
```

**Tool Invocation Flow**:
1. User sends message to POST /api/chat
2. Auth middleware extracts user_id from JWT token
3. Agent endpoint creates thread and run
4. Assistant determines which tools to call
5. Run status becomes "requires_action"
6. We extract tool_calls from run
7. For each tool_call, invoke wrapper with user_id
8. Wrapper injects user_id and calls MCP tool
9. MCP tool enforces user ownership via TaskService
10. Results returned to assistant via submit_tool_outputs
11. Assistant generates natural language response

**Error Handling**:
- Wrapper catches all exceptions and returns structured errors
- UUID validation errors caught and transformed to user-friendly messages
- Database errors logged with context, generic message to user
- Tool not found errors handled gracefully

**Alternatives Considered**:
1. **Direct MCP tool invocation**: Assistant calls tools directly
   - Rejected: Cannot inject user_id, security risk
2. **Modify MCP tools**: Add optional user_id parameter
   - Rejected: Violates zero-regression requirement (FR-021)
3. **Global user context**: Thread-local storage for user_id
   - Rejected: Not thread-safe, implicit dependencies

## 7. API Endpoint Design

### Decision: Synchronous Response with Polling and Timeout

**Endpoint**: POST /api/chat

**Request Schema**:
```json
{
    "message": "Add a task to buy groceries"
}
```

**Response Schema** (Success):
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

**Response Schema** (Error):
```json
{
    "error": true,
    "message": "I encountered an issue processing your request. Please try again."
}
```

**Rationale**:
- Synchronous response simplifies client implementation
- Polling handled server-side (client waits for final response)
- 30-second timeout prevents hanging requests
- Tool calls included for debugging and transparency
- Streaming deferred to future enhancement (out of scope)

**Implementation**:
```python
# src/api/chat.py

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from src.middleware.auth import get_current_user
from src.ai.agent import process_message
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    tool_calls: list = []

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user = Depends(get_current_user)
):
    """
    Send a message to the AI agent and receive a response.

    The agent processes the message, invokes appropriate MCP tools,
    and returns a natural language response.

    Authentication required via JWT token.
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
        logger.error(f"Agent error for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process message. Please try again."
        )
```

**Alternatives Considered**:
1. **Streaming response**: Real-time token-by-token response
   - Rejected: Out of scope per specification, deferred to future
2. **Asynchronous with webhook**: Return immediately, callback when done
   - Rejected: Adds complexity, not needed for <5 second target
3. **WebSocket connection**: Persistent connection for chat
   - Rejected: Overkill for stateless operations

## Summary of Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| Agent Framework | OpenAI Assistants API | Production-ready, built-in function calling, multi-step reasoning |
| Model | GPT-4o | Latest optimized model, superior accuracy, acceptable latency |
| Temperature | 0.3 | Consistent, deterministic responses for task management |
| MCP SDK Version | Upgrade to >=1.8.0 | Compatibility requirement, validate with regression tests |
| Multi-Step Operations | Native with 3-iteration limit | Leverages assistant's reasoning, prevents infinite loops |
| Intent Recognition | Built-in with system instructions | Sufficient accuracy, no custom NLP needed |
| Tool Integration | Wrapper functions with user_id injection | Maintains security, zero-regression on MCP tools |
| API Design | Synchronous POST /api/chat | Simple, meets <5 second response time requirement |
| Thread Management | Ephemeral threads | Stateless operation, delete after response |
| Polling Strategy | Server-side with 0.5s interval | Client receives final response, no client-side polling |

## Implementation Dependencies

**Python Packages**:
```
openai>=1.59.4  # Assistants API support
mcp>=1.8.0      # MCP SDK upgrade
```

**Environment Variables**:
```
OPENAI_API_KEY=sk-...  # OpenAI API key (required)
```

**Existing Dependencies** (no changes):
- FastAPI
- SQLModel
- Pydantic
- Neon PostgreSQL

## Next Steps

1. **Phase 1**: Create data-model.md, contracts/agent-api.yaml, and quickstart.md based on these decisions
2. **Validation**: Test MCP SDK upgrade (mcp>=1.8.0) with existing tools
3. **Prototype**: Build minimal agent implementation to validate integration patterns
4. **Documentation**: Update quickstart.md with troubleshooting for common issues

## References

- OpenAI Assistants API: https://platform.openai.com/docs/assistants
- OpenAI Assistants API Cookbook: https://cookbook.openai.com/examples/assistants_api_overview_python
- OpenAI Swarm (experimental, replaced by Assistants API): https://github.com/openai/swarm
- MCP Server Foundation (Phase III Step 1): Quantum-Todo-Backend/HANDOFF_PHASE_III_STEP_2.md
- Feature Specification: specs/002-openai-agent-integration/spec.md
- Existing MCP Tools: Quantum-Todo-Backend/src/mcp_server/tools/
