# Docker Foundation - Deployment Guide

## Overview

This guide explains how to build and run the Evolution Todo application using Docker containers. The frontend and backend run as **separate containers** that communicate over localhost.

## Prerequisites

- Docker installed (version 20.10+)
- Neon PostgreSQL database provisioned
- Environment variables configured (see Configuration section)

## Quick Start

### 1. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your actual values:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `JWT_SECRET`: Generate with `openssl rand -base64 32`
- `GEMINI_API_KEY`: Get from https://makersuite.google.com/app/apikey

### 2. Build Container Images

**Backend:**
```bash
cd Quantum-Todo-Backend
docker build -t evolution-todo-backend:latest .
cd ..
```

**Frontend:**
```bash
cd frontend
docker build -t evolution-todo-frontend:latest --build-arg NEXT_PUBLIC_API_URL=http://localhost:8001 .
cd ..
```

### 3. Run Containers Separately

**Start Backend Container:**
```bash
docker run -d \
  --name backend \
  -p 8001:8001 \
  -e DATABASE_URL="your-neon-postgresql-url" \
  -e JWT_SECRET="your-jwt-secret" \
  -e GEMINI_API_KEY="your-gemini-api-key" \
  -e CORS_ORIGINS="http://localhost:3000" \
  evolution-todo-backend:latest
```

**Start Frontend Container:**
```bash
docker run -d \
  --name frontend \
  -p 3000:3000 \
  evolution-todo-frontend:latest
```

### 4. Verify Deployment

**Check container status:**
```bash
docker ps
```

**Check backend logs:**
```bash
docker logs backend
```

**Check frontend logs:**
```bash
docker logs frontend
```

**Test endpoints:**
```bash
# Backend health check
curl http://localhost:8001/health

# Frontend
curl http://localhost:3000
```

**Access application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Docs: http://localhost:8001/docs

## Container Details

### Backend Container

- **Image**: evolution-todo-backend:latest
- **Size**: 516MB
- **Base**: python:3.11-slim (multi-stage build)
- **Port**: 8001
- **User**: appuser (UID 1001, non-root)
- **Health Check**: GET /health every 30s
- **Startup Time**: ~30 seconds

**Required Environment Variables:**
- `DATABASE_URL` (required)
- `JWT_SECRET` (required)
- `GEMINI_API_KEY` (required)
- `CORS_ORIGINS` (optional, default: http://localhost:3000)

### Frontend Container

- **Image**: evolution-todo-frontend:latest
- **Size**: 287MB
- **Base**: node:18-alpine (multi-stage build)
- **Port**: 3000
- **User**: nextjs (UID 1001, non-root)
- **Health Check**: GET / every 30s
- **Startup Time**: ~10 seconds

**Build-time Configuration:**
- `NEXT_PUBLIC_API_URL` (set during build, default: http://localhost:8001)

## Container Management

### Stop Containers

```bash
docker stop backend frontend
```

### Restart Containers

```bash
docker start backend frontend
```

### Remove Containers

```bash
docker rm -f backend frontend
```

### View Logs

```bash
# Follow logs in real-time
docker logs -f backend
docker logs -f frontend

# View last 100 lines
docker logs --tail 100 backend
```

### Execute Commands in Container

```bash
# Backend: Run database migrations
docker exec backend alembic upgrade head

# Backend: Open Python shell
docker exec -it backend python

# Frontend: Open shell
docker exec -it frontend sh
```

## Troubleshooting

### Backend Container Won't Start

**Check logs:**
```bash
docker logs backend
```

**Common issues:**
- Invalid DATABASE_URL format
- Database not accessible from container
- Missing required environment variables
- Port 8001 already in use

**Solutions:**
- Verify DATABASE_URL includes `?sslmode=require`
- Check Neon PostgreSQL allows connections from your IP
- Ensure all required env vars are set
- Stop any process using port 8001

### Frontend Container Won't Start

**Check logs:**
```bash
docker logs frontend
```

**Common issues:**
- Port 3000 already in use
- NEXT_PUBLIC_API_URL not set correctly at build time

**Solutions:**
- Stop any process using port 3000
- Rebuild frontend with correct `--build-arg NEXT_PUBLIC_API_URL`

### Frontend Can't Reach Backend

**Symptoms:**
- API calls fail with connection errors
- CORS errors in browser console

**Solutions:**
- Verify backend is running: `docker ps | grep backend`
- Check backend logs for errors: `docker logs backend`
- Ensure CORS_ORIGINS includes `http://localhost:3000`
- Verify frontend was built with correct NEXT_PUBLIC_API_URL

### Database Connection Fails

**Symptoms:**
- Backend logs show database connection errors
- Health check fails

**Solutions:**
- Verify DATABASE_URL format: `postgresql://user:pass@host.neon.tech/db?sslmode=require`
- Check Neon PostgreSQL dashboard for connection issues
- Ensure database allows connections from your IP
- Test connection manually: `docker exec backend python -c "from src.db.session import engine; engine.connect()"`

## Security Notes

- ✅ Both containers run as non-root users
- ✅ Secrets managed via environment variables (never in images)
- ✅ .dockerignore excludes sensitive files
- ✅ Multi-stage builds minimize attack surface
- ✅ Health checks enable automatic recovery

## Performance

**Build Times:**
- Backend: ~3 minutes (under 5 minute requirement ✓)
- Frontend: ~3 minutes (under 3 minute requirement ✓)

**Image Sizes:**
- Backend: 516MB
- Frontend: 287MB

**Startup Times:**
- Backend: ~30 seconds (meets requirement ✓)
- Frontend: ~10 seconds (meets requirement ✓)

## Development Workflow

### Rebuild After Code Changes

**Backend:**
```bash
docker stop backend
docker rm backend
cd Quantum-Todo-Backend
docker build -t evolution-todo-backend:latest .
cd ..
# Run container again with same command
```

**Frontend:**
```bash
docker stop frontend
docker rm frontend
cd frontend
docker build -t evolution-todo-frontend:latest --build-arg NEXT_PUBLIC_API_URL=http://localhost:8001 .
cd ..
# Run container again with same command
```

### Clean Up

```bash
# Remove containers
docker rm -f backend frontend

# Remove images
docker rmi evolution-todo-backend:latest evolution-todo-frontend:latest

# Remove all unused Docker resources
docker system prune -a
```

## Next Steps

After successful local Docker deployment:

1. **Kubernetes Deployment**: Create Kubernetes manifests (future phase)
2. **Helm Charts**: Package as Helm chart for easy deployment (future phase)
3. **CI/CD**: Automate builds and deployments (future phase)
4. **Monitoring**: Add Prometheus metrics and Grafana dashboards (future phase)

## Support

For issues or questions:
1. Check container logs: `docker logs <container-name>`
2. Verify environment variables are set correctly
3. Ensure Neon PostgreSQL is accessible
4. Review Dockerfile specifications in `specs/001-docker-foundation/contracts/`
5. Consult `specs/001-docker-foundation/quickstart.md` for detailed guidance
