---
name: speckit-monorepo-orchestration
description: |
  Orchestration skill for designing, creating, and operating within a Spec-Kit-driven
  full-stack monorepo. This skill should be used when initializing projects, organizing
  codebases, coordinating cross-stack changes, and ensuring spec governance. Enforces
  clean separation of concerns, proper folder structure, and spec-first development
  across frontend, backend, and specifications in a single repository.
---

# Spec-Kit Full-Stack Monorepo Orchestration

Orchestration and reasoning skill for Spec-Kit-driven monorepo architecture.

## What This Skill Does

- **Guides monorepo initialization**: Single Git repository with frontend, backend, and specs
- **Enforces folder structure**: Canonical Spec-Kit monorepo layout
- **Ensures spec governance**: specs/ as single source of truth
- **Coordinates cross-stack changes**: Synchronized updates across frontend, backend, API, DB, UI
- **Maintains separation of concerns**: Clear boundaries between components
- **Supports phase evolution**: Phase II (auth, persistence) → Phase III+ (chatbot, MCP, agents)

## What This Skill Does NOT Do

- Business logic implementation (use other skills for that)
- Framework-specific code generation (use Next.js, FastAPI skills)
- Database schema creation (use Neon persistence skill)
- Authentication implementation (use Better Auth skill)
- This is an **orchestration and reasoning skill only**

---

## Before Implementation

**This skill is invoked BEFORE other implementation skills.**

Sequence of skill usage:
1. **speckit-monorepo-orchestration** → Initialize structure, ensure specs exist
2. **spec-driven-fullstack** → Validate specs, enforce workflow
3. **nextjs-app-router** / **fastapi-backend** / etc. → Implement features

Gather context:

| Source | Gather |
|--------|--------|
| **Codebase** | Existing monorepo structure, folder organization |
| **Conversation** | Project phase, features needed, initialization requirements |
| **Skill References** | Monorepo patterns from `references/` |
| **User Guidelines** | Team conventions, deployment targets |

---

## Core Principles

### 1. Single Repository, Multiple Concerns

**One Git repository** contains everything, properly organized.

**Benefits**:
- Single source of truth
- Atomic commits across frontend/backend
- Easier dependency management
- Simplified CI/CD
- Better code sharing

**Structure**:
```
evolution_todo/
├── specs/          # Specifications (what to build)
├── frontend/       # Next.js implementation
├── backend/        # FastAPI implementation
└── CLAUDE.md       # Root orchestration rules
```

**Not** separate repositories:
```
❌ hackathon-todo-frontend/
❌ hackathon-todo-backend/
❌ hackathon-todo-specs/
```

### 2. Specs as Single Source of Truth

**specs/ directory governs all implementation.**

**Rule**: No implementation without corresponding spec.

**Enforcement**:
- Frontend developers reference specs/features/ and specs/ui/
- Backend developers reference specs/features/ and specs/api/
- Database changes reference specs/database/
- All changes traceable to specs

**Example**:
```
Spec exists: specs/features/task-crud.md
  ↓
Frontend implements: frontend/app/tasks/
  ↓
Backend implements: backend/app/api/routes/tasks.py
  ↓
Database implements: backend/app/models/task.py
```

### 3. Clean Separation of Concerns

**Each directory has a clear, single responsibility.**

| Directory | Responsibility | Cannot Contain |
|-----------|----------------|----------------|
| `specs/` | Requirements, design documents | Code, tests |
| `frontend/` | Next.js application | Backend code, database |
| `backend/` | FastAPI application | Frontend code, UI |
| `.spec-kit/` | Spec-Kit configuration | Application code |

**Cross-cutting concerns**:
- **Authentication**: Spec in `specs/features/`, frontend in `frontend/`, backend in `backend/`
- **Database**: Spec in `specs/database/`, implementation in `backend/app/models/`
- **API**: Spec in `specs/api/`, implementation in `backend/app/api/routes/`

### 4. Phase Awareness

**Monorepo evolves through phases** - structure accommodates growth.

**Phase II (Current)**:
```
├── frontend/       # Next.js
├── backend/        # FastAPI
├── specs/
│   ├── features/   # task-crud, authentication
│   ├── api/        # REST endpoints
│   ├── database/   # schema
│   └── ui/         # components, pages
```

**Phase III+ (Future)**:
```
├── frontend/       # Same
├── backend/        # Same + MCP tools
├── chatbot/        # New: AI agent
├── agents/         # New: Claude agents
├── docker/         # New: Containerization
└── specs/
    ├── features/   # + chatbot features
    ├── api/        # + MCP tool specs
    ├── agents/     # New: agent specs
    └── deployment/ # New: infra specs
```

**Future-proofing**: Structure allows adding `chatbot/`, `agents/`, `docker/` without restructuring.

---

## Canonical Folder Structure

### Required Structure (Phase II)

```
evolution_todo/
├── .spec-kit/
│   └── config.yaml              # Spec-Kit configuration
│
├── specs/                       # SINGLE SOURCE OF TRUTH
│   ├── overview.md              # Project overview
│   ├── architecture.md          # System architecture
│   │
│   ├── features/                # Feature specifications
│   │   ├── task-crud.md         # Task CRUD operations
│   │   ├── authentication.md    # Auth flows
│   │   └── user-profile.md      # User management
│   │
│   ├── api/                     # API specifications
│   │   ├── rest-endpoints.md    # REST API design
│   │   └── error-handling.md    # Error patterns
│   │
│   ├── database/                # Database specifications
│   │   ├── schema.md            # Tables, relationships
│   │   └── migrations.md        # Migration strategy
│   │
│   └── ui/                      # UI specifications
│       ├── components.md        # Component library
│       ├── pages.md             # Page structure
│       └── design-system.md     # Colors, typography
│
├── frontend/                    # Next.js Application
│   ├── CLAUDE.md                # Frontend-specific rules
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── .env.local.example
│   │
│   ├── app/                     # App Router
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   ├── (auth)/              # Auth routes (route group)
│   │   │   ├── signin/
│   │   │   └── signup/
│   │   ├── dashboard/           # Protected routes
│   │   └── tasks/               # Task pages
│   │
│   ├── components/              # Shared components
│   │   ├── ui/                  # Base UI components
│   │   ├── auth/                # Auth components
│   │   └── tasks/               # Task components
│   │
│   ├── lib/                     # Utilities
│   │   ├── auth-client.ts       # Better Auth client
│   │   ├── api-client.ts        # Backend API client
│   │   └── utils.ts             # Helper functions
│   │
│   └── public/                  # Static assets
│
├── backend/                     # FastAPI Application
│   ├── CLAUDE.md                # Backend-specific rules
│   ├── requirements.txt
│   ├── pyproject.toml
│   ├── .env.example
│   │
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   │
│   │   ├── api/                 # API layer
│   │   │   ├── dependencies/    # DI
│   │   │   ├── middleware/      # Middleware
│   │   │   └── routes/          # Endpoints
│   │   │       ├── auth.py
│   │   │       ├── users.py
│   │   │       └── tasks.py
│   │   │
│   │   ├── core/                # Core config
│   │   │   ├── config.py        # Settings
│   │   │   ├── security.py      # JWT, passwords
│   │   │   └── database.py      # DB connection
│   │   │
│   │   ├── models/              # Data models
│   │   │   ├── domain/          # SQLModel (ORM)
│   │   │   └── schemas/         # Pydantic (API)
│   │   │
│   │   ├── services/            # Business logic
│   │   ├── repositories/        # Data access
│   │   └── utils/               # Utilities
│   │
│   ├── alembic/                 # Database migrations
│   └── tests/                   # Backend tests
│
├── CLAUDE.md                    # Root orchestration rules
├── .gitignore
├── README.md
├── docker-compose.yml           # Local dev (Phase III)
└── package.json                 # Root package.json (optional)
```

### Phase III+ Additions

```
evolution_todo/
├── ... (all Phase II structure)
│
├── chatbot/                     # AI Chatbot (Phase III)
│   ├── CLAUDE.md
│   ├── app/
│   │   ├── agent.py             # Main agent
│   │   ├── tools/               # MCP tools
│   │   └── prompts/             # System prompts
│   └── tests/
│
├── agents/                      # Claude Agents (Phase III)
│   ├── task-agent/
│   └── support-agent/
│
├── docker/                      # Containerization (Phase III)
│   ├── frontend.Dockerfile
│   ├── backend.Dockerfile
│   └── nginx.conf
│
└── specs/
    ├── ... (Phase II specs)
    ├── chatbot/                 # New specs
    │   ├── agent-design.md
    │   └── mcp-tools.md
    ├── agents/                  # New specs
    └── deployment/              # New specs
        ├── docker.md
        └── infrastructure.md
```

---

## Folder Creation Rules

### Rule 1: Folders Before Files

**Always create parent directories before files.**

```bash
# ✅ GOOD: Create folder first
mkdir -p specs/features
echo "# Task CRUD" > specs/features/task-crud.md

# ❌ BAD: File creation fails without folder
echo "# Task CRUD" > specs/features/task-crud.md  # Error: folder doesn't exist
```

**Implementation pattern**:
```typescript
// When writing files programmatically
import fs from 'fs'
import path from 'path'

function writeFile(filePath: string, content: string) {
  const dir = path.dirname(filePath)

  // Ensure directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  // Write file
  fs.writeFileSync(filePath, content)
}
```

### Rule 2: Every Major Folder Has a Purpose

**No "misc", "other", or "temp" folders in production structure.**

| Folder | Purpose | Contains |
|--------|---------|----------|
| `specs/` | Requirements | Markdown specs |
| `frontend/` | Next.js app | TypeScript, React |
| `backend/` | FastAPI app | Python code |
| `.spec-kit/` | Spec-Kit config | YAML config |
| `alembic/` | DB migrations | Migration files |
| `tests/` | Test files | Test code |

**If creating a new folder**, document its purpose in README.md or CLAUDE.md.

### Rule 3: CLAUDE.md at Multiple Levels

**Three levels of Claude Code instructions:**

```
evolution_todo/
├── CLAUDE.md           # Root: Orchestration, cross-cutting concerns
├── frontend/
│   └── CLAUDE.md       # Frontend: Next.js patterns, UI rules
└── backend/
    └── CLAUDE.md       # Backend: FastAPI patterns, API rules
```

**Root CLAUDE.md** (this skill):
- Monorepo structure
- Spec governance
- Cross-stack coordination

**Frontend CLAUDE.md**:
- Next.js App Router patterns
- Better Auth integration
- UI component standards

**Backend CLAUDE.md**:
- FastAPI architecture
- JWT validation
- Database persistence

### Rule 4: No Mixed Concerns

**Frontend and backend are completely separate.**

```
✅ GOOD:
frontend/lib/auth-client.ts      # Frontend auth
backend/app/core/security.py     # Backend auth

❌ BAD:
shared/auth.ts                   # ❌ Mixed concerns
frontend/api/users.py            # ❌ Backend in frontend
backend/components/Button.tsx    # ❌ Frontend in backend
```

**Exception**: Shared TypeScript types (Phase III+):
```
shared/
└── types/
    ├── api.ts          # API response types
    └── models.ts       # Data model types
```

---

## Spec Governance

### Spec Structure

**specs/ is organized by concern:**

```
specs/
├── overview.md          # What: Project goals, scope
├── architecture.md      # How: System design, tech stack
│
├── features/            # What: User-facing features
│   ├── task-crud.md
│   └── authentication.md
│
├── api/                 # How: Backend contract
│   └── rest-endpoints.md
│
├── database/            # How: Data persistence
│   └── schema.md
│
└── ui/                  # How: User interface
    ├── components.md
    └── pages.md
```

### Spec Dependency Flow

**Implementation follows spec hierarchy:**

```
specs/features/task-crud.md
    ↓ defines
specs/api/rest-endpoints.md (GET /tasks, POST /tasks, etc.)
    ↓ references
specs/database/schema.md (tasks table)
    ↓ guides
specs/ui/pages.md (task list page, task detail page)
    ↓ all feed into
Implementation (frontend/ + backend/)
```

### Spec-First Development Workflow

**Mandatory workflow:**

1. **Write Spec** → `specs/features/new-feature.md`
2. **Design API** → `specs/api/rest-endpoints.md` (if needed)
3. **Design Data** → `specs/database/schema.md` (if needed)
4. **Design UI** → `specs/ui/pages.md` (if needed)
5. **Implement Backend** → `backend/app/`
6. **Implement Frontend** → `frontend/app/`
7. **Test** → Validate against spec

**Never skip steps 1-4.**

### Enforcing Spec Governance

**Claude Code must verify:**

Before implementing any feature:
- [ ] Does `specs/features/<feature>.md` exist?
- [ ] Does it define requirements clearly?
- [ ] Are API endpoints specified in `specs/api/`?
- [ ] Is database schema specified in `specs/database/`?
- [ ] Are UI components specified in `specs/ui/`?

**If any spec is missing:**
```
STOP: Feature spec missing or incomplete.

Cannot proceed with implementation until specifications exist.

Required specs:
- specs/features/<feature>.md → Define feature requirements
- specs/api/rest-endpoints.md → Define API contract
- specs/database/schema.md → Define data model
- specs/ui/pages.md → Define UI structure

Please create these specs first, then implementation can begin.
```

---

## Cross-Stack Coordination

### When a Feature Changes

**A single feature touches multiple layers.**

**Example**: Add "task priority" feature

**Required updates:**

1. **Feature Spec** (`specs/features/task-crud.md`)
   ```markdown
   ## Priority Levels

   Tasks can have priority: low, medium, high, urgent.

   ### Requirements
   - Users can set priority when creating tasks
   - Users can change priority after creation
   - Task list can be filtered by priority
   - Default priority is "medium"
   ```

2. **Database Spec** (`specs/database/schema.md`)
   ```markdown
   ## tasks table

   | Column | Type | Constraints |
   |--------|------|-------------|
   | priority | VARCHAR(20) | NOT NULL, DEFAULT 'medium' |

   Valid values: 'low', 'medium', 'high', 'urgent'
   ```

3. **API Spec** (`specs/api/rest-endpoints.md`)
   ```markdown
   ### POST /api/v1/tasks

   Request:
   {
     "title": "string",
     "priority": "low" | "medium" | "high" | "urgent"
   }

   ### GET /api/v1/tasks?priority=high

   Filter by priority (optional query param)
   ```

4. **UI Spec** (`specs/ui/components.md`)
   ```markdown
   ## TaskForm

   - Priority dropdown: Low, Medium, High, Urgent
   - Default: Medium
   - Required field

   ## TaskList

   - Priority filter dropdown
   - Display priority badge on each task
   ```

5. **Implementation**: Database migration, backend code, frontend UI

**Coordination checklist:**
- [ ] Feature spec updated
- [ ] Database spec updated (if schema changes)
- [ ] API spec updated (if endpoints change)
- [ ] UI spec updated (if UI changes)
- [ ] All specs reviewed before implementation
- [ ] Implementation matches all specs

### API Contract Changes

**API is the interface between frontend and backend.**

**When API changes:**

1. **Update API Spec** (`specs/api/rest-endpoints.md`)
   - New endpoints
   - Changed request/response formats
   - New error codes

2. **Update Backend** (`backend/app/api/routes/`)
   - Implement new endpoints
   - Update request/response models
   - Update validation

3. **Update Frontend** (`frontend/lib/api-client.ts`)
   - Update API calls
   - Update TypeScript types
   - Update error handling

**Version API if breaking changes:**
```
Old: /api/v1/tasks
New: /api/v2/tasks (breaking changes)
```

### Database Schema Changes

**When schema changes:**

1. **Update Database Spec** (`specs/database/schema.md`)
   - New tables
   - New columns
   - Changed relationships

2. **Create Migration** (`backend/alembic/versions/`)
   ```bash
   alembic revision --autogenerate -m "Add task priority"
   ```

3. **Update Backend Models** (`backend/app/models/domain/`)
   - Update SQLModel classes
   - Update Pydantic schemas

4. **Update Frontend Types** (`frontend/lib/types.ts`)
   - Update TypeScript interfaces

---

## Monorepo Initialization

### Step 1: Create Repository

```bash
# Create directory
cd evolution_todo 

# Initialize git
git init

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
__pycache__/
*.pyc
.venv/
venv/

# Environment
.env
.env.local
.env.*.local

# Build outputs
.next/
dist/
build/
*.egg-info/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Database
*.sqlite
*.db
EOF
```

### Step 2: Initialize Specs

```bash
# Create specs structure
mkdir -p .spec-kit
mkdir -p specs/{features,api,database,ui}

# Spec-Kit config
cat > .spec-kit/config.yaml << 'EOF'
version: 1.0.0
project:
  name: hackathon-todo
  type: full-stack-monorepo
specs:
  root: specs/
  features: specs/features/
  api: specs/api/
  database: specs/database/
  ui: specs/ui/
EOF

# Create overview
cat > specs/overview.md << 'EOF'
# Hackathon TODO Application

## Overview

Full-stack task management application built with Next.js, FastAPI, Neon PostgreSQL, and Better Auth.

## Features

- Task CRUD operations
- User authentication
- User-specific task lists
- Task priorities and status

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Backend**: FastAPI, Python
- **Database**: Neon PostgreSQL, SQLModel
- **Authentication**: Better Auth with JWT
EOF

# Create architecture
cat > specs/architecture.md << 'EOF'
# System Architecture

## Overview

Monorepo structure with frontend and backend in single repository.

## Components

### Frontend (Next.js)
- App Router for file-based routing
- Server Components by default
- Client Components for interactivity
- Better Auth React hooks for authentication

### Backend (FastAPI)
- RESTful API
- JWT authentication
- SQLModel with Neon PostgreSQL
- User-scoped queries

## Communication

- Frontend calls backend via REST API
- JWT tokens in Authorization headers
- CORS configured for local development
EOF
```

### Step 3: Initialize Frontend

```bash
# Create Next.js app
npx create-next-app@latest frontend \
  --typescript \
  --eslint \
  --tailwind \
  --app \
  --src-dir false \
  --import-alias "@/*"

# Frontend CLAUDE.md
cat > frontend/CLAUDE.md << 'EOF'
# Frontend Claude Code Rules

## Framework
Next.js 15 App Router with TypeScript and Tailwind CSS

## Key Patterns
- Server Components by default
- Client Components only for interactivity
- Better Auth for authentication
- API calls to FastAPI backend

## Refer to Root Specs
Always reference ../specs/ for:
- Feature requirements
- API contracts
- UI specifications
EOF
```

### Step 4: Initialize Backend

```bash
# Create backend structure
mkdir -p backend/app/{api/{routes,dependencies,middleware},core,models/{domain,schemas},services,repositories}
mkdir -p backend/tests
mkdir -p backend/alembic

# Backend requirements
cat > backend/requirements.txt << 'EOF'
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlmodel==0.0.14
psycopg2-binary==2.9.9
alembic==1.13.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
pydantic-settings==2.1.0
EOF

# Backend CLAUDE.md
cat > backend/CLAUDE.md << 'EOF'
# Backend Claude Code Rules

## Framework
FastAPI with Python

## Key Patterns
- Stateless API design
- JWT authentication
- User-scoped queries
- SQLModel with Neon PostgreSQL

## Refer to Root Specs
Always reference ../specs/ for:
- Feature requirements
- API contracts
- Database schema
EOF
```

### Step 5: Root CLAUDE.md

```bash
cat > CLAUDE.md << 'EOF'
# Evolution TODO - Monorepo Claude Code Rules

## Structure
This is a Spec-Kit-driven monorepo containing:
- specs/ - Single source of truth
- frontend/ - Next.js application
- backend/ - FastAPI application

## Spec Governance
NO implementation without corresponding specs.

## Skills
Use these skills in order:
1. speckit-monorepo-orchestration
2. spec-driven-fullstack
3. nextjs-app-router / fastapi-backend / neon-postgresql-sqlmodel / better-auth-jwt

## Cross-Stack Coordination
When features change, update:
- Feature spec
- API spec (if endpoints change)
- Database spec (if schema changes)
- UI spec (if UI changes)
EOF
```

### Step 6: README

```bash
cat > README.md << 'EOF'
# Hackathon TODO

Full-stack task management application.

## Structure

```
evolution_todo/
├── specs/          # Specifications
├── frontend/       # Next.js
└── backend/        # FastAPI
```

## Getting Started

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Documentation

See specs/ for all specifications.
EOF
```

---

## Phase Progression

### Phase II Checklist

Before moving to Phase III, ensure:
- [ ] Frontend and backend fully functional
- [ ] User authentication working (Better Auth)
- [ ] Task CRUD implemented
- [ ] Database persistence (Neon PostgreSQL)
- [ ] All specs complete and up-to-date
- [ ] Tests passing
- [ ] Docker Compose for local dev (optional)

### Phase III Additions

**When adding chatbot:**

1. Create `specs/chatbot/agent-design.md`
2. Create `chatbot/` directory
3. Update root `CLAUDE.md` to reference chatbot
4. Implement chatbot with MCP tools

**When adding agents:**

1. Create `specs/agents/` directory
2. Create `agents/<agent-name>/` directories
3. Define agent specifications
4. Implement agents

**When containerizing:**

1. Create `specs/deployment/docker.md`
2. Create `docker/` directory with Dockerfiles
3. Update `docker-compose.yml`
4. Configure production deployment

---

## Navigation Patterns

### Finding Specifications

**Always start with specs when working on features.**

```bash
# Find feature spec
cat specs/features/task-crud.md

# Check API contract
cat specs/api/rest-endpoints.md

# Check database schema
cat specs/database/schema.md

# Check UI design
cat specs/ui/pages.md
```

### Cross-Referencing

**Link between specs and implementation:**

**In spec** (`specs/features/task-crud.md`):
```markdown
## Implementation

- Frontend: `frontend/app/tasks/`
- Backend: `backend/app/api/routes/tasks.py`
- Database: `backend/app/models/domain/task.py`
```

**In code** (`backend/app/api/routes/tasks.py`):
```python
"""
Task API endpoints.

Specification: specs/features/task-crud.md
API Contract: specs/api/rest-endpoints.md
"""
```

---

## Best Practices Summary

### Monorepo Organization

✅ **DO**:
- Keep all code in single repository
- Maintain clear folder boundaries
- Document structure in README.md
- Use CLAUDE.md at multiple levels
- Create folders before files

❌ **DON'T**:
- Split into multiple repositories
- Mix frontend and backend code
- Skip folder structure planning
- Forget to create parent directories

### Spec Governance

✅ **DO**:
- Write specs before implementation
- Keep specs up-to-date with changes
- Reference specs in code comments
- Review specs during PR reviews

❌ **DON'T**:
- Implement without specs
- Let specs become outdated
- Skip spec updates when changing features

### Cross-Stack Coordination

✅ **DO**:
- Update all affected specs together
- Validate API contracts match frontend/backend
- Test integration after changes
- Document breaking changes

❌ **DON'T**:
- Change API without updating specs
- Change database without migration
- Skip frontend updates when backend changes

---

## Quick Reference

### Monorepo Structure

```
evolution_todo/
├── .spec-kit/       # Config
├── specs/           # Specifications
├── frontend/        # Next.js
├── backend/         # FastAPI
└── CLAUDE.md        # Orchestration
```

### Spec Organization

```
specs/
├── overview.md      # Project overview
├── architecture.md  # System design
├── features/        # Feature specs
├── api/             # API contracts
├── database/        # DB schema
└── ui/              # UI design
```

### Development Workflow

```
1. Write spec → specs/features/
2. Design API → specs/api/
3. Design data → specs/database/
4. Design UI → specs/ui/
5. Implement backend → backend/
6. Implement frontend → frontend/
7. Test integration
```

---

## References

See `references/` for detailed documentation:
- `initialization-guide.md` - Step-by-step monorepo setup
- `coordination-patterns.md` - Cross-stack change management
- `phase-progression.md` - Evolution from Phase II to Phase III+
