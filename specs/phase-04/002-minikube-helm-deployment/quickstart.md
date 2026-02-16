# Quickstart Guide: Minikube Helm Deployment

**Feature**: 002-minikube-helm-deployment
**Date**: 2026-02-16
**Purpose**: Step-by-step guide for deploying Evolution Todo to Minikube

## Prerequisites

Before deploying, ensure you have:

### 1. Minikube Running

```bash
# Start Minikube with sufficient resources
minikube start --cpus=4 --memory=8192 --disk-size=20g

# Verify Minikube is running
minikube status

# Expected output:
# minikube
# type: Control Plane
# host: Running
# kubelet: Running
# apiserver: Running
# kubeconfig: Configured
```

### 2. Docker Images Available

```bash
# Load backend image into Minikube
minikube image load evolution-todo-backend:latest

# Load frontend image into Minikube
minikube image load evolution-todo-frontend:latest

# Verify images are loaded
minikube image ls | grep evolution-todo

# Expected output:
# docker.io/library/evolution-todo-backend:latest
# docker.io/library/evolution-todo-frontend:latest
```

### 3. kubectl Configured

```bash
# Verify kubectl is configured for Minikube
kubectl config current-context

# Expected output: minikube

# Test kubectl access
kubectl get nodes

# Expected output:
# NAME       STATUS   ROLES           AGE   VERSION
# minikube   Ready    control-plane   1m    v1.28.x
```

### 4. Helm Installed

```bash
# Verify Helm is installed
helm version

# Expected output: version.BuildInfo{Version:"v3.x.x", ...}
```

### 5. Environment Variables Ready

Prepare your actual credentials:
- **DATABASE_URL**: Neon PostgreSQL connection string
- **JWT_SECRET**: Secret key for JWT tokens (generate with `openssl rand -base64 32`)
- **GEMINI_API_KEY**: Google Gemini API key

---

## Deployment Scenarios

### Scenario 1: First-Time Deployment

**Step 1: Create Kubernetes Secrets**

```bash
# Create secrets with your actual credentials
kubectl create secret generic todo-app-secrets \
  --from-literal=DATABASE_URL="postgresql://user:password@host.neon.tech/database?sslmode=require" \
  --from-literal=JWT_SECRET="your-jwt-secret-key-here" \
  --from-literal=GEMINI_API_KEY="your-gemini-api-key-here"

# Verify secret was created
kubectl get secrets

# Expected output:
# NAME                TYPE     DATA   AGE
# todo-app-secrets    Opaque   3      5s
```

**Step 2: Deploy with Helm**

```bash
# Deploy the application
helm upgrade --install todo-app ./todo-app

# Expected output:
# Release "todo-app" does not exist. Installing it now.
# NAME: todo-app
# LAST DEPLOYED: [timestamp]
# NAMESPACE: default
# STATUS: deployed
# REVISION: 1
```

**Step 3: Verify Deployment**

```bash
# Check pod status (wait for Running)
kubectl get pods

# Expected output:
# NAME                                READY   STATUS    RESTARTS   AGE
# todo-app-backend-xxxxxxxxxx-xxxxx   1/1     Running   0          30s
# todo-app-frontend-xxxxxxxxxx-xxxxx  1/1     Running   0          30s

# Check services
kubectl get services

# Expected output:
# NAME                TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
# todo-app-backend    ClusterIP   10.96.xxx.xxx   <none>        8001/TCP         30s
# todo-app-frontend   NodePort    10.96.xxx.xxx   <none>        3000:xxxxx/TCP   30s
```

**Step 4: Access Application**

```bash
# Get frontend URL
minikube service todo-app-frontend --url

# Expected output: http://192.168.49.2:30123

# Open in browser or test with curl
curl $(minikube service todo-app-frontend --url)
```

---

### Scenario 2: Update Deployment

After making changes to Helm chart templates or values:

```bash
# Update the deployment
helm upgrade todo-app ./todo-app

# Expected output:
# Release "todo-app" has been upgraded. Happy Helming!
# NAME: todo-app
# LAST DEPLOYED: [timestamp]
# NAMESPACE: default
# STATUS: deployed
# REVISION: 2

# Watch pods rolling update
kubectl get pods -w

# Verify new pods are running
kubectl get pods
```

---

### Scenario 3: Rollback Deployment

If something goes wrong after an upgrade:

```bash
# Check deployment history
helm history todo-app

# Expected output:
# REVISION  UPDATED                   STATUS      CHART           APP VERSION  DESCRIPTION
# 1         [timestamp]               superseded  todo-app-0.1.0  1.0.0        Install complete
# 2         [timestamp]               deployed    todo-app-0.1.0  1.0.0        Upgrade complete

# Rollback to previous revision
helm rollback todo-app 1

# Expected output:
# Rollback was a success! Happy Helming!

# Verify rollback
kubectl get pods
```

---

### Scenario 4: Clean Up Deployment

To remove the application:

```bash
# Uninstall Helm release
helm uninstall todo-app

# Expected output:
# release "todo-app" uninstalled

# Verify pods are terminated
kubectl get pods

# Delete secrets (if needed)
kubectl delete secret todo-app-secrets

# Stop Minikube (optional)
minikube stop
```

---

## Access Methods

### Frontend Access

**Method 1: Minikube Service (Recommended)**

```bash
# Get frontend URL
minikube service todo-app-frontend --url

# Open in browser
# Windows: start $(minikube service todo-app-frontend --url)
# macOS: open $(minikube service todo-app-frontend --url)
# Linux: xdg-open $(minikube service todo-app-frontend --url)
```

**Method 2: Port Forwarding**

```bash
# Forward local port 3000 to frontend service
kubectl port-forward svc/todo-app-frontend 3000:3000

# Access at: http://localhost:3000
```

### Backend Access (For Testing)

**Method 1: Port Forwarding**

```bash
# Forward local port 8001 to backend service
kubectl port-forward svc/todo-app-backend 8001:8001

# Test health endpoint
curl http://localhost:8001/api/health

# Expected output: {"status":"healthy","version":"1.0.0"}
```

**Method 2: From Within Cluster**

```bash
# Run a test pod
kubectl run curl-test --rm -it --image=curlimages/curl -- sh

# Inside the pod, test backend service
curl http://todo-app-backend:8001/api/health

# Exit the pod
exit
```

---

## Troubleshooting

### Pods Not Starting

**Check pod status:**

```bash
kubectl get pods

# If status is not "Running", describe the pod
kubectl describe pod <pod-name>

# Check pod logs
kubectl logs <pod-name>
```

**Common Issues:**

1. **ImagePullBackOff**: Images not loaded into Minikube
   ```bash
   # Solution: Load images
   minikube image load evolution-todo-backend:latest
   minikube image load evolution-todo-frontend:latest
   ```

2. **CrashLoopBackOff**: Application failing to start
   ```bash
   # Check logs for errors
   kubectl logs <pod-name>

   # Common causes:
   # - Missing or invalid DATABASE_URL
   # - Database not accessible
   # - Missing environment variables
   ```

3. **Pending**: Insufficient resources
   ```bash
   # Check node resources
   kubectl top nodes

   # Solution: Increase Minikube resources
   minikube stop
   minikube start --cpus=4 --memory=8192
   ```

### Secrets Not Found

**Check if secrets exist:**

```bash
kubectl get secrets

# If todo-app-secrets is missing, create it
kubectl create secret generic todo-app-secrets \
  --from-literal=DATABASE_URL="..." \
  --from-literal=JWT_SECRET="..." \
  --from-literal=GEMINI_API_KEY="..."
```

### Database Connection Fails

**Test database connectivity:**

```bash
# Run psql test pod
kubectl run psql-test --rm -it --image=postgres:15 -- bash

# Inside pod, test connection
psql "postgresql://user:pass@host.neon.tech/db?sslmode=require"

# If connection fails:
# - Verify DATABASE_URL is correct
# - Check Neon PostgreSQL allows connections from your IP
# - Verify SSL mode is set to "require"
```

### Frontend Can't Reach Backend

**Check service endpoints:**

```bash
# Verify backend service has endpoints
kubectl get endpoints

# Expected output:
# NAME                ENDPOINTS           AGE
# todo-app-backend    10.244.0.5:8001     5m
# todo-app-frontend   10.244.0.6:3000     5m

# If backend endpoint is missing, check backend pod
kubectl get pods -l app.kubernetes.io/name=backend
kubectl logs <backend-pod-name>
```

**Check DNS resolution:**

```bash
# Run test pod
kubectl run dns-test --rm -it --image=busybox -- sh

# Inside pod, test DNS
nslookup todo-app-backend

# Expected output:
# Server:    10.96.0.10
# Address 1: 10.96.0.10 kube-dns.kube-system.svc.cluster.local
#
# Name:      todo-app-backend
# Address 1: 10.96.xxx.xxx todo-app-backend.default.svc.cluster.local
```

### Helm Deployment Fails

**Check Helm status:**

```bash
# Get deployment status
helm status todo-app

# Check Helm history
helm history todo-app

# Get detailed error
helm upgrade --install todo-app ./todo-app --debug --dry-run
```

**Common Issues:**

1. **Template errors**: Syntax errors in Helm templates
   ```bash
   # Validate templates
   helm template todo-app ./todo-app
   ```

2. **Values errors**: Invalid values in values.yaml
   ```bash
   # Check values
   helm get values todo-app
   ```

---

## Verification Checklist

Use this checklist to verify successful deployment:

### Infrastructure Verification

- [ ] Minikube is running: `minikube status`
- [ ] Docker images loaded: `minikube image ls | grep evolution-todo`
- [ ] kubectl configured: `kubectl config current-context` returns "minikube"
- [ ] Secrets created: `kubectl get secrets | grep todo-app-secrets`

### Deployment Verification

- [ ] Helm release deployed: `helm list | grep todo-app`
- [ ] Both pods running: `kubectl get pods` shows 2/2 Running
- [ ] Backend pod ready: `kubectl get pods -l app.kubernetes.io/name=backend` shows 1/1 Ready
- [ ] Frontend pod ready: `kubectl get pods -l app.kubernetes.io/name=frontend` shows 1/1 Ready
- [ ] Services created: `kubectl get services` shows backend (ClusterIP) and frontend (NodePort)

### Application Verification

- [ ] Backend logs show successful startup: `kubectl logs -l app.kubernetes.io/name=backend`
- [ ] Backend logs show database connection: Check logs for "Application startup complete"
- [ ] Frontend logs show successful startup: `kubectl logs -l app.kubernetes.io/name=frontend`
- [ ] Backend health check responds: `kubectl port-forward svc/todo-app-backend 8001:8001` then `curl http://localhost:8001/api/health`
- [ ] Frontend accessible: `minikube service todo-app-frontend --url` returns valid URL
- [ ] Frontend loads in browser: Open frontend URL, verify page loads

### Feature Verification (Phase III Features)

- [ ] User registration works: Create new account via frontend
- [ ] User login works: Login with created account
- [ ] Task creation works: Create a new task
- [ ] Task read works: View task list
- [ ] Task update works: Edit a task
- [ ] Task delete works: Delete a task
- [ ] Chatbot works: Send message to chatbot, receive response

### Performance Verification

- [ ] Backend pod starts within 60 seconds: Check pod age with `kubectl get pods`
- [ ] Frontend pod starts within 60 seconds: Check pod age with `kubectl get pods`
- [ ] Backend health check passes within 40 seconds: Check readiness probe
- [ ] Frontend health check passes within 20 seconds: Check readiness probe
- [ ] Helm deployment completes within 2 minutes: Time the `helm upgrade --install` command

---

## Performance Monitoring

### Resource Usage

```bash
# Check pod resource usage
kubectl top pods

# Expected output:
# NAME                                CPU(cores)   MEMORY(bytes)
# todo-app-backend-xxxxxxxxxx-xxxxx   50m          200Mi
# todo-app-frontend-xxxxxxxxxx-xxxxx  30m          150Mi

# Check node resource usage
kubectl top nodes

# Expected output:
# NAME       CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
# minikube   500m         25%    2000Mi          25%
```

### Log Monitoring

```bash
# Follow backend logs in real-time
kubectl logs -f -l app.kubernetes.io/name=backend

# Follow frontend logs in real-time
kubectl logs -f -l app.kubernetes.io/name=frontend

# Get last 100 lines of logs
kubectl logs --tail=100 -l app.kubernetes.io/name=backend
```

### Event Monitoring

```bash
# Watch all events in real-time
kubectl get events --watch

# Get events for specific pod
kubectl get events --field-selector involvedObject.name=<pod-name>
```

---

## Advanced Operations

### Scaling Deployments

```bash
# Scale backend to 2 replicas
kubectl scale deployment todo-app-backend --replicas=2

# Verify scaling
kubectl get pods -l app.kubernetes.io/name=backend

# Scale via Helm (persistent)
# Edit values.yaml: backend.replicaCount: 2
helm upgrade todo-app ./todo-app
```

### Updating Secrets

```bash
# Delete old secret
kubectl delete secret todo-app-secrets

# Create new secret with updated values
kubectl create secret generic todo-app-secrets \
  --from-literal=DATABASE_URL="new-value" \
  --from-literal=JWT_SECRET="new-value" \
  --from-literal=GEMINI_API_KEY="new-value"

# Restart pods to pick up new secrets
kubectl rollout restart deployment todo-app-backend
kubectl rollout restart deployment todo-app-frontend
```

### Debugging Pods

```bash
# Execute shell in running pod
kubectl exec -it <pod-name> -- sh

# Inside pod, check environment variables
env | grep -E 'DATABASE_URL|JWT_SECRET|GEMINI_API_KEY|CORS_ORIGINS|NEXT_PUBLIC_API_URL'

# Test network connectivity
curl http://todo-app-backend:8001/api/health

# Exit pod
exit
```

---

## Next Steps

After successful deployment:

1. **Test all Phase III features** through the web interface
2. **Monitor resource usage** to optimize resource limits
3. **Document any issues** encountered during deployment
4. **Prepare for production deployment** (future phase)

---

## Support

For issues or questions:

1. Check pod logs: `kubectl logs <pod-name>`
2. Check pod events: `kubectl describe pod <pod-name>`
3. Verify secrets: `kubectl get secrets`
4. Test database connectivity: Use psql test pod
5. Review Helm status: `helm status todo-app`
6. Consult data-model.md for resource architecture
7. Review contracts/ for reference manifests
