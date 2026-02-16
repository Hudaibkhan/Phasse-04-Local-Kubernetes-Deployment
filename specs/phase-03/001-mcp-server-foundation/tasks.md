# Tasks: MCP Server Foundation with Task Tools

**Input**: Design documents from `/specs/001-mcp-server-foundation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are NOT included as they were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

All paths are relative to `Quantum-Todo-Backend/` directory.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependency installation, and baseline verification

- [ ] T001 Verify baseline - Run existing backend and confirm all features work (auth, task CRUD, recurring tasks, notifications)
- [x] T002 Add MCP SDK dependency to requirements.txt (mcp==1.0.0)
- [x] T003 Install dependencies with pip install -r requirements.txt
- [x] T004 Verify MCP SDK installation with python -c "import mcp; print(mcp.__version__)"

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema additions that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create Conversation SQLModel in src/models/conversation.py with id, user_id, created_at, updated_at fields
- [x] T006 [P] Create Message SQLModel in src/models/message.py with id, conversation_id, user_id, role, content, created_at fields
- [x] T007 Update src/models/user.py to add relationships for conversations and messages
- [x] T008 Update src/models/__init__.py to export Conversation and Message models
- [x] T009 Generate Alembic migration with alembic revision --autogenerate -m "add_conversation_message_tables"
- [x] T010 Review generated migration file in alembic/versions/ to ensure only new tables are added (no modifications to existing tables)
- [x] T011 Apply migration to Neon DB with alembic upgrade head
- [x] T012 Verify tables created with psql commands to check conversations and messages tables exist

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Chat History Persistence (Priority: P1) 🎯 MVP

**Goal**: Store conversation history for AI agent interactions, enabling stateless agent execution with full conversation context

**Independent Test**: Create a conversation, add messages to it, and verify messages are retrieved correctly with proper user isolation

### Implementation for User Story 1

- [x] T013 [P] [US1] Verify Conversation model has proper foreign key to users table in src/models/conversation.py
- [x] T014 [P] [US1] Verify Message model has proper foreign keys to conversations and users tables in src/models/message.py
- [x] T015 [US1] Verify cascade delete behavior - when conversation is deleted, messages are deleted
- [x] T016 [US1] Verify user isolation - query conversations by user_id returns only that user's conversations
- [x] T017 [US1] Verify message ordering - messages retrieved in chronological order by created_at
- [x] T018 [US1] Test conversation creation manually with Python script to verify database persistence
- [x] T019 [US1] Test message creation manually with Python script to verify database persistence and relationships

**Checkpoint**: At this point, User Story 1 should be fully functional - conversations and messages can be stored and retrieved with proper user isolation

---

## Phase 4: User Story 2 - Task Management via Agent Tools (Priority: P2)

**Goal**: Enable AI agent to perform task operations through standardized MCP tool interfaces with user ownership enforcement

**Independent Test**: Invoke each tool operation (add, list, complete, delete, update) and verify correct task state changes and user isolation

### MCP Server Infrastructure

- [x] T020 [US2] Create src/mcp_server/ directory structure with __init__.py
- [x] T021 [US2] Create src/mcp_server/tools/ directory with __init__.py
- [ ] T022 [US2] Create tool input/output schemas in src/mcp_server/schemas.py using Pydantic models

### Tool Implementations

- [ ] T023 [P] [US2] Implement add_task tool in src/mcp_server/tools/add_task.py that delegates to TaskService.create_task
- [ ] T024 [P] [US2] Implement list_tasks tool in src/mcp_server/tools/list_tasks.py that delegates to TaskService.get_tasks with status filter
- [ ] T025 [P] [US2] Implement complete_task tool in src/mcp_server/tools/complete_task.py that delegates to TaskService.update_task
- [ ] T026 [P] [US2] Implement update_task tool in src/mcp_server/tools/update_task.py that delegates to TaskService.update_task
- [ ] T027 [P] [US2] Implement delete_task tool in src/mcp_server/tools/delete_task.py that delegates to TaskService.delete_task

### MCP Server Setup

- [ ] T028 [US2] Create MCP server initialization in src/mcp_server/server.py using Official MCP SDK
- [ ] T029 [US2] Register all 5 tools (add_task, list_tasks, complete_task, update_task, delete_task) in src/mcp_server/server.py
- [ ] T030 [US2] Add error handling for all tools to return structured error responses
- [ ] T031 [US2] Verify user ownership enforcement in all tools - operations fail if user_id doesn't match task owner

### Tool Validation

- [ ] T032 [US2] Test add_task tool manually - create task and verify in database
- [ ] T033 [US2] Test list_tasks tool manually - list tasks with different status filters
- [ ] T034 [US2] Test complete_task tool manually - mark task complete and verify recurring task creation if applicable
- [ ] T035 [US2] Test update_task tool manually - update title/description and verify changes
- [ ] T036 [US2] Test delete_task tool manually - delete task and verify removal from database
- [ ] T037 [US2] Test user ownership enforcement - attempt to access another user's task and verify rejection
- [ ] T038 [US2] Test error handling - invoke tools with invalid inputs and verify error responses

**Checkpoint**: At this point, User Story 2 should be fully functional - all 5 MCP tools work correctly with proper user isolation and error handling

---

## Phase 5: User Story 3 - System Integrity and Non-Regression (Priority: P3)

**Goal**: Ensure all existing application features continue to function without degradation after MCP server integration

**Independent Test**: Run existing test suites and manually verify all existing features work as before

### Regression Validation

- [ ] T039 [P] [US3] Test existing auth endpoints - signup and login still work correctly
- [ ] T040 [P] [US3] Test existing task CRUD via REST API - create, read, update, delete tasks work identically
- [ ] T041 [P] [US3] Test recurring task logic - completing recurring task creates next occurrence
- [ ] T042 [P] [US3] Test notification system - task events trigger notifications as before
- [ ] T043 [US3] Verify no performance degradation - existing API response times unchanged
- [ ] T044 [US3] Verify database schema - Task and Notification tables unchanged
- [ ] T045 [US3] Run full regression test suite if it exists in tests/ directory

**Checkpoint**: All user stories should now be independently functional and existing features remain intact

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, cleanup, and final validation

- [ ] T046 [P] Update quickstart.md with any implementation-specific notes or corrections
- [ ] T047 [P] Add inline documentation to all MCP tool implementations
- [ ] T048 [P] Add inline documentation to Conversation and Message models
- [ ] T049 Verify all success criteria from spec.md are met
- [ ] T050 Run complete validation checklist from quickstart.md
- [ ] T051 Document any lessons learned or implementation notes
- [ ] T052 Prepare handoff documentation for Phase III Step 2 (OpenAI Agents SDK integration)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T004) - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion (T005-T012)
  - User Story 1 (Phase 3): Can start after Foundational - No dependencies on other stories
  - User Story 2 (Phase 4): Can start after Foundational - No dependencies on other stories (uses existing TaskService)
  - User Story 3 (Phase 5): Should run after User Stories 1 and 2 are complete for full validation
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Independently testable
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independently testable (does not depend on US1)
- **User Story 3 (P3)**: Should run after US1 and US2 for comprehensive validation

### Within Each User Story

**User Story 1 (Chat Persistence)**:
- T013-T014 (model verification) can run in parallel [P]
- T015-T017 (behavior verification) must run sequentially
- T018-T019 (manual testing) can run in parallel [P]

**User Story 2 (MCP Tools)**:
- T020-T022 (infrastructure) must run sequentially
- T023-T027 (tool implementations) can run in parallel [P]
- T028-T031 (server setup) must run sequentially after tools
- T032-T038 (validation) should run sequentially to catch issues early

**User Story 3 (Regression)**:
- T039-T042 (regression tests) can run in parallel [P]
- T043-T045 (final validation) should run sequentially

### Parallel Opportunities

- **Setup Phase**: T002-T004 can run in sequence (dependencies on each other)
- **Foundational Phase**: T005-T006 (models) can run in parallel [P], then T007-T008 (updates), then T009-T012 (migration)
- **User Story 1**: T013-T014 can run in parallel [P], T018-T019 can run in parallel [P]
- **User Story 2**: T023-T027 (all 5 tools) can run in parallel [P], T032-T038 validation should be sequential
- **User Story 3**: T039-T042 can run in parallel [P]
- **Polish Phase**: T046-T048 can run in parallel [P]

**Cross-Story Parallelism**: After Foundational phase completes, User Story 1 and User Story 2 can be worked on in parallel by different developers since they have no dependencies on each other.

---

## Parallel Example: User Story 2 (MCP Tools)

```bash
# Launch all 5 tool implementations together:
Task: "Implement add_task tool in src/mcp_server/tools/add_task.py"
Task: "Implement list_tasks tool in src/mcp_server/tools/list_tasks.py"
Task: "Implement complete_task tool in src/mcp_server/tools/complete_task.py"
Task: "Implement update_task tool in src/mcp_server/tools/update_task.py"
Task: "Implement delete_task tool in src/mcp_server/tools/delete_task.py"

# These can all be developed simultaneously as they:
# - Operate on different files
# - Have no dependencies on each other
# - All delegate to existing TaskService methods
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T012) - CRITICAL
3. Complete Phase 3: User Story 1 (T013-T019)
4. **STOP and VALIDATE**: Test conversation and message persistence independently
5. This delivers the foundation for AI agent chat history

### Recommended Incremental Delivery

1. **Foundation**: Complete Setup + Foundational (T001-T012) → Database ready
2. **MVP**: Add User Story 1 (T013-T019) → Chat persistence working → Validate independently
3. **Core Value**: Add User Story 2 (T020-T038) → MCP tools working → Validate independently → **DEMO READY**
4. **Validation**: Add User Story 3 (T039-T045) → Regression confirmed → Deploy with confidence
5. **Polish**: Complete Phase 6 (T046-T052) → Production ready

### Parallel Team Strategy

With multiple developers:

1. **Together**: Complete Setup + Foundational (T001-T012)
2. **Once Foundational is done**:
   - Developer A: User Story 1 (T013-T019) - Chat persistence
   - Developer B: User Story 2 (T020-T038) - MCP tools
3. **After both complete**:
   - Developer A or B: User Story 3 (T039-T045) - Regression validation
4. **Together**: Polish phase (T046-T052)

---

## Success Criteria Mapping

Each task maps to success criteria from spec.md:

- **SC-001** (All 5 tools execute successfully): T023-T027, T032-T036
- **SC-002** (User ownership enforcement): T031, T037
- **SC-003** (Chat history persistence): T013-T019
- **SC-004** (Zero regression failures): T039-T045
- **SC-005** (Error handling): T030, T038
- **SC-006** (Migrations succeed): T009-T012
- **SC-007** (Performance): T043

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- User Story 2 does NOT depend on User Story 1 - they can be developed in parallel
- All tools delegate to existing TaskService - no business logic duplication
- Database migrations are additive only - no modifications to existing tables
- Baseline verification (T001) is critical - must pass before proceeding
