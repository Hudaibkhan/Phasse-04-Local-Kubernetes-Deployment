# Evolution Todo - Project Overview

## Status
📝 **Draft** - Phase II Specifications

## Project Summary

Evolution Todo is a production-grade, multi-user task management application built as part of Hackathon Phase II. The project evolves a Phase I CLI, in-memory todo application into a full-stack system using Spec-Driven Development (SDD) methodology and Spec-Kit conventions.

## Project Goals

### Primary Objectives
1. **Multi-User Support**: Transition from single-user CLI to multi-user web application
2. **Persistent Storage**: Replace in-memory storage with PostgreSQL database
3. **Secure Authentication**: Implement JWT-based authentication with user isolation
4. **Full-Stack Architecture**: Build modern frontend (Next.js) and backend (FastAPI)
5. **Spec-Driven Process**: Demonstrate spec-first development with comprehensive documentation

### Success Metrics
- Users can register, authenticate, and manage tasks independently
- Data persists across sessions with user isolation enforced
- System handles 100+ concurrent users without degradation
- All features specified before implementation (zero code without specs)
- Complete PHR and ADR documentation trail

## Architecture

This is a full-stack monorepo consisting of:

- **Frontend**: Next.js 15+ with App Router, TypeScript, TailwindCSS
- **Backend**: FastAPI with Python 3.11+, SQLModel ORM
- **Database**: PostgreSQL with Neon (serverless), Alembic migrations
- **Authentication**: Better-Auth with JWT tokens, HTTP-only cookies

## Monorepo Structure

```
evolution_todo/
├── specs/              # Single source of truth (specifications)
│   ├── overview.md
│   ├── architecture.md
│   ├── features/
│   ├── api/
│   ├── database/
│   └── ui/
├── frontend/           # Next.js application (Phase III)
├── backend/            # FastAPI application (Phase III)
├── .spec-kit/          # Spec-Kit configuration
├── .specify/           # Templates, scripts, and memory
│   ├── memory/
│   │   └── constitution.md
│   ├── scripts/
│   └── templates/
└── history/            # PHRs and ADRs
    ├── prompts/
    └── adr/
```

## Development Workflow

1. **Specify**: Define features in `specs/features/` using `/sp.specify`
2. **Clarify**: Resolve ambiguities using `/sp.clarify` (if needed)
3. **Plan**: Create architecture decisions using `/sp.plan`
4. **Tasks**: Break down into testable tasks using `/sp.tasks`
5. **Implement**: Execute tasks using `/sp.implement` (Phase III)
6. **Document**: Record PHRs automatically and ADRs when significant decisions made

## Phase II Scope

### In Scope
- Complete specifications for all features
- Architecture decisions and design documents
- API contracts and database schema definitions
- UI page and component specifications
- PHR and ADR documentation

### Out of Scope (Phase III+)
- Application code implementation
- Frontend components and pages
- Backend endpoints and services
- Database migrations and seed data
- Deployment and infrastructure

## Key Principles

1. **Spec-First Development**: All work begins with specifications as single source of truth
2. **Monorepo Discipline**: Single repository with clear domain boundaries
3. **Deterministic over Clever**: Clarity and correctness over abstraction
4. **Reproducibility**: System understandable via `/specs`, `CLAUDE.md`, and constitution
5. **User Isolation**: Multi-user support with strict data separation
6. **Security by Default**: No hardcoded secrets, JWT authentication, input validation

## Core Features

### Authentication System
- User registration with email/password
- Secure login with JWT token issuance
- Session management with HTTP-only cookies
- Protected routes and API endpoints
- Logout with token invalidation

### Task Management (CRUD)
- Create tasks with title and description
- View all user's tasks in dashboard
- Update task details (title, description, completion status)
- Delete tasks with confirmation
- Toggle task completion status

## Technology Stack Rationale

- **Next.js 15+**: Modern React framework with App Router for optimal performance and SEO
- **FastAPI**: High-performance Python framework with automatic API documentation
- **PostgreSQL/Neon**: Reliable relational database with serverless scaling
- **SQLModel**: Type-safe ORM combining SQLAlchemy and Pydantic
- **Better-Auth**: Comprehensive authentication library with JWT support
- **TypeScript**: Type safety across the stack for reduced runtime errors

## Status

**Current Phase**: Phase II - Specification and Design
**Next Milestone**: Complete all feature specifications
**Ready For**: `/sp.plan` on individual features after specifications complete

## Notes

This project demonstrates Spec-Driven Development (SDD) methodology where all design decisions are documented before any code is written. The specifications in this directory serve as the single source of truth for Phase III implementation.
