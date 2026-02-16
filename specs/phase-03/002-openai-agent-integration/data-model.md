# Data Model: OpenAI Agents SDK Integration

**Feature**: 002-openai-agent-integration
**Date**: 2026-02-08
**Status**: Design Complete

## Overview

This feature introduces an AI agent for natural language task management. Notably, **no new database tables are required**. All entities are either stateless (ephemeral) or already exist from previous phases.

## Entity Catalog

### New Entities (Stateless - No Persistence)

#### 1. Agent
**Description**: The AI-powered conversational interface that processes user messages and invokes MCP tools.

**Characteristics**:
- Stateless: No persistent state in our database
- Managed by OpenAI: Assistant configuration stored on OpenAI's servers
- Singleton: One assistant instance shared across all users
- Reusable: Created once, cached for all requests

**Attributes**:
- `assistant_id` (string): OpenAI assistant identifier (cached in application)
- `model` (string): GPT-4o
- `instructions` (string): System instructions for task management
- `tools` (array): 5 MCP tool schemas (add_task, list_tasks, complete_task, update_task, delete_task)

**Lifecycle**:
- Created: On application startup or first request
- Updated: When system instructions or tools change
- Deleted: Never (persists on OpenAI's servers)

**Validation Rules**:
- Must have exactly 5 tools registered
- Instructions must not exceed OpenAI's token limits
- Model must be a valid OpenAI model identifier

---

#### 2. Thread
**Description**: Represents a single conversation session between user and agent.

**Characteristics**:
- Ephemeral: Created per request, deleted after response
- Managed by OpenAI: Thread state stored on OpenAI's servers
- Stateless from our perspective: Not persisted in our database (conversation persistence is out of scope)
- User-scoped: Each thread belongs to one user (enforced at application level)

**Attributes**:
- `thread_id` (string): OpenAI thread identifier
- `user_id` (UUID): Associated user (not stored in thread, tracked in application)
- `created_at` (datetime): Thread creation timestamp (OpenAI-managed)

**Lifecycle**:
- Created: When user sends a message
- Used: For the duration of one request-response cycle
- Deleted: Immediately after final response is retrieved

**Validation Rules**:
- Must be associated with authenticated user
- Must be deleted after use to avoid storage costs
- Maximum lifetime: 30 seconds (application timeout)

---

#### 3. Run
**Description**: Represents the execution of an assistant on a thread.

**Characteristics**:
- Ephemeral: Exists only during agent processing
- Managed by OpenAI: Run state tracked on OpenAI's servers
- Asynchronous: Requires polling for status updates
- Multi-step capable: Can invoke multiple tools in sequence

**Attributes**:
- `run_id` (string): OpenAI run identifier
- `thread_id` (string): Associated thread
- `assistant_id` (string): Associated assistant
- `status` (enum): queued | in_progress | requires_action | completed | failed | cancelled | expired
- `required_action` (object): Tool calls to execute (when status = requires_action)

**Lifecycle**:
- Created: When agent begins processing user message
- Polled: Every 0.5 seconds until completion or timeout
- Completed: When agent generates final response or reaches iteration limit

**Validation Rules**:
- Must not exceed 3 tool invocation iterations (FR-015)
- Must complete within 30 seconds (application timeout)
- Must handle all status values gracefully

---

#### 4. Tool Call
**Description**: Represents a single invocation of an MCP tool by the agent.

**Characteristics**:
- Ephemeral: Exists only during run execution
- Managed by OpenAI: Tool call metadata from assistant
- Executed by application: We invoke MCP tools and return results

**Attributes**:
- `tool_call_id` (string): OpenAI tool call identifier
- `function_name` (string): MCP tool name (add_task, list_tasks, etc.)
- `arguments` (object): Tool parameters (without user_id)
- `output` (string): JSON-serialized tool result

**Lifecycle**:
- Created: When run status becomes requires_action
- Executed: Application invokes MCP tool with user_id injected
- Completed: Output submitted back to assistant

**Validation Rules**:
- Function name must match one of 5 registered tools
- Arguments must conform to tool's JSON schema
- Output must be JSON-serializable

---

#### 5. Agent Response
**Description**: The final natural language response returned to the user.

**Characteristics**:
- Ephemeral: Generated per request, not persisted (in this phase)
- User-facing: Friendly, conversational text
- Context-aware: Reflects tool invocation results

**Attributes**:
- `response` (string): Natural language message
- `tool_calls` (array): List of tools invoked (for debugging/transparency)
- `error` (boolean): Whether an error occurred
- `message` (string): Error message (if error = true)

**Lifecycle**:
- Created: When run completes successfully
- Returned: To user via POST /api/chat response
- Discarded: Not persisted in this phase (conversation persistence is out of scope)

**Validation Rules**:
- Response must not be empty
- Tool calls must include tool name, arguments, and result
- Error responses must include user-friendly message

---

### Existing Entities (No Changes)

#### 6. User
**Description**: Represents an authenticated user of the system.

**Source**: Existing from Phase II
**Table**: `users`
**Changes**: None

**Relevant Attributes**:
- `id` (UUID): Primary key, used for user_id in all tool invocations
- `email` (string): User email
- `username` (string): User username

**Usage in This Feature**:
- Extracted from JWT token in auth middleware
- Injected into all MCP tool invocations
- Enforces user ownership of tasks

---

#### 7. Task
**Description**: Represents a todo item belonging to a user.

**Source**: Existing from Phase II
**Table**: `tasks`
**Changes**: None

**Relevant Attributes**:
- `id` (UUID): Primary key, used as task_id in tool operations
- `user_id` (UUID): Foreign key to users.id
- `title` (string): Task title
- `description` (string): Task description
- `completed` (boolean): Completion status

**Usage in This Feature**:
- Managed exclusively through MCP tools
- Agent never accesses tasks table directly
- All operations enforce user_id matching

---

#### 8. Conversation
**Description**: Represents a conversation session (created in Phase III Step 1).

**Source**: Phase III Step 1 (MCP Server Foundation)
**Table**: `conversations`
**Changes**: None
**Usage in This Feature**: Not used (conversation persistence is out of scope)

---

#### 9. Message
**Description**: Represents a message in a conversation (created in Phase III Step 1).

**Source**: Phase III Step 1 (MCP Server Foundation)
**Table**: `messages`
**Changes**: None
**Usage in This Feature**: Not used (conversation persistence is out of scope)

---

## Entity Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                     OpenAI's Servers                        │
│                                                             │
│  ┌──────────┐                                              │
│  │ Assistant│ (singleton, cached)                          │
│  └────┬─────┘                                              │
│       │ uses                                               │
│       ▼                                                    │
│  ┌──────────┐     contains     ┌──────────┐              │
│  │  Thread  │ ───────────────> │   Run    │              │
│  │(ephemeral)│                  │(ephemeral)│              │
│  └──────────┘                  └────┬─────┘              │
│                                      │ requires_action     │
│                                      ▼                     │
│                                 ┌──────────┐              │
│                                 │Tool Call │              │
│                                 │(ephemeral)│              │
│                                 └──────────┘              │
└─────────────────────────────────────────────────────────────┘
                                       │
                                       │ invokes (with user_id)
                                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Our Application                           │
│                                                             │
│  ┌──────────┐     injects      ┌──────────┐              │
│  │   User   │ ───────────────> │MCP Tools │              │
│  │(existing)│     user_id      │(existing)│              │
│  └────┬─────┘                  └────┬─────┘              │
│       │ owns                        │ operates on         │
│       ▼                             ▼                     │
│  ┌──────────┐                  ┌──────────┐              │
│  │   Task   │ <──────────────  │  Result  │              │
│  │(existing)│                  │(ephemeral)│              │
│  └──────────┘                  └──────────┘              │
└─────────────────────────────────────────────────────────────┘
```

**Key Relationships**:
1. **Assistant → Thread**: One assistant processes many threads (1:N)
2. **Thread → Run**: One thread has one run per request (1:1 per request)
3. **Run → Tool Call**: One run can have multiple tool calls (1:N)
4. **Tool Call → MCP Tool**: Each tool call invokes one MCP tool (1:1)
5. **User → Task**: One user owns many tasks (1:N, existing)
6. **MCP Tool → Task**: Tools operate on tasks with user_id enforcement (N:M)

---

## Data Flow

### Request Flow
```
1. User sends message
   ↓
2. Auth middleware extracts user_id from JWT
   ↓
3. Create ephemeral thread on OpenAI
   ↓
4. Add user message to thread
   ↓
5. Create run (assistant processes thread)
   ↓
6. Poll run status
   ↓
7. If requires_action:
   - Extract tool calls
   - For each tool call:
     * Inject user_id into arguments
     * Invoke MCP tool
     * Collect result
   - Submit tool outputs to run
   - Continue polling (max 3 iterations)
   ↓
8. If completed:
   - Retrieve final message from thread
   - Delete thread (cleanup)
   - Return response to user
```

### Tool Invocation Flow
```
Tool Call (from OpenAI)
  ↓
Wrapper Function (inject user_id)
  ↓
MCP Tool Input Schema (validate)
  ↓
MCP Tool Function (delegate to TaskService)
  ↓
TaskService (enforce user ownership)
  ↓
Database Query (user_id = ?)
  ↓
Result (JSON)
  ↓
Wrapper Function (serialize)
  ↓
Submit to OpenAI (tool output)
```

---

## Validation Rules

### Agent Configuration
- **VR-001**: Assistant must have exactly 5 tools registered
- **VR-002**: System instructions must not exceed 32,000 tokens
- **VR-003**: Model must be a valid OpenAI model (gpt-4o, gpt-4-turbo, etc.)

### Thread Management
- **VR-004**: Thread must be created for each request (no reuse)
- **VR-005**: Thread must be deleted after response is retrieved
- **VR-006**: Thread lifetime must not exceed 30 seconds

### Run Execution
- **VR-007**: Run must not exceed 3 tool invocation iterations (FR-015)
- **VR-008**: Run must complete within 30 seconds (application timeout)
- **VR-009**: Run status must be polled at 0.5 second intervals

### Tool Invocation
- **VR-010**: Tool name must match one of: add_task, list_tasks, complete_task, update_task, delete_task
- **VR-011**: User_id must be injected into all tool invocations
- **VR-012**: Tool arguments must conform to MCP tool input schemas
- **VR-013**: Tool results must be JSON-serializable

### User Context
- **VR-014**: User_id must be extracted from valid JWT token
- **VR-015**: User_id must be a valid UUID
- **VR-016**: User must exist in users table

### Response Generation
- **VR-017**: Response must not be empty string
- **VR-018**: Error responses must include user-friendly message
- **VR-019**: Tool calls in response must include tool name, arguments, and result

---

## State Management

### Application State (In-Memory)
- **Assistant ID**: Cached on application startup, reused for all requests
- **User Context**: Extracted per request from JWT, not persisted
- **Iteration Count**: Tracked per request to enforce 3-invocation limit

### OpenAI State (External)
- **Assistant Configuration**: Persisted on OpenAI's servers
- **Thread Messages**: Persisted temporarily on OpenAI's servers
- **Run Status**: Tracked on OpenAI's servers during execution

### Database State (Persistent)
- **Users**: Existing, no changes
- **Tasks**: Existing, modified only through MCP tools
- **Conversations**: Existing, not used in this phase
- **Messages**: Existing, not used in this phase

---

## Schema Changes

**Database Schema**: No changes required

**Reason**: All new entities (Agent, Thread, Run, Tool Call, Agent Response) are ephemeral and managed either by OpenAI or in-memory. Conversation persistence (saving messages to database) is explicitly out of scope for this phase.

---

## Migration Strategy

**Database Migrations**: None required

**Application Changes**:
1. Add new module: `src/ai/` with agent implementation
2. Add new endpoint: `POST /api/chat` in `src/api/chat.py`
3. Update dependencies: Add `openai>=1.59.4` to requirements.txt
4. Update dependencies: Upgrade `mcp>=1.8.0` in requirements.txt
5. Add environment variable: `OPENAI_API_KEY` to `.env`

**Validation**:
- Run regression tests after MCP SDK upgrade
- Verify existing MCP tools still work with mcp>=1.8.0
- Test agent with all 5 MCP tools
- Verify zero regression in existing features

---

## Performance Considerations

### Latency
- **Thread Creation**: ~100-200ms (OpenAI API call)
- **Run Execution**: ~1-3 seconds (depends on model and tool calls)
- **Tool Invocation**: ~200-500ms per tool (database query + processing)
- **Total**: <5 seconds for 95% of requests (SC-004)

### Optimization Strategies
1. **Cache Assistant**: Create once, reuse for all requests
2. **Parallel Tool Calls**: OpenAI can invoke multiple tools in one step
3. **Efficient Polling**: 0.5 second intervals balance responsiveness and API calls
4. **Ephemeral Threads**: Delete immediately to avoid storage costs

### Scalability
- **Concurrent Users**: Stateless design supports unlimited concurrent users
- **Rate Limiting**: Implement per-user rate limiting (10 requests/minute)
- **OpenAI Quota**: Monitor token usage and implement backoff strategies

---

## Security Considerations

### User Isolation
- **SI-001**: User_id extracted from JWT token (trusted source)
- **SI-002**: User_id injected into all MCP tool invocations
- **SI-003**: MCP tools enforce user ownership via TaskService
- **SI-004**: Users cannot access other users' tasks through agent

### API Key Security
- **SI-005**: OpenAI API key stored in environment variable (never hardcoded)
- **SI-006**: API key not exposed in logs or error messages
- **SI-007**: API key not included in responses to users

### Input Validation
- **SI-008**: User messages validated for length and content
- **SI-009**: Tool arguments validated against JSON schemas
- **SI-010**: Malicious input rejected gracefully

---

## Testing Strategy

### Unit Tests
- Test agent initialization and configuration
- Test tool wrapper functions with user_id injection
- Test error handling for all failure modes
- Test iteration limit enforcement

### Integration Tests
- Test agent with each of the 5 MCP tools
- Test multi-step operations (e.g., list then delete)
- Test error scenarios (task not found, invalid ID, etc.)
- Test timeout handling

### Regression Tests
- Run existing test suite after MCP SDK upgrade
- Verify zero regression in auth, tasks, recurring tasks, notifications
- Verify existing REST API endpoints unchanged

---

## Summary

This feature introduces **zero new database tables**. All agent-related entities are ephemeral and managed either by OpenAI (Assistant, Thread, Run) or in-memory (user context, iteration count). The design maintains strict separation between agent logic (natural language processing) and tool logic (task operations), ensuring zero regression in existing features.

**Key Design Principles**:
1. **Stateless Operation**: No persistent agent state in our database
2. **User Isolation**: User_id enforced at every tool invocation
3. **Zero Regression**: Existing features unchanged
4. **Ephemeral Threads**: Created per request, deleted after response
5. **Tool-Only Access**: Agent uses MCP tools exclusively, no direct database access
