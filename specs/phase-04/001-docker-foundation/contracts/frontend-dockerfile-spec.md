# Frontend Dockerfile Specification

**Service**: Evolution Todo Frontend (Next.js)
**Base Image**: node:18-alpine
**Target**: Production-ready container image
**Build Pattern**: Multi-stage build with standalone output

## Build Stages

### Stage 1: Dependencies (deps)

**Purpose**: Install Node.js dependencies

**Base**: node:18-alpine
**Working Directory**: /app
**Actions**:
1. Install libc6-compat (Alpine compatibility for Node.js)
2. Copy package.json and package-lock.json
3. Install dependencies with npm ci (clean install)

**Output**: node_modules/ with all dependencies

### Stage 2: Builder (builder)

**Purpose**: Build Next.js application with standalone output

**Base**: node:18-alpine
**Working Directory**: /app
**Actions**:
1. Copy node_modules from deps stage
2. Copy all application source code
3. Set NEXT_TELEMETRY_DISABLED=1 (disable telemetry)
4. Run next build (creates .next/ and standalone output)

**Output**: Built Next.js application in .next/standalone/

### Stage 3: Production (runner)

**Purpose**: Create minimal production image with only runtime files

**Base**: node:18-alpine
**Working Directory**: /app
**Actions**:
1. Set NODE_ENV=production
2. Create non-root user (nextjs, UID 1001)
3. Copy standalone output from builder
4. Copy static files and public assets
5. Set ownership to nextjs user
6. Switch to non-root user
7. Expose port 3000
8. Define health check
9. Set entrypoint

**Output**: Production-ready container image

## File Structure in Container

```
/app/
├── server.js              # Next.js standalone server
├── .next/
│   ├── standalone/        # Minimal Next.js runtime
│   └── static/            # Static assets
└── public/                # Public assets (images, etc.)
```

## Environment Variables

**Build-time** (embedded in image):
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)

**Runtime**:
- `PORT`: Application port (default: 3000)
- `HOSTNAME`: Bind hostname (default: 0.0.0.0)

**Note**: `NEXT_PUBLIC_*` variables must be set at build time as they are embedded in the client-side bundle.

## Port Configuration

**Exposed Port**: 3000
**Protocol**: HTTP
**Binding**: 0.0.0.0 (all interfaces)

## Health Check

**Type**: HTTP
**Endpoint**: GET /
**Interval**: 30 seconds
**Timeout**: 5 seconds
**Retries**: 3
**Start Period**: 15 seconds

**Expected Response**: HTTP 200 with HTML content

## Entrypoint

**Command**: `node server.js`

**Rationale**:
- Next.js standalone mode creates optimized server.js
- Minimal dependencies, faster startup
- Production-optimized performance

## Security Configuration

**User**: nextjs (UID 1001, GID 1001)
**Rationale**: Non-root user follows security best practices

**File Permissions**:
- Application code: Read-only (owned by root)
- Working directory: Read-write (owned by nextjs)

## Build Context

**Root**: `frontend/`

**Included Files**:
- src/ (application code)
- public/ (static assets)
- package.json (dependencies)
- package-lock.json (lock file)
- next.config.js (Next.js config)
- tsconfig.json (TypeScript config)
- postcss.config.js (PostCSS config)
- tailwind.config.js (Tailwind config)

**Excluded Files** (via .dockerignore):
- .git/
- .env.local
- node_modules/ (rebuilt in container)
- .next/ (rebuilt in container)
- *.md
- tests/
- .eslintrc.json
- .prettierrc

## Build Command

```bash
docker build -t evolution-todo-frontend:latest \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:8000 \
  -f Dockerfile .
```

**Build Arguments**:
- `NEXT_PUBLIC_API_URL`: Backend API URL (required at build time)

## Run Command

```bash
docker run -d \
  --name frontend \
  -p 3000:3000 \
  -e PORT=3000 \
  evolution-todo-frontend:latest
```

**Note**: NEXT_PUBLIC_API_URL is embedded at build time, not runtime.

## Validation Criteria

**Build Success**:
- ✅ Build completes without errors
- ✅ Build time under 3 minutes
- ✅ Final image size under 200 MB
- ✅ Standalone output generated correctly

**Runtime Success**:
- ✅ Container starts without errors
- ✅ Health check passes within 15 seconds
- ✅ Application serves HTML on port 3000
- ✅ Static assets load correctly
- ✅ API calls reach backend successfully

## Next.js Configuration Requirements

**next.config.js must include**:
```javascript
module.exports = {
  output: 'standalone',  // Enable standalone output mode
  // ... other config
}
```

**Rationale**: Standalone mode creates minimal production bundle with only necessary files.

## Optimization Notes

**Layer Caching**:
- package.json and package-lock.json copied before source code
- Dependency installation cached unless package files change
- Source code changes don't trigger dependency reinstall

**Image Size**:
- Multi-stage build excludes dev dependencies and build artifacts
- Standalone output includes only necessary runtime files
- Alpine base image reduces OS footprint
- Static assets optimized by Next.js build

**Build Speed**:
- Dependency layer cached for faster rebuilds
- npm ci faster than npm install (uses lock file)
- Parallel builds possible with BuildKit

## Docker Compose Integration

**Service Name**: frontend
**Depends On**: backend (for API connectivity)
**Networks**: Default bridge network
**Environment**: NEXT_PUBLIC_API_URL set to backend service name

**Example**:
```yaml
services:
  frontend:
    build:
      context: ./frontend
      args:
        NEXT_PUBLIC_API_URL: http://backend:8000
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

## Known Limitations

1. **Build-time API URL**: NEXT_PUBLIC_API_URL must be known at build time. For dynamic configuration, use server-side API routes.

2. **Static Export Not Used**: We use standalone mode (server-side rendering) rather than static export to support dynamic features and API routes.

3. **Single Architecture**: Image built for host architecture. Multi-arch builds require additional configuration.

## Troubleshooting

**Issue**: Build fails with "ENOENT: no such file or directory"
**Solution**: Ensure all required config files (next.config.js, tsconfig.json) are present

**Issue**: Container starts but health check fails
**Solution**: Check that port 3000 is not already in use, verify Next.js server is running

**Issue**: API calls fail from frontend
**Solution**: Verify NEXT_PUBLIC_API_URL is correct and backend is accessible
