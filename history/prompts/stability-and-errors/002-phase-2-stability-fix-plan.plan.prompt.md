---
id: 002
title: phase-2 stability fix plan
stage: plan
date: 2026-01-12
surface: agent
model: claude-sonnet-4-5-20250929
feature: stability-and-errors
branch: 001-stability-and-errors
user: unknown
command: /sp.plan
labels: ["plan", "stability", "errors", "frontend", "backend", "architecture"]
links:
  spec: ../specs/001-stability-and-errors/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - ../specs/001-stability-and-errors/plan.md
 - ../specs/001-stability-and-errors/research.md
 - ../specs/001-stability-and-errors/data-model.md
 - ../specs/001-stability-and-errors/quickstart.md
 - ../specs/001-stability-and-errors/contracts/auth-api.yaml
tests:
 - none
---

## Prompt

phase-2-stability-fix

## Status
📝 **Draft**

---

## Objective
Restore **full operational stability** of the **Evolution Todo** system using a **frontend-first, spec-driven debugging approach**, followed by backend recovery.

---

## Mandatory Skills to Use

Claude Code **MUST** use:

- Skills located in `.claude/skills`
- Spec-Driven Full-Stack Integration
- Spec-Kit Monorepo Orchestration
- Next.js App Router Architecture
- FastAPI Backend Service Architecture
- Better Auth + JWT Integration
- Neon PostgreSQL Persistence

Claude Code **MUST ALSO** use:

### Context7 MCP for:
- Next.js
- Neon PostgreSQL
- Authentication libraries

---

## Execution Strategy (STRICT ORDER)

### Phase A: Frontend Stabilization (**FIRST**)
- Validate Next.js configuration
- Fix path alias (`@`) resolution
- Restore global CSS loading
- Validate Tailwind / styling pipeline
- Ensure all pages render without runtime errors

❌ **Backend must NOT be touched during this phase.**

---

### Phase B: Backend Stabilization (**SECON

## Response snapshot

Created comprehensive implementation plan for the stability and errors fix, including research, data models, API contracts, and quickstart guide.

## Outcome

- ✅ Impact: Complete implementation plan created with all required artifacts (plan.md, research.md, data-model.md, quickstart.md, API contracts)
- 🧪 Tests: none
- 📁 Files: specs/001-stability-and-errors/plan.md, specs/001-stability-and-errors/research.md, specs/001-stability-and-errors/data-model.md, specs/001-stability-and-errors/quickstart.md, specs/001-stability-and-errors/contracts/auth-api.yaml
- 🔁 Next prompts: /sp.tasks stability-and-errors to generate implementation tasks
- 🧠 Reflection: Plan follows constitution requirements and addresses both frontend and backend stability issues systematically

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Not applicable
- Prompt variant (if applicable): Not applicable
- Next experiment (smallest change to try): None needed - plan is complete and ready for task generation