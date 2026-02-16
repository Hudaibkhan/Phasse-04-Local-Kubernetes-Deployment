<!--
Sync Impact Report:
- Version: 1.0.0 → 1.1.0 (MINOR: Added Phase IV deployment principles and infrastructure guidance)
- Modified principles:
  - "Explicitly Out of Scope" → Updated to reflect Phase IV includes containerization
  - "Stages of Development" → Added Phase IV: Deployment stage
- Added sections:
  - Phase IV: Deployment & Infrastructure (Section 10)
  - Deployment principles and constraints
  - Container orchestration rules
  - Infrastructure-as-code requirements
- Removed sections: None
- Templates requiring updates:
  - ✅ plan-template.md: Constitution Check aligns with deployment constraints
  - ✅ spec-template.md: No changes needed (deployment is infrastructure, not feature spec)
  - ✅ tasks-template.md: Task organization supports infrastructure tasks
- Follow-up TODOs: None
-->

# Evolution Todo Constitution

## Purpose

The purpose of **Evolution Todo (Hackathon Phase IV)** is to containerize and deploy the production-grade, multi-user, full-stack system to a Kubernetes cluster.

This stage focuses on **Docker containerization, Kubernetes orchestration, Helm packaging, and Minikube deployment** while preserving all Phase III functionality.

## Stages of Development

### 1. Specification (Completed - Phase II)
Detailed design and architecture captured in `specs/`. All placeholders replaced with drafts.

### 2. Implementation (Completed - Phase II/III)
Building the full-stack system (Frontend & Backend) based on the specifications.

### 3. Feature Enhancement (Completed - Phase III)
AI chatbot integration, authentication, and advanced features.

### 4. Deployment & Infrastructure (Current - Phase IV)
Containerization and Kubernetes deployment without modifying application logic.

## Core Principles

### Spec-Driven Implementation

The specifications are the **single source of truth**. All implementation code in `frontend/` and `backend/` must strictly adhere to the designs in `specs/`.

**Rationale**: Spec-driven development ensures that implementation follows the approved architecture and requirements, reducing technical debt and misalignment.

**Rules**:
- Any feature change requires a **spec update first**
- If specs conflict, work MUST stop until resolved
- Specs MUST stay consistent across frontend, backend, and database

### Monorepo Discipline

The project is maintained as a **single monorepo**. Frontend, backend, and specifications
live together. Clear boundaries MUST be maintained between domains.

**Rationale**: Monorepo structure enables atomic changes across the stack while
maintaining clear separation of concerns through directory structure and governance files.

**Rules**:
- All code lives in one repository
- Domain boundaries enforced via directory structure and CLAUDE.md files
- Cross-domain changes require updates to specifications first

### Deterministic over Clever

Prefer clarity and correctness over abstraction or novelty. Avoid premature optimization
or over-engineering.

**Rationale**: In Phase II, establishing correct patterns is more valuable than clever
solutions. Simplicity enables faster iteration and easier onboarding.

**Rules**:
- Choose the simplest solution that satisfies requirements
- Justify any complexity introduced
- Prefer explicit code over implicit magic

### Reproducibility

Any contributor (human or AI) should be able to understand the system by reading `/specs`,
`CLAUDE.md`, and this constitution.

**Rationale**: Documentation-driven development ensures knowledge is captured and
accessible, enabling both human and AI collaboration.

**Rules**:
- All architectural decisions documented in specs or ADRs
- CLAUDE.md files define agent behavior boundaries
- Constitution captures non-negotiable principles

## Scope of Implementation

- Full-stack implementation (Next.js + FastAPI)
- Persistent storage using a relational database
- Authentication and user isolation
- REST API implementation
- Spec-Kit governed workflow
- AI chatbot integration (Phase III)
- Docker containerization (Phase IV)
- Kubernetes orchestration (Phase IV)
- Helm chart packaging (Phase IV)

## Explicitly Out of Scope (Current Phase)

These belong to **future phases**:

- Background workers
- Event streaming or messaging systems
- Production cloud deployment (AWS, GCP, Azure)
- CI/CD pipelines
- Monitoring and observability platforms

## System Architecture Rules

### Frontend

Built with a modern React framework (**Next.js**). Responsible only for UI and API
consumption. No business logic or data persistence.

**Rules**:
- All data fetching via REST API calls to backend
- No direct database access
- State management for UI concerns only
- Refer to `frontend/CLAUDE.md` for frontend-specific rules

### Backend

Built as a stateless REST API (**FastAPI**). Responsible for business rules,
authentication enforcement, and database interaction.

**Rules**:
- All business logic resides in backend
- Stateless request handling (no in-memory session state)
- Database access exclusively through backend
- Refer to `backend/CLAUDE.md` for backend-specific rules

### Database

Persistent storage using a **serverless PostgreSQL database**. No in-memory state for
application data. All data MUST be **user-scoped**.

**Rules**:
- Every data record MUST be associated with a user
- No shared data between users without explicit authorization
- Schema defined in `specs/database/schema.md`
- Migrations managed by backend

## Authentication & Security

The system MUST support **multiple users**. Authentication is mandatory for all protected
operations. Users MUST never access or modify other users' data. Secrets MUST never be
hardcoded. Authentication flow MUST be **clearly specified before implementation**.

**Rules**:
- All protected endpoints require valid authentication
- User isolation enforced at database query level
- Secrets stored in `.env` files (never committed)
- Authentication behavior specified in `specs/features/authentication.md`

## Specification Governance

### Required Specs

At minimum, Phase II MUST define:

- Project overview
- System architecture
- Task CRUD behavior
- Authentication behavior
- API contracts
- Database schema
- UI page structure

### Change Rules

- Any feature change requires a **spec update first**
- If specs conflict, work MUST stop until resolved
- Specs MUST stay consistent across frontend, backend, and database

## Claude Code Usage Rules

Claude Code MUST operate under **skills**, not ad-hoc reasoning. Skills are the reusable
intelligence layer.

**Claude MUST**:
- Read specs before acting
- Respect monorepo boundaries
- Refuse to implement undefined behavior

**Claude MUST NOT**:
- Write code without corresponding specs
- Violate domain boundaries (e.g., business logic in frontend)
- Hardcode secrets or configuration

## Success Criteria for Phase II

Phase II is considered successful when:

- The monorepo structure is complete and clean
- Specs fully describe the system
- Authentication and persistence are correctly designed
- Frontend and backend responsibilities are clearly separated
- The system can support multiple users safely

## Implementation Readiness Rule

Implementation builds upon the completed specifications.

## Phase IV: Deployment & Infrastructure

Phase IV focuses exclusively on **containerization and Kubernetes deployment** without modifying application logic, business rules, or database schema.

### Deployment Principles

**Infrastructure-Only Changes**: Phase IV MUST NOT modify:
- Backend API routes, business logic, or services
- Database schema or migrations
- Authentication or authorization logic
- Task management or chatbot features
- Frontend components or pages

**Rationale**: Deployment is an infrastructure concern. Application code that works in Phase III MUST continue working unchanged in Phase IV. Separation of concerns prevents deployment complexity from introducing application bugs.

**Rules**:
- Only add Dockerfiles, Kubernetes manifests, and Helm charts
- Application code remains untouched
- Configuration externalized via environment variables
- All Phase III features MUST remain functional

### Container Orchestration

**Kubernetes-Native Deployment**: The application MUST run in a Kubernetes cluster with proper service discovery, health checks, and resource management.

**Rationale**: Kubernetes provides production-grade orchestration, scaling, and self-healing capabilities. Minikube enables local testing before cloud deployment.

**Rules**:
- Frontend and Backend MUST run as separate Deployments
- Each deployment MUST have a corresponding Service
- Health checks (liveness/readiness probes) MUST be configured
- Resource limits (CPU/memory) MUST be defined
- No local database containers (use Neon PostgreSQL)

### Secrets Management

**Secure Configuration**: Sensitive data (database credentials, API keys, JWT secrets) MUST be managed via Kubernetes Secrets, never hardcoded or committed.

**Rationale**: Kubernetes Secrets provide a secure, auditable way to manage sensitive configuration separate from application code.

**Rules**:
- All environment variables loaded from Kubernetes Secrets
- No secrets in Dockerfiles or manifests
- `.env` files used only for local development (never committed)
- Database connection strings reference Neon PostgreSQL

### Helm Packaging

**Declarative Infrastructure**: Kubernetes resources MUST be packaged as a Helm chart for repeatable, version-controlled deployments.

**Rationale**: Helm provides templating, versioning, and rollback capabilities for Kubernetes deployments.

**Rules**:
- Single Helm chart for the entire application
- Separate values for development/production environments
- Chart MUST be deployable to Minikube without modification
- All resources (Deployments, Services, Secrets) managed by Helm

### Deployment Verification

**Operational Readiness**: Deployment MUST be verified using standard Kubernetes tools before considering Phase IV complete.

**Rationale**: Verification ensures the application runs correctly in the cluster and all services are accessible.

**Required Checks**:
- `kubectl get pods` - All pods Running
- `kubectl logs <pod>` - No startup errors
- `helm status <release>` - Deployment successful
- `minikube service list` - Services accessible
- Manual testing of frontend and backend functionality

### Stability Guarantee

**Zero Regression**: Phase IV MUST NOT break any Phase III functionality. If deployment introduces issues, rollback and fix infrastructure before proceeding.

**Rationale**: Deployment should be transparent to application functionality. Users should experience identical behavior whether running locally or in Kubernetes.

**Rules**:
- All Phase III features MUST work in Kubernetes
- API endpoints MUST respond identically
- Authentication MUST function correctly
- Database operations MUST succeed
- Frontend MUST render and interact correctly

## Governance

This constitution supersedes all other development practices. Amendments require:

1. Documentation of the proposed change
2. Impact analysis on existing templates and workflows
3. User approval
4. Version increment following semantic versioning

All work (specs, plans, tasks, implementation) MUST verify compliance with constitution
principles. Complexity MUST be justified against the "Deterministic over Clever" principle.

**Amendment Procedure**:

- MAJOR version: Backward incompatible governance/principle removals or redefinitions
- MINOR version: New principle/section added or materially expanded guidance
- PATCH version: Clarifications, wording, typo fixes, non-semantic refinements

**Compliance Review**:

- All PRs reviewed for constitution compliance
- Spec-first development enforced (no code without specs)
- Claude Code adherence to boundaries verified

**Runtime Guidance**: See `CLAUDE.md` in repository root for agent execution guidelines.

---

**Version**: 1.1.0 | **Ratified**: 2026-01-07 | **Last Amended**: 2026-02-16
