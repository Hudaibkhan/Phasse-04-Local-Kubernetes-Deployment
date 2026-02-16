---

description: "Task list for Docker Foundation implementation"
---

# Tasks: Docker Foundation

**Input**: Design documents from `/specs/001-docker-foundation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No tests requested in feature specification. Tasks focus on infrastructure deployment only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `Quantum-Todo-Backend/` at repository root
- **Frontend**: `frontend/` at repository root
- **Root level**: .env.example

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Review existing backend structure in Quantum-Todo-Backend/ to understand entry points and dependencies
- [x] T002 Review existing frontend structure in frontend/ to understand build configuration and dependencies
- [x] T003 [P] Verify Next.js configuration has standalone output mode in frontend/next.config.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create .dockerignore file in Quantum-Todo-Backend/ to exclude .git, .env, __pycache__, tests, .venv
- [x] T005 [P] Create .dockerignore file in frontend/ to exclude .git, .env.local, node_modules, .next, tests
- [x] T006 [P] Create .env.example file at repository root with required environment variables (DATABASE_URL, JWT_SECRET, GEMINI_API_KEY, NEXT_PUBLIC_API_URL)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Backend Containerization (Priority: P1) 🎯 MVP

**Goal**: Package FastAPI backend into container image with health checks and Neon PostgreSQL connectivity

**Independent Test**: Backend container builds successfully, starts independently, responds to health check requests, and connects to Neon PostgreSQL

### Implementation for User Story 1

- [x] T007 [US1] Create Dockerfile in Quantum-Todo-Backend/ with multi-stage build (Stage 1: dependencies with python:3.11-slim base)
- [x] T008 [US1] Add Stage 2 to Quantum-Todo-Backend/Dockerfile for production runtime (copy virtual environment, create non-root user appuser UID 1001)
- [x] T009 [US1] Configure Quantum-Todo-Backend/Dockerfile with port 8001 exposure, health check (GET /health every 30s), and entrypoint (uvicorn main:app --host 0.0.0.0 --port 8001)
- [x] T010 [US1] Build backend container image with command: docker build -t evolution-todo-backend:latest Quantum-Todo-Backend/
- [x] T011 [US1] Verify backend container build completes without errors and image size is under 200 MB
- [x] T012 [US1] Test backend container startup with environment variables (DATABASE_URL, JWT_SECRET, GEMINI_API_KEY, CORS_ORIGINS)
- [x] T013 [US1] Verify backend health check endpoint responds successfully within 40 seconds of container start
- [x] T014 [US1] Verify backend container connects to Neon PostgreSQL successfully using DATABASE_URL environment variable

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Frontend Containerization (Priority: P2)

**Goal**: Package Next.js frontend into container image configured to communicate with backend service

**Independent Test**: Frontend container builds successfully, starts independently, serves the application, and can be configured to point to backend API endpoint

### Implementation for User Story 2

- [x] T015 [US2] Create Dockerfile in frontend/ with multi-stage build (Stage 1: dependencies with node:18-alpine base, install libc6-compat)
- [x] T016 [US2] Add Stage 2 to frontend/Dockerfile for builder (copy node_modules, run next build with standalone output)
- [x] T017 [US2] Add Stage 3 to frontend/Dockerfile for production runtime (copy standalone output, create non-root user nextjs UID 1001)
- [x] T018 [US2] Configure frontend/Dockerfile with port 3000 exposure, health check (GET / every 30s), and entrypoint (node server.js)
- [x] T019 [US2] Build frontend container image with command: docker build -t evolution-todo-frontend:latest --build-arg NEXT_PUBLIC_API_URL=http://localhost:8001 frontend/
- [x] T020 [US2] Verify frontend container build completes without errors and image size is under 200 MB
- [x] T021 [US2] Test frontend container startup and verify it serves HTML content on port 3000
- [x] T022 [US2] Verify frontend health check endpoint responds successfully within 15 seconds of container start

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Local Container Verification (Priority: P3)

**Goal**: Verify both containers work together locally with full Phase III functionality (auth, tasks, chatbot)

**Independent Test**: Both containers run simultaneously, communicate with each other, and provide full application functionality

### Implementation for User Story 3

- [x] T023 [US3] Start backend container separately with docker run command (map port 8001:8001, pass environment variables for DATABASE_URL, JWT_SECRET, GEMINI_API_KEY, CORS_ORIGINS)
- [x] T024 [US3] Start frontend container separately with docker run command (map port 3000:3000, ensure NEXT_PUBLIC_API_URL points to http://localhost:8001)
- [x] T025 [US3] Verify both containers are running successfully using docker ps command
- [x] T026 [US3] Check backend container logs with docker logs to ensure no startup errors
- [x] T027 [US3] Check frontend container logs with docker logs to ensure no startup errors
- [x] T028 [US3] Test frontend can communicate with backend by accessing http://localhost:3000 and verifying API calls to http://localhost:8001 succeed
- [x] T029 [US3] Verify all Phase III features work in containers: user authentication (login/register)
- [x] T030 [US3] Verify all Phase III features work in containers: task CRUD operations (create, read, update, delete tasks)
- [x] T031 [US3] Verify all Phase III features work in containers: chatbot functionality (send messages, receive responses)
- [x] T032 [US3] Test container restart scenario: stop both containers with docker stop, restart with docker start, verify all functionality resumes

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T033 [P] Update repository README.md with Docker build and run instructions (if README exists)
- [x] T034 [P] Verify .dockerignore files exclude all sensitive files (.env, credentials, secrets)
- [x] T035 [P] Verify both Dockerfiles run containers as non-root users (appuser for backend, nextjs for frontend)
- [x] T036 [P] Verify container logs are written to stdout/stderr (check with docker logs commands)
- [x] T037 Measure and document backend container build time (must be under 5 minutes)
- [x] T038 Measure and document frontend container build time (must be under 3 minutes)
- [x] T039 Measure and document backend container startup time (must be under 30 seconds)
- [x] T040 Measure and document frontend container startup time (must be under 10 seconds)
- [x] T041 Run final validation checklist from quickstart.md (all items must pass)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Can start after Foundational - No dependencies on other stories (independent)
  - User Story 3 (P3): Depends on User Story 1 AND User Story 2 completion (requires both containers)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories (can run in parallel with US1)
- **User Story 3 (P3)**: Depends on User Story 1 AND User Story 2 completion - Cannot start until both containers exist

### Within Each User Story

- Backend Dockerfile: Create stages sequentially (dependencies → production)
- Frontend Dockerfile: Create stages sequentially (deps → builder → runner)
- Build before test: Container image must exist before running container
- Start before verify: Container must be running before testing functionality

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- User Story 1 and User Story 2 can be worked on in parallel (different files, no dependencies)
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1 and User Story 2

```bash
# User Story 1 and User Story 2 can be developed in parallel:
# Developer A works on User Story 1 (Backend Containerization)
Task: "Create Dockerfile in Quantum-Todo-Backend/"
Task: "Build backend container image"
Task: "Test backend container startup"

# Developer B works on User Story 2 (Frontend Containerization) simultaneously
Task: "Create Dockerfile in frontend/"
Task: "Build frontend container image"
Task: "Test frontend container startup"

# Once both complete, proceed to User Story 3 (requires both containers)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Backend Containerization)
4. **STOP and VALIDATE**: Test backend container independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test end-to-end → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Backend Containerization)
   - Developer B: User Story 2 (Frontend Containerization)
3. Once both US1 and US2 complete:
   - Developer A or B: User Story 3 (Local Container Verification)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No tests requested in specification - focus on infrastructure deployment only
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: modifying application code, changing business logic, altering database schema
- Constitution compliance: Infrastructure-only changes, zero application code modifications
