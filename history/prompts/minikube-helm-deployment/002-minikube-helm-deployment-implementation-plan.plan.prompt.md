---
id: 002
title: Minikube Helm Deployment Implementation Plan
stage: plan
date: 2026-02-16
surface: agent
model: claude-sonnet-4-5-20250929
feature: minikube-helm-deployment
branch: 002-minikube-helm-deployment
user: user
command: /sp.plan
labels: ["phase-iv", "kubernetes", "helm", "minikube", "planning", "infrastructure"]
links:
  spec: specs/002-minikube-helm-deployment/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-minikube-helm-deployment/plan.md
  - specs/002-minikube-helm-deployment/research.md
  - specs/002-minikube-helm-deployment/data-model.md
  - specs/002-minikube-helm-deployment/quickstart.md
  - specs/002-minikube-helm-deployment/contracts/backend-deployment.yaml
  - specs/002-minikube-helm-deployment/contracts/backend-service.yaml
  - specs/002-minikube-helm-deployment/contracts/frontend-deployment.yaml
  - specs/002-minikube-helm-deployment/contracts/frontend-service.yaml
  - specs/002-minikube-helm-deployment/contracts/secrets.yaml
  - specs/002-minikube-helm-deployment/contracts/configmap.yaml
  - CLAUDE.md
tests:
  - none
---

## Prompt

/sp.plan

1. Review existing Helm chart structure (`charts/todo-app`)
2. Update `values.yaml` with correct image names + ports
3. Fix deployments:
   - frontend deployment → port 3000
   - backend deployment → port 8000
4. Ensure services expose correct targets
5. Add required env vars (API URL, Neon DB, Auth secrets)
6. Deploy on Minikube using Helm
7. Verify pods + services, test app access via `minikube service`

## Response snapshot

Successfully completed implementation planning for Minikube Helm deployment feature. Generated comprehensive plan with research, design, and contracts.

**Planning Phases Completed:**

**Phase 0: Research & Technical Decisions**
- Helm Chart Best Practices: Single chart with separate template files for backend/frontend
- Minikube Configuration: Image loading via `minikube image load`, NodePort for frontend, ClusterIP for backend
- Kubernetes Health Checks: HTTP GET probes matching Docker health checks
- Environment Variable Management: Manual kubectl secrets, Helm-managed ConfigMaps

**Phase 1: Design & Contracts**
- Data Model: Defined 6 Kubernetes resources (2 Deployments, 2 Services, 1 Secret, 1 ConfigMap)
- Contracts: Created reference manifests for all resources
- Quickstart Guide: Complete deployment scenarios, troubleshooting, and verification checklist

**Key Design Decisions:**

1. **Single Helm Chart with Multiple Deployments**
   - Rationale: Simplifies deployment, maintains logical grouping, easier version management
   - Alternative rejected: Separate charts (deployment complexity)

2. **NodePort for Frontend, ClusterIP for Backend**
   - Rationale: Frontend needs external access, backend internal only (more secure)
   - Alternative rejected: Ingress controller (unnecessary complexity for local)

3. **Manual Secret Creation**
   - Rationale: Security best practice, prevents accidental commit
   - Alternative rejected: Helm-managed secrets (security risk)

4. **Image Loading Strategy**
   - Rationale: Images already built locally, no registry needed
   - Command: `minikube image load evolution-todo-backend:latest`

5. **Health Check Configuration**
   - Rationale: Match Docker health checks for consistency
   - Backend: GET /api/health (40s startup), Frontend: GET / (20s startup)

**Technical Context:**
- Platform: Kubernetes 1.28+, Helm 3.x, Minikube 1.32+
- Images: evolution-todo-backend:latest (516MB, port 8001), evolution-todo-frontend:latest (287MB, port 3000)
- Database: External Neon PostgreSQL (no in-cluster database)
- Resources: 2 Deployments, 2 Services, 1 Secret, 1 ConfigMap
- Resource Limits: Backend (100m/256Mi requests, 500m/512Mi limits), Frontend (same)

**Project Structure:**
```
specs/002-minikube-helm-deployment/
├── spec.md              ✓ Complete
├── plan.md              ✓ Complete
├── research.md          ✓ Complete
├── data-model.md        ✓ Complete
├── quickstart.md        ✓ Complete
├── contracts/           ✓ Complete (6 manifests)
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── secrets.yaml
│   └── configmap.yaml
└── tasks.md             ⏳ Next: /sp.tasks
```

**Infrastructure Code (to be updated):**
```
todo-app/                # Existing Helm chart
├── Chart.yaml           → Update version
├── values.yaml          → Update images, ports, env vars
├── templates/           → Split deployment, add secrets/configmap
│   ├── backend-deployment.yaml    (NEW)
│   ├── backend-service.yaml       (NEW)
│   ├── frontend-deployment.yaml   (NEW)
│   ├── frontend-service.yaml      (NEW)
│   ├── secrets.yaml               (NEW)
│   ├── configmap.yaml             (NEW)
│   └── NOTES.txt                  (UPDATE)
```

**Constitution Compliance:**
- ✅ Infrastructure-only changes (no application code modifications)
- ✅ Separate Deployments for frontend and backend
- ✅ External Neon PostgreSQL (no local database containers)
- ✅ Kubernetes Secrets for sensitive data
- ✅ Non-root users (UID 1001) in both pods
- ✅ Health checks configured
- ✅ All Phase III features must remain functional

**Agent Context Updated:**
- Added Kubernetes 1.28+, Helm 3.x, Minikube 1.32+ to CLAUDE.md
- Added External Neon PostgreSQL database context

**Next Steps:**
1. Run `/sp.tasks minikube-helm-deployment` to generate task breakdown
2. Review generated tasks organized by user story (P1: Backend, P2: Frontend, P3: E2E)
3. Run `/sp.implement minikube-helm-deployment` to execute implementation

## Outcome

- ✅ Impact: Complete implementation plan with research, design, and contracts for Minikube Helm deployment
- 🧪 Tests: No tests (planning phase, testing defined in quickstart verification checklist)
- 📁 Files: 11 files created (plan, research, data-model, quickstart, 6 contracts, agent context updated)
- 🔁 Next prompts: Ready for `/sp.tasks minikube-helm-deployment` to generate task breakdown
- 🧠 Reflection: Successfully planned Kubernetes deployment with comprehensive research on Helm best practices, Minikube configuration, health checks, and secret management. All design decisions documented with rationale and alternatives considered. Created complete reference manifests and deployment guide. Constitution compliance verified (infrastructure-only, no application code changes). Ready for task generation and implementation.

## Evaluation notes (flywheel)

- Failure modes observed: None. Planning completed successfully with all required artifacts.
- Graders run and results (PASS/FAIL): Constitution Check: PASS (all requirements met), Research: PASS (all questions answered), Design: PASS (complete resource architecture), Contracts: PASS (6 manifests created), Quickstart: PASS (comprehensive deployment guide)
- Prompt variant (if applicable): Standard /sp.plan workflow with user-provided implementation steps
- Next experiment (smallest change to try): Generate tasks with /sp.tasks to create detailed implementation breakdown
