# Evolution Todo Helm Chart

A Helm chart for deploying the Evolution Todo full-stack application to Kubernetes (Minikube).

## Overview

Evolution Todo is a modern task management application with AI-powered chatbot assistance. This Helm chart deploys both the frontend (Next.js) and backend (FastAPI) components along with necessary configuration.

## Architecture

- **Backend**: FastAPI application with PostgreSQL database (external Neon)
- **Frontend**: Next.js 15 application with App Router
- **Database**: External Neon PostgreSQL (serverless)
- **AI**: Google Gemini integration for chatbot functionality

## Prerequisites

- Kubernetes 1.28+
- Helm 3.x
- Minikube (for local deployment)
- Docker images pre-loaded:
  - `evolution-todo-backend:latest`
  - `evolution-todo-frontend:latest`

## Quick Start

### 1. Load Docker Images to Minikube

```bash
minikube image load evolution-todo-backend:latest
minikube image load evolution-todo-frontend:latest
```

### 2. Create Kubernetes Secrets

```bash
kubectl create secret generic todo-app-secrets \
  --from-literal=DATABASE_URL='your-database-url' \
  --from-literal=JWT_SECRET='your-jwt-secret' \
  --from-literal=GEMINI_API_KEY='your-gemini-api-key'
```

### 3. Install the Chart

```bash
helm install todo-app . --wait --timeout 10m
```

### 4. Verify Deployment

```bash
bash verify-deployment.sh
```

## Configuration

### Values

The following table lists the configurable parameters and their default values.

#### Backend Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `backend.enabled` | Enable backend deployment | `true` |
| `backend.replicaCount` | Number of backend replicas | `1` |
| `backend.image.repository` | Backend image repository | `evolution-todo-backend` |
| `backend.image.tag` | Backend image tag | `latest` |
| `backend.image.pullPolicy` | Image pull policy | `Never` |
| `backend.service.type` | Backend service type | `ClusterIP` |
| `backend.service.port` | Backend service port | `8001` |
| `backend.resources.requests.cpu` | CPU request | `100m` |
| `backend.resources.requests.memory` | Memory request | `256Mi` |
| `backend.resources.limits.cpu` | CPU limit | `500m` |
| `backend.resources.limits.memory` | Memory limit | `512Mi` |

#### Frontend Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `frontend.enabled` | Enable frontend deployment | `true` |
| `frontend.replicaCount` | Number of frontend replicas | `1` |
| `frontend.image.repository` | Frontend image repository | `evolution-todo-frontend` |
| `frontend.image.tag` | Frontend image tag | `latest` |
| `frontend.image.pullPolicy` | Image pull policy | `Never` |
| `frontend.service.type` | Frontend service type | `NodePort` |
| `frontend.service.port` | Frontend service port | `3000` |
| `frontend.resources.requests.cpu` | CPU request | `100m` |
| `frontend.resources.requests.memory` | Memory request | `256Mi` |
| `frontend.resources.limits.cpu` | CPU limit | `500m` |
| `frontend.resources.limits.memory` | Memory limit | `512Mi` |

#### Application Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `config.corsOrigins` | CORS allowed origins | `http://localhost:3000` |
| `config.backendUrl` | Backend URL for frontend | `http://todo-app-backend:8001` |

### Customizing Values

Create a custom `values.yaml` file:

```yaml
backend:
  replicaCount: 2
  resources:
    requests:
      cpu: 200m
      memory: 512Mi
    limits:
      cpu: 1000m
      memory: 1Gi

frontend:
  replicaCount: 2
  service:
    type: LoadBalancer
```

Install with custom values:

```bash
helm install todo-app . -f custom-values.yaml
```

## Accessing the Application

### Frontend

Get the frontend URL:

```bash
minikube service todo-app-frontend --url
```

Or use port-forwarding:

```bash
kubectl port-forward svc/todo-app-frontend 3000:3000
```

Then visit: http://localhost:3000

### Backend API

Port-forward the backend service:

```bash
kubectl port-forward svc/todo-app-backend 8001:8001
```

Then visit: http://localhost:8001/api/health

## Health Checks

### Backend

- **Liveness Probe**: HTTP GET `/api/health` (delay: 40s, period: 30s)
- **Readiness Probe**: HTTP GET `/api/health` (delay: 10s, period: 10s)

### Frontend

- **Liveness Probe**: HTTP GET `/` (delay: 20s, period: 30s)
- **Readiness Probe**: HTTP GET `/` (delay: 5s, period: 10s)

## Monitoring

### Check Pod Status

```bash
kubectl get pods -l "app.kubernetes.io/instance=todo-app"
```

### Check Service Status

```bash
kubectl get services -l "app.kubernetes.io/instance=todo-app"
```

### View Backend Logs

```bash
kubectl logs -l "app.kubernetes.io/name=backend" -f
```

### View Frontend Logs

```bash
kubectl logs -l "app.kubernetes.io/name=frontend" -f
```

## Troubleshooting

### Pods Not Starting

Check pod events:

```bash
kubectl describe pod <pod-name>
```

Check pod logs:

```bash
kubectl logs <pod-name>
```

### Database Connection Issues

Verify the DATABASE_URL secret:

```bash
kubectl get secret todo-app-secrets -o jsonpath='{.data.DATABASE_URL}' | base64 -d
```

### Health Check Failures

Check if the backend is responding:

```bash
kubectl port-forward svc/todo-app-backend 8001:8001
curl http://localhost:8001/api/health
```

### Image Pull Errors

Ensure images are loaded to Minikube:

```bash
minikube image ls | grep evolution-todo
```

## Upgrading

Update the chart:

```bash
helm upgrade todo-app . --wait --timeout 10m
```

## Uninstalling

Remove the release:

```bash
helm uninstall todo-app
```

Remove secrets:

```bash
kubectl delete secret todo-app-secrets
```

## Performance Metrics

- **Deployment Time**: ~34 seconds (with pre-loaded images)
- **Resource Usage**: 200m CPU, 512Mi memory (requests)
- **Startup Time**: Backend ready in ~10s, Frontend ready in ~5s

See [DEPLOYMENT_METRICS.md](./DEPLOYMENT_METRICS.md) for detailed performance analysis.

## Security

- Runs as non-root user (UID 1001)
- Secrets stored in Kubernetes Secrets
- Resource limits enforced
- Health checks configured
- Security context applied

## Production Considerations

For production deployment, consider:

1. **Image Pull Policy**: Change to `IfNotPresent` or `Always`
2. **Replicas**: Increase to 2+ for high availability
3. **Service Type**: Use LoadBalancer or Ingress
4. **Resource Limits**: Adjust based on load testing
5. **Persistent Storage**: Add PVCs if needed
6. **Monitoring**: Add Prometheus/Grafana
7. **Logging**: Configure centralized logging
8. **TLS**: Enable HTTPS with cert-manager
9. **Network Policies**: Restrict pod-to-pod communication
10. **Pod Disruption Budgets**: Ensure availability during updates

## Support

For issues and questions:
- Check the [troubleshooting section](#troubleshooting)
- Review pod logs and events
- Run the verification script: `bash verify-deployment.sh`

## License

See the main project LICENSE file.

## Version History

- **0.2.0** (2026-02-16): Full-stack deployment with backend and frontend
- **0.1.0**: Initial chart structure
