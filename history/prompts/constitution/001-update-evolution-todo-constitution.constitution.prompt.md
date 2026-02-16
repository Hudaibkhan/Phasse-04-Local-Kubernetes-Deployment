---
id: 001
title: Update Evolution Todo Constitution
stage: constitution
date: 2026-01-07
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: unknown
command: /sp.constitution
labels: ["constitution", "phase-ii", "governance", "principles"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
---

## Prompt

```text
# Project Constitution

## Project Name
**Evolution Todo**

## Hackathon
**Hackathon II**

## Phase
**Phase II – Full-Stack Evolution**

## Methodology
**Spec-Driven Development (SDD)**

---

## 1. Purpose

The purpose of **Evolution Todo (Phase II)** is to evolve a Phase I CLI, in-memory todo application into a **production-grade, multi-user, full-stack system** using a **spec-first, AI-assisted workflow**.

This phase focuses on **architecture, persistence, authentication, and correctness**, not AI agents or automation.

---

## 2. Core Principles

### 2.1 Spec-First Development
- All work must begin with specifications
- No frontend or backend code may be written without an approved spec
- Specifications are the **single source of truth**

### 2.2 Monorepo Discipline
- The project is maintained as a **single monorepo**
- Frontend, backend, and specifications live together
- Clear boundaries must be maintained between domains

### 2.3 Deterministic over Clever
- Prefer clarity and correctness over abstraction or novelty
- Avoid premature optimization or over-engineering

### 2.4 Reproducibility
Any contributor (human or AI) should be able to understand the system by reading:
- `/specs`
- `CLAUDE.md`
- This constitution

---

## 3. Scope of Phase II

### 3.1 In Scope
- Full-stack architecture (frontend + backend)
- Persistent storage using a relational database
- Authentication and user isolation
- REST API design
- Spec-Kit governed workflow
- Claude Code skills (not agents)

### 3.2 Explicitly Out of Scope (Phase II)
- AI chatbots or conversational agents
- Background workers
- Kubernetes or container orchestration
- Event streaming or messaging systems

> These belong to **Phase III and beyond**

---

## 4. System Architecture Rules

### 4.1 Frontend
- Built with a modern React framework (**Next.js**)
- Responsible only for UI and API consumption
- No business logic or data persistence

### 4.2 Backend
- Built as a stateless REST API (**FastAPI**)
- Responsible for:
  - Business rules
  - Authentication enforcement
  - Database interaction

### 4.3 Database
- Persistent storage using a **serverless PostgreSQL database**
- No in-memory state for application data
- All data must be **user-scoped**

---

## 5. Authentication & Security
- The system must support **multiple users**
- Authentication is mandatory for all protected operations
- Users must never access or modify other users' data
- Secrets must never be hardcoded
- Authentication flow must be **clearly specified before implementation**

---

## 6. Specification Governance

### 6.1 Required Specs
At minimum, Phase II must define:
- Project overview
- System architecture
- Task CRUD behavior
- Authentication behavior
- API contracts
- Database schema
- UI page structure

### 6.2 Change Rules
- Any feature change requires a **spec update first**
- If specs conflict, work must stop until resolved
- Specs must stay consistent across frontend, backend, and database

---

## 7. Claude Code Usage Rules
- Claude Code must operate under **skills**, not ad-hoc reasoning
- Skills are the reusable intelligence layer

Claude must:
- Read specs before acting
- Respect monorepo boundaries
- Refuse to implement undefined behavior

---

## 8. Success Criteria for Phase II

Phase II is considered successful when:
- The monorepo structure is complete and clean
- Specs fully describe the system
- Authentication and persistence are correctly designed
- Frontend and backend responsibilities are clearly separated
- The system can support multiple users safely

---

## 9. Phase Transition Rule
No Phase III work may begin until:
- All Phase II specs are complete
- Architecture is stable
- Phase II requirements
```

## Response snapshot

Created Evolution Todo Constitution v1.0.0 with the following structure:

**Purpose**: Evolve Phase I CLI todo app into production-grade, multi-user, full-stack system using spec-first, AI-assisted workflow

**Core Principles** (4):
1. Spec-First Development - All work begins with specifications as single source of truth
2. Monorepo Discipline - Single repo with clear domain boundaries
3. Deterministic over Clever - Clarity and correctness over abstraction
4. Reproducibility - System understandable via `/specs`, `CLAUDE.md`, and constitution

**Scope**: Full-stack (Next.js + FastAPI + PostgreSQL), authentication, REST API, Spec-Kit workflow
**Out of Scope**: AI agents, background workers, K8s, event streaming (Phase III+)

**Architecture Rules**:
- Frontend: Next.js, UI only, no business logic
- Backend: FastAPI, stateless REST, all business logic
- Database: Serverless PostgreSQL, user-scoped data

**Security**: Multi-user support, mandatory authentication, user isolation, no hardcoded secrets

**Governance**: Constitution supersedes all practices, amendments require documentation + approval + versioning

**Version**: 1.0.0 (ratified 2026-01-07)

All templates verified for consistency. No follow-up actions required.

## Outcome

- ✅ Impact: Constitution v1.0.0 ratified; establishes governance for Phase II full-stack evolution
- 🧪 Tests: N/A (documentation artifact)
- 📁 Files: Created `.specify/memory/constitution.md` (239 lines)
- 🔁 Next prompts: Create project overview spec, define system architecture, specify authentication
- 🧠 Reflection: Successfully translated user's Phase II requirements into formal constitution with 4 core principles, clear scope boundaries, and architecture rules. Template consistency validated.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A (initial constitution creation)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Validate constitution against actual spec creation workflow
