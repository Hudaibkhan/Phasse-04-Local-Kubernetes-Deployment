# Feature Specification: Minikube Helm Deployment

**Feature Branch**: `002-minikube-helm-deployment`
**Created**: 2026-02-16
**Status**: Draft
**Input**: User description: "Phase IV — Local Kubernetes Deployment (Helm Update). Deploy Quantum Todo (frontend + backend chatbot app) on Minikube using existing Helm charts."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Backend Kubernetes Deployment (Priority: P1) 🎯 MVP

As a DevOps engineer, I need to deploy the FastAPI backend application to Minikube using Helm charts so that the API is accessible within the Kubernetes cluster and can connect to the external Neon PostgreSQL database.

**Why this priority**: The backend API is the foundation of the application. Without a working backend deployment, no other services can function. This is the minimum viable deployment that proves Kubernetes orchestration works.

**Independent Test**: Can be fully tested by deploying only the backend chart, verifying the pod is running, and confirming the /health endpoint responds successfully via port-forwarding or a test pod within the cluster. Delivers a working API that can be called from within the Kubernetes cluster.

**Acceptance Scenarios**:

1. **Given** Helm chart templates exist and Docker image evolution-todo-backend:latest is available, **When** I run `helm upgrade --install todo-app ./todo-app` with backend configuration, **Then** the backend pod starts successfully and reaches Running state
2. **Given** backend pod is running, **When** I check pod logs with `kubectl logs`, **Then** logs show successful startup and database connection to Neon PostgreSQL
3. **Given** backend service is created, **When** I port-forward to the backend service and call /api/health, **Then** the endpoint returns HTTP 200 with healthy status
4. **Given** backend deployment uses Kubernetes secrets, **When** the pod starts, **Then** environment variables (DATABASE_URL, JWT_SECRET, GEMINI_API_KEY) are loaded from secrets and not exposed in pod spec

---

### User Story 2 - Frontend Kubernetes Deployment (Priority: P2)

As a DevOps engineer, I need to deploy the Next.js frontend application to Minikube using Helm charts so that users can access the web interface and it can communicate with the backend service within the cluster.

**Why this priority**: The frontend provides the user interface but depends on the backend API being accessible. Once backend is proven working (P1), frontend deployment adds the user-facing layer.

**Independent Test**: Can be tested by deploying the frontend chart (assuming backend is already deployed from P1), verifying the frontend pod is running, and confirming the Next.js application serves HTML content. Delivers a working web interface accessible via Minikube service.

**Acceptance Scenarios**:

1. **Given** Helm chart templates exist and Docker image evolution-todo-frontend:latest is available, **When** I run `helm upgrade --install todo-app ./todo-app` with frontend configuration, **Then** the frontend pod starts successfully and reaches Running state
2. **Given** frontend pod is running, **When** I check pod logs with `kubectl logs`, **Then** logs show successful Next.js server startup on port 3000
3. **Given** frontend service is created, **When** I run `minikube service frontend --url`, **Then** I receive a URL that serves the Evolution Todo web application
4. **Given** frontend is configured with backend service URL, **When** the frontend pod starts, **Then** NEXT_PUBLIC_API_URL environment variable points to the backend service (e.g., http://backend:8001)

---

### User Story 3 - End-to-End Cluster Verification (Priority: P3)

As a DevOps engineer, I need to verify that both frontend and backend work together in the Minikube cluster so that I can confirm the full application stack is functional and all Phase III features (authentication, tasks, chatbot) work in the Kubernetes environment.

**Why this priority**: This validates the complete deployment but requires both P1 and P2 to be complete. It's the final integration test that proves the entire system works in Kubernetes.

**Independent Test**: Can be tested by accessing the frontend via Minikube service, performing user registration/login, creating/managing tasks, and using the chatbot. Delivers confidence that the full application stack works in Kubernetes.

**Acceptance Scenarios**:

1. **Given** both frontend and backend pods are running, **When** I access the frontend URL from `minikube service frontend`, **Then** the web application loads successfully in my browser
2. **Given** the web application is loaded, **When** I register a new user account, **Then** the registration succeeds and I receive a JWT token (proving frontend-to-backend communication works)
3. **Given** I am logged in, **When** I create, read, update, and delete tasks, **Then** all CRUD operations succeed (proving database connectivity through backend works)
4. **Given** I am logged in, **When** I send a message to the chatbot, **Then** I receive an intelligent response (proving AI integration works in Kubernetes)
5. **Given** both pods are running, **When** I run `kubectl get pods`, **Then** both pods show status "Running" with 1/1 ready containers

---

### Edge Cases

- What happens when Minikube is not running or not accessible?
- How does the system handle missing Kubernetes secrets (DATABASE_URL, JWT_SECRET, GEMINI_API_KEY)?
- What happens if the Docker images are not available locally (need to be pulled or loaded)?
- How does the system handle pod restart scenarios (should automatically reconnect to database)?
- What happens if the backend service is not ready when frontend starts (should retry connections)?
- How does the system handle Minikube resource constraints (insufficient CPU/memory)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Helm chart MUST deploy backend application using evolution-todo-backend:latest Docker image
- **FR-002**: Helm chart MUST deploy frontend application using evolution-todo-frontend:latest Docker image
- **FR-003**: Backend deployment MUST expose port 8001 for API access within the cluster
- **FR-004**: Frontend deployment MUST expose port 3000 for web access
- **FR-005**: Backend deployment MUST load environment variables from Kubernetes secrets (DATABASE_URL, JWT_SECRET, GEMINI_API_KEY, CORS_ORIGINS)
- **FR-006**: Frontend deployment MUST be configured with backend service URL via environment variable (NEXT_PUBLIC_API_URL)
- **FR-007**: Backend service MUST be accessible from frontend pods using Kubernetes DNS (e.g., http://backend:8001)
- **FR-008**: Frontend service MUST be accessible from outside the cluster via Minikube service command
- **FR-009**: Helm chart MUST support single command deployment: `helm upgrade --install todo-app ./todo-app`
- **FR-010**: Deployments MUST include health checks (liveness and readiness probes) matching Docker health checks
- **FR-011**: Pods MUST run as non-root users (UID 1001) matching Docker container security configuration
- **FR-012**: Helm chart MUST support configuration via values.yaml for image tags, replica counts, and resource limits
- **FR-013**: Backend deployment MUST connect to external Neon PostgreSQL database (no in-cluster database)
- **FR-014**: Deployments MUST preserve all Phase III functionality (authentication, task CRUD, chatbot)

### Non-Functional Requirements

- **NFR-001**: Pods MUST start within 60 seconds of deployment
- **NFR-002**: Backend pod MUST pass health check within 40 seconds of startup
- **NFR-003**: Frontend pod MUST pass health check within 20 seconds of startup
- **NFR-004**: Helm chart deployment MUST complete within 2 minutes
- **NFR-005**: Services MUST be accessible immediately after pods reach Ready state

### Key Entities *(Kubernetes Resources)*

- **Backend Deployment**: Kubernetes Deployment resource managing backend pod replicas, using evolution-todo-backend:latest image, exposing port 8001
- **Frontend Deployment**: Kubernetes Deployment resource managing frontend pod replicas, using evolution-todo-frontend:latest image, exposing port 3000
- **Backend Service**: Kubernetes Service (ClusterIP) exposing backend deployment on port 8001 for internal cluster access
- **Frontend Service**: Kubernetes Service (NodePort or LoadBalancer) exposing frontend deployment on port 3000 for external access via Minikube
- **Secrets**: Kubernetes Secret resource storing sensitive environment variables (DATABASE_URL, JWT_SECRET, GEMINI_API_KEY)
- **ConfigMap**: Kubernetes ConfigMap resource storing non-sensitive configuration (CORS_ORIGINS, NEXT_PUBLIC_API_URL)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Backend pod reaches Running state within 60 seconds of Helm deployment
- **SC-002**: Frontend pod reaches Running state within 60 seconds of Helm deployment
- **SC-003**: Backend health check endpoint (/api/health) responds with HTTP 200 within 40 seconds of pod start
- **SC-004**: Frontend health check endpoint (/) responds with HTTP 200 within 20 seconds of pod start
- **SC-005**: Users can access the web application via Minikube service URL within 2 minutes of deployment
- **SC-006**: All Phase III features (user registration, login, task CRUD, chatbot) work identically to Docker container deployment
- **SC-007**: Helm deployment completes successfully with zero failed pods
- **SC-008**: Backend successfully connects to Neon PostgreSQL database on first startup attempt
- **SC-009**: Frontend successfully communicates with backend service for all API calls
- **SC-010**: Pods automatically restart and recover if they crash (Kubernetes self-healing works)

## Assumptions

- Minikube is installed and running on the local machine
- Docker images (evolution-todo-backend:latest, evolution-todo-frontend:latest) are available locally or can be loaded into Minikube
- Helm 3.x is installed and configured
- kubectl is installed and configured to access Minikube cluster
- Neon PostgreSQL database is accessible from Minikube cluster (network connectivity exists)
- User has valid credentials for DATABASE_URL, JWT_SECRET, and GEMINI_API_KEY
- Existing Helm chart structure in todo-app/ directory will be updated (not created from scratch)
- Minikube has sufficient resources (minimum 2 CPU cores, 4GB RAM recommended)

## Out of Scope

- Creating new Helm charts from scratch (charts already exist, only updates needed)
- Production Kubernetes deployment (this is local Minikube only)
- Ingress controller configuration (using Minikube service for access)
- Horizontal Pod Autoscaling (HPA) configuration
- Persistent volume claims (application is stateless, database is external)
- Multi-namespace deployment (single namespace deployment)
- CI/CD pipeline integration (manual deployment only)
- Monitoring and logging infrastructure (Prometheus, Grafana, ELK stack)
- Certificate management and TLS/SSL configuration
- Network policies and advanced security configurations
- Backup and disaster recovery procedures
- Modifying application code, database schema, or business logic (Phase IV constitution compliance)

## Dependencies

- **Docker Foundation (001)**: Requires completed Docker images from previous feature
- **Neon PostgreSQL**: External database must be accessible and configured
- **Minikube**: Local Kubernetes cluster must be running
- **Helm**: Chart templating and deployment tool
- **kubectl**: Kubernetes CLI for verification and debugging

## Constraints

- **Phase IV Constitution**: MUST NOT modify backend logic, database schema, authentication, task management, or chatbot features
- **Infrastructure-only changes**: Only Helm chart templates, values.yaml, and Kubernetes manifests can be modified
- **Local deployment only**: This feature targets Minikube, not production Kubernetes clusters
- **External database**: Must use Neon PostgreSQL, no in-cluster database allowed
- **Secrets management**: Sensitive data must be stored in Kubernetes secrets, not in values.yaml or templates
- **Image availability**: Docker images must be available in Minikube's Docker daemon (may require `minikube image load`)

## Risks

- **Risk-001**: Docker images not available in Minikube (Mitigation: Document image loading process with `minikube image load`)
- **Risk-002**: Network connectivity issues between Minikube and Neon PostgreSQL (Mitigation: Test database connectivity before deployment)
- **Risk-003**: Insufficient Minikube resources causing pod failures (Mitigation: Document minimum resource requirements)
- **Risk-004**: Secrets not created before deployment causing pod crash loops (Mitigation: Document secret creation as prerequisite step)
- **Risk-005**: Service DNS resolution issues within cluster (Mitigation: Use Kubernetes service names, test with debug pod)
