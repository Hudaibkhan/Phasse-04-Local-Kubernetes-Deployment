# Implementation Plan: Docker Foundation

**Branch**: `001-docker-foundation` | **Date**: 2026-02-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-docker-foundation/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Containerize the Evolution Todo full-stack application (Next.js frontend + FastAPI backend) to enable local Docker deployment and prepare for Kubernetes orchestration. This is Phase IV infrastructure work - no application code changes, only deployment configuration files (Dockerfiles, docker-compose.yml). Both services must connect to external Neon PostgreSQL and preserve all Phase III functionality (authentication, task CRUD, chatbot).

## Technical Context

**Language/Version**: Python 3.11+ (backend), Node.js 18+ with TypeScript (frontend)
**Primary Dependencies**: FastAPI, SQLModel, uvicorn (backend); Next.js 15+, React 18+ (frontend)
**Storage**: Neon PostgreSQL (external serverless database, no local container)
**Testing**: pytest (backend), jest (frontend)
**Target Platform**: Linux containers (Docker), deployable to Kubernetes
**Project Type**: Web application (frontend + backend as separate services)
**Performance Goals**: Backend startup <30s, Frontend startup <10s, Build times <5min (backend) and <3min (frontend)
**Constraints**: Infrastructure-only changes, zero application code modifications, all Phase III features must work identically
**Scale/Scope**: 2 container images (frontend, backend), local development and Kubernetes deployment

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Phase IV: Deployment & Infrastructure Compliance

**✅ Infrastructure-Only Changes**
- Plan adds only Dockerfiles and docker-compose.yml
- No modifications to backend API routes, business logic, or services
- No modifications to database schema or migrations
- No modifications to authentication or authorization logic
- No modifications to task management or chatbot features
- No modifications to frontend components or pages

**✅ Container Orchestration Readiness**
- Frontend and Backend will run as separate containers
- Health checks will be configured in Dockerfiles
- Resource limits will be defined in Kubernetes manifests (future phase)
- External Neon PostgreSQL only (no local database containers)

**✅ Secrets Management**
- All environment variables externalized (DATABASE_URL, JWT_SECRET, etc.)
- No secrets in Dockerfiles or committed files
- `.env` files for local development only (already in .gitignore)
- Database connection strings reference Neon PostgreSQL

**✅ Stability Guarantee**
- All Phase III features must work in containers (auth, tasks, chatbot)
- API endpoints must respond identically
- Authentication must function correctly
- Database operations must succeed
- Frontend must render and interact correctly

**✅ Deterministic over Clever**
- Use standard Docker multi-stage builds (industry best practice)
- Prefer official base images (python:3.11-slim, node:18-alpine)
- Simple, explicit Dockerfiles without complex optimization
- Standard port mappings (3000 for frontend, 8000 for backend)

### Gates Status: ✅ ALL PASSED

No constitution violations. This is pure infrastructure work with zero application code changes.

## Project Structure

### Documentation (this feature)

```text
specs/001-docker-foundation/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── backend-dockerfile-spec.md
│   └── frontend-dockerfile-spec.md
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Web application structure (frontend + backend)
frontend/
├── src/
│   ├── app/             # Next.js App Router pages
│   ├── components/      # React components
│   └── lib/             # Utilities and API clients
├── public/              # Static assets
├── package.json         # Node.js dependencies
├── next.config.js       # Next.js configuration
├── tsconfig.json        # TypeScript configuration
└── Dockerfile           # ← NEW: Frontend container image definition

Quantum-Todo-Backend/
├── src/
│   ├── api/             # FastAPI routers
│   ├── models/          # SQLModel database models
│   ├── services/        # Business logic
│   ├── db/              # Database configuration
│   └── middleware/      # Auth and CORS middleware
├── alembic/             # Database migrations
├── main.py              # FastAPI application entry point
├── requirements.txt     # Python dependencies
├── alembic.ini          # Alembic configuration
└── Dockerfile           # ← EXISTS: Backend container image (may need updates)

# Root level (NEW)
docker-compose.yml       # ← NEW: Local multi-container orchestration
.dockerignore            # ← NEW: Exclude files from Docker context (frontend)
Quantum-Todo-Backend/.dockerignore  # ← NEW: Exclude files from Docker context (backend)
```

**Structure Decision**: Web application with separate frontend and backend services. Each service gets its own Dockerfile for independent building and deployment. Docker Compose orchestrates local development with both services running together. This structure aligns with Kubernetes deployment where each service becomes a separate Deployment.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - this section is empty. All constitution checks passed.
