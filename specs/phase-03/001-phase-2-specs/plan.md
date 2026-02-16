# Implementation Plan: Evolution Todo Phase II Complete System

**Branch**: `001-phase-2-specs` | **Date**: 2026-01-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-phase-2-specs/spec.md`

**Note**: This plan covers the complete Phase II implementation including all P1, P2, and P3 features.

## Summary

Evolution Todo Phase II transforms the Phase I CLI prototype into a production-grade, multi-user, full-stack web application. This implementation delivers:

**Core Features (P1)**:
- Secure multi-user authentication with JWT and bcrypt password hashing
- Complete task CRUD operations with user isolation at database level
- Modern landing page with responsive UI and smooth animations

**Intermediate Features (P2)**:
- Task priorities (High/Medium/Low) with color-coded visual indicators
- Custom tags/categories for task organization
- Real-time search and filtering across tasks
- Multi-dimensional sorting (date, priority, title, due date)
- Dark/light theme toggle with persistent preferences

**Advanced Features (P3)**:
- Due dates and time management with overdue indicators
- Recurring tasks with configurable patterns (daily, weekly, custom)
- Browser notifications for task reminders

**Technical Approach**:
- **Frontend**: Next.js 15+ with TypeScript, TailwindCSS, and Framer Motion animations
- **Backend**: FastAPI with async/await, SQLModel ORM, and automatic OpenAPI generation
- **Database**: Neon PostgreSQL (serverless) with Alembic migrations
- **Authentication**: Better-Auth library with HTTP-only JWT cookies (24h expiration)
- **Architecture**: Stateless REST API, server components, strict domain boundaries

**Success Criteria**: 100% user isolation enforcement, <2s task operations, 60fps animations, WCAG AA accessibility, support for 100+ concurrent users with 1000 tasks each.

## Technical Context

**Language/Version**:
- **Frontend**: TypeScript with Next.js 15+ (React 18+)
- **Backend**: Python 3.11+ with FastAPI
- **Database**: PostgreSQL 15+ (Neon serverless)

**Primary Dependencies**:
- **Frontend**: Next.js 15+, React 18+, TailwindCSS, Framer Motion (animations), Better-Auth (JWT client)
- **Backend**: FastAPI, SQLModel (ORM), Alembic (migrations), Bcrypt (password hashing), Better-Auth (JWT)
- **Database**: Neon PostgreSQL with connection pooling

**Storage**: PostgreSQL (Neon serverless) with user-scoped data isolation

**Testing**:
- **Frontend**: Jest + React Testing Library (unit), Playwright (E2E - Phase III)
- **Backend**: pytest + pytest-asyncio (unit & integration)
- **Contract Testing**: OpenAPI spec validation

**Target Platform**:
- **Frontend**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Backend**: Linux server (containerized deployment)
- **Database**: Neon serverless PostgreSQL (cloud-hosted)

**Project Type**: Full-stack web application (monorepo with frontend + backend)

**Performance Goals**:
- Task creation/update: <2s end-to-end
- Task completion toggle: <300ms visual feedback
- Search results: <500ms as user types
- UI animations: 60fps on modern browsers
- Landing page load: <3s on 3G connection

**Constraints**:
- User isolation: 100% enforcement at database query level
- Password security: bcrypt with salt factor 12+
- JWT token expiration: 24 hours
- Task limits: 1000 tasks per user
- Tag limits: 50 unique tags per user
- Title max: 200 characters, Description max: 1000 characters

**Scale/Scope**:
- Phase II MVP: Support 100+ concurrent users
- Per-user capacity: 1000 tasks, 50 tags
- 11 user stories (P1-P3 priorities)
- ~60 functional requirements across auth, CRUD, priorities, tags, search, sorting, dates, recurrence, reminders, UI/UX
- 7 pages (landing, login, signup, dashboard, task detail, 404, 500)
- 15 reusable UI components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Spec-First Development ✅
- **Status**: PASS
- **Evidence**: This feature has comprehensive spec.md with 11 user stories, 60+ functional requirements, and clear success criteria defined before any implementation
- **Notes**: All Phase II specs are complete (overview.md, architecture.md, features/, api/, database/, ui/)

### Monorepo Discipline ✅
- **Status**: PASS
- **Evidence**: Clear monorepo structure with `specs/`, `frontend/`, `backend/` directories. Domain boundaries defined via CLAUDE.md files
- **Notes**: Frontend and backend remain empty during Phase II as required

### Deterministic over Clever ✅
- **Status**: PASS
- **Evidence**: Technology choices are proven and straightforward (Next.js, FastAPI, PostgreSQL). No experimental abstractions or premature optimizations
- **Notes**: REST API (not GraphQL), standard JWT auth, conventional database design

### Reproducibility ✅
- **Status**: PASS
- **Evidence**: Complete specifications, CLAUDE.md governance files, and constitution.md provide full context for any contributor
- **Notes**: All architectural decisions documented in specs; ADRs will be created during planning for significant decisions

### In Scope Verification ✅
- **Status**: PASS
- **Evidence**: Feature includes full-stack architecture, persistent storage, authentication, REST API, spec-driven workflow
- **Violations**: None - all features align with Phase II scope

### Out of Scope Verification ✅
- **Status**: PASS
- **Evidence**: Feature explicitly excludes Phase III items: no AI agents, background workers, Kubernetes, event streaming
- **Violations**: None - no Phase III features included

### Authentication & Security ✅
- **Status**: PASS
- **Evidence**:
  - Multi-user support with JWT authentication (FR-AUTH-001 to FR-AUTH-015)
  - User isolation enforced at database level (FR-TASK-017)
  - Secrets management via .env (not hardcoded)
  - Authentication spec defined in specs/features/authentication.md
- **Notes**: Bcrypt password hashing, HTTP-only cookies, 24-hour token expiration

### Frontend Boundary Compliance ✅
- **Status**: PASS
- **Evidence**: Frontend specs show UI/UX only - no business logic, no direct database access
- **Notes**: All data fetching via REST API calls to backend; state management for UI concerns only

### Backend Boundary Compliance ✅
- **Status**: PASS
- **Evidence**: Backend handles all business logic, authentication enforcement, database interaction via SQLModel ORM
- **Notes**: Stateless REST API design; no in-memory session state

### Database Architecture ✅
- **Status**: PASS
- **Evidence**:
  - Schema defined in specs/database/schema.md
  - All tables have user_id foreign key for user-scoping
  - No shared data between users
- **Notes**: PostgreSQL with proper indexes for query optimization

### Required Specs ✅
- **Status**: PASS
- **Evidence**: All Phase II required specs present:
  - ✅ specs/overview.md
  - ✅ specs/architecture.md
  - ✅ specs/features/task-crud.md
  - ✅ specs/features/authentication.md
  - ✅ specs/api/rest-endpoints.md
  - ✅ specs/database/schema.md
  - ✅ specs/ui/pages.md
  - ✅ specs/ui/components.md

### Claude Code Usage Compliance ✅
- **Status**: PASS
- **Evidence**: This plan references all specs; respects monorepo boundaries; no undefined behavior
- **Notes**: Implementation will follow skill-based approach; no code without specs

---

**Overall Constitution Compliance: ✅ PASS**

All constitutional principles satisfied. Proceed to Phase 0: Research.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/           # SQLModel database models (User, Task, Tag, etc.)
│   ├── services/         # Business logic layer
│   ├── api/              # FastAPI route handlers
│   │   ├── auth.py       # Authentication endpoints
│   │   ├── tasks.py      # Task CRUD endpoints
│   │   └── tags.py       # Tag management endpoints
│   ├── middleware/       # JWT validation, CORS, error handling
│   ├── db/               # Database connection, session management
│   ├── schemas/          # Pydantic request/response schemas
│   └── utils/            # Helper functions (password hashing, JWT generation)
├── tests/
│   ├── unit/             # Unit tests for services and models
│   ├── integration/      # API endpoint integration tests
│   └── conftest.py       # pytest fixtures
├── alembic/              # Database migrations
│   └── versions/
├── .env.example          # Environment variable template
└── requirements.txt      # Python dependencies

frontend/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (protected)/  # Authenticated route group
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   └── tasks/[id]/
│   │   ├── login/
│   │   ├── signup/
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Landing page
│   ├── components/       # Reusable UI components
│   │   ├── layout/       # Header, Footer
│   │   ├── forms/        # Input, Button, Textarea, Checkbox
│   │   ├── auth/         # LoginForm, SignupForm
│   │   ├── tasks/        # TaskList, TaskItem, TaskForm
│   │   └── ui/           # Loading, EmptyState, Modal
│   ├── lib/              # Utility functions
│   │   ├── api.ts        # API client for backend calls
│   │   └── auth.ts       # Auth context and helpers
│   └── styles/
│       └── globals.css   # TailwindCSS imports
├── tests/
│   ├── unit/             # Component unit tests (Jest + RTL)
│   └── e2e/              # End-to-end tests (Playwright - Phase III)
├── middleware.ts         # Next.js middleware (auth checks)
├── .env.local.example    # Environment variable template
├── package.json
└── tsconfig.json
```

**Structure Decision**: Full-stack web application (Option 2) with clear separation between frontend (Next.js) and backend (FastAPI). This structure:
- Maintains monorepo discipline with distinct `frontend/` and `backend/` directories
- Enforces domain boundaries (UI vs business logic vs data)
- Aligns with Phase II specifications (no mobile apps, no microservices)
- Supports independent testing of each layer

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: N/A - No constitution violations detected.

All constitutional principles passed verification. No complexity justifications required.
