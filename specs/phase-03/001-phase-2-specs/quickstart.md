# Quickstart Guide: Evolution Todo Phase II

**Feature**: 001-phase-2-specs
**Date**: 2026-01-07
**Audience**: Developers onboarding to the Evolution Todo project

## Overview

This guide helps you set up the Evolution Todo development environment and understand the project structure. Follow these steps to go from zero to running the full-stack application locally.

**Time to complete**: ~30 minutes

---

## Prerequisites

Before starting, ensure you have the following installed:

### Required Software

| Tool | Version | Purpose | Installation |
|------|---------|---------|--------------|
| **Node.js** | 18.0+ | Frontend runtime | [nodejs.org](https://nodejs.org) |
| **Python** | 3.11+ | Backend runtime | [python.org](https://python.org) |
| **Git** | Latest | Version control | [git-scm.com](https://git-scm.com) |
| **Docker** | Latest | Local PostgreSQL (optional) | [docker.com](https://docker.com) |

### Verify Installations

```bash
node --version    # Should show v18.0.0 or higher
npm --version     # Should show 9.0.0 or higher
python --version  # Should show 3.11.0 or higher
git --version     # Any recent version
docker --version  # Any recent version (optional)
```

---

## Project Structure Overview

```text
evolution_todo/
├── .spec-kit/              # Spec-Kit configuration
├── .specify/               # Templates and scripts
│   └── memory/
│       └── constitution.md # Project principles
├── specs/                  # Single source of truth
│   ├── 001-phase-2-specs/  # This implementation plan
│   ├── overview.md
│   ├── architecture.md
│   ├── features/
│   ├── api/
│   ├── database/
│   └── ui/
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # Reusable UI components
│   │   └── lib/           # Utilities and API client
│   ├── package.json
│   └── tsconfig.json
├── backend/                # FastAPI application
│   ├── src/
│   │   ├── models/        # SQLModel database models
│   │   ├── services/      # Business logic
│   │   ├── api/           # Route handlers
│   │   └── db/            # Database connection
│   ├── tests/
│   ├── alembic/           # Database migrations
│   └── requirements.txt
├── history/
│   ├── prompts/           # Prompt History Records
│   └── adr/               # Architecture Decision Records
└── CLAUDE.md              # Root governance file
```

---

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-org/evolution-todo.git
cd evolution_todo

# Check current branch
git branch
# Should show: 001-phase-2-specs or master
```

---

## Step 2: Set Up Database (Neon PostgreSQL)

### Option A: Use Neon (Recommended for Phase II)

1. **Create a Neon account**: Visit [neon.tech](https://neon.tech) and sign up
2. **Create a new project**: Name it "evolution-todo-dev"
3. **Copy connection string**: It will look like:
   ```
   postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. **Save for next step**

### Option B: Use Local PostgreSQL (Docker)

```bash
# Create a docker-compose.yml in the project root
cat > docker-compose.yml <<EOF
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: todouser
      POSTGRES_PASSWORD: todopass
      POSTGRES_DB: evolution_todo_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
EOF

# Start PostgreSQL
docker-compose up -d

# Connection string will be:
# postgresql://todouser:todopass@localhost:5432/evolution_todo_dev
```

---

## Step 3: Set Up Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env <<EOF
# Database
DATABASE_URL=postgresql://user:password@host/database  # Replace with your connection string

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Environment
ENVIRONMENT=development
DEBUG=True

# CORS (allow frontend)
CORS_ORIGINS=http://localhost:3000
EOF

# Run database migrations
alembic upgrade head

# Verify migrations worked
alembic current
# Should show: <revision_id> (head)

# Run backend server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend should now be running at**: `http://localhost:8000`

**Test it**:
- Open browser: `http://localhost:8000/docs` (FastAPI auto-generated docs)
- You should see the OpenAPI/Swagger UI

---

## Step 4: Set Up Frontend

Open a **new terminal** (keep backend running):

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local <<EOF
# API endpoint
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Environment
NODE_ENV=development
EOF

# Run development server
npm run dev
```

**Frontend should now be running at**: `http://localhost:3000`

**Test it**:
- Open browser: `http://localhost:3000`
- You should see the landing page

---

## Step 5: Verify Full Stack

### Test Authentication Flow

1. **Navigate to**: `http://localhost:3000`
2. **Click**: "Get Started" or "Sign Up"
3. **Register**:
   - Email: `test@example.com`
   - Password: `password123`
4. **Verify**:
   - Should redirect to login page with success message
5. **Login**:
   - Email: `test@example.com`
   - Password: `password123`
6. **Verify**:
   - Should redirect to dashboard
   - Should see empty state: "No tasks yet"

### Test Task Creation

1. **On Dashboard**: Click "Add Task" button
2. **Enter**: "My first task"
3. **Click**: "Create"
4. **Verify**:
   - Task appears in list
   - Task has checkbox, title, edit/delete buttons

### Test API Directly

```bash
# Register a user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "api-test@example.com", "password": "password123"}'

# Should return 201 Created with user object

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "api-test@example.com", "password": "password123"}' \
  -c cookies.txt

# Should return 200 OK and save cookie to cookies.txt

# Create a task (using saved cookie)
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title": "API test task", "description": "Created via curl"}'

# Should return 201 Created with task object

# Get all tasks
curl -X GET http://localhost:8000/api/tasks \
  -b cookies.txt

# Should return task list
```

---

## Step 6: Run Tests

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/unit/test_auth.py

# Run integration tests only
pytest tests/integration/
```

### Frontend Tests

```bash
cd frontend

# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## Common Issues & Solutions

### Issue 1: Database Connection Error

**Error**: `psycopg2.OperationalError: could not connect to server`

**Solution**:
1. Verify DATABASE_URL in `.env` is correct
2. Check if PostgreSQL is running: `docker-compose ps` (if using Docker)
3. Test connection: `psql <DATABASE_URL>`
4. Verify firewall allows connection to Neon (if using Neon)

### Issue 2: Alembic Migration Fails

**Error**: `sqlalchemy.exc.ProgrammingError: relation "users" already exists`

**Solution**:
```bash
# Reset database (WARNING: deletes all data)
alembic downgrade base
alembic upgrade head

# Or drop and recreate database
dropdb evolution_todo_dev
createdb evolution_todo_dev
alembic upgrade head
```

### Issue 3: Frontend Can't Connect to Backend

**Error**: `Network Error` or `CORS policy` in browser console

**Solution**:
1. Verify backend is running: `curl http://localhost:8000/docs`
2. Check CORS_ORIGINS in backend `.env` includes `http://localhost:3000`
3. Verify NEXT_PUBLIC_API_URL in frontend `.env.local` is `http://localhost:8000/api`
4. Restart both servers after changing `.env` files

### Issue 4: JWT Token Invalid

**Error**: `401 Unauthorized` on protected routes

**Solution**:
1. Verify JWT_SECRET matches between backend startup and current `.env`
2. Clear browser cookies: DevTools → Application → Cookies → Delete `auth_token`
3. Login again to get new token
4. Check token expiration (default 24 hours)

### Issue 5: Port Already in Use

**Error**: `Address already in use: 8000` or `3000`

**Solution**:
```bash
# Find process using port
# On Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# On macOS/Linux:
lsof -ti:8000 | xargs kill -9

# Or use different ports
uvicorn src.main:app --reload --port 8001
npm run dev -- -p 3001
```

---

## Development Workflow

### Daily Development

```bash
# 1. Pull latest changes
git pull origin 001-phase-2-specs

# 2. Start backend (Terminal 1)
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn src.main:app --reload

# 3. Start frontend (Terminal 2)
cd frontend
npm run dev

# 4. Make changes, test, commit
git add .
git commit -m "feat: add new feature"
git push
```

### Creating a New Feature

1. **Read the spec**: Check `specs/features/<feature-name>.md`
2. **Plan implementation**: Run `/sp.plan <feature-name>`
3. **Generate tasks**: Run `/sp.tasks <feature-name>`
4. **Implement**: Follow tasks.md step-by-step
5. **Test**: Write tests before marking tasks complete
6. **Commit**: Use conventional commit messages

### Database Schema Changes

```bash
cd backend

# 1. Modify SQLModel models in src/models/

# 2. Generate migration
alembic revision --autogenerate -m "add priority to tasks"

# 3. Review generated migration in alembic/versions/

# 4. Apply migration
alembic upgrade head

# 5. Verify
alembic current
```

### Testing Changes

```bash
# Backend: Run tests after any changes
cd backend
pytest

# Frontend: Run tests after component changes
cd frontend
npm run test

# Manual testing:
# 1. Register new user
# 2. Create tasks with various inputs
# 3. Test edge cases (empty fields, long text, etc.)
# 4. Test error handling (network failures, invalid data)
```

---

## Project Commands Reference

### Backend Commands

```bash
# Development
uvicorn src.main:app --reload              # Start dev server
uvicorn src.main:app --reload --port 8001  # Start on different port

# Testing
pytest                                      # Run all tests
pytest tests/unit/                          # Run unit tests only
pytest tests/integration/                   # Run integration tests only
pytest -v                                   # Verbose output
pytest -k "test_auth"                       # Run tests matching pattern
pytest --cov=src                            # Run with coverage

# Database
alembic upgrade head                        # Apply all migrations
alembic downgrade -1                        # Rollback one migration
alembic current                             # Show current version
alembic history                             # Show migration history
alembic revision -m "description"           # Create empty migration
alembic revision --autogenerate -m "desc"   # Auto-generate migration

# Dependencies
pip install -r requirements.txt             # Install dependencies
pip freeze > requirements.txt               # Update requirements
```

### Frontend Commands

```bash
# Development
npm run dev                                 # Start dev server
npm run dev -- -p 3001                      # Start on different port
npm run build                               # Build for production
npm run start                               # Start production server

# Testing
npm run test                                # Run tests
npm run test:watch                          # Run tests in watch mode
npm run test:coverage                       # Run with coverage

# Linting/Formatting
npm run lint                                # Run ESLint
npm run lint:fix                            # Auto-fix linting issues
npm run format                              # Format with Prettier

# Dependencies
npm install                                 # Install dependencies
npm install <package>                       # Add dependency
npm install -D <package>                    # Add dev dependency
npm update                                  # Update dependencies
```

---

## Environment Variables Reference

### Backend (.env)

```bash
# Required
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=your-secret-key-min-32-chars

# Optional
ENVIRONMENT=development                     # development | production
DEBUG=True                                  # Enable debug mode
CORS_ORIGINS=http://localhost:3000         # Comma-separated allowed origins
JWT_EXPIRATION=86400                        # Token lifetime in seconds (24h)
LOG_LEVEL=INFO                              # DEBUG | INFO | WARNING | ERROR
```

### Frontend (.env.local)

```bash
# Required
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Optional
NODE_ENV=development                        # development | production
NEXT_PUBLIC_APP_NAME=Evolution Todo        # App display name
NEXT_PUBLIC_ENABLE_ANALYTICS=false         # Enable analytics (Phase III)
```

---

## Key Files to Know

### Specifications (Read these first!)

- `specs/overview.md` - Project goals and Phase II scope
- `specs/architecture.md` - System design and data flow
- `specs/features/authentication.md` - Auth requirements
- `specs/features/task-crud.md` - Task management requirements
- `specs/api/rest-endpoints.md` - API contract
- `specs/database/schema.md` - Database design
- `specs/ui/pages.md` - Frontend page structure
- `specs/ui/components.md` - Reusable component specs

### Governance

- `CLAUDE.md` - Root agent rules and workflow
- `.specify/memory/constitution.md` - Project principles
- `frontend/CLAUDE.md` - Frontend-specific rules
- `backend/CLAUDE.md` - Backend-specific rules

### Implementation

- `backend/src/main.py` - FastAPI app entry point
- `backend/src/models/` - Database models
- `backend/src/api/` - API route handlers
- `frontend/src/app/` - Next.js pages
- `frontend/src/components/` - UI components
- `frontend/src/lib/api.ts` - API client

---

## Next Steps

After completing this quickstart:

1. **Read the constitution**: `.specify/memory/constitution.md`
2. **Review specifications**: Start with `specs/overview.md`
3. **Explore the codebase**: Follow the project structure above
4. **Pick a task**: Check `specs/001-phase-2-specs/tasks.md` (after running `/sp.tasks`)
5. **Start coding**: Follow the development workflow
6. **Ask questions**: Refer to specs first, then ask team

---

## Additional Resources

### Documentation

- **FastAPI**: [fastapi.tiangolo.com](https://fastapi.tiangolo.com)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **SQLModel**: [sqlmodel.tiangolo.com](https://sqlmodel.tiangolo.com)
- **TailwindCSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Neon**: [neon.tech/docs](https://neon.tech/docs)

### Project-Specific

- **OpenAPI Contract**: `specs/001-phase-2-specs/contracts/openapi.yaml`
- **Data Model**: `specs/001-phase-2-specs/data-model.md`
- **Research**: `specs/001-phase-2-specs/research.md`

### Tools

- **API Testing**: [Postman](https://postman.com) or [Insomnia](https://insomnia.rest)
- **Database GUI**: [pgAdmin](https://pgadmin.org) or [DBeaver](https://dbeaver.io)
- **Git GUI**: [GitHub Desktop](https://desktop.github.com) or [GitKraken](https://gitkraken.com)

---

## Troubleshooting Checklist

Before asking for help, verify:

- [ ] All prerequisites installed with correct versions
- [ ] Database connection string is correct
- [ ] `.env` files exist in backend and frontend
- [ ] Migrations ran successfully (`alembic current`)
- [ ] Backend is running (`curl http://localhost:8000/docs`)
- [ ] Frontend is running (`curl http://localhost:3000`)
- [ ] No port conflicts (8000, 3000 available)
- [ ] Virtual environment activated for Python
- [ ] Node modules installed (`node_modules/` exists)
- [ ] Recent git pull completed
- [ ] No merge conflicts in working directory

---

**Quickstart Complete!** You're ready to start developing on Evolution Todo Phase II.

**Questions?** Refer to the specifications in `specs/` or check `CLAUDE.md` for governance rules.
