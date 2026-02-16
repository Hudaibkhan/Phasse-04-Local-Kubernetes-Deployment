# Tasks: OpenAI Agents SDK Integration

**Input**: Design documents from `/specs/002-openai-agent-integration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/agent-api.yaml, quickstart.md

**Tests**: Not explicitly requested in specification - focus on implementation and manual validation

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

All paths relative to `Quantum-Todo-Backend/` directory.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependency installation, and environment configuration

- [x] T001 Update requirements.txt to add openai>=1.59.4 and upgrade mcp>=1.8.0
- [x] T002 Install new dependencies with pip install -r requirements.txt
- [x] T003 Add OPENAI_API_KEY to .env file (placeholder value for development)
- [x] T004 Create src/ai/ directory structure with __init__.py
- [x] T005 Verify MCP SDK upgrade compatibility by running pytest tests/test_mcp_tools.py

**Checkpoint**: Dependencies installed, environment configured, MCP tools still working after upgrade

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core agent infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 [P] Create agent configuration in src/ai/config.py with AGENT_CONFIG, RUNTIME_CONFIG, and OPENAI_API_KEY loading
- [x] T007 [P] Create MCP tool schemas in src/ai/tool_registry.py with TOOL_SCHEMAS array for all 5 tools (add_task, list_tasks, complete_task, update_task, delete_task)
- [x] T008 Implement invoke_mcp_tool_with_user_context function in src/ai/tool_registry.py to inject user_id and call MCP tools
- [x] T009 Implement get_or_create_assistant function in src/ai/agent.py to cache OpenAI assistant
- [x] T010 Implement core process_message function in src/ai/agent.py with thread creation, run polling, and tool invocation loop
- [x] T011 Create ChatRequest and ChatResponse Pydantic models in src/api/chat.py
- [x] T012 Create POST /api/chat endpoint in src/api/chat.py with authentication via get_current_user dependency
- [x] T013 Register chat router in main.py with app.include_router(chat_router, prefix="/api", tags=["chat"])

**Checkpoint**: Foundation ready - agent can process messages and invoke MCP tools

---

## Phase 3: User Story 1 - Basic Natural Language Task Management (Priority: P1) 🎯 MVP

**Goal**: Users can manage tasks using natural language commands (add, list, complete, update, delete) through the AI agent

**Independent Test**: Send "Add a task to buy groceries" and verify agent creates task and returns friendly confirmation. Send "Show my pending tasks" and verify agent lists tasks correctly.

### Implementation for User Story 1

- [x] T014 [US1] Verify agent correctly handles "Add a task" intent by testing with sample message and checking add_task tool is invoked
- [x] T015 [US1] Verify agent correctly handles "Show my tasks" intent by testing with sample message and checking list_tasks tool is invoked
- [x] T016 [US1] Verify agent correctly handles "Mark task as done" intent by testing with task ID and checking complete_task tool is invoked
- [x] T017 [US1] Verify agent correctly handles "Update task" intent by testing with task title change and checking update_task tool is invoked
- [x] T018 [US1] Verify agent correctly handles "Delete task" intent by testing with task ID and checking delete_task tool is invoked
- [x] T019 [US1] Test agent returns friendly, conversational responses for all 5 basic operations
- [x] T020 [US1] Verify user_id is correctly injected into all MCP tool invocations from JWT token
- [x] T021 [US1] Test agent response time is under 5 seconds for single-step operations

**Checkpoint**: User Story 1 complete - agent handles all 5 basic task operations with natural language

---

## Phase 4: User Story 2 - Multi-Step Task Operations (Priority: P2)

**Goal**: Users can perform complex operations requiring multiple tool invocations through a single natural language command

**Independent Test**: Send "Delete the meeting task" and verify agent chains list_tasks (to find task) → delete_task (to remove it) and returns confirmation

### Implementation for User Story 2

- [x] T022 [US2] Test agent handles "Delete the [task name]" by chaining list_tasks → delete_task operations
- [x] T023 [US2] Test agent handles "Rename the [task name] to [new name]" by chaining list_tasks → update_task operations
- [x] T024 [US2] Verify agent asks for clarification when multiple tasks match search term (e.g., "Delete the grocery task" with 2 grocery tasks)
- [x] T025 [US2] Test iteration limit enforcement - verify agent stops after 3 tool invocations and returns appropriate message
- [x] T026 [US2] Verify multi-step operations complete within 5 seconds for 85% of requests
- [x] T027 [US2] Test agent maintains context within single message processing cycle (results from first tool available to second tool)

**Checkpoint**: User Story 2 complete - agent handles multi-step operations intelligently

---

## Phase 5: User Story 3 - Robust Error Handling and User Feedback (Priority: P3)

**Goal**: Users receive clear, helpful feedback when operations fail or when agent cannot understand intent

**Independent Test**: Send "Mark task xyz-999 as done" (non-existent task) and verify agent returns helpful error message instead of crashing

### Implementation for User Story 3

- [x] T028 [US3] Implement error handling for non-existent task IDs - agent should respond with "I couldn't find a task with ID xyz-999. Would you like to see your current tasks?"
- [x] T029 [US3] Implement error handling for MCP tool failures - agent should catch errors and respond with user-friendly message
- [x] T030 [US3] Implement error handling for ambiguous commands - agent should ask clarifying questions (e.g., "Do the thing" → "What would you like me to do?")
- [x] T031 [US3] Implement error handling for incomplete commands - agent should prompt for missing information (e.g., "Add a task" → "What would you like the task to be?")
- [x] T032 [US3] Implement error handling for OpenAI API failures (rate limits, timeouts) with exponential backoff retry logic in src/ai/agent.py
- [x] T033 [US3] Implement timeout handling - if agent processing exceeds 30 seconds, return "Request timed out. Please try again."
- [x] T034 [US3] Add comprehensive logging for all error scenarios with appropriate log levels (ERROR for failures, WARNING for retries)
- [x] T035 [US3] Test agent handles malformed input gracefully without exposing internal errors to users

**Checkpoint**: User Story 3 complete - agent provides excellent error handling and user feedback

---

## Phase 6: User Story 4 - System Integrity and Non-Regression (Priority: P4)

**Goal**: Verify AI agent integration does not break any existing functionality

**Independent Test**: Run full existing test suite and verify zero regression failures

### Validation for User Story 4

- [x] T036 [US4] Run pytest tests/test_regression.py and verify all tests pass (auth, manual task APIs, recurring tasks, notifications)
- [x] T037 [US4] Run pytest tests/test_mcp_tools.py and verify all 5 MCP tools still work correctly after agent integration
- [x] T038 [US4] Manually test POST /api/tasks (create task via REST API) and verify it works identically to before agent integration
- [x] T039 [US4] Manually test POST /api/auth/login and verify authentication works identically to before agent integration
- [x] T040 [US4] Manually test recurring task completion and verify next occurrence is created automatically as before
- [x] T041 [US4] Manually test task notification triggers and verify notifications are created and delivered as before
- [x] T042 [US4] Verify no database schema changes were made (check alembic migrations)
- [x] T043 [US4] Verify existing REST API endpoints unchanged (GET /api/tasks, PUT /api/tasks/{id}, DELETE /api/tasks/{id})

**Checkpoint**: User Story 4 complete - zero regression confirmed, all existing features working

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, documentation, and production readiness

- [x] T044 [P] Add rate limiting to POST /api/chat endpoint (10 requests per minute per user recommended)
- [x] T045 [P] Add request/response logging for agent operations with token usage tracking
- [x] T046 [P] Update API documentation to include POST /api/chat endpoint details
- [x] T047 [P] Create deployment checklist for production (OPENAI_API_KEY setup, quota monitoring, error alerting)
- [x] T048 Verify quickstart.md instructions are accurate by following them step-by-step
- [x] T049 Performance optimization: verify assistant caching is working (assistant created once, reused)
- [x] T050 Performance optimization: verify ephemeral threads are deleted after use to avoid storage costs
- [x] T051 Security review: verify OPENAI_API_KEY not exposed in logs or error messages
- [x] T052 Security review: verify user_id injection prevents unauthorized access to other users' tasks

**Checkpoint**: Feature complete and production-ready

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T005) - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion (T006-T013)
  - User Story 1 (Phase 3): Can start after Foundational - No dependencies on other stories
  - User Story 2 (Phase 4): Can start after Foundational - Builds on US1 but independently testable
  - User Story 3 (Phase 5): Can start after Foundational - Enhances US1/US2 but independently testable
  - User Story 4 (Phase 6): Should run after US1-US3 to validate no regressions
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation only - MVP can ship with just this story
- **User Story 2 (P2)**: Foundation only - Can implement in parallel with US1 if desired
- **User Story 3 (P3)**: Foundation only - Can implement in parallel with US1/US2 if desired
- **User Story 4 (P4)**: Requires US1-US3 complete - Validation phase

### Within Each User Story

- Tasks within a story should be executed in order (T014 → T015 → T016...)
- Tasks marked [P] within a phase can run in parallel
- Each story should be validated independently before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup):**
- T003 (add env var) and T004 (create directory) can run in parallel

**Phase 2 (Foundational):**
- T006 (config.py) and T007 (tool schemas) can run in parallel
- T011 (Pydantic models) can run in parallel with T006-T010

**Phase 7 (Polish):**
- T044, T045, T046, T047 can all run in parallel (different concerns)

**User Stories:**
- Once Foundational is complete, US1, US2, and US3 can be worked on in parallel by different developers
- US4 should wait until US1-US3 are complete

---

## Parallel Example: Foundational Phase

```bash
# Launch these tasks together after Setup is complete:
Task T006: "Create agent configuration in src/ai/config.py"
Task T007: "Create MCP tool schemas in src/ai/tool_registry.py"
Task T011: "Create ChatRequest and ChatResponse models in src/api/chat.py"

# Then launch these sequentially:
Task T008: "Implement invoke_mcp_tool_with_user_context" (depends on T007)
Task T009: "Implement get_or_create_assistant" (depends on T006)
Task T010: "Implement process_message" (depends on T008, T009)
Task T012: "Create POST /api/chat endpoint" (depends on T011)
Task T013: "Register chat router in main.py" (depends on T012)
```

---

## Parallel Example: User Story Implementation

```bash
# After Foundational phase is complete, these can run in parallel:

# Developer A works on User Story 1:
Task T014-T021: Basic natural language task management

# Developer B works on User Story 2:
Task T022-T027: Multi-step task operations

# Developer C works on User Story 3:
Task T028-T035: Error handling and user feedback

# Then all developers collaborate on User Story 4:
Task T036-T043: Regression validation
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T013) - CRITICAL
3. Complete Phase 3: User Story 1 (T014-T021)
4. **STOP and VALIDATE**: Test agent with basic commands
5. Deploy/demo if ready - **This is a functional MVP!**

**MVP Delivers**: Natural language task management for all 5 basic operations (add, list, complete, update, delete)

### Incremental Delivery

1. **Foundation** (Setup + Foundational) → Agent infrastructure ready
2. **MVP** (+ User Story 1) → Basic natural language task management → Deploy/Demo
3. **Enhanced** (+ User Story 2) → Multi-step operations → Deploy/Demo
4. **Polished** (+ User Story 3) → Excellent error handling → Deploy/Demo
5. **Validated** (+ User Story 4) → Zero regression confirmed → Production-ready

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. **Together**: Complete Setup + Foundational (T001-T013)
2. **Parallel**: Once Foundational is done:
   - Developer A: User Story 1 (T014-T021)
   - Developer B: User Story 2 (T022-T027)
   - Developer C: User Story 3 (T028-T035)
3. **Together**: User Story 4 validation (T036-T043)
4. **Parallel**: Polish tasks (T044-T052)

---

## Task Count Summary

- **Phase 1 (Setup)**: 5 tasks
- **Phase 2 (Foundational)**: 8 tasks (BLOCKING)
- **Phase 3 (User Story 1 - P1)**: 8 tasks 🎯 MVP
- **Phase 4 (User Story 2 - P2)**: 6 tasks
- **Phase 5 (User Story 3 - P3)**: 8 tasks
- **Phase 6 (User Story 4 - P4)**: 8 tasks
- **Phase 7 (Polish)**: 9 tasks

**Total**: 52 tasks

**MVP Scope** (Recommended first delivery): Phase 1 + Phase 2 + Phase 3 = 21 tasks

**Parallel Opportunities**:
- 3 tasks in Setup phase
- 3 tasks in Foundational phase
- 8 tasks in Polish phase
- All user stories (Phase 3-5) can run in parallel after Foundational

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **No test tasks**: Tests not explicitly requested in specification - focus on implementation and manual validation
- **User Story 4**: Validation phase, not new functionality - runs existing test suite
- **Backend only**: All work in Quantum-Todo-Backend/ directory
- **Zero database changes**: All agent entities are ephemeral
- **MCP SDK upgrade**: Critical in Setup phase - must validate with regression tests
- **Independent stories**: Each user story should be independently completable and testable
- **Commit frequently**: After each task or logical group
- **Stop at checkpoints**: Validate story independently before proceeding

---

## Success Criteria

Feature is complete when:

- ✅ Agent correctly interprets intent with 90% accuracy (SC-001)
- ✅ Single-step operations succeed 95% of the time (SC-002)
- ✅ Multi-step operations succeed 85% of the time (SC-003)
- ✅ Response time <5 seconds for 95% of requests (SC-004)
- ✅ 100% graceful error handling (SC-005)
- ✅ Zero regression failures in existing features (SC-006 to SC-009)
- ✅ Zero security vulnerabilities detected (SC-010)

All success criteria map to specific user stories and validation tasks above.
