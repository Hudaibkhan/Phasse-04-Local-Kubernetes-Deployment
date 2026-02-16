---

description: "Task list for Minikube Helm Deployment implementation"
---

# Tasks: Minikube Helm Deployment

**Input**: Design documents from `/specs/002-minikube-helm-deployment/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No tests requested in feature specification. Tasks focus on infrastructure deployment and manual verification only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Helm Chart**: `todo-app/` at repository root
- **Contracts**: `specs/002-minikube-helm-deployment/contracts/`
- **Documentation**: `specs/002-minikube-helm-deployment/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and environment preparation

- [x] T001 Review existing Helm chart structure in todo-app/ directory to understand current templates and values
- [x] T002 Verify Minikube is running with sufficient resources (2 CPU, 4GB RAM minimum)
- [x] T003 [P] Load backend Docker image into Minikube: minikube image load evolution-todo-backend:latest
- [x] T004 [P] Load frontend Docker image into Minikube: minikube image load evolution-todo-frontend:latest
- [x] T005 Verify Docker images are available in Minikube with: minikube image ls | grep evolution-todo

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create Kubernetes secrets manually with kubectl create secret generic todo-app-secrets (DATABASE_URL, JWT_SECRET, GEMINI_API_KEY)
- [x] T007 Verify secrets were created successfully with: kubectl get secrets | grep todo-app-secrets
- [x] T008 Update todo-app/Chart.yaml with new version (0.2.0) and description for Minikube deployment
- [x] T009 Create todo-app/templates/configmap.yaml for non-sensitive configuration (CORS_ORIGINS, NEXT_PUBLIC_API_URL)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Backend Kubernetes Deployment (Priority: P1) 🎯 MVP

**Goal**: Deploy FastAPI backend to Minikube with health checks and Neon PostgreSQL connectivity

**Independent Test**: Backend pod running, health check responds, database connected

### Implementation for User Story 1

- [ ] T010 [US1] Update todo-app/values.yaml with backend configuration (image: evolution-todo-backend:latest, pullPolicy: Never, port: 8001)
- [ ] T011 [US1] Create todo-app/templates/backend-deployment.yaml based on contracts/backend-deployment.yaml with Helm templating
- [ ] T012 [US1] Create todo-app/templates/backend-service.yaml based on contracts/backend-service.yaml (ClusterIP, port 8001)
- [ ] T013 [US1] Configure backend liveness probe in backend-deployment.yaml (httpGet /api/health, initialDelaySeconds: 40)
- [ ] T014 [US1] Configure backend readiness probe in backend-deployment.yaml (httpGet /api/health, initialDelaySeconds: 10)
- [ ] T015 [US1] Add backend environment variables in backend-deployment.yaml (DATABASE_URL, JWT_SECRET, GEMINI_API_KEY from secrets, CORS_ORIGINS from configmap)
- [ ] T016 [US1] Set backend security context in backend-deployment.yaml (runAsNonRoot: true, runAsUser: 1001)
- [ ] T017 [US1] Set backend resource limits in backend-deployment.yaml (requests: 100m/256Mi, limits: 500m/512Mi)
- [ ] T018 [US1] Deploy backend only with: helm upgrade --install todo-app ./todo-app (frontend disabled in values.yaml)
- [ ] T019 [US1] Verify backend pod is running with: kubectl get pods -l app.kubernetes.io/name=backend
- [ ] T020 [US1] Check backend pod logs for successful startup with: kubectl logs -l app.kubernetes.io/name=backend
- [ ] T021 [US1] Verify backend health check passes with: kubectl port-forward svc/todo-app-backend 8001:8001 && curl http://localhost:8001/api/health
- [ ] T022 [US1] Verify backend connects to Neon PostgreSQL successfully (check logs for database connection message)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Frontend Kubernetes Deployment (Priority: P2)

**Goal**: Deploy Next.js frontend to Minikube with backend service communication

**Independent Test**: Frontend pod running, serves HTML, configured with backend URL

### Implementation for User Story 2

- [ ] T023 [US2] Update todo-app/values.yaml with frontend configuration (image: evolution-todo-frontend:latest, pullPolicy: Never, port: 3000)
- [ ] T024 [US2] Create todo-app/templates/frontend-deployment.yaml based on contracts/frontend-deployment.yaml with Helm templating
- [ ] T025 [US2] Create todo-app/templates/frontend-service.yaml based on contracts/frontend-service.yaml (NodePort, port 3000)
- [ ] T026 [US2] Configure frontend liveness probe in frontend-deployment.yaml (httpGet /, initialDelaySeconds: 20)
- [ ] T027 [US2] Configure frontend readiness probe in frontend-deployment.yaml (httpGet /, initialDelaySeconds: 5)
- [ ] T028 [US2] Add frontend environment variable in frontend-deployment.yaml (NEXT_PUBLIC_API_URL from configmap)
- [ ] T029 [US2] Set frontend security context in frontend-deployment.yaml (runAsNonRoot: true, runAsUser: 1001)
- [ ] T030 [US2] Set frontend resource limits in frontend-deployment.yaml (requests: 100m/256Mi, limits: 500m/512Mi)
- [ ] T031 [US2] Update todo-app/values.yaml to enable both backend and frontend deployments
- [ ] T032 [US2] Deploy full application with: helm upgrade --install todo-app ./todo-app
- [ ] T033 [US2] Verify frontend pod is running with: kubectl get pods -l app.kubernetes.io/name=frontend
- [ ] T034 [US2] Check frontend pod logs for successful Next.js startup with: kubectl logs -l app.kubernetes.io/name=frontend
- [ ] T035 [US2] Get frontend URL with: minikube service todo-app-frontend --url
- [ ] T036 [US2] Verify frontend serves HTML content by accessing the Minikube service URL in browser or with curl

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - End-to-End Cluster Verification (Priority: P3)

**Goal**: Verify full application stack works in Kubernetes with all Phase III features

**Independent Test**: Frontend and backend communicate, all Phase III features work (auth, tasks, chatbot)

### Implementation for User Story 3

- [ ] T037 [US3] Verify both pods are running with: kubectl get pods (expect 2/2 Running)
- [ ] T038 [US3] Verify both services are created with: kubectl get services (expect backend ClusterIP and frontend NodePort)
- [ ] T039 [US3] Check backend service endpoints with: kubectl get endpoints todo-app-backend
- [ ] T040 [US3] Check frontend service endpoints with: kubectl get endpoints todo-app-frontend
- [ ] T041 [US3] Test backend health check via port-forward: kubectl port-forward svc/todo-app-backend 8001:8001 && curl http://localhost:8001/api/health
- [ ] T042 [US3] Access frontend via Minikube service URL and verify web application loads
- [ ] T043 [US3] Test user registration through frontend (create new account)
- [ ] T044 [US3] Test user login through frontend (login with created account)
- [ ] T045 [US3] Test task creation through frontend (create a new task)
- [ ] T046 [US3] Test task read through frontend (view task list)
- [ ] T047 [US3] Test task update through frontend (edit a task)
- [ ] T048 [US3] Test task delete through frontend (delete a task)
- [ ] T049 [US3] Test chatbot functionality through frontend (send message, receive response)
- [ ] T050 [US3] Verify frontend-to-backend communication by checking network requests in browser DevTools
- [ ] T051 [US3] Test pod restart scenario: kubectl delete pod -l app.kubernetes.io/name=backend && verify pod restarts automatically
- [ ] T052 [US3] Test pod restart scenario: kubectl delete pod -l app.kubernetes.io/name=frontend && verify pod restarts automatically
- [ ] T053 [US3] Verify health checks are working: kubectl describe pod <backend-pod> | grep -A 5 "Liveness\|Readiness"
- [ ] T054 [US3] Verify resource limits are applied: kubectl describe pod <backend-pod> | grep -A 5 "Limits\|Requests"

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T055 [P] Update todo-app/templates/NOTES.txt with deployment instructions and access URLs
- [ ] T056 [P] Update todo-app/templates/_helpers.tpl with common labels and selectors for backend and frontend
- [ ] T057 [P] Verify todo-app/.helmignore excludes unnecessary files (.git, tests, .env)
- [ ] T058 Create deployment verification script at scripts/verify-deployment.sh with automated checks
- [ ] T059 Document troubleshooting procedures in specs/002-minikube-helm-deployment/quickstart.md (already created, verify completeness)
- [ ] T060 Measure backend pod startup time with: kubectl get pods -w (must be under 60 seconds)
- [ ] T061 Measure frontend pod startup time with: kubectl get pods -w (must be under 60 seconds)
- [ ] T062 Measure Helm deployment time with: time helm upgrade --install todo-app ./todo-app (must be under 2 minutes)
- [ ] T063 Verify backend health check passes within 40 seconds of pod start
- [ ] T064 Verify frontend health check passes within 20 seconds of pod start
- [ ] T065 Check pod resource usage with: kubectl top pods (verify within limits)
- [ ] T066 Check node resource usage with: kubectl top nodes (verify sufficient capacity)
- [ ] T067 Run final validation checklist from quickstart.md (all items must pass)
- [ ] T068 Document deployment performance metrics in specs/002-minikube-helm-deployment/DEPLOYMENT_METRICS.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Can start after Foundational - No dependencies on other stories (independent)
  - User Story 3 (P3): Depends on User Story 1 AND User Story 2 completion (requires both deployments)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories (can run in parallel with US1)
- **User Story 3 (P3)**: Depends on User Story 1 AND User Story 2 completion - Cannot start until both deployments exist

### Within Each User Story

- Helm chart templates: Create in order (deployment → service)
- values.yaml: Update before creating templates
- Deploy before test: Helm deployment must succeed before verification
- Verify before next story: Complete all verification tasks before moving to next user story

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003, T004)
- User Story 1 and User Story 2 can be worked on in parallel (different files, no dependencies)
- All Polish tasks marked [P] can run in parallel (T055, T056, T057)

---

## Parallel Example: User Story 1 and User Story 2

```bash
# User Story 1 and User Story 2 can be developed in parallel:
# Developer A works on User Story 1 (Backend Deployment)
Task: "Create backend-deployment.yaml"
Task: "Create backend-service.yaml"
Task: "Deploy backend only"
Task: "Verify backend pod running"

# Developer B works on User Story 2 (Frontend Deployment) simultaneously
Task: "Create frontend-deployment.yaml"
Task: "Create frontend-service.yaml"
Task: "Update values.yaml for frontend"

# Once both complete, proceed to User Story 3 (requires both deployments)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Backend Deployment)
4. **STOP and VALIDATE**: Test backend deployment independently
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
   - Developer A: User Story 1 (Backend Deployment)
   - Developer B: User Story 2 (Frontend Deployment)
3. Once both US1 and US2 complete:
   - Developer A or B: User Story 3 (E2E Verification)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No tests requested in specification - focus on infrastructure deployment and manual verification
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: modifying application code, changing business logic, altering database schema
- Constitution compliance: Infrastructure-only changes, zero application code modifications
