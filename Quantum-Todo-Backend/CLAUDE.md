# Backend Application - CLAUDE.md

## Application Identity
**Name**: Evolution Todo Backend
**Type**: FastAPI with SQLModel
**Phase**: II - Initialization

## Purpose
This folder contains the FastAPI backend application for Evolution Todo. During Phase II, this folder serves as a placeholder for future implementation.

## Current State
**Status**: Empty - No implementation code yet
**Rationale**: Following spec-first workflow. Implementation begins after specifications are complete.

## Spec-Driven Workflow

### Phase II (Current)
1. All features are specified in `../specs/`
2. Architecture decisions documented
3. API contracts defined in `../specs/api/`
4. Database schema planned in `../specs/database/`
5. **No code generation yet**

### Phase III (Future)
1. Generate FastAPI application structure
2. Implement SQLModel models per schema spec
3. Create API endpoints per contract spec
4. Add authentication with Better-Auth
5. Configure Neon PostgreSQL connection
6. Deploy and test

## Constraints

### During Phase II
- Do NOT create FastAPI files
- Do NOT install dependencies
- Do NOT generate models or endpoints
- Do NOT write application code
- Do NOT configure database connections

### Source of Truth
All business logic, features, and requirements are defined in:
- `../specs/overview.md`
- `../specs/architecture.md`
- `../specs/api/rest-endpoints.md`
- `../specs/database/schema.md`
- `../specs/features/`

## Technology Stack (Planned)
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **ORM**: SQLModel
- **Database**: Neon PostgreSQL
- **Migrations**: Alembic
- **Auth**: Better-Auth with JWT
- **Validation**: Pydantic

## Integration Points
- **Database**: Neon PostgreSQL (connection string in `.env`)
- **Frontend**: CORS configured for `http://localhost:3000` (development)
- **Authentication**: JWT tokens, HTTP-only cookie strategy
- **Environment**: `.env` (not created yet)

## Commands (Not yet available)
```bash
# Will be available in Phase III
pip install -r requirements.txt
uvicorn main:app --reload
alembic upgrade head
pytest
```

## API Structure (Planned)
```
backend/
├── main.py              # FastAPI app entry
├── models/              # SQLModel models
├── routers/             # API endpoints
├── schemas/             # Pydantic schemas
├── services/            # Business logic
├── db/                  # Database config
└── auth/                # Authentication
```

## Next Steps
1. Complete feature specifications in `../specs/features/`
2. Finalize API contracts in `../specs/api/rest-endpoints.md`
3. Finalize database schema in `../specs/database/schema.md`
4. Run `/sp.plan <feature-name>` to create architecture
5. Run `/sp.tasks <feature-name>` to generate implementation tasks
6. Run `/sp.implement <feature-name>` to generate code

## Governance
- This file tracks backend-specific rules
- Root `../CLAUDE.md` contains monorepo-wide rules
- Both files must be followed during implementation

## Security Notes
- No secrets in code
- Use environment variables for all configuration
- Password hashing with bcrypt/argon2
- JWT secret rotation strategy (to be specified)
- Input validation at API boundaries
- SQL injection prevention via SQLModel/Pydantic
