---
id: 002
title: openai-agent-integration-implementation-plan
stage: plan
date: 2026-02-08
surface: agent
model: claude-sonnet-4-5
feature: 002-openai-agent-integration
branch: 002-openai-agent-integration
user: system
command: /sp.plan
labels: ["planning", "openai-assistants-api", "agent-architecture", "mcp-integration", "design"]
links:
  spec: specs/002-openai-agent-integration/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-openai-agent-integration/plan.md
  - specs/002-openai-agent-integration/research.md
  - specs/002-openai-agent-integration/data-model.md
  - specs/002-openai-agent-integration/contracts/agent-api.yaml
  - specs/002-openai-agent-integration/quickstart.md
tests:
  - None (planning phase)
---

## Prompt

/sp.plan 002-openai-agent-integration

# Phase III — Step B Plan: OpenAI Agents SDK + MCP Tool Agent

## 1. Docs First (Context7)
- Resolve and read official OpenAI Agents SDK docs

## 2. Create Agent Module
- Add new folder: quantum_todo_backend/ai/
- Create file: quantum_todo_backend/ai/agent.py

## 3. Build OpenAI Agent
- Initialize an Agent using OpenAI Agents SDK
- Configure system instructions for task management

## 4. Connect MCP Tools
- Register MCP tools inside the agent:
  - add_task, list_tasks, complete_task, update_task, delete_task
- Agent must call tools, not manual DB logic

## 5. Natural Language Routing
- Ensure agent understands user intents:
  - Create task, List tasks, Complete task, Update task, Delete task

## 6. Response Handling
- Always return friendly confirmations
- Handle errors gracefully (task not found, invalid ID)

## 7. Keep Existing Features Safe
- Do not change current features

## Response snapshot

Created comprehensive implementation plan for OpenAI Agents SDK Integration (feature 002-openai-agent-integration).

**Phase 0: Research (research.md)**
- Researched OpenAI Assistants API (production-ready agent solution)
- Key finding: "OpenAI Agents SDK" refers to Assistants API, not experimental Swarm
- Documented 7 major technology decisions:
  1. Use Assistants API with custom function tools
  2. Upgrade MCP SDK from 1.0.0 to >=1.8.0
  3. Native multi-step operations with 3-iteration limit
  4. Built-in intent recognition with system instructions
  5. GPT-4o model with temperature 0.3
  6. Wrapper functions for user_id injection
  7. Synchronous API endpoint with server-side polling
- Fetched official documentation from OpenAI Cookbook
- Analyzed Swarm framework (experimental, replaced by Assistants API)

**Phase 1: Design Artifacts**

1. **data-model.md**: Entity design and relationships
   - Zero new database tables required (all entities ephemeral or existing)
   - 5 new stateless entities: Agent, Thread, Run, Tool Call, Agent Response
   - 4 existing entities: User, Task, Conversation, Message (no changes)
   - Comprehensive validation rules (VR-001 to VR-019)
   - Data flow diagrams for request and tool invocation
   - Performance considerations and security analysis

2. **contracts/agent-api.yaml**: OpenAPI 3.0 specification
   - POST /api/chat endpoint with full documentation
   - Request/response schemas with examples
   - Error responses (400, 401, 429, 500) with examples
   - Multi-step operation examples
   - JWT authentication requirements
   - Rate limiting guidance (10 requests/minute)

3. **quickstart.md**: Developer implementation guide
   - 7-step implementation process
   - Dependency installation (openai>=1.59.4, mcp>=1.8.0)
   - Environment variable configuration
   - Complete code examples for all modules:
     - src/ai/config.py (agent configuration)
     - src/ai/tool_registry.py (MCP tool schemas and wrappers)
     - src/ai/agent.py (core agent logic with polling)
     - src/api/chat.py (REST endpoint)
   - Testing instructions with curl examples
   - Troubleshooting guide for 6 common issues
   - Performance optimization strategies

**Technical Context**:
- Language: Python 3.11+
- Framework: FastAPI (existing)
- Database: Neon PostgreSQL (no schema changes)
- New dependencies: openai>=1.59.4, mcp>=1.8.0
- Model: GPT-4o with temperature 0.3
- Performance targets: <5s response time, 90% intent accuracy

**Constitution Check**: All 7 gates PASS
- Spec-driven implementation ✓
- Monorepo discipline ✓
- Deterministic over clever ✓
- Reproducibility ✓
- Authentication & security ✓
- No breaking changes ✓
- Out of scope compliance ✓

**Project Structure**:
- Backend-only changes (no frontend modifications)
- New module: src/ai/ (agent.py, config.py, tool_registry.py)
- New endpoint: POST /api/chat
- Integration with existing MCP tools (Phase III Step 1)

**Agent Context Updated**: Added Python 3.11+ and Neon PostgreSQL to CLAUDE.md

## Outcome

- ✅ Impact: Complete implementation plan with research, design artifacts, and developer guide ready for task generation. Provides clear technical approach for integrating OpenAI Assistants API with existing MCP tools.
- 🧪 Tests: No tests at planning phase. Test strategy defined in data-model.md (unit tests, integration tests, regression tests).
- 📁 Files: Created 5 files (plan.md, research.md, data-model.md, contracts/agent-api.yaml, quickstart.md)
- 🔁 Next prompts: `/sp.tasks 002-openai-agent-integration` to generate actionable implementation tasks
- 🧠 Reflection: Planning successfully identified that "OpenAI Agents SDK" refers to the Assistants API (production-ready) rather than Swarm (experimental). All design decisions documented with rationale and alternatives considered. Zero new database tables required - all agent entities are ephemeral. Constitution check passes all gates with zero violations.

## Evaluation notes (flywheel)

- Failure modes observed: Initial web search failed, but successfully fetched OpenAI documentation via WebFetch from GitHub and Cookbook
- Graders run and results (PASS/FAIL): Constitution Check - ALL PASS (7/7 gates)
- Prompt variant (if applicable): Standard /sp.plan workflow with Phase 0 research and Phase 1 design
- Next experiment (smallest change to try): Proceed to task generation to create actionable implementation steps based on quickstart guide
