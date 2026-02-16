# Implementation Plan: OpenAI Agents SDK Integration

**Branch**: `002-openai-agent-integration` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-openai-agent-integration/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Integrate OpenAI Agents SDK into the Evolution Todo backend to enable natural language task management through an AI agent. The agent will process user messages, understand intent, and invoke the appropriate MCP tools (add_task, list_tasks, complete_task, update_task, delete_task) to perform task operations. The agent operates statelessly with no in-memory conversation history, ensuring all existing features (authentication, manual task APIs, recurring tasks, notifications) remain unchanged.

**Primary Requirement**: Users can manage tasks using natural language commands like "Add a task to buy groceries" or "Show my pending tasks", with the agent correctly interpreting intent and executing operations through MCP tools.

**Technical Approach**: Create an AI agent module using OpenAI Agents SDK that registers the five existing MCP tools as callable functions. The agent processes natural language input, selects appropriate tools, handles multi-step operations (e.g., search then delete), and returns friendly conversational responses. All operations enforce user ownership through user_id propagation.

## Technical Context

**Language/Version**: Python 3.11+ (existing backend version)
**Primary Dependencies**:
- OpenAI Agents SDK (to be installed, requires mcp>=1.8.0)
- Existing: FastAPI, SQLModel, Pydantic, mcp==1.0.0 (will upgrade to >=1.8.0)
- OpenAI Python SDK (for API access)

**Storage**: Neon PostgreSQL (existing, no schema changes required)
**Testing**: pytest (existing test framework)
**Target Platform**: Linux server (existing deployment target)
**Project Type**: Web application (FastAPI backend)

**Performance Goals**:
- Agent response time: <5 seconds for 95% of requests (including OpenAI API call + MCP tool execution)
- Intent recognition accuracy: 90% for common task management commands
- Single-step operation success rate: 95%
- Multi-step operation success rate: 85%

**Constraints**:
- Zero regression: All existing features must continue working unchanged
- Stateless operation: No in-memory conversation history (database persistence deferred to future phase)
- Tool-only access: Agent must use ONLY the 5 existing MCP tools, no direct database access
- Multi-step limit: Maximum 3 tool invocations per user message to prevent infinite loops
- User isolation: All operations must enforce user ownership via user_id

**Scale/Scope**:
- 5 MCP tools to integrate (add_task, list_tasks, complete_task, update_task, delete_task)
- Single agent module (src/ai/agent.py)
- Natural language support for 5 core intents (add, list, complete, update, delete)
- Multi-step operation support (e.g., "delete the meeting task" = list + delete)
- Comprehensive error handling for all failure modes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Spec-Driven Implementation ✓ PASS
- **Rule**: Implementation must strictly adhere to specifications
- **Status**: PASS - Complete specification exists at specs/002-openai-agent-integration/spec.md with 30 functional requirements, 10 success criteria, and 4 prioritized user stories
- **Evidence**: All requirements are testable and unambiguous (verified by specification quality checklist)

### Monorepo Discipline ✓ PASS
- **Rule**: Clear boundaries maintained between domains
- **Status**: PASS - Agent module will be added to backend (Quantum-Todo-Backend/src/ai/) with no frontend changes
- **Evidence**: Backend-only feature, no cross-domain changes required

### Deterministic over Clever ✓ PASS
- **Rule**: Prefer clarity and correctness over abstraction
- **Status**: PASS - Agent uses straightforward tool registration pattern, no complex abstractions
- **Evidence**: Direct integration with existing MCP tools, no new architectural patterns introduced
- **Justification**: OpenAI Agents SDK is the specified requirement, not a premature optimization

### Reproducibility ✓ PASS
- **Rule**: System understandable through specs, CLAUDE.md, and constitution
- **Status**: PASS - Complete specification, implementation plan, and handoff documentation available
- **Evidence**: Phase III Step 1 handoff documentation provides full context for MCP tools

### Authentication & Security ✓ PASS
- **Rule**: User isolation enforced, no hardcoded secrets
- **Status**: PASS - Agent will extract user_id from JWT token and pass to all MCP tool invocations
- **Evidence**: FR-007 requires user_id propagation, FR-027 requires environment variable for OpenAI API key

### No Breaking Changes ✓ PASS
- **Rule**: Existing features must continue working
- **Status**: PASS - Specification explicitly requires zero regression (FR-021 to FR-025, SC-006 to SC-009)
- **Evidence**: User Story 4 (P4) dedicated to system integrity and non-regression testing

### Out of Scope Compliance ✓ PASS
- **Rule**: No AI chatbots in Phase II
- **Status**: PASS - This is Phase III Step 2, following completed Phase III Step 1 (MCP Server Foundation)
- **Evidence**: Phase II is complete, this is authorized Phase III work per project roadmap

## Project Structure

### Documentation (this feature)

```text
specs/002-openai-agent-integration/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (to be created)
├── data-model.md        # Phase 1 output (to be created)
├── quickstart.md        # Phase 1 output (to be created)
├── contracts/           # Phase 1 output (to be created)
│   └── agent-api.yaml   # REST API contract for agent endpoint
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
Quantum-Todo-Backend/
├── src/
│   ├── ai/                      # NEW: Agent module
│   │   ├── __init__.py          # Module exports
│   │   ├── agent.py             # OpenAI Agent implementation
│   │   ├── config.py            # Agent configuration (model, temperature, etc.)
│   │   └── tool_registry.py    # MCP tool registration for agent
│   ├── api/                     # EXISTING: REST API endpoints
│   │   ├── auth.py              # Existing auth endpoints
│   │   ├── tasks.py             # Existing task endpoints
│   │   └── chat.py              # NEW: Agent chat endpoint
│   ├── mcp_server/              # EXISTING: MCP tools (Phase III Step 1)
│   │   ├── server.py            # MCP server
│   │   ├── schemas.py           # Tool input/output schemas
│   │   └── tools/               # 5 MCP tools
│   │       ├── add_task.py
│   │       ├── list_tasks.py
│   │       ├── complete_task.py
│   │       ├── update_task.py
│   │       └── delete_task.py
│   ├── models/                  # EXISTING: Database models
│   │   ├── user.py
│   │   ├── task.py
│   │   ├── conversation.py      # Existing (Phase III Step 1)
│   │   └── message.py           # Existing (Phase III Step 1)
│   ├── services/                # EXISTING: Business logic
│   │   └── task_service.py      # Existing task operations
│   ├── middleware/              # EXISTING: Auth middleware
│   │   └── auth.py              # JWT token validation
│   └── db/                      # EXISTING: Database config
│       └── session.py           # Database session management
├── tests/
│   ├── test_agent.py            # NEW: Agent unit tests
│   ├── test_agent_integration.py # NEW: Agent + MCP integration tests
│   ├── test_mcp_tools.py        # EXISTING: MCP tool tests
│   └── test_regression.py       # EXISTING: Regression tests (will re-run)
├── .env                         # EXISTING: Environment variables (add OPENAI_API_KEY)
├── requirements.txt             # EXISTING: Dependencies (add openai-agents-sdk)
└── main.py                      # EXISTING: FastAPI app (add chat endpoint)
```

**Structure Decision**: This is a web application (Option 2) with backend-only changes. The agent module is added to the existing FastAPI backend at `src/ai/`. No frontend changes are required in this phase. The agent integrates with existing MCP tools created in Phase III Step 1, ensuring clean separation between agent logic (natural language processing) and tool logic (task operations).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All constitution checks pass.

## Phase 0: Research & Technology Decisions

### Research Tasks

The following unknowns from Technical Context require research:

1. **OpenAI Agents SDK Integration Patterns**
   - Research: How to initialize and configure an OpenAI Agent
   - Research: How to register custom tools/functions with the agent
   - Research: How to handle agent responses and tool invocations
   - Research: Best practices for error handling in agent workflows

2. **MCP SDK Version Compatibility**
   - Research: Compatibility between mcp==1.0.0 and mcp>=1.8.0
   - Research: Breaking changes when upgrading MCP SDK
   - Research: Impact on existing MCP tools (add_task, list_tasks, etc.)

3. **Multi-Step Operation Patterns**
   - Research: How agents chain multiple tool invocations
   - Research: Context management within a single message processing cycle
   - Research: Preventing infinite loops in multi-step operations

4. **Natural Language Intent Recognition**
   - Research: How OpenAI Agents SDK handles intent extraction
   - Research: Prompt engineering for task management domain
   - Research: Handling ambiguous or incomplete user input

5. **OpenAI API Configuration**
   - Research: Model selection (GPT-4, GPT-3.5-turbo, etc.)
   - Research: Temperature and token limit settings for task management
   - Research: Rate limiting and quota management strategies
   - Research: Error handling for API failures (timeouts, rate limits)

### Technology Choices to Validate

1. **Agent Framework**: OpenAI Agents SDK (specified requirement)
   - Validate: Installation process and compatibility with Python 3.11+
   - Validate: Integration with existing FastAPI application
   - Validate: Tool registration mechanism

2. **Tool Integration Approach**: Direct MCP tool invocation vs. wrapper functions
   - Evaluate: Should agent call MCP tools directly or through wrapper layer?
   - Evaluate: How to pass user_id context to tool invocations?
   - Evaluate: Error handling and response transformation patterns

3. **API Endpoint Design**: Synchronous vs. asynchronous response
   - Evaluate: Should POST /api/chat return immediately or wait for agent response?
   - Evaluate: Streaming vs. complete response
   - Evaluate: Timeout handling for long-running agent operations

**Output Target**: `research.md` with all decisions documented, alternatives considered, and rationale provided.

## Phase 1: Design Artifacts

### Data Model

**Entities from Spec**:
- Agent (stateless, no persistence required)
- User Intent (extracted from message, not persisted)
- Tool Invocation (logged for debugging, optional)
- Agent Response (returned to user, not persisted in this phase)

**Existing Entities** (no changes):
- User (existing)
- Task (existing)
- Conversation (existing, created in Phase III Step 1)
- Message (existing, created in Phase III Step 1)

**Note**: This feature does NOT require new database tables or schema changes. All entities are either stateless (Agent, User Intent) or already exist (User, Task, Conversation, Message). Conversation persistence (saving messages to database) is explicitly out of scope for this phase.

**Output Target**: `data-model.md` documenting entity relationships and validation rules.

### API Contracts

**New Endpoint**:
- POST /api/chat - Send message to agent and receive response

**Existing Endpoints** (no changes):
- POST /api/auth/signup
- POST /api/auth/login
- GET /api/tasks
- POST /api/tasks
- PUT /api/tasks/{task_id}
- DELETE /api/tasks/{task_id}
- POST /api/tasks/{task_id}/complete

**Output Target**: `contracts/agent-api.yaml` with OpenAPI specification for chat endpoint.

### Quickstart Guide

**Output Target**: `quickstart.md` with:
- Installation instructions (pip install openai-agents-sdk)
- Environment variable setup (OPENAI_API_KEY)
- Agent initialization example
- Tool registration example
- Testing instructions
- Troubleshooting common issues

## Phase 2: Task Generation

**Not created by /sp.plan command**. Run `/sp.tasks 002-openai-agent-integration` after Phase 1 is complete.

## Next Steps

1. **Phase 0**: Generate `research.md` by researching OpenAI Agents SDK integration patterns, MCP SDK compatibility, and multi-step operation handling
2. **Phase 1**: Generate `data-model.md`, `contracts/agent-api.yaml`, and `quickstart.md` based on research findings
3. **Update Agent Context**: Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType claude` to add OpenAI Agents SDK to agent context
4. **Re-evaluate Constitution Check**: Verify all gates still pass after design decisions
5. **Task Generation**: Run `/sp.tasks 002-openai-agent-integration` to create actionable implementation tasks

## Dependencies

- **Phase III Step 1 (MCP Server Foundation)**: COMPLETE - All 5 MCP tools operational and tested
- **OpenAI API Access**: REQUIRED - Valid API key with sufficient quota
- **MCP SDK Upgrade**: REQUIRED - Upgrade from 1.0.0 to >=1.8.0 for OpenAI Agents SDK compatibility

## Risk Analysis

1. **MCP SDK Upgrade Risk**: Upgrading from 1.0.0 to >=1.8.0 may break existing MCP tools
   - Mitigation: Run full regression test suite after upgrade
   - Fallback: Document breaking changes and update tool implementations if needed

2. **OpenAI API Dependency**: Agent functionality depends on external API availability
   - Mitigation: Implement timeout handling and graceful degradation
   - Fallback: Return user-friendly error message when API is unavailable

3. **Multi-Step Operation Complexity**: Chaining tool invocations may introduce edge cases
   - Mitigation: Limit to 3 tool invocations per message, comprehensive error handling
   - Fallback: Fall back to single-step operations if chaining fails

4. **Intent Recognition Accuracy**: Agent may misinterpret user intent
   - Mitigation: Prompt engineering and testing with diverse user inputs
   - Fallback: Ask clarifying questions when intent is ambiguous

## Success Metrics

Implementation is complete when:
- ✓ Agent correctly interprets intent with 90% accuracy (SC-001)
- ✓ Single-step operations succeed 95% of the time (SC-002)
- ✓ Multi-step operations succeed 85% of the time (SC-003)
- ✓ Response time <5 seconds for 95% of requests (SC-004)
- ✓ 100% graceful error handling (SC-005)
- ✓ Zero regression failures in existing features (SC-006 to SC-009)
- ✓ Zero security vulnerabilities detected (SC-010)
