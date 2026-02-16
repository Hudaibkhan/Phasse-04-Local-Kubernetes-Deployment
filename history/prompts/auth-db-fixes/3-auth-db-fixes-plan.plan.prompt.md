---
id: 3
title: "auth-db-fixes-plan"
stage: "plan"
date_iso: "2026-01-13"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "auth-db-fixes"
branch: "002-auth-db-fixes"
user: "Muhammad Hudaib Arif"
command: "sp.plan"
labels: ["planning", "authentication", "database", "ui-fixes"]
links:
  spec: "specs/002-auth-db-fixes/spec.md"
  plan: "specs/002-auth-db-fixes/plan.md"
  ticket: null
  adr: null
  pr: null
files_yaml:
  - "specs/002-auth-db-fixes/plan.md"
  - "specs/002-auth-db-fixes/research.md"
  - "specs/002-auth-db-fixes/data-model.md"
  - "specs/002-auth-db-fixes/contracts/auth-api.yaml"
  - "specs/002-auth-db-fixes/contracts/task-api.yaml"
  - "specs/002-auth-db-fixes/quickstart.md"
tests_yaml: []
---

# PHR: auth-db-fixes-plan

## Prompt Text

```
phase-2-auth-db-ui-fix

## Status
📝 **Draft**

---

## Objective
Restore **correct authentication UX**, **session persistence**, **database schema**, and **task functionality** using **Spec-Driven Full-Stack Recovery**.

---

## Mandatory Tools & Skills

Claude Code **MUST**:

- Use skills from `.claude/skills`

- Use **Context7 MCP** for:
  - Next.js App Router
  - Authentication patterns
  - Neon PostgreSQL
  - SQLAlchemy + Alembic

---

## Execution Order (STRICT)

### Phase A: Authentication UI Fixes (**Frontend First**)
- Fix password input binding so masked dots appear
- Add show / hide password toggle
- Update signup form:
  - Add name field
  - Add confirm password field
  - Validate password match
- Ensure correct input types and controlled state

---

### Phase B: Routing & Session Stability
- Verify post-signup redirect path
- Create or correct `/dashboard` route
- Fix auth state persistence:
  - Cookies / tokens
  - Session provider
- Prevent auto logout on page refresh

---

### Phase
```

## Response Text

Created comprehensive implementation plan for authentication, database, and UI fixes with the following deliverables:

1. **Implementation Plan** (plan.md): Detailed approach covering all phases from UI fixes to database schema and task functionality
2. **Research Summary** (research.md): Analysis of authentication patterns, database design, security implementations, and architectural decisions
3. **Data Model** (data-model.md): Complete schema definition for User, Task, and Session entities with validation rules and relationships
4. **API Contracts** (contracts/*.yaml): OpenAPI specifications for authentication and task management endpoints
5. **Quickstart Guide** (quickstart.md): Step-by-step implementation guide for developers

The plan follows the required execution order with Phase A focusing on frontend authentication UI fixes, Phase B on routing and session stability, Phase C on database schema and persistence, and Phase D on task page functionality. All components comply with the Evolution Todo constitution principles including spec-driven implementation, monorepo discipline, and deterministic over clever approaches.

## Outcome

Successfully completed Phase 0 (Research) and Phase 1 (Design & Contracts) of the implementation plan. Created all required artifacts including data models, API contracts, and implementation guidance. Ready for task generation phase (/sp.tasks).