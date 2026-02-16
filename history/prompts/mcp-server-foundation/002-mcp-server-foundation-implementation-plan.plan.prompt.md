---
id: 002
title: MCP Server Foundation Implementation Plan
stage: plan
date: 2026-02-08
surface: agent
model: claude-sonnet-4-5
feature: mcp-server-foundation
branch: 001-mcp-server-foundation
user: user
command: /sp.plan
labels: ["planning", "mcp-server", "architecture", "design", "phase-0", "phase-1"]
links:
  spec: specs/001-mcp-server-foundation/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/001-mcp-server-foundation/plan.md
 - specs/001-mcp-server-foundation/research.md
 - specs/001-mcp-server-foundation/data-model.md
 - specs/001-mcp-server-foundation/quickstart.md
 - specs/001-mcp-server-foundation/contracts/add_task.json
 - specs/001-mcp-server-foundation/contracts/list_tasks.json
 - specs/001-mcp-server-foundation/contracts/complete_task.json
 - specs/001-mcp-server-foundation/contracts/update_task.json
 - specs/001-mcp-server-foundation/contracts/delete_task.json
tests:
 - None (planning phase)
---

## Prompt

User requested creation of implementation plan for MCP Server Foundation with simplified requirements:

**Goal**: Add MCP Server + Task Tools foundation in `quantum_todo_backend` using Neon DB only, without breaking existing auth, tasks, recurring, or notifications.

**Key Requirements**:
1. Baseline Check - Verify current features still work
2. DB Additions - Create + migrate new SQLModel tables (Conversation, Message) - only ADD tables, no changes to Task/Notification schema
3. MCP Server Setup - Create `quantum_todo_backend/mcp_server/` and initialize Official MCP SDK server
4. Implement Stateless MCP Tools - Expose task operations using existing backend logic (add_task, list_tasks, complete_task, update_task, delete_task) with user ownership enforcement
5. Testing + Regression - Test each MCP tool against Neon DB and re-test existing UI/API features

**Critical Constraints**:
- Must NOT break any existing features
- Must NOT modify existing Task or Notification schemas
- Must NOT introduce local SQLite or local DB
- Neon DB must remain the only database
- MCP tools must be stateless and store all state in DB

## Response snapshot

Successfully created comprehensive implementation plan with Phase 0 (Research) and Phase 1 (Design) artifacts:

**Plan Document** (plan.md):
- Complete technical context (Python 3.11+, FastAPI, SQLModel, MCP SDK, Neon PostgreSQL)
- Constitution compliance check (all gates passed)
- Detailed project structure for documentation and source code
- Phase 0 research tasks (5 research areas)
- Phase 1 design artifacts (data model, contracts, quickstart)
- Implementation sequence with pre-implementation checklist
- Risk mitigation strategies (4 major risks identified)
- Success criteria (8 measurable outcomes)

**Phase 0: Research Document** (research.md):
- **R1: MCP SDK Integration** - Decision: Use Official MCP Python SDK with separate server process
- **R2: Stateless Tool Design** - Decision: Pure functions delegating to TaskService
- **R3: Tool Schemas** - Decision: Pydantic models for input, JSON dicts for output
- **R4: Migration Safety** - Decision: Alembic with additive-only changes
- **R5: Testing Strategy** - Decision: Three-tier (unit, integration, regression)
- **R6: Dependency Management** - Decision: Pinned version in requirements.txt

All technical unknowns resolved with clear rationale and implementation notes.

**Phase 1: Design Artifacts**:

1. **Data Model** (data-model.md):
   - Complete Conversation entity definition (4 fields, relationships, indexes)
   - Complete Message entity definition (6 fields, relationships, indexes)
   - Entity relationship diagram
   - Data access patterns (4 common patterns)
   - Storage estimates (~78 MB for 1000 users)
   - Migration strategy
   - User model updates for relationships

2. **Tool Contracts** (contracts/ directory):
   - add_task.json - Create task with user_id, title, description
   - list_tasks.json - Retrieve tasks with optional status filter
   - complete_task.json - Mark task as completed
   - update_task.json - Update title/description
   - delete_task.json - Delete task permanently

   Each contract includes input schema, output schema, error codes, and notes.

3. **Quickstart Guide** (quickstart.md):
   - Prerequisites verification
   - Step-by-step setup (8 major steps)
   - Baseline verification procedures
   - MCP SDK installation
   - Database migration process
   - Model implementation
   - MCP server setup
   - Tool testing procedures
   - Regression testing
   - Troubleshooting guide
   - Verification checklist

**Agent Context Update**:
- Successfully updated CLAUDE.md with new technologies
- Added Python 3.11+ and Neon PostgreSQL to context

**Constitution Compliance**:
- ✅ Spec-Driven Implementation
- ✅ Monorepo Discipline
- ✅ Deterministic over Clever
- ✅ Reproducibility
- ✅ Backend Rules (stateless)
- ✅ Database Rules (user-scoped)
- ✅ Authentication & Security

**Key Architectural Decisions**:
1. MCP server runs as separate process alongside FastAPI
2. Tools delegate to existing TaskService (no logic duplication)
3. Database sessions created per tool invocation
4. Additive-only migrations (no schema modifications)
5. Three-tier testing strategy

**Project Structure**:
- Backend-only changes within existing FastAPI monolith
- New mcp_server/ module with clear separation from REST API
- 2 new database tables (Conversation, Message)
- 5 tool implementations
- Comprehensive test coverage

## Outcome

- ✅ Impact: Created complete implementation plan with all Phase 0 research and Phase 1 design artifacts, providing clear technical direction for MCP server foundation implementation
- 🧪 Tests: No tests at planning phase; testing strategy documented in research.md
- 📁 Files: 9 files created (plan, research, data-model, quickstart, 5 tool contracts)
- 🔁 Next prompts: `/sp.tasks` to generate implementation tasks, then `/sp.implement` to execute
- 🧠 Reflection: Planning phase successfully resolved all technical unknowns and created comprehensive design artifacts. All constitution gates passed. Ready for task generation and implementation.

## Evaluation notes (flywheel)

- Failure modes observed: None - planning completed successfully
- Graders run and results (PASS/FAIL): Constitution check - PASS (all 7 principles satisfied)
- Prompt variant (if applicable): Standard /sp.plan workflow with Phase 0 and Phase 1
- Next experiment (smallest change to try): Generate tasks with /sp.tasks to validate that plan provides sufficient detail for implementation
