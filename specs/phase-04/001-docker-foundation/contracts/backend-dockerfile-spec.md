# Backend Dockerfile Specification

**Service**: Evolution Todo Backend (FastAPI)
**Base Image**: python:3.11-slim
**Target**: Production-ready container image
**Build Pattern**: Multi-stage build

## Build Stages

### Stage 1: Dependencies (builder)

**Purpose**: Install Python dependencies in isolated virtual environment

**Base**: python:3.11-slim
**Working Directory**: /app
**Actions**:
1. Install system dependencies (postgresql-client for psycopg2)
2. Create Python virtual environment at /opt/venv
3. Activate virtual environment
4. Copy requirements.txt
5. Install Python dependencies with pip (no cache)

**Output**: Virtual environment with all dependencies at /opt/venv

### Stage 2: Production (runtime)

**Purpose**: Create minimal production image with application code

**Base**: python:3.11-slim
**Working Directory**: /app
**Actions**:
1. Install runtime system dependencies (postgresql-client)
2. Copy virtual environment from builder stage
3. Create non-root user (appuser, UID 1001)
4. Copy application code (src/, main.py, alembic/, alembic.ini)
5. Set ownership to appuser
6. Switch to non-root user
7. Configure environment variables
8. Expose port 8000
9. Define health check
10. Set entrypoint

**Output**: Production-ready container image

## File Structure in Container

```
/app/
├── main.py                 # FastAPI entry point
├── src/                    # Application code
│   ├── api/               # API routers
│   ├── models/            # Database models
│   ├── services/          # Business logic
│   ├── db/                # Database configuration
│   └── middleware/        # Middleware
├── alembic/               # Database migrations
└── alembic.ini            # Migration configuration

/opt/venv/                 # Python virtual environment
├── bin/                   # Python executables
├── lib/                   # Installed packages
└── ...
```

## Environment Variables

**Required**:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret
- `GEMINI_API_KEY`: Google Gemini API key

**Optional**:
- `CORS_ORIGINS`: Allowed CORS origins (default: http://localhost:3000)
- `PORT`: Application port (default: 8000)
- `LOG_LEVEL`: Logging level (default: INFO)

## Port Configuration

**Exposed Port**: 8000
**Protocol**: HTTP
**Binding**: 0.0.0.0 (all interfaces)

## Health Check

**Type**: HTTP
**Endpoint**: GET /health
**Interval**: 30 seconds
**Timeout**: 5 seconds
**Retries**: 3
**Start Period**: 40 seconds

**Expected Response**: HTTP 200 with JSON body

## Entrypoint

**Command**: `uvicorn main:app --host 0.0.0.0 --port 8000`

**Rationale**:
- uvicorn is the recommended ASGI server for FastAPI
- --host 0.0.0.0 allows external connections
- --port 8000 is the standard FastAPI port

**Alternative for Production** (future):
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```
(Multiple workers for better performance)

## Security Configuration

**User**: appuser (UID 1001, GID 1001)
**Rationale**: Non-root user follows security best practices

**File Permissions**:
- Application code: Read-only (owned by root)
- Working directory: Read-write (owned by appuser)

**Capabilities**: Drop all unnecessary capabilities (future enhancement)

## Build Context

**Root**: `Quantum-Todo-Backend/`

**Included Files**:
- src/ (application code)
- main.py (entry point)
- requirements.txt (dependencies)
- alembic/ (migrations)
- alembic.ini (migration config)

**Excluded Files** (via .dockerignore):
- .git/
- .env
- __pycache__/
- *.pyc
- .pytest_cache/
- tests/
- *.md
- .venv/

## Build Command

```bash
docker build -t evolution-todo-backend:latest -f Dockerfile .
```

**Build Arguments** (optional):
- `PYTHON_VERSION`: Python version (default: 3.11)

## Run Command

```bash
docker run -d \
  --name backend \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql://user:pass@host/db" \
  -e JWT_SECRET="your-secret-key" \
  -e GEMINI_API_KEY="your-api-key" \
  -e CORS_ORIGINS="http://localhost:3000" \
  evolution-todo-backend:latest
```

## Validation Criteria

**Build Success**:
- ✅ Build completes without errors
- ✅ Build time under 5 minutes
- ✅ Final image size under 200 MB
- ✅ All dependencies installed correctly

**Runtime Success**:
- ✅ Container starts without errors
- ✅ Health check passes within 40 seconds
- ✅ Application responds to HTTP requests on port 8000
- ✅ Database connection successful
- ✅ All API endpoints functional

## Optimization Notes

**Layer Caching**:
- requirements.txt copied before application code
- Dependency installation cached unless requirements change
- Application code changes don't trigger dependency reinstall

**Image Size**:
- Multi-stage build excludes build tools from final image
- --no-cache-dir flag reduces pip cache size
- Slim base image reduces OS footprint

**Build Speed**:
- Dependency layer cached for faster rebuilds
- Parallel dependency installation where possible
- Minimal system package installation
