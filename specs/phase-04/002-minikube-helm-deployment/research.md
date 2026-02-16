# Research: Minikube Helm Deployment

**Feature**: 002-minikube-helm-deployment
**Date**: 2026-02-16
**Purpose**: Resolve technical unknowns for Helm chart updates and Minikube deployment

## 1. Helm Chart Best Practices

### Multi-Deployment Chart Patterns

**Research Question**: How to structure a single Helm chart with multiple deployments (frontend + backend)?

**Decision**: Use separate template files for each deployment within a single chart.

**Pattern**:
```
templates/
├── backend-deployment.yaml
├── backend-service.yaml
├── frontend-deployment.yaml
├── frontend-service.yaml
├── secrets.yaml
└── configmap.yaml
```

**Rationale**:
- Separate files improve maintainability and readability
- Each resource can be independently templated
- Easier to debug and troubleshoot specific components
- Follows Helm community conventions for multi-tier applications

**Alternative Considered**: Single deployment.yaml with conditional logic
- Rejected: Complex templating, harder to maintain, error-prone

### Values.yaml Structure

**Research Question**: How to organize values.yaml for frontend/backend configuration?

**Decision**: Nested structure with separate sections for each component.

**Structure**:
```yaml
backend:
  image:
    repository: evolution-todo-backend
    tag: latest
    pullPolicy: Never  # For Minikube (images loaded locally)
  service:
    type: ClusterIP
    port: 8001
  resources:
    requests:
      cpu: 100m
      memory: 256Mi
    limits:
      cpu: 500m
      memory: 512Mi

frontend:
  image:
    repository: evolution-todo-frontend
    tag: latest
    pullPolicy: Never
  service:
    type: NodePort
    port: 3000
  resources:
    requests:
      cpu: 100m
      memory: 256Mi
    limits:
      cpu: 500m
      memory: 512Mi

config:
  corsOrigins: "http://localhost:3000"
  backendUrl: "http://todo-app-backend:8001"
```

**Rationale**:
- Clear separation of concerns
- Easy to override specific values
- Supports environment-specific configurations
- Standard Helm pattern

### Template Naming Conventions

**Research Question**: What naming conventions for multiple services in templates?

**Decision**: Use `{{ .Release.Name }}-<component>` pattern.

**Examples**:
- Deployment: `{{ .Release.Name }}-backend`, `{{ .Release.Name }}-frontend`
- Service: `{{ .Release.Name }}-backend`, `{{ .Release.Name }}-frontend`
- Secret: `{{ .Release.Name }}-secrets`
- ConfigMap: `{{ .Release.Name }}-config`

**Rationale**:
- Prevents naming conflicts in shared namespaces
- Supports multiple releases in same cluster
- Standard Helm convention
- Easy to identify resources by release

### Secret and ConfigMap Management

**Research Question**: Should secrets be managed by Helm or created manually?

**Decision**: Manual secret creation with kubectl, ConfigMap managed by Helm.

**Secrets (Manual)**:
```bash
kubectl create secret generic todo-app-secrets \
  --from-literal=DATABASE_URL="postgresql://..." \
  --from-literal=JWT_SECRET="..." \
  --from-literal=GEMINI_API_KEY="..."
```

**ConfigMap (Helm-Managed)**:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Release.Name }}-config
data:
  CORS_ORIGINS: {{ .Values.config.corsOrigins | quote }}
  NEXT_PUBLIC_API_URL: {{ .Values.config.backendUrl | quote }}
```

**Rationale**:
- Secrets contain sensitive data (never commit to Git)
- Manual creation prevents accidental exposure
- ConfigMap contains non-sensitive data (safe in values.yaml)
- Secrets persist across Helm upgrades/rollbacks
- Follows Kubernetes security best practices

**Alternative Considered**: Helm-managed secrets with values.yaml
- Rejected: Security risk, secrets would be in version control

---

## 2. Minikube Configuration

### Image Loading Strategies

**Research Question**: How to make Docker images available to Minikube?

**Decision**: Use `minikube image load` for local images.

**Command**:
```bash
minikube image load evolution-todo-backend:latest
minikube image load evolution-todo-frontend:latest
```

**Rationale**:
- Images already built locally from Docker Foundation (001)
- No external registry needed
- Faster than push/pull workflow
- Works offline
- Simple and reliable

**Verification**:
```bash
minikube image ls | grep evolution-todo
```

**Alternative Considered**: Local Docker registry in Minikube
- Rejected: Unnecessary complexity for local development

**Image Pull Policy**: Set `imagePullPolicy: Never` in values.yaml
- Prevents Minikube from trying to pull images from external registries
- Forces use of locally loaded images
- Fails fast if images not loaded

### Service Exposure Methods

**Research Question**: How to expose services for external access in Minikube?

**Decision**: NodePort for frontend, ClusterIP for backend.

**Frontend Service (NodePort)**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ .Release.Name }}-frontend
spec:
  type: NodePort
  ports:
    - port: 3000
      targetPort: 3000
      protocol: TCP
  selector:
    app.kubernetes.io/name: frontend
```

**Access Method**:
```bash
minikube service todo-app-frontend --url
# Returns: http://192.168.49.2:30123
```

**Backend Service (ClusterIP)**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ .Release.Name }}-backend
spec:
  type: ClusterIP
  ports:
    - port: 8001
      targetPort: 8001
      protocol: TCP
  selector:
    app.kubernetes.io/name: backend
```

**Rationale**:
- NodePort: Simple external access for frontend (no Ingress needed)
- ClusterIP: Backend only needs internal cluster access (more secure)
- Minikube service command provides easy URL access
- No LoadBalancer setup required

**Alternative Considered**: Ingress controller
- Rejected: Overkill for local development, adds complexity

### Resource Limits

**Research Question**: What resource limits for Minikube local development?

**Decision**: Conservative limits suitable for local development.

**Backend Resources**:
```yaml
resources:
  requests:
    cpu: 100m      # 0.1 CPU cores
    memory: 256Mi  # 256 megabytes
  limits:
    cpu: 500m      # 0.5 CPU cores
    memory: 512Mi  # 512 megabytes
```

**Frontend Resources**:
```yaml
resources:
  requests:
    cpu: 100m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

**Rationale**:
- Requests: Minimum resources guaranteed by Kubernetes
- Limits: Maximum resources pod can consume
- Conservative values work on most development machines
- Prevents resource exhaustion on local machine
- Can be adjusted via values.yaml if needed

**Minikube Minimum Requirements**:
- CPU: 2 cores (recommended 4)
- Memory: 4GB (recommended 8GB)
- Disk: 20GB

**Verification**:
```bash
minikube config view
kubectl top nodes
kubectl top pods
```

### Network Connectivity to External Databases

**Research Question**: Can Minikube pods connect to external Neon PostgreSQL?

**Decision**: Yes, Minikube pods can connect to external services via internet.

**Configuration**:
- DATABASE_URL in Kubernetes secret includes full connection string
- Neon PostgreSQL accessible via public internet
- No special network configuration needed
- SSL/TLS connection required (`?sslmode=require`)

**Verification Strategy**:
```bash
# Deploy test pod with psql client
kubectl run psql-test --rm -it --image=postgres:15 -- bash
# Inside pod:
psql "postgresql://user:pass@host.neon.tech/db?sslmode=require"
```

**Potential Issues**:
- Firewall blocking outbound connections: Check Minikube network settings
- Neon IP allowlist: Ensure Minikube node IP is allowed
- DNS resolution: Verify pod can resolve neon.tech domain

**Rationale**:
- Minikube uses host network by default
- Pods can access internet through host
- No NAT or proxy configuration needed
- Standard Kubernetes networking applies

---

## 3. Kubernetes Health Checks

### Liveness Probe Configuration

**Research Question**: How to configure liveness probes for FastAPI and Next.js?

**Decision**: HTTP GET probes matching Docker health checks.

**Backend Liveness Probe (FastAPI)**:
```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 8001
  initialDelaySeconds: 40  # Wait for startup
  periodSeconds: 30        # Check every 30 seconds
  timeoutSeconds: 5        # Timeout after 5 seconds
  failureThreshold: 3      # Restart after 3 failures
```

**Frontend Liveness Probe (Next.js)**:
```yaml
livenessProbe:
  httpGet:
    path: /
    port: 3000
  initialDelaySeconds: 20
  periodSeconds: 30
  timeoutSeconds: 5
  failureThreshold: 3
```

**Rationale**:
- HTTP GET probes verify application is responding
- Matches Docker health check configuration
- initialDelaySeconds accounts for startup time
- failureThreshold prevents premature restarts
- Kubernetes restarts pod if liveness probe fails

### Readiness Probe Configuration

**Research Question**: Should readiness probes differ from liveness probes?

**Decision**: Use same endpoints as liveness probes.

**Backend Readiness Probe**:
```yaml
readinessProbe:
  httpGet:
    path: /api/health
    port: 8001
  initialDelaySeconds: 10  # Shorter than liveness
  periodSeconds: 10        # Check more frequently
  timeoutSeconds: 5
  failureThreshold: 3
```

**Frontend Readiness Probe**:
```yaml
readinessProbe:
  httpGet:
    path: /
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

**Rationale**:
- Readiness determines if pod receives traffic
- Shorter initialDelaySeconds (pod ready before liveness check)
- More frequent checks (periodSeconds: 10 vs 30)
- Prevents traffic to pods not ready to serve requests
- Pod removed from service endpoints if readiness fails

**Difference from Liveness**:
- Liveness: Is the application alive? (restart if not)
- Readiness: Is the application ready to serve traffic? (remove from service if not)

### Startup Probe Timing

**Research Question**: Do we need startup probes for slow-starting containers?

**Decision**: No startup probes needed for this application.

**Rationale**:
- Backend starts in ~8 seconds (well under 40s initialDelaySeconds)
- Frontend starts in ~3 seconds (well under 20s initialDelaySeconds)
- Startup probes useful for applications taking >60 seconds to start
- Liveness probe initialDelaySeconds sufficient for our use case

**When to Use Startup Probes**:
- Applications with long initialization (>60 seconds)
- Legacy applications with unpredictable startup times
- Applications that need different probe configuration during startup

### Probe Failure Thresholds

**Research Question**: What failure thresholds prevent false positives?

**Decision**: failureThreshold: 3 for all probes.

**Calculation**:
- Liveness: 3 failures × 30s period = 90 seconds before restart
- Readiness: 3 failures × 10s period = 30 seconds before removing from service

**Rationale**:
- Prevents restarts due to temporary network issues
- Allows time for transient failures to recover
- Standard Kubernetes default (failureThreshold: 3)
- Balances responsiveness with stability

**Alternative Considered**: failureThreshold: 1
- Rejected: Too aggressive, causes unnecessary restarts

---

## 4. Environment Variable Management

### Kubernetes Secrets for Sensitive Data

**Research Question**: How to securely manage DATABASE_URL, JWT_SECRET, GEMINI_API_KEY?

**Decision**: Kubernetes Secrets created manually before Helm deployment.

**Secret Creation**:
```bash
kubectl create secret generic todo-app-secrets \
  --from-literal=DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require" \
  --from-literal=JWT_SECRET="your-secret-key-here" \
  --from-literal=GEMINI_API_KEY="your-gemini-api-key"
```

**Secret Reference in Deployment**:
```yaml
env:
  - name: DATABASE_URL
    valueFrom:
      secretKeyRef:
        name: todo-app-secrets
        key: DATABASE_URL
  - name: JWT_SECRET
    valueFrom:
      secretKeyRef:
        name: todo-app-secrets
        key: JWT_SECRET
  - name: GEMINI_API_KEY
    valueFrom:
      secretKeyRef:
        name: todo-app-secrets
        key: GEMINI_API_KEY
```

**Rationale**:
- Secrets stored in etcd (encrypted at rest in production)
- Not visible in pod spec or Helm values
- Can be updated independently of Helm releases
- Follows Kubernetes security best practices
- Prevents accidental commit to version control

### ConfigMap for Non-Sensitive Config

**Research Question**: How to manage CORS_ORIGINS and NEXT_PUBLIC_API_URL?

**Decision**: Kubernetes ConfigMap managed by Helm.

**ConfigMap Template**:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Release.Name }}-config
data:
  CORS_ORIGINS: {{ .Values.config.corsOrigins | quote }}
  NEXT_PUBLIC_API_URL: {{ .Values.config.backendUrl | quote }}
```

**ConfigMap Reference in Deployment**:
```yaml
env:
  - name: CORS_ORIGINS
    valueFrom:
      configMapKeyRef:
        name: {{ .Release.Name }}-config
        key: CORS_ORIGINS
  - name: NEXT_PUBLIC_API_URL
    valueFrom:
      configMapKeyRef:
        name: {{ .Release.Name }}-config
        key: NEXT_PUBLIC_API_URL
```

**Rationale**:
- Non-sensitive data safe in values.yaml
- Helm manages ConfigMap lifecycle
- Easy to update via values.yaml
- Supports environment-specific configurations
- Can be version controlled safely

### Environment Variable Injection Patterns

**Research Question**: What's the best pattern for injecting env vars in Helm templates?

**Decision**: Use envFrom for ConfigMap, individual env for Secrets.

**Backend Deployment Pattern**:
```yaml
spec:
  containers:
    - name: backend
      image: {{ .Values.backend.image.repository }}:{{ .Values.backend.image.tag }}
      env:
        # Secrets (individual references)
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: todo-app-secrets
              key: DATABASE_URL
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: todo-app-secrets
              key: JWT_SECRET
        - name: GEMINI_API_KEY
          valueFrom:
            secretKeyRef:
              name: todo-app-secrets
              key: GEMINI_API_KEY
        # ConfigMap (individual references)
        - name: CORS_ORIGINS
          valueFrom:
            configMapKeyRef:
              name: {{ .Release.Name }}-config
              key: CORS_ORIGINS
```

**Frontend Deployment Pattern**:
```yaml
spec:
  containers:
    - name: frontend
      image: {{ .Values.frontend.image.repository }}:{{ .Values.frontend.image.tag }}
      env:
        - name: NEXT_PUBLIC_API_URL
          valueFrom:
            configMapKeyRef:
              name: {{ .Release.Name }}-config
              key: NEXT_PUBLIC_API_URL
```

**Rationale**:
- Individual env references provide explicit control
- Clear which variables come from secrets vs configmaps
- Easier to debug missing environment variables
- Supports mixing secrets and configmaps

**Alternative Considered**: envFrom to load all keys
- Rejected: Less explicit, harder to track which variables are used

### Secret Creation Strategies

**Research Question**: Manual kubectl vs Helm-managed secrets?

**Decision**: Manual kubectl secret creation (not Helm-managed).

**Workflow**:
1. User creates secrets manually before deployment
2. Helm chart references existing secrets
3. Secrets persist across Helm upgrades/rollbacks

**Advantages**:
- Secrets never in version control
- Secrets persist independently of Helm releases
- Can update secrets without Helm upgrade
- Follows security best practices

**Disadvantages**:
- Extra manual step before deployment
- User must remember to create secrets
- Not automated in CI/CD (requires separate secret management)

**Mitigation**:
- Document secret creation in quickstart.md
- Add verification step in deployment checklist
- Helm deployment fails fast if secrets missing

**Alternative Considered**: Helm-managed secrets with external secret management (Vault, Sealed Secrets)
- Rejected: Overkill for local Minikube development

---

## Summary of Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| Chart Structure | Single chart, separate template files | Maintainability, standard pattern |
| Values Organization | Nested backend/frontend sections | Clear separation, easy overrides |
| Secret Management | Manual kubectl creation | Security, persistence |
| ConfigMap Management | Helm-managed | Safe for non-sensitive data |
| Image Loading | minikube image load | Local images, no registry needed |
| Service Types | NodePort (frontend), ClusterIP (backend) | External access, internal security |
| Health Checks | HTTP GET probes | Application-level verification |
| Resource Limits | Conservative (100m/256Mi requests) | Local development friendly |
| Network | Standard Kubernetes networking | External database connectivity |

---

## Open Questions Resolved

All research questions have been answered. No remaining "NEEDS CLARIFICATION" items.

**Ready for Phase 1**: Design & Contracts
