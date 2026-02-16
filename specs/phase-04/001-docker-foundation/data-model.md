# Data Model: Docker Foundation

**Feature**: 001-docker-foundation
**Date**: 2026-02-16
**Purpose**: Define the deployment model for containerized Evolution Todo application

## Overview

This document defines the deployment architecture for the containerized Evolution Todo application. Unlike traditional data models that describe database entities, this deployment model describes the structure of container images, environment configuration, networking, and runtime dependencies.

## Container Images

### Backend Container Image

**Name**: `evolution-todo-backend`
**Base Image**: `python:3.11-slim`
**Purpose**: Run FastAPI application with database connectivity

**Structure**:
```
Layer 1: Base OS (Debian slim)
Layer 2: Python 3.11 runtime
Layer 3: System dependencies (postgresql-client)
Layer 4: Python virtual environment
Layer 5: Application dependencies (from requirements.txt)
Layer 6: Application code (src/, main.py, alembic/)
Layer 7: Non-root user configuration
Layer 8: Entrypoint and health check
```

**Runtime Requirements**:
- Port: 8000 (exposed)
- User: appuser (UID 1001, non-root)
- Working Directory: /app
- Entrypoint: uvicorn main:app --host 0.0.0.0 --port 8000
- Health Check: HTTP GET /health every 30s

**Environment Variables** (see Environment Configuration section)

### Frontend Container Image

**Name**: `evolution-todo-frontend`
**Base Image**: `node:18-alpine`
**Purpose**: Serve Next.js application

**Structure**:
```
Layer 1: Base OS (Alpine Linux)
Layer 2: Node.js 18 runtime
Layer 3: Application dependencies (node_modules, production only)
Layer 4: Built application (Next.js standalone output)
Layer 5: Non-root user configuration
Layer 6: Entrypoint and health check
```

**Runtime Requirements**:
- Port: 3000 (exposed)
- User: nextjs (UID 1001, non-root)
- Working Directory: /app
- Entrypoint: node server.js
- Health Check: HTTP GET / every 30s

**Environment Variables** (see Environment Configuration section)

## Environment Configuration

### Backend Environment Variables

| Variable | Required | Default | Description | Example |
|----------|----------|---------|-------------|---------|
| DATABASE_URL | Yes | None | Neon PostgreSQL connection string | postgresql://user:pass@host/db |
| JWT_SECRET | Yes | None | Secret key for JWT signing | random-256-bit-string |
| CORS_ORIGINS | No | http://localhost:3000 | Allowed CORS origins (comma-separated) | http://localhost:3000,http://frontend:3000 |
| PORT | No | 8000 | Application port | 8000 |
| LOG_LEVEL | No | INFO | Logging verbosity | INFO, DEBUG, WARNING, ERROR |
| GEMINI_API_KEY | Yes* | None | Google Gemini API key for chatbot | AIza... |

*Required for chatbot functionality

### Frontend Environment Variables

| Variable | Required | Default | Description | Example |
|----------|----------|---------|-------------|---------|
| NEXT_PUBLIC_API_URL | No | http://localhost:8000 | Backend API URL | http://backend:8000 |
| PORT | No | 3000 | Application port | 3000 |

**Note**: `NEXT_PUBLIC_*` variables are embedded at build time in Next.js. For dynamic configuration, use server-side environment variables.

## Container Networking

### Local Development (Docker Compose)

**Network**: bridge (default)
**Service Names**: frontend, backend

**Communication**:
- Frontend → Backend: http://backend:8000 (internal DNS)
- External → Frontend: http://localhost:3000 (port mapping)
- External → Backend: http://localhost:8000 (port mapping)

**Port Mappings**:
- Frontend: 3000:3000 (host:container)
- Backend: 8000:8000 (host:container)

### Kubernetes Deployment (Future)

**Network**: Cluster network with Services
**Service Names**: evolution-todo-frontend, evolution-todo-backend

**Communication**:
- Frontend → Backend: http://evolution-todo-backend:8000 (ClusterIP Service)
- External → Frontend: LoadBalancer or Ingress
- External → Backend: Not exposed (internal only)

## External Dependencies

### Neon PostgreSQL Database

**Type**: External managed service (not containerized)
**Connection**: Via DATABASE_URL environment variable
**Network**: Internet-accessible endpoint
**Authentication**: Username/password in connection string
**SSL**: Required (verify-full mode)

**Connection String Format**:
```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

**Considerations**:
- Database must be accessible from container network
- Connection pooling handled by SQLModel/SQLAlchemy
- Migrations run on backend startup or via init container

### Google Gemini API

**Type**: External API service
**Connection**: HTTPS to api.google.com
**Authentication**: API key in GEMINI_API_KEY environment variable
**Network**: Internet-accessible endpoint

## Build Context

### Backend Build Context

**Root**: `Quantum-Todo-Backend/`
**Included Files**:
- src/ (application code)
- main.py (entry point)
- requirements.txt (dependencies)
- alembic/ (migrations)
- alembic.ini (migration config)

**Excluded Files** (via .dockerignore):
- .git/
- .env (secrets)
- __pycache__/
- *.pyc
- .pytest_cache/
- tests/
- *.md (documentation)
- .venv/ (local virtual environment)

### Frontend Build Context

**Root**: `frontend/`
**Included Files**:
- src/ (application code)
- public/ (static assets)
- package.json (dependencies)
- package-lock.json (lock file)
- next.config.js (Next.js config)
- tsconfig.json (TypeScript config)

**Excluded Files** (via .dockerignore):
- .git/
- .env.local (secrets)
- node_modules/ (rebuilt in container)
- .next/ (rebuilt in container)
- *.md (documentation)
- tests/

## Health Checks

### Backend Health Check

**Endpoint**: GET /health
**Expected Response**:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-02-16T12:00:00Z"
}
```

**Check Configuration**:
- Interval: 30 seconds
- Timeout: 5 seconds
- Retries: 3
- Start Period: 40 seconds (allow startup time)

**Failure Conditions**:
- HTTP status != 200
- Response timeout
- Database connection failure

### Frontend Health Check

**Endpoint**: GET /
**Expected Response**: HTTP 200 with HTML content

**Check Configuration**:
- Interval: 30 seconds
- Timeout: 5 seconds
- Retries: 3
- Start Period: 15 seconds (allow startup time)

**Failure Conditions**:
- HTTP status != 200
- Response timeout
- Next.js server not responding

## Security Model

### Container Security

**Principles**:
1. Run as non-root user (UID 1001)
2. Minimal base images (slim/alpine)
3. No secrets in images
4. Read-only root filesystem where possible
5. Drop unnecessary capabilities

**User Configuration**:
- Backend: User `appuser` (UID 1001, GID 1001)
- Frontend: User `nextjs` (UID 1001, GID 1001)

**File Permissions**:
- Application code: Read-only (owned by root)
- Working directory: Read-write (owned by app user)
- Logs: Written to stdout/stderr (no file system)

### Network Security

**Principles**:
1. Minimize exposed ports
2. Use internal DNS for service-to-service communication
3. No direct database access from frontend
4. CORS configured on backend

**Port Exposure**:
- Frontend: 3000 (public)
- Backend: 8000 (public in dev, internal in prod)
- Database: Not exposed (external managed service)

## Resource Requirements

### Backend Container

**CPU**: 0.5 cores (request), 1 core (limit)
**Memory**: 512 MB (request), 1 GB (limit)
**Storage**: 100 MB (image size target)

**Rationale**: FastAPI is lightweight, but needs memory for Python runtime and database connections

### Frontend Container

**CPU**: 0.25 cores (request), 0.5 cores (limit)
**Memory**: 256 MB (request), 512 MB (limit)
**Storage**: 150 MB (image size target)

**Rationale**: Next.js standalone mode is efficient, primarily serving static content

## Deployment States

### State 1: Not Running
- No containers exist
- No resources allocated

### State 2: Building
- Docker build in progress
- Downloading base images
- Installing dependencies
- Building application artifacts

### State 3: Starting
- Containers created
- Environment variables loaded
- Health checks initializing
- Database connections establishing

### State 4: Healthy
- All containers running
- Health checks passing
- Services responding to requests
- Database connected

### State 5: Unhealthy
- One or more health checks failing
- Containers may be restarting
- Services not responding
- Database connection issues

### State 6: Stopped
- Containers stopped gracefully
- Resources released
- Data persisted in external database

## Validation Criteria

**Build Validation**:
- ✅ Backend image builds without errors
- ✅ Frontend image builds without errors
- ✅ Build completes in under 5 minutes (backend) and 3 minutes (frontend)
- ✅ Final image sizes under 200 MB (backend) and 200 MB (frontend)

**Runtime Validation**:
- ✅ Containers start without errors
- ✅ Health checks pass within start period
- ✅ Backend responds to API requests
- ✅ Frontend serves application
- ✅ Frontend can communicate with backend
- ✅ Backend can connect to Neon PostgreSQL
- ✅ All Phase III features work (auth, tasks, chatbot)

**Security Validation**:
- ✅ Containers run as non-root users
- ✅ No secrets in image layers
- ✅ Minimal base images used
- ✅ .dockerignore excludes sensitive files
