# Research: Docker Foundation

**Feature**: 001-docker-foundation
**Date**: 2026-02-16
**Purpose**: Research Docker containerization best practices for Next.js and FastAPI applications

## Research Questions

1. What are the best practices for containerizing Next.js 15+ applications?
2. What are the best practices for containerizing FastAPI applications?
3. How should multi-stage builds be structured for optimal image size and build time?
4. What security considerations apply to production container images?
5. How should environment variables be managed in containers?
6. What health check strategies work best for Next.js and FastAPI?

## Findings

### 1. Next.js Containerization Best Practices

**Decision**: Use multi-stage build with separate dependency installation and production build stages

**Rationale**:
- Next.js official documentation recommends multi-stage builds to minimize final image size
- Separating dependency installation from build allows Docker layer caching to speed up rebuilds
- Production mode (`next start`) is optimized for performance and security
- Standalone output mode reduces image size by including only necessary files

**Key Patterns**:
- Base image: `node:18-alpine` (small, secure, official)
- Install dependencies in separate stage with `npm ci` (faster, deterministic)
- Build application with `next build`
- Use standalone output mode for minimal production bundle
- Run as non-root user for security
- Expose port 3000 (Next.js default)
- Health check: HTTP GET to root path or dedicated health endpoint

**Alternatives Considered**:
- `node:18` (full): Rejected due to larger image size (~900MB vs ~150MB)
- Single-stage build: Rejected due to including dev dependencies in final image
- Custom Node.js build: Rejected due to complexity and maintenance burden

### 2. FastAPI Containerization Best Practices

**Decision**: Use multi-stage build with Python virtual environment and slim base image

**Rationale**:
- FastAPI applications benefit from virtual environments even in containers for dependency isolation
- `python:3.11-slim` provides good balance of size and compatibility
- uvicorn with multiple workers provides production-grade performance
- Alembic migrations should run before application starts or as init container

**Key Patterns**:
- Base image: `python:3.11-slim` (official, minimal)
- Create virtual environment in build stage
- Install dependencies with `pip install --no-cache-dir` to reduce layer size
- Copy only necessary files (exclude tests, docs, .git)
- Run as non-root user for security
- Expose port 8000 (FastAPI/uvicorn default)
- Health check: HTTP GET to `/health` or `/api/health` endpoint
- Use uvicorn with `--host 0.0.0.0` to accept external connections

**Alternatives Considered**:
- `python:3.11-alpine`: Rejected due to compilation issues with some Python packages (psycopg2, cryptography)
- `python:3.11` (full): Rejected due to larger image size (~1GB vs ~150MB)
- Installing system packages: Minimize to only essential (postgresql-client for psycopg2)

### 3. Multi-Stage Build Structure

**Decision**: Use 3-stage pattern: dependencies → build → production

**Rationale**:
- Stage 1 (dependencies): Install all dependencies including dev dependencies
- Stage 2 (build): Build application artifacts (Next.js) or prepare runtime (FastAPI)
- Stage 3 (production): Copy only production artifacts and runtime dependencies
- Each stage can be cached independently, speeding up rebuilds
- Final image contains only what's needed to run the application

**Pattern for Next.js**:
```
Stage 1: Install dependencies (node_modules)
Stage 2: Build application (next build, standalone output)
Stage 3: Copy standalone output + node_modules (production only)
```

**Pattern for FastAPI**:
```
Stage 1: Install dependencies in virtual environment
Stage 2: Copy application code
Stage 3: Copy virtual environment + application code, run as non-root
```

### 4. Security Considerations

**Decision**: Implement defense-in-depth security practices

**Key Security Measures**:
1. **Non-root user**: Create and use dedicated user (UID 1000+) to run application
2. **Minimal base images**: Use slim/alpine variants to reduce attack surface
3. **No secrets in images**: All secrets via environment variables at runtime
4. **Read-only filesystem**: Where possible, run with read-only root filesystem
5. **Dependency scanning**: Use `npm audit` and `pip-audit` in CI (future)
6. **Layer optimization**: Minimize layers and use `.dockerignore` to exclude sensitive files

**Rationale**:
- Running as root violates principle of least privilege
- Smaller images have fewer potential vulnerabilities
- Secrets in images can be extracted even from intermediate layers
- Read-only filesystem prevents runtime tampering
- Regular dependency scanning catches known vulnerabilities

### 5. Environment Variable Management

**Decision**: Use environment variables for all configuration, with sensible defaults where safe

**Environment Variables Required**:

**Backend (FastAPI)**:
- `DATABASE_URL`: Neon PostgreSQL connection string (required, no default)
- `JWT_SECRET`: Secret key for JWT token signing (required, no default)
- `CORS_ORIGINS`: Allowed CORS origins (default: `http://localhost:3000`)
- `PORT`: Application port (default: 8000)
- `LOG_LEVEL`: Logging verbosity (default: INFO)
- `GEMINI_API_KEY`: Google Gemini API key for chatbot (required for chatbot feature)

**Frontend (Next.js)**:
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: `http://localhost:8000`)
- `PORT`: Application port (default: 3000)

**Rationale**:
- Environment variables are the standard way to configure containerized applications
- Separates configuration from code (12-factor app principle)
- Allows same image to run in different environments (dev, staging, prod)
- Secrets never committed to version control or baked into images

**Implementation**:
- Use `.env` files for local development (already in .gitignore)
- Use Kubernetes Secrets for cluster deployment (future phase)
- Validate required environment variables on application startup
- Provide clear error messages for missing required variables

### 6. Health Check Strategies

**Decision**: Implement HTTP-based health checks for both services

**Backend Health Check**:
- Endpoint: `GET /health` or `GET /api/health`
- Response: `{"status": "healthy", "database": "connected"}`
- Checks: Application running, database connectivity
- Interval: 30 seconds
- Timeout: 5 seconds
- Retries: 3

**Frontend Health Check**:
- Endpoint: `GET /` (root path)
- Response: HTTP 200 with HTML content
- Checks: Next.js server running and responding
- Interval: 30 seconds
- Timeout: 5 seconds
- Retries: 3

**Rationale**:
- HTTP health checks are standard for web applications
- Kubernetes uses health checks for liveness and readiness probes
- Database connectivity check ensures backend is fully operational
- Proper health checks enable automatic recovery from failures

## Technology Decisions Summary

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| Backend Base Image | python:3.11-slim | 3.11 | Official, minimal, compatible with all dependencies |
| Frontend Base Image | node:18-alpine | 18 | Official, minimal, Next.js compatible |
| Backend Server | uvicorn | Latest | ASGI server, production-ready, FastAPI recommended |
| Build Pattern | Multi-stage | N/A | Optimal image size, build caching, security |
| User | Non-root (UID 1001) | N/A | Security best practice, least privilege |
| Health Checks | HTTP endpoints | N/A | Standard, Kubernetes-compatible |

## Implementation Approach

1. **Backend Dockerfile**: Multi-stage build with virtual environment, non-root user, health check
2. **Frontend Dockerfile**: Multi-stage build with standalone output, non-root user, health check
3. **docker-compose.yml**: Orchestrate both services with proper networking and environment variables
4. **.dockerignore**: Exclude unnecessary files from build context (node_modules, .git, tests, etc.)
5. **Documentation**: Update quickstart.md with Docker build and run instructions

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Large image sizes | Slow builds, high storage costs | Use multi-stage builds, alpine/slim base images |
| Build failures due to dependencies | Blocked deployment | Pin dependency versions, test builds in CI |
| Missing environment variables | Runtime failures | Validate on startup, provide clear error messages |
| Database connection failures | Application won't start | Implement retry logic, health checks |
| Port conflicts | Containers won't start | Use standard ports, document in quickstart |

## Next Steps

1. Create Dockerfile specifications in contracts/
2. Create data-model.md (deployment model)
3. Create quickstart.md with build and run instructions
4. Proceed to task generation (/sp.tasks)
