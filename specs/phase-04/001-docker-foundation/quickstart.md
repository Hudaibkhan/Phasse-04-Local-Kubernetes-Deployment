# Quick Start: Docker Foundation

**Feature**: 001-docker-foundation
**Date**: 2026-02-16
**Purpose**: Quick start guide for building and running Evolution Todo in Docker containers

## Prerequisites

- Docker installed (version 20.10+)
- Docker Compose installed (version 2.0+)
- Neon PostgreSQL database provisioned and accessible
- Environment variables configured (see Configuration section)

## Quick Start (Docker Compose)

### 1. Configure Environment Variables

Create `.env` file in project root:

```bash
# Backend Configuration
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
JWT_SECRET=your-256-bit-secret-key-here
GEMINI_API_KEY=your-gemini-api-key-here
CORS_ORIGINS=http://localhost:3000

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Important**: Never commit `.env` file to version control.

### 2. Build and Run All Services

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

### 3. Verify Deployment

**Check container status**:
```bash
docker-compose ps
```

Expected output:
```
NAME                STATUS              PORTS
frontend            Up (healthy)        0.0.0.0:3000->3000/tcp
backend             Up (healthy)        0.0.0.0:8000->8000/tcp
```

**Check logs**:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Test endpoints**:
```bash
# Backend health check
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000
```

### 4. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### 5. Stop Services

```bash
# Stop and remove containers
docker-compose down

# Stop, remove containers, and remove volumes
docker-compose down -v
```

## Manual Build and Run

### Backend

**Build**:
```bash
cd Quantum-Todo-Backend
docker build -t evolution-todo-backend:latest .
```

**Run**:
```bash
docker run -d \
  --name backend \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require" \
  -e JWT_SECRET="your-secret-key" \
  -e GEMINI_API_KEY="your-api-key" \
  -e CORS_ORIGINS="http://localhost:3000" \
  evolution-todo-backend:latest
```

**Verify**:
```bash
# Check logs
docker logs backend

# Test health endpoint
curl http://localhost:8000/health
```

### Frontend

**Build**:
```bash
cd frontend
docker build -t evolution-todo-frontend:latest \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:8000 \
  .
```

**Run**:
```bash
docker run -d \
  --name frontend \
  -p 3000:3000 \
  evolution-todo-frontend:latest
```

**Verify**:
```bash
# Check logs
docker logs frontend

# Test frontend
curl http://localhost:3000
```

## Configuration

### Required Environment Variables

**Backend**:
- `DATABASE_URL`: Neon PostgreSQL connection string (required)
- `JWT_SECRET`: Secret key for JWT signing (required)
- `GEMINI_API_KEY`: Google Gemini API key for chatbot (required)

**Frontend**:
- `NEXT_PUBLIC_API_URL`: Backend API URL (build-time, default: http://localhost:8000)

### Optional Environment Variables

**Backend**:
- `CORS_ORIGINS`: Allowed CORS origins (default: http://localhost:3000)
- `PORT`: Application port (default: 8000)
- `LOG_LEVEL`: Logging level (default: INFO)

**Frontend**:
- `PORT`: Application port (default: 3000)

## Troubleshooting

### Build Issues

**Problem**: Backend build fails with "Could not find a version that satisfies the requirement"
**Solution**: Check requirements.txt for version conflicts, ensure Python 3.11+ base image

**Problem**: Frontend build fails with "Module not found"
**Solution**: Ensure package.json and package-lock.json are present, run `npm install` locally first to verify

**Problem**: Build is very slow
**Solution**: Use BuildKit for faster builds: `DOCKER_BUILDKIT=1 docker build ...`

### Runtime Issues

**Problem**: Backend container exits immediately
**Solution**: Check logs with `docker logs backend`, verify DATABASE_URL is correct and database is accessible

**Problem**: Frontend container exits immediately
**Solution**: Check logs with `docker logs frontend`, verify next.config.js has `output: 'standalone'`

**Problem**: Backend health check fails
**Solution**: Verify database connection, check if port 8000 is already in use

**Problem**: Frontend can't reach backend
**Solution**:
- If using Docker Compose: Use service name `http://backend:8000`
- If using separate containers: Create custom network or use host networking

**Problem**: "Connection refused" when accessing database
**Solution**: Verify Neon PostgreSQL allows connections from your IP, check DATABASE_URL format

### Network Issues

**Problem**: Frontend can't communicate with backend in Docker Compose
**Solution**: Ensure both services are on same network, use service name (backend) not localhost

**Problem**: Can't access services from host machine
**Solution**: Verify port mappings in docker-compose.yml, check firewall settings

## Development Workflow

### Rebuild After Code Changes

**Backend**:
```bash
docker-compose up --build backend
```

**Frontend**:
```bash
docker-compose up --build frontend
```

**Both**:
```bash
docker-compose up --build
```

### View Logs

```bash
# Follow logs for all services
docker-compose logs -f

# Follow logs for specific service
docker-compose logs -f backend

# View last 100 lines
docker-compose logs --tail=100 backend
```

### Execute Commands in Running Container

```bash
# Backend: Run database migrations
docker-compose exec backend alembic upgrade head

# Backend: Open Python shell
docker-compose exec backend python

# Frontend: Open shell
docker-compose exec frontend sh
```

### Clean Up

```bash
# Remove stopped containers
docker-compose rm

# Remove all containers, networks, and volumes
docker-compose down -v

# Remove images
docker rmi evolution-todo-backend:latest
docker rmi evolution-todo-frontend:latest

# Remove all unused Docker resources
docker system prune -a
```

## Performance Tips

### Build Performance

1. **Use BuildKit**: `DOCKER_BUILDKIT=1` for faster builds
2. **Layer Caching**: Don't change package files unless necessary
3. **Parallel Builds**: Build frontend and backend simultaneously

### Runtime Performance

1. **Resource Limits**: Set appropriate CPU/memory limits in docker-compose.yml
2. **Health Checks**: Tune intervals to balance responsiveness and overhead
3. **Logging**: Use JSON logging for better performance in production

## Security Checklist

- [ ] No secrets in Dockerfiles or docker-compose.yml
- [ ] `.env` file in .gitignore
- [ ] Containers run as non-root users
- [ ] Minimal base images used (slim/alpine)
- [ ] .dockerignore excludes sensitive files
- [ ] DATABASE_URL uses SSL (sslmode=require)
- [ ] JWT_SECRET is strong random string (256+ bits)

## Next Steps

After successful local Docker deployment:

1. **Kubernetes Deployment**: Create Kubernetes manifests (future phase)
2. **Helm Charts**: Package as Helm chart for easy deployment (future phase)
3. **CI/CD**: Automate builds and deployments (future phase)
4. **Monitoring**: Add Prometheus metrics and Grafana dashboards (future phase)
5. **Production**: Deploy to cloud Kubernetes cluster (future phase)

## Validation Checklist

Before proceeding to Kubernetes deployment, verify:

- [ ] Backend container builds successfully
- [ ] Frontend container builds successfully
- [ ] Both containers start without errors
- [ ] Health checks pass for both services
- [ ] Backend responds to API requests
- [ ] Frontend serves application
- [ ] Frontend can communicate with backend
- [ ] Backend can connect to Neon PostgreSQL
- [ ] All Phase III features work (auth, tasks, chatbot)
- [ ] No application code was modified
- [ ] Build times meet requirements (<5min backend, <3min frontend)
- [ ] Containers run as non-root users

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables are set correctly
3. Ensure Neon PostgreSQL is accessible
4. Review Dockerfile specifications in `contracts/`
5. Consult research.md for Docker best practices
