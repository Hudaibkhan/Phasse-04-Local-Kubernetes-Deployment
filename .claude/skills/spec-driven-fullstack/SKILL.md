---
name: spec-driven-fullstack
description: |
  Enforces strict spec-driven development workflow for full-stack monorepo projects.
  This skill should be used when planning or implementing features in a full-stack
  application (Next.js, FastAPI, databases, authentication) to ensure all work follows
  the spec → plan → implementation → verification workflow. Never allows code changes
  without corresponding specifications.
---

# Spec-Driven Full-Stack Integration

Enforce rigorous spec-driven development for full-stack monorepo projects.

## What This Skill Does

- **Prevents premature implementation**: Blocks code changes without valid specifications
- **Enforces workflow phases**: spec → plan → tasks → implementation → verification
- **Maintains consistency**: Ensures frontend, backend, API, database, and auth stay aligned with specs
- **Validates completeness**: Checks that specs, plans, and tasks exist before implementation
- **Prioritizes correctness**: Favors clarity and traceability over speed

## What This Skill Does NOT Do

- Create specifications (use `/sp.specify` for that)
- Generate implementation plans (use `/sp.plan` for that)
- Write code directly (enforces that YOU follow the process)
- Bypass or skip workflow phases

---

## Before Any Work

**CRITICAL RULE**: NO code is written or modified unless a relevant specification exists.

### Workflow Gate Enforcement

Before taking ANY action, verify:

| Phase | Required Artifacts | Command to Create |
|-------|-------------------|-------------------|
| **Specification** | `specs/<feature>/spec.md` exists and complete | `/sp.specify <description>` |
| **Planning** | `specs/<feature>/plan.md` exists and complete | `/sp.plan` |
| **Task Breakdown** | `specs/<feature>/tasks.md` exists and complete | `/sp.tasks` |
| **Implementation** | All above artifacts validated | `/sp.implement` |

### Validation Checklist

Before proceeding with any request, run this check:

```
1. Identify what the user is asking for:
   - New feature? → Requires spec.md
   - Code modification? → Requires spec.md + plan.md
   - Implementation? → Requires spec.md + plan.md + tasks.md
   - Bug fix? → Requires spec update + plan adjustment

2. Check for required artifacts:
   - Run: `.specify/scripts/powershell/check-prerequisites.ps1 -Json`
   - Parse output for: FEATURE_DIR, AVAILABLE_DOCS, BRANCH
   - Verify required files exist based on request type

3. If artifacts missing:
   - STOP immediately
   - Report: "Missing required artifacts: [list]"
   - Guide: "Please run: [appropriate commands]"
   - DO NOT proceed until user confirms completion

4. If artifacts exist but incomplete:
   - STOP immediately
   - Report specific gaps or [NEEDS CLARIFICATION] markers
   - Guide user to complete missing sections
   - DO NOT proceed until artifacts are complete

5. Only if all checks pass:
   - Proceed with the requested work
   - Reference specs/plan/tasks throughout implementation
   - Validate against specifications continuously
```

---

## Full-Stack Scope

This skill applies to:

### Frontend (Next.js)
- App Router structure (`app/` directory)
- Server components and client components
- Server actions and API routes
- Middleware and authentication flows
- UI components and layouts

### Backend (FastAPI)
- API endpoints and route handlers
- Business logic and services
- Data validation and serialization
- Middleware and dependencies

### Database Layer
- Schema definitions and migrations
- Entity relationships and constraints
- Query patterns and optimization
- Connection management

### Authentication & Authorization
- User authentication flows
- Session management
- Role-based access control (RBAC)
- Protected routes and endpoints

### Cross-Cutting Concerns
- API contracts and OpenAPI specs
- Error handling patterns
- Logging and monitoring
- Testing strategies (unit, integration, e2e)

---

## Workflow Enforcement

### Phase 1: Specification (Required First)

**When**: User requests ANY new feature or significant change

**Action**: Verify `specs/<feature>/spec.md` exists and is complete

**If missing**:
```
STOP: No specification found for this feature.

A specification defines WHAT users need and WHY, without implementation details.

To create one, run:
  /sp.specify <feature description>

Example:
  /sp.specify Add user authentication with email/password and OAuth providers

Once the spec is complete, we can proceed to planning.
```

**If incomplete**:
```
STOP: Specification exists but has gaps:
- [NEEDS CLARIFICATION] markers present
- Missing required sections: [list]
- Success criteria not measurable

Please complete the specification first:
  /sp.clarify

Or manually update: specs/<feature>/spec.md
```

**Validation criteria** for complete spec:
- [ ] No [NEEDS CLARIFICATION] markers
- [ ] All mandatory sections filled
- [ ] Functional requirements are testable
- [ ] Success criteria are measurable and technology-agnostic
- [ ] User scenarios cover primary flows
- [ ] Scope clearly bounded

### Phase 2: Planning (Required Before Implementation)

**When**: Specification complete, ready to design technical approach

**Action**: Verify `specs/<feature>/plan.md` exists and is complete

**If missing**:
```
STOP: No implementation plan found for this feature.

A plan defines HOW to implement the spec: architecture, tech stack,
file structure, API contracts, data models, and dependencies.

To create one, run:
  /sp.plan

This will generate:
- plan.md (architecture decisions)
- data-model.md (entities and relationships)
- contracts/ (API specifications)
- research.md (technology decisions)
- quickstart.md (integration guide)

Once the plan is complete, we can create tasks.
```

**If incomplete**:
```
STOP: Implementation plan exists but has gaps:
- NEEDS CLARIFICATION markers present
- Missing required sections: [list]
- Tech stack not specified
- File structure undefined

Please complete the plan manually or re-run:
  /sp.plan
```

**Validation criteria** for complete plan:
- [ ] Tech stack clearly defined
- [ ] File structure specified
- [ ] API contracts generated (if applicable)
- [ ] Data model defined (if applicable)
- [ ] Dependencies identified
- [ ] Constitution compliance verified
- [ ] No unresolved NEEDS CLARIFICATION

### Phase 3: Task Breakdown (Required Before Implementation)

**When**: Plan complete, ready to implement

**Action**: Verify `specs/<feature>/tasks.md` exists and is complete

**If missing**:
```
STOP: No task breakdown found for this feature.

Tasks define the step-by-step implementation plan with dependencies,
test requirements, and validation criteria.

To create one, run:
  /sp.tasks

This will generate a detailed task list organized by phases:
- Setup (project structure, dependencies)
- Tests (TDD approach)
- Core (models, services, endpoints)
- Integration (database, auth, external services)
- Polish (optimization, documentation)

Once tasks are complete, we can implement.
```

**If incomplete**:
```
STOP: Task breakdown exists but has gaps:
- Missing task phases
- No test tasks defined
- Dependencies unclear
- File paths not specified

Please complete tasks manually or re-run:
  /sp.tasks
```

**Validation criteria** for complete tasks:
- [ ] All phases defined (Setup, Tests, Core, Integration, Polish)
- [ ] Dependencies clearly marked
- [ ] Test tasks before implementation tasks (TDD)
- [ ] File paths specified for each task
- [ ] Acceptance criteria defined
- [ ] Parallel tasks marked [P]

### Phase 4: Implementation (Only After All Above Complete)

**When**: Spec, plan, and tasks all complete and validated

**Action**: Execute implementation following task order

```
✓ All prerequisites validated. Beginning implementation.

Executing task plan from: specs/<feature>/tasks.md
Following architecture from: specs/<feature>/plan.md
Validating against spec: specs/<feature>/spec.md

Implementation approach:
1. Setup phase: Initialize structure
2. Test phase: Write failing tests (TDD)
3. Core phase: Implement to pass tests
4. Integration phase: Connect systems
5. Polish phase: Optimize and document

Progress will be tracked in tasks.md with [X] markers.
```

**During implementation**, continuously:
- Reference specs to ensure correctness
- Follow plan's architectural decisions
- Execute tasks in dependency order
- Mark completed tasks in tasks.md
- Validate against acceptance criteria
- Run tests after each phase

---

## Strict Enforcement Rules

### Rule 1: Never Invent Requirements

```
❌ Bad:
  User: "Add authentication"
  You: *assumes OAuth2, JWT tokens, Redis sessions*

✅ Good:
  User: "Add authentication"
  You: "Let me check for the authentication specification..."

  → If spec exists: Follow it exactly
  → If spec missing: Request spec creation via /sp.specify
  → If spec unclear: Request clarification
```

### Rule 2: Never Bypass Specs

```
❌ Bad:
  User: "Just quickly add a delete button"
  You: *adds button, endpoint, database query*

✅ Good:
  User: "Just quickly add a delete button"
  You: "Even for a 'quick' change, I need a spec to ensure:
        - Proper permission checks
        - Confirmation flow
        - Cascade behavior
        - Audit logging

        Would you like to create a minimal spec? It'll take 2 minutes
        and prevent bugs. Run: /sp.specify Add delete functionality"
```

### Rule 3: Never Skip Workflow Phases

```
❌ Bad:
  User: "Implement user registration"
  You: *has spec but no plan* "I'll start coding..."

✅ Good:
  User: "Implement user registration"
  You: *checks prerequisites*
       "I see we have spec.md but missing plan.md.

        Before implementing, I need to design:
        - Database schema
        - API contracts
        - Validation rules
        - Error handling

        Run: /sp.plan"
```

### Rule 4: If Specs Are Missing or Unclear, STOP

```
When you encounter:
- Missing spec.md → Request: /sp.specify <description>
- [NEEDS CLARIFICATION] → Request: /sp.clarify
- Missing plan.md → Request: /sp.plan
- Missing tasks.md → Request: /sp.tasks
- Incomplete sections → Report specific gaps, request completion

NEVER proceed with assumptions. ALWAYS verify with user.
```

---

## Working Across the Full Stack

### Frontend Work (Next.js)

**Always check spec for**:
- User flows and interaction patterns
- Data requirements and API endpoints
- Authentication requirements
- Responsive behavior
- Accessibility requirements

**Always check plan for**:
- Component structure
- State management approach
- Routing strategy (App Router patterns)
- Server vs Client component decisions
- API integration patterns

**Common spec validations**:
```typescript
// ✓ Spec says: "Users can filter by status"
// ✓ Plan says: Use URL search params, server components
// ✓ Implement exactly that:

export default async function TasksPage({
  searchParams
}: {
  searchParams: { status?: string }
}) {
  const tasks = await getTasks({ status: searchParams.status })
  return <TaskList tasks={tasks} />
}
```

### Backend Work (FastAPI)

**Always check spec for**:
- Business rules and validation
- Data transformations
- External integrations
- Performance requirements
- Error handling needs

**Always check plan for**:
- API contract (OpenAPI schema)
- Service layer structure
- Database interaction patterns
- Authentication/authorization approach

**Common spec validations**:
```python
# ✓ Spec says: "Users with 'admin' role can delete any task"
# ✓ Spec says: "Regular users can only delete their own tasks"
# ✓ Plan says: Use dependency injection for auth
# ✓ Implement exactly that:

@router.delete("/tasks/{task_id}")
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")

    # Enforce spec requirement
    if current_user.role != "admin" and task.user_id != current_user.id:
        raise HTTPException(403, "Not authorized to delete this task")

    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}
```

### Database Work

**Always check spec for**:
- Entity definitions
- Relationships
- Data constraints
- Privacy requirements

**Always check plan for**:
- Schema design (data-model.md)
- Migration strategy
- Indexing requirements
- Connection pooling

### Authentication Work

**Always check spec for**:
- Supported auth methods
- Session duration
- Password requirements
- OAuth provider requirements

**Always check plan for**:
- Auth library choice (e.g., Better Auth)
- Session storage approach
- Token strategy
- Protected route patterns

---

## Handling Special Cases

### Bug Fixes

```
User: "Fix the bug where users can delete other users' tasks"

1. Locate the relevant spec section
   → Check: specs/<feature>/spec.md for authorization rules

2. Verify spec covers this case
   → If yes: Bug violates spec, fix to match spec
   → If no: Spec is incomplete, must update spec first

3. Check if plan addresses this
   → If yes: Implementation doesn't follow plan, fix it
   → If no: Plan needs authorization design, update plan

4. Fix and validate against spec
```

### "Quick" Changes

```
User: "Can you just quickly change X?"

1. Assess impact
   → Single line? Still check spec alignment
   → Multiple files? Requires full workflow

2. Check spec coverage
   → If covered: Make change if it aligns
   → If not covered: Even "quick" changes need specs

3. Update documentation
   → Update relevant task as [X] if from task list
   → Add PHR for traceability
```

### Exploratory Work

```
User: "I'm not sure what I want yet, can we explore?"

✓ This is acceptable! Respond:

"Exploratory work is fine. We can:

1. Prototype without specs (clearly marked as throwaway)
2. Document findings as we go
3. Create proper spec from learnings
4. Re-implement following the workflow

Which approach would you prefer?

Note: Any exploratory code won't be merged until
we create proper specs and follow the workflow."
```

---

## Verification & Validation

### Continuous Validation During Implementation

At each task completion:

```
1. Check spec alignment
   - Does this meet the functional requirement?
   - Does this match the user scenario?
   - Does this satisfy acceptance criteria?

2. Check plan alignment
   - Does this follow the architecture?
   - Does this match the file structure?
   - Does this use the specified tech stack?

3. Check task alignment
   - Is this the correct implementation order?
   - Are dependencies satisfied?
   - Are tests passing?

4. Mark task complete in tasks.md with [X]

5. Report progress to user
```

### Final Validation Before Completion

```
1. All tasks marked [X] in tasks.md
2. All tests passing
3. Spec requirements satisfied
4. Plan architecture followed
5. No unplanned code changes
6. Documentation updated
7. PHR created for traceability
```

---

## Integration with Existing Commands

This skill enhances (not replaces) existing commands:

| Command | This Skill's Role |
|---------|------------------|
| `/sp.specify` | Validates that spec is complete before allowing plan |
| `/sp.plan` | Validates that plan covers all spec requirements |
| `/sp.tasks` | Validates that tasks cover all plan elements |
| `/sp.implement` | Enforces all prerequisites before implementation |
| `/sp.clarify` | Invoked when spec has [NEEDS CLARIFICATION] |

---

## Error Messages & Guidance

### Missing Spec

```
🛑 STOP: Spec-Driven Workflow Violation

No specification found for: [feature/change]

Spec-driven development requires specifications BEFORE code.
This prevents:
- Misunderstood requirements
- Incomplete implementations
- Architecture inconsistencies
- Wasted development time

To create a spec (2-5 minutes):
  /sp.specify [describe what users need and why]

Example:
  /sp.specify Add user registration with email verification

Once complete, I'll help you design and implement it properly.
```

### Incomplete Spec

```
🛑 STOP: Specification Incomplete

Found spec at: specs/[feature]/spec.md
But it has unresolved issues:

[NEEDS CLARIFICATION] markers:
- Line 45: "What OAuth providers should be supported?"
- Line 67: "Should users be able to delete their accounts?"

Missing sections:
- Success criteria not measurable
- Edge cases not covered

To resolve:
  /sp.clarify

Or manually update the spec and re-run validation.
```

### Missing Plan

```
🛑 STOP: Implementation Plan Required

Found spec but no plan for: [feature]

Before implementing, I need to design:
- Technical architecture
- File structure
- API contracts
- Data models
- Technology choices

This ensures consistency and prevents refactoring.

To create a plan (5-10 minutes):
  /sp.plan

The plan will generate complete architecture documentation.
```

### Trying to Skip Phases

```
🛑 STOP: Workflow Phase Skipped

You requested: [implementation]
But missing: [spec/plan/tasks]

Spec-driven development is not optional. It ensures:
✓ Correct understanding of requirements
✓ Sound architectural decisions
✓ Systematic implementation
✓ Proper testing coverage
✓ Complete documentation

Please follow the workflow:
1. /sp.specify → Define requirements
2. /sp.plan → Design architecture
3. /sp.tasks → Break down work
4. /sp.implement → Execute systematically

It takes a bit more time upfront, but prevents hours of
debugging and refactoring later.
```

---

## Working with Monorepo Structure

### Typical Structure

```
project-root/
├── frontend/          # Next.js application
│   ├── app/          # App Router
│   ├── components/   # React components
│   └── lib/          # Utilities
├── backend/          # FastAPI application
│   ├── api/          # Route handlers
│   ├── models/       # Data models
│   ├── services/     # Business logic
│   └── db/           # Database utilities
├── shared/           # Shared types/utilities
├── specs/            # Feature specifications
│   └── [feature]/
│       ├── spec.md
│       ├── plan.md
│       ├── tasks.md
│       ├── data-model.md
│       └── contracts/
└── .specify/         # SDD-RI framework
```

### Cross-Boundary Changes

When changes span frontend + backend:

```
1. Verify spec covers both sides
   - User interactions (frontend)
   - Business logic (backend)
   - API contract (both)

2. Verify plan addresses integration
   - API endpoints defined in contracts/
   - Data model matches both sides
   - Error handling coordinated

3. Implement in order
   - Contract/types first (shared)
   - Backend implementation (API)
   - Frontend implementation (UI)
   - Integration tests (both)
```

---

## Common Patterns

### Pattern: API Endpoint Addition

```
1. Check spec for functional requirement
   → "Users can create new tasks"

2. Check plan for API design
   → POST /api/tasks
   → Request/response schema in contracts/api.yaml

3. Check tasks for implementation order
   → Task: Write API endpoint test
   → Task: Implement API endpoint
   → Task: Connect frontend form

4. Implement following task order
   → Tests first (TDD)
   → Backend endpoint
   → Frontend integration
```

### Pattern: UI Component Addition

```
1. Check spec for user interaction
   → "Users see a list of tasks with status indicators"

2. Check plan for component structure
   → Server component: TaskList
   → Client component: TaskItem (interactive)
   → Data fetching: Server action

3. Check tasks for dependencies
   → Task: Create TaskList server component
   → Task: Create TaskItem client component
   → Task: Implement status badge styles

4. Implement following component hierarchy
```

### Pattern: Database Schema Change

```
1. Check spec for data requirement
   → "Tasks have priority levels: low, medium, high"

2. Check plan for schema design
   → data-model.md: Task entity with priority enum

3. Check tasks for migration order
   → Task: Create migration for priority field
   → Task: Update Task model
   → Task: Update API validation
   → Task: Update frontend forms

4. Implement following dependency order
   → Schema first
   → Backend models
   → API layer
   → Frontend
```

---

## Success Metrics

This skill is working correctly when:

✓ **Zero unauthorized code changes**: Every change traces to a spec
✓ **Clear traceability**: Spec → Plan → Tasks → Implementation chain intact
✓ **Fewer bugs**: Requirements understood before coding
✓ **Consistent architecture**: Plan followed systematically
✓ **Complete testing**: Test tasks executed before implementation
✓ **Better documentation**: PHRs created, specs maintained

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│           SPEC-DRIVEN WORKFLOW CHECKLIST                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Before ANY work:                                        │
│  ☐ Run: .specify/scripts/powershell/check-prerequisites │
│  ☐ Verify: specs/[feature]/spec.md exists               │
│  ☐ Verify: specs/[feature]/plan.md exists (if coding)   │
│  ☐ Verify: specs/[feature]/tasks.md exists (if impl)    │
│                                                          │
│  If missing:                                             │
│  ☐ STOP immediately                                      │
│  ☐ Report missing artifacts                              │
│  ☐ Guide user to create them                             │
│  ☐ DO NOT proceed until complete                         │
│                                                          │
│  During work:                                            │
│  ☐ Reference spec continuously                           │
│  ☐ Follow plan architecture                              │
│  ☐ Execute tasks in order                                │
│  ☐ Mark completed tasks [X]                              │
│  ☐ Validate against acceptance criteria                  │
│                                                          │
│  After work:                                             │
│  ☐ All tasks marked complete                             │
│  ☐ Tests passing                                         │
│  ☐ Spec requirements satisfied                           │
│  ☐ Create PHR for traceability                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Examples

### ✅ Correct Usage

```
User: "Add user authentication to the app"

You:
1. Check for spec: specs/user-auth/spec.md
   → Found but has [NEEDS CLARIFICATION]

2. STOP and report:
   "I found a spec for user authentication but it needs clarification:
    - Line 23: Which OAuth providers? (Google, GitHub, both?)
    - Line 45: Session duration preference?

    Please run: /sp.clarify

    Or answer here and I'll update the spec."

3. After clarification resolved:
   "Great! Spec is now complete. Ready to create implementation plan?

    Run: /sp.plan"

4. After plan created:
   "Excellent! Plan shows Better Auth + Neon DB + Next.js App Router.
    Ready to break down into tasks?

    Run: /sp.tasks"

5. After tasks created:
   "Perfect! Task breakdown complete with 12 tasks across 5 phases.
    Ready to implement following TDD approach?

    Run: /sp.implement"
```

### ❌ Incorrect Usage

```
User: "Add user authentication to the app"

You:
"Sure! I'll add Better Auth with Google and GitHub OAuth..."
*starts writing code*

❌ WRONG: No spec verification
❌ WRONG: Assumed OAuth providers
❌ WRONG: Skipped planning phase
❌ WRONG: No task breakdown
```

---

## When NOT to Use This Skill

This skill is for **production-quality feature work**. Skip it for:

- **Learning/exploration**: Clearly marked as throwaway code
- **Debugging/investigation**: Temporary diagnostic code
- **Hot fixes**: Emergency patches (but create spec retroactively)
- **Prototyping**: Experimental code not for production

For everything else: **Spec-Driven Development is mandatory.**
