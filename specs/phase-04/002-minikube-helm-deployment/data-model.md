# Data Model: Kubernetes Resources

**Feature**: 002-minikube-helm-deployment
**Date**: 2026-02-16
**Purpose**: Define Kubernetes resource architecture for Evolution Todo deployment

## Overview

This document defines the Kubernetes resources required to deploy Evolution Todo application to Minikube. The architecture consists of two separate Deployments (frontend and backend), two Services, one Secret, and one ConfigMap.

## Resource Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Minikube Cluster                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Namespace: default                     │    │
│  │                                                     │    │
│  │  ┌──────────────────┐      ┌──────────────────┐  │    │
│  │  │  Frontend Pod    │      │  Backend Pod     │  │    │
│  │  │  ┌────────────┐  │      │  ┌────────────┐  │  │    │
│  │  │  │ Next.js    │  │      │  │  FastAPI   │  │  │    │
│  │  │  │ Port: 3000 │  │      │  │ Port: 8001 │  │  │    │
│  │  │  │ UID: 1001  │  │      │  │ UID: 1001  │  │  │    │
│  │  │  └────────────┘  │      │  └────────────┘  │  │    │
│  │  └──────────────────┘      └──────────────────┘  │    │
│  │           │                         │             │    │
│  │           │                         │             │    │
│  │  ┌────────▼────────┐      ┌────────▼────────┐   │    │
│  │  │ Frontend Service│      │ Backend Service │   │    │
│  │  │ Type: NodePort  │      │ Type: ClusterIP │   │    │
│  │  │ Port: 3000      │      │ Port: 8001      │   │    │
│  │  └────────┬────────┘      └────────┬────────┘   │    │
│  │           │                         │             │    │
│  │           │                         │             │    │
│  │  ┌────────▼─────────────────────────▼────────┐  │    │
│  │  │         ConfigMap: todo-app-config        │  │    │
│  │  │  - CORS_ORIGINS                           │  │    │
│  │  │  - NEXT_PUBLIC_API_URL                    │  │    │
│  │  └───────────────────────────────────────────┘  │    │
│  │                                                  │    │
│  │  ┌──────────────────────────────────────────┐  │    │
│  │  │      Secret: todo-app-secrets            │  │    │
│  │  │  - DATABASE_URL (base64)                 │  │    │
│  │  │  - JWT_SECRET (base64)                   │  │    │
│  │  │  - GEMINI_API_KEY (base64)               │  │    │
│  │  └──────────────────────────────────────────┘  │    │
│  │                                                  │    │
│  └──────────────────────────────────────────────────┘    │
│                                                           │
│                          │                                │
│                          │ External Access                │
└──────────────────────────┼────────────────────────────────┘
                           │
                           ▼
                    User Browser
                    (via minikube service)
                           │
                           │
                           ▼
                  External Neon PostgreSQL
                  (via internet)
```

## Resource Definitions

### 1. Backend Deployment

**Resource Type**: Deployment (apps/v1)

**Metadata**:
- Name: `{{ .Release.Name }}-backend`
- Labels:
  - `app.kubernetes.io/name: backend`
  - `app.kubernetes.io/instance: {{ .Release.Name }}`
  - `app.kubernetes.io/component: api`
  - `app.kubernetes.io/part-of: evolution-todo`

**Spec**:
- **Replicas**: 1 (configurable via `values.backend.replicaCount`)
- **Selector**: `app.kubernetes.io/name: backend`
- **Strategy**: RollingUpdate (maxSurge: 1, maxUnavailable: 0)

**Pod Template**:
- **Container Name**: backend
- **Image**: `{{ .Values.backend.image.repository }}:{{ .Values.backend.image.tag }}`
- **Image Pull Policy**: Never (images loaded locally)
- **Port**: 8001 (containerPort)
- **Environment Variables**:
  - `DATABASE_URL` (from Secret: todo-app-secrets)
  - `JWT_SECRET` (from Secret: todo-app-secrets)
  - `GEMINI_API_KEY` (from Secret: todo-app-secrets)
  - `CORS_ORIGINS` (from ConfigMap: todo-app-config)
- **Liveness Probe**:
  - Type: httpGet
  - Path: /api/health
  - Port: 8001
  - initialDelaySeconds: 40
  - periodSeconds: 30
  - timeoutSeconds: 5
  - failureThreshold: 3
- **Readiness Probe**:
  - Type: httpGet
  - Path: /api/health
  - Port: 8001
  - initialDelaySeconds: 10
  - periodSeconds: 10
  - timeoutSeconds: 5
  - failureThreshold: 3
- **Security Context**:
  - runAsNonRoot: true
  - runAsUser: 1001
  - allowPrivilegeEscalation: false
- **Resources**:
  - Requests: cpu: 100m, memory: 256Mi
  - Limits: cpu: 500m, memory: 512Mi

**Relationships**:
- References: Secret (todo-app-secrets), ConfigMap (todo-app-config)
- Exposed by: Service (todo-app-backend)

---

### 2. Frontend Deployment

**Resource Type**: Deployment (apps/v1)

**Metadata**:
- Name: `{{ .Release.Name }}-frontend`
- Labels:
  - `app.kubernetes.io/name: frontend`
  - `app.kubernetes.io/instance: {{ .Release.Name }}`
  - `app.kubernetes.io/component: web`
  - `app.kubernetes.io/part-of: evolution-todo`

**Spec**:
- **Replicas**: 1 (configurable via `values.frontend.replicaCount`)
- **Selector**: `app.kubernetes.io/name: frontend`
- **Strategy**: RollingUpdate (maxSurge: 1, maxUnavailable: 0)

**Pod Template**:
- **Container Name**: frontend
- **Image**: `{{ .Values.frontend.image.repository }}:{{ .Values.frontend.image.tag }}`
- **Image Pull Policy**: Never (images loaded locally)
- **Port**: 3000 (containerPort)
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL` (from ConfigMap: todo-app-config)
- **Liveness Probe**:
  - Type: httpGet
  - Path: /
  - Port: 3000
  - initialDelaySeconds: 20
  - periodSeconds: 30
  - timeoutSeconds: 5
  - failureThreshold: 3
- **Readiness Probe**:
  - Type: httpGet
  - Path: /
  - Port: 3000
  - initialDelaySeconds: 5
  - periodSeconds: 10
  - timeoutSeconds: 5
  - failureThreshold: 3
- **Security Context**:
  - runAsNonRoot: true
  - runAsUser: 1001
  - allowPrivilegeEscalation: false
- **Resources**:
  - Requests: cpu: 100m, memory: 256Mi
  - Limits: cpu: 500m, memory: 512Mi

**Relationships**:
- References: ConfigMap (todo-app-config)
- Exposed by: Service (todo-app-frontend)

---

### 3. Backend Service

**Resource Type**: Service (v1)

**Metadata**:
- Name: `{{ .Release.Name }}-backend`
- Labels:
  - `app.kubernetes.io/name: backend`
  - `app.kubernetes.io/instance: {{ .Release.Name }}`
  - `app.kubernetes.io/component: api`

**Spec**:
- **Type**: ClusterIP (internal only)
- **Selector**: `app.kubernetes.io/name: backend`
- **Ports**:
  - Name: http
  - Protocol: TCP
  - Port: 8001 (service port)
  - TargetPort: 8001 (container port)

**Purpose**: Exposes backend API within the cluster for frontend-to-backend communication.

**DNS Name**: `{{ .Release.Name }}-backend.default.svc.cluster.local` (or simply `{{ .Release.Name }}-backend` within same namespace)

**Relationships**:
- Selects: Backend Deployment pods
- Accessed by: Frontend pods

---

### 4. Frontend Service

**Resource Type**: Service (v1)

**Metadata**:
- Name: `{{ .Release.Name }}-frontend`
- Labels:
  - `app.kubernetes.io/name: frontend`
  - `app.kubernetes.io/instance: {{ .Release.Name }}`
  - `app.kubernetes.io/component: web`

**Spec**:
- **Type**: NodePort (external access)
- **Selector**: `app.kubernetes.io/name: frontend`
- **Ports**:
  - Name: http
  - Protocol: TCP
  - Port: 3000 (service port)
  - TargetPort: 3000 (container port)
  - NodePort: (auto-assigned by Kubernetes, typically 30000-32767)

**Purpose**: Exposes frontend web application for external access via Minikube.

**Access Method**: `minikube service {{ .Release.Name }}-frontend --url`

**Relationships**:
- Selects: Frontend Deployment pods
- Accessed by: External users (via Minikube node IP)

---

### 5. Secrets

**Resource Type**: Secret (v1)

**Metadata**:
- Name: `todo-app-secrets` (hardcoded, not templated)
- Labels:
  - `app.kubernetes.io/name: secrets`
  - `app.kubernetes.io/part-of: evolution-todo`

**Type**: Opaque

**Data** (base64 encoded):
- `DATABASE_URL`: Neon PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `GEMINI_API_KEY`: Google Gemini API key for chatbot

**Creation Method**: Manual (kubectl create secret)

**Example**:
```bash
kubectl create secret generic todo-app-secrets \
  --from-literal=DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require" \
  --from-literal=JWT_SECRET="your-secret-key-here" \
  --from-literal=GEMINI_API_KEY="your-gemini-api-key"
```

**Lifecycle**: Independent of Helm releases (persists across upgrades/rollbacks)

**Relationships**:
- Referenced by: Backend Deployment (environment variables)

---

### 6. ConfigMap

**Resource Type**: ConfigMap (v1)

**Metadata**:
- Name: `{{ .Release.Name }}-config`
- Labels:
  - `app.kubernetes.io/name: config`
  - `app.kubernetes.io/instance: {{ .Release.Name }}`
  - `app.kubernetes.io/part-of: evolution-todo`

**Data** (plain text):
- `CORS_ORIGINS`: Allowed CORS origins for backend (e.g., "http://localhost:3000")
- `NEXT_PUBLIC_API_URL`: Backend API URL for frontend (e.g., "http://todo-app-backend:8001")

**Creation Method**: Helm-managed (created/updated with Helm deployment)

**Values Source**: `values.yaml` (config.corsOrigins, config.backendUrl)

**Lifecycle**: Managed by Helm (updated with helm upgrade)

**Relationships**:
- Referenced by: Backend Deployment (CORS_ORIGINS), Frontend Deployment (NEXT_PUBLIC_API_URL)

---

## Resource Dependencies

### Deployment Order

1. **Prerequisites** (manual):
   - Minikube running
   - Docker images loaded
   - Secrets created

2. **Helm Deployment** (automatic):
   - ConfigMap (no dependencies)
   - Backend Deployment (depends on: Secret, ConfigMap)
   - Backend Service (depends on: Backend Deployment)
   - Frontend Deployment (depends on: ConfigMap, Backend Service for DNS)
   - Frontend Service (depends on: Frontend Deployment)

### Runtime Dependencies

- **Frontend → Backend**: Frontend pods call backend service via Kubernetes DNS
- **Backend → Database**: Backend pods connect to external Neon PostgreSQL via internet
- **Backend → Gemini API**: Backend pods call Google Gemini API via internet

---

## Resource Sizing

### Pod Resource Allocation

| Component | CPU Request | CPU Limit | Memory Request | Memory Limit |
|-----------|-------------|-----------|----------------|--------------|
| Backend   | 100m        | 500m      | 256Mi          | 512Mi        |
| Frontend  | 100m        | 500m      | 256Mi          | 512Mi        |
| **Total** | **200m**    | **1000m** | **512Mi**      | **1024Mi**   |

### Minikube Requirements

- **Minimum**: 2 CPU cores, 4GB RAM
- **Recommended**: 4 CPU cores, 8GB RAM
- **Disk**: 20GB

---

## Security Configuration

### Pod Security

- **Non-root users**: Both pods run as UID 1001
- **No privilege escalation**: allowPrivilegeEscalation: false
- **Read-only root filesystem**: Not enforced (applications need write access to /tmp)

### Secret Management

- **Secrets**: Stored in Kubernetes etcd (encrypted at rest in production)
- **ConfigMap**: Plain text (non-sensitive data only)
- **Environment variables**: Injected from Secrets/ConfigMaps (not hardcoded)

### Network Security

- **Backend**: ClusterIP only (not exposed externally)
- **Frontend**: NodePort (external access required)
- **Database**: External Neon PostgreSQL (SSL/TLS required)

---

## Monitoring and Observability

### Health Checks

- **Liveness**: Determines if pod should be restarted
- **Readiness**: Determines if pod should receive traffic
- **Endpoints**: Backend (/api/health), Frontend (/)

### Logging

- **Container logs**: stdout/stderr captured by Kubernetes
- **Access**: `kubectl logs <pod-name>`
- **Persistence**: Not configured (logs lost on pod deletion)

### Metrics

- **Resource usage**: `kubectl top pods`
- **Node metrics**: `kubectl top nodes`
- **Prometheus**: Not configured (future enhancement)

---

## Scaling Considerations

### Current Configuration

- **Replicas**: 1 for both frontend and backend
- **Scaling**: Manual (kubectl scale or helm upgrade with new replicaCount)

### Future Enhancements

- **Horizontal Pod Autoscaler (HPA)**: Scale based on CPU/memory usage
- **Vertical Pod Autoscaler (VPA)**: Adjust resource requests/limits automatically
- **Cluster Autoscaler**: Add/remove nodes based on demand (not applicable to Minikube)

---

## Disaster Recovery

### Pod Failure

- **Automatic restart**: Kubernetes restarts failed pods automatically
- **Liveness probe**: Triggers restart if application becomes unresponsive
- **Self-healing**: No manual intervention required

### Node Failure

- **Minikube**: Single-node cluster, no automatic recovery
- **Production**: Multi-node cluster with pod rescheduling

### Data Loss

- **Stateless application**: No persistent data in pods
- **Database**: External Neon PostgreSQL (managed backup/recovery)

---

## Summary

This data model defines 6 Kubernetes resources:
1. Backend Deployment (1 replica, port 8001)
2. Frontend Deployment (1 replica, port 3000)
3. Backend Service (ClusterIP, internal)
4. Frontend Service (NodePort, external)
5. Secrets (manual creation, sensitive data)
6. ConfigMap (Helm-managed, non-sensitive data)

All resources follow Kubernetes best practices for security, health checks, and resource management. The architecture supports local Minikube deployment with external database connectivity.
