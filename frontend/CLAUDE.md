# Frontend Application - CLAUDE.md

## Application Identity
**Name**: Evolution Todo Frontend
**Type**: Next.js 15+ with App Router
**Phase**: II - Initialization

## Purpose
This folder contains the Next.js frontend application for Evolution Todo. During Phase II, this folder serves as a placeholder for future implementation.

## Current State
**Status**: Empty - No implementation code yet
**Rationale**: Following spec-first workflow. Implementation begins after specifications are complete.

## Spec-Driven Workflow

### Phase II (Current)
1. All features are specified in `../specs/`
2. Architecture decisions documented
3. API contracts defined
4. UI components planned
5. **No code generation yet**

### Phase III (Future)
1. Generate Next.js application structure
2. Implement components per spec
3. Integrate with backend API
4. Add authentication flow
5. Deploy and test

## Constraints

### During Phase II
- Do NOT create Next.js files
- Do NOT install dependencies
- Do NOT generate components
- Do NOT write application code

### Source of Truth
All business logic, features, and requirements are defined in:
- `../specs/overview.md`
- `../specs/architecture.md`
- `../specs/features/`
- `../specs/ui/`

## Technology Stack (Planned)
- **Framework**: Next.js 15+
- **Language**: TypeScript
- **Styling**: TailwindCSS (to be specified)
- **State**: React hooks + Context
- **Auth**: Better-Auth client integration

## Integration Points
- **Backend API**: `http://localhost:8000/api` (development)
- **Authentication**: JWT tokens via HTTP-only cookies
- **Environment**: `.env.local` (not created yet)

## Commands (Not yet available)
```bash
# Will be available in Phase III
npm install
npm run dev
npm run build
npm run test
```

## Next Steps
1. Complete feature specifications in `../specs/features/`
2. Run `/sp.plan <feature-name>` to create architecture
3. Run `/sp.tasks <feature-name>` to generate implementation tasks
4. Run `/sp.implement <feature-name>` to generate code

## Governance
- This file tracks frontend-specific rules
- Root `../CLAUDE.md` contains monorepo-wide rules
- Both files must be followed during implementation
