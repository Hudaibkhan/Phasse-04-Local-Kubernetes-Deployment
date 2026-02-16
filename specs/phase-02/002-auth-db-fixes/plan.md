# Implementation Plan: Fix Authentication, Database, and UI Issues

**Feature**: Authentication, Database, and UI Fixes
**Branch**: `002-auth-db-fixes`
**Created**: 2026-01-13
**Status**: Draft

## Technical Context

This plan addresses critical issues in the Evolution Todo application related to authentication, database persistence, and UI functionality. The system currently suffers from broken authentication flows, missing database tables, and incorrect UI behavior that prevents users from registering, logging in, and accessing their tasks.

### Architecture Overview

The system follows a full-stack architecture with:
- **Frontend**: Next.js application in `frontend/` directory
- **Backend**: FastAPI application in `backend/` directory
- **Database**: Neon PostgreSQL database with SQLModel ORM
- **Authentication**: Session-based authentication with user isolation

### Current State Assessment

**Known Issues**:
- Password input fields don't properly bind values, causing masked input to appear empty
- Missing show/hide password toggle functionality
- Signup form lacks username field and confirm password validation
- Post-signup redirect to non-existent `/dashboard` route
- Session not persisting after authentication
- Missing database tables for users, tasks, and sessions
- Tasks page shows infinite loading without displaying data

**Technology Stack**:
- Frontend: Next.js 15+ with App Router
- Backend: FastAPI with SQLModel and Alembic
- Database: Neon PostgreSQL
- Authentication: Better Auth or custom session management

**Dependencies**:
- Next.js App Router for routing and server components
- FastAPI for REST API endpoints
- SQLModel for database modeling
- Alembic for database migrations
- React state management for client-side authentication

## Constitution Check

### Spec-Driven Implementation ✓
- Plan strictly adheres to requirements in `specs/002-auth-db-fixes/spec.md`
- All implementation will follow the functional requirements and success criteria defined in the spec

### Monorepo Discipline ✓
- Frontend changes will be contained to `frontend/` directory
- Backend changes will be contained to `backend/` directory
- Database schema changes will align with `specs/database/schema.md`

### Deterministic over Clever ✓
- Solutions will prioritize clarity and correctness over complex abstractions
- Following established patterns from existing codebase
- Avoiding premature optimization

### Reproducibility ✓
- All architectural decisions will be documented
- Implementation steps will be clear and traceable to requirements

### Compliance Verification
- All changes will maintain user data isolation
- Authentication will be implemented as specified
- Database operations will be user-scoped
- No secrets will be hardcoded

## Research & Discovery

### Phase 0: Research Summary

#### Authentication Patterns
- **Decision**: Implement session-based authentication with JWT tokens or cookie-based sessions
- **Rationale**: Following industry best practices for Next.js/FastAPI applications with proper security
- **Alternatives considered**: OAuth providers, custom token management, localStorage vs cookies

#### Database Schema Design
- **Decision**: Create User, Task, and Session models following SQLModel patterns
- **Rationale**: Maintaining consistency with existing database approach and user isolation requirements
- **Alternatives considered**: Different ORM approaches, schema variations

#### UI Component Architecture
- **Decision**: Update existing authentication forms with proper state management and validation
- **Rationale**: Building on existing component structure while fixing identified issues
- **Alternatives considered**: Complete rewrite vs incremental fixes

#### Password Security Implementation
- **Decision**: Implement proper password hashing with bcrypt or similar, client-side masking
- **Rationale**: Ensuring security best practices for password handling
- **Alternatives considered**: Different hashing algorithms, client-side encryption

## Phase 1: Design & Contracts

### Data Model Design

#### User Entity
- **Fields**: id, username, email, password_hash, created_at, updated_at
- **Validation**: Unique username/email, proper password strength
- **Relationships**: One-to-many with Tasks

#### Task Entity
- **Fields**: id, title, description, completed, user_id, created_at, updated_at
- **Validation**: Belongs to authenticated user
- **Relationships**: Many-to-one with User

#### Session Entity (if needed)
- **Fields**: id, user_id, token, expires_at, created_at
- **Validation**: Token expiration, user association
- **Relationships**: Many-to-one with User

### API Contract Design

#### Authentication Endpoints
- `POST /api/auth/register` - Register new user with username, email, password
- `POST /api/auth/login` - Authenticate user with credentials
- `POST /api/auth/logout` - Invalidate session
- `GET /api/auth/me` - Get current user info

#### Task Endpoints
- `GET /api/tasks` - Get user's tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

#### Validation Rules
- All endpoints require authentication except register/login
- User isolation enforced at database query level
- Input validation for all user-provided data

### Frontend Architecture

#### Authentication Components
- Updated login/signup forms with proper input binding
- Password visibility toggle functionality
- Form validation with proper error handling
- Correct redirect paths after authentication

#### Session Management
- Client-side state management for authentication
- Token/cookie handling for session persistence
- Protected route components for restricted access

#### Task Page Implementation
- Proper loading/error states
- API integration for task operations
- User-specific task filtering

## Implementation Approach

### Phase A: Authentication UI Fixes (Frontend First)
1. Fix password input binding to properly display masked values
2. Add show/hide password toggle functionality
3. Update signup form to include username and confirm password fields
4. Implement password confirmation validation
5. Ensure correct input types and controlled component state

### Phase B: Routing & Session Stability
1. Verify and update post-signup redirect path to valid route
2. Create or correct appropriate landing page after signup
3. Fix auth state persistence using cookies/tokens
4. Prevent auto logout on page refresh
5. Implement proper session provider pattern

### Phase C: Database Schema & Persistence
1. Create proper database tables for users, tasks, and sessions
2. Implement user registration data persistence
3. Enable task data storage in database
4. Set up proper database connection and session management
5. Configure Alembic migrations

### Phase D: Task Page Functionality
1. Fix infinite loading issue on tasks page
2. Implement proper API calls to backend
3. Add authentication dependency handling
4. Ensure backend endpoints respond correctly
5. Add appropriate loading and error states

## Risk Assessment

### High-Risk Areas
- Authentication security implementation
- Database migration without data loss
- Session management across page refreshes

### Mitigation Strategies
- Thorough testing of authentication flows
- Backup and rollback procedures for database changes
- Progressive implementation with validation at each step

## Success Metrics

Implementation will be successful when:
- Users can register with username, password, and confirm password with 100% success rate
- Password fields properly mask input with dots and allow visibility toggle for 100% of users
- User registration data persists in database and can be retrieved after logout/login with 100% success rate
- Tasks page loads with user's tasks in under 5 seconds for 95% of page visits
- Users maintain authenticated state across page navigations with 95% success rate
- All database tables for users, tasks, and sessions are created and accessible at application startup
- Zero instances of infinite loading on the tasks page occur during normal operation
- Password confirmation validation prevents mismatched passwords during registration with 100% accuracy