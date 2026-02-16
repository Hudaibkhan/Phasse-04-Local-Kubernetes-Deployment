# Tasks: Evolution Todo Phase II Complete System

**Input**: Design documents from `specs/001-phase-2-specs/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md

**Tests**: Tests are NOT explicitly requested in spec.md. Test tasks are excluded per task generation rules. Testing will be ad-hoc during development.

**Organization**: Tasks are grouped by user story (US1-US11) to enable independent implementation and testing. Each story can be delivered as an increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US11)
- Include exact file paths in descriptions

## Path Conventions

This is a **web application** with `backend/` and `frontend/` directories at repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic monorepo structure

- [x] T001 Create backend directory structure: backend/src/{models,services,api,middleware,db,schemas,utils}/, backend/tests/{unit,integration}/, backend/alembic/versions/
- [x] T002 Create frontend directory structure: frontend/src/app/{(protected),login,signup}/, frontend/src/components/{layout,forms,auth,tasks,ui}/, frontend/src/lib/, frontend/tests/unit/
- [x] T003 Initialize backend Python project with requirements.txt (FastAPI, SQLModel, Alembic, Bcrypt, Better-Auth, pytest)
- [x] T004 Initialize frontend Node project with package.json (Next.js 15+, React 18+, TypeScript, TailwindCSS, Framer Motion)
- [x] T005 [P] Configure backend linting (black, ruff) and create pyproject.toml
- [x] T006 [P] Configure frontend linting (ESLint, Prettier) and create .eslintrc, .prettierrc
- [x] T007 [P] Create backend .env.example with DATABASE_URL, JWT_SECRET, CORS_ORIGINS placeholders
- [x] T008 [P] Create frontend .env.local.example with NEXT_PUBLIC_API_URL placeholder
- [x] T009 [P] Create .gitignore for Python and Node artifacts
- [x] T010 Create README.md with quickstart instructions referencing specs/001-phase-2-specs/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T011 Setup Neon PostgreSQL database and obtain connection string
- [x] T012 Configure Alembic in backend/alembic.ini with Neon connection
- [x] T013 Create initial Alembic migration (001_initial_schema.py) with users and tasks tables per specs/database/schema.md
- [x] T014 Run Alembic migration: alembic upgrade head
- [x] T015 [P] Create database connection manager in backend/src/db/session.py with connection pooling (min=10, max=20)
- [x] T016 [P] Implement JWT utility functions in backend/src/utils/jwt.py (generate_token, verify_token using Better-Auth)
- [x] T017 [P] Implement password hashing utilities in backend/src/utils/password.py (hash_password, verify_password using bcrypt salt factor 12)
- [x] T018 [P] Create authentication middleware in backend/src/middleware/auth.py to extract user_id from JWT cookie
- [x] T019 [P] Setup CORS middleware in backend/src/middleware/cors.py with CORS_ORIGINS from .env
- [x] T020 [P] Create error handling middleware in backend/src/middleware/errors.py with consistent JSON error responses
- [x] T021 [P] Create FastAPI app instance in backend/src/main.py with middleware registration
- [x] T022 [P] Setup TailwindCSS in frontend with dark mode configuration in tailwind.config.js
- [x] T023 [P] Create global styles in frontend/src/styles/globals.css with Tailwind imports
- [x] T024 [P] Create Next.js root layout in frontend/src/app/layout.tsx with font and metadata
- [x] T025 [P] Create Next.js middleware in frontend/middleware.ts for authentication checks on protected routes
- [x] T026 [P] Create API client utility in frontend/src/lib/api.ts for backend HTTP requests with cookie handling

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration & Authentication (Priority: P1) 🎯 MVP

**Goal**: Enable new users to create accounts and log in securely so they can access the personal task management system

**Independent Test**: Complete signup flow → login → verify JWT cookie set → access /api/auth/me successfully

### Implementation for User Story 1

- [x] T027 [P] [US1] Create User SQLModel in backend/src/models/user.py with id, email, password_hash, created_at, updated_at fields
- [x] T028 [P] [US1] Create Pydantic schemas in backend/src/schemas/auth.py: RegisterRequest, LoginRequest, UserResponse
- [x] T029 [US1] Implement AuthService in backend/src/services/auth_service.py with register_user(), login_user(), get_current_user() methods
- [x] T030 [US1] Implement POST /api/auth/register endpoint in backend/src/api/auth.py using AuthService.register_user()
- [x] T031 [US1] Implement POST /api/auth/login endpoint in backend/src/api/auth.py using AuthService.login_user() and set HTTP-only cookie
- [x] T032 [US1] Implement GET /api/auth/me endpoint in backend/src/api/auth.py to return current user from JWT
- [x] T033 [US1] Implement POST /api/auth/logout endpoint in backend/src/api/auth.py to clear auth_token cookie
- [x] T034 [US1] Register auth router in backend/src/main.py
- [x] T035 [P] [US1] Create Input component in frontend/src/components/forms/Input.tsx with label, error, helperText props
- [x] T036 [P] [US1] Create Button component in frontend/src/components/forms/Button.tsx with variants (primary, secondary, danger) and loading state
- [x] T037 [P] [US1] Create SignupForm component in frontend/src/components/auth/SignupForm.tsx with email/password inputs and validation
- [x] T038 [P] [US1] Create LoginForm component in frontend/src/components/auth/LoginForm.tsx with email/password inputs and validation
- [x] T039 [P] [US1] Create AuthContext in frontend/src/lib/auth.ts with user state, login(), logout(), register() methods
- [x] T040 [US1] Create signup page in frontend/src/app/signup/page.tsx using SignupForm component
- [x] T041 [US1] Create login page in frontend/src/app/login/page.tsx using LoginForm component
- [x] T042 [P] [US1] Create Header component in frontend/src/components/layout/Header.tsx with logo and auth state (login/signup links vs user email + logout)
- [x] T043 [P] [US1] Create Footer component in frontend/src/components/layout/Footer.tsx with copyright
- [x] T044 [US1] Create landing page in frontend/src/app/page.tsx with hero section, CTA buttons, and feature showcase
- [x] T045 [US1] Update Next.js middleware in frontend/middleware.ts to redirect authenticated users
 from / /login /signup to /dashboard
- [x] T046 [US1] Add email validation (RFC 5322 regex) and password strength check (min 8 chars) to SignupForm and LoginForm
- [x] T047 [US1] Add error handling and display for auth failures (invalid credentials, email already registered)
- [x] T048 [US1] Test full authentication flow: signup → login → verify cookie → access protected route

**Checkpoint**: Authentication is fully functional - users can register, login, logout, and session persists

---

## Phase 4: User Story 2 - Basic Task CRUD Operations (Priority: P1) 🎯 MVP

**Goal**: Enable logged-in users to create, view, update, and delete tasks for effective todo list management

**Independent Test**: Login → create task → view on dashboard → edit task → toggle completion → delete task

### Implementation for User Story 2

- [x] T049 [P] [US2] Create Task SQLModel in backend/src/models/task.py with id, user_id, title, description, completed, created_at, updated_at fields
- [x] T050 [P] [US2] Create Pydantic schemas in backend/src/schemas/task.py: TaskCreate, TaskUpdate, TaskResponse
- [x] T051 [US2] Implement TaskService in backend/src/services/task_service.py with create_task(), get_tasks(), get_task_by_id(), update_task(), delete_task() methods (all filtering by user_id)
- [x] T052 [US2] Implement POST /api/tasks endpoint in backend/src/api/tasks.py using TaskService.create_task()
- [x] T053 [US2] Implement GET /api/tasks endpoint in backend/src/api/tasks.py using TaskService.get_tasks() with user_id filter
- [x] T054 [US2] Implement GET /api/tasks/{id} endpoint in backend/src/api/tasks.py using TaskService.get_task_by_id() with ownership check
- [x] T055 [US2] Implement PUT /api/tasks/{id} endpoint in backend/src/api/tasks.py for full update with ownership check
- [x] T056 [US2] Implement PATCH /api/tasks/{id} endpoint in backend/src/api/tasks.py for partial update (e.g., toggle completed)
- [x] T057 [US2] Implement DELETE /api/tasks/{id} endpoint in backend/src/api/tasks.py with ownership check
- [x] T058 [US2] Register tasks router in backend/src/main.py
- [x] T059 [P] [US2] Create Checkbox component in frontend/src/components/forms/Checkbox.tsx for task completion toggle
- [x] T060 [P] [US2] Create Textarea component in frontend/src/components/forms/Textarea.tsx for task descriptions
- [x] T061 [P] [US2] Create TaskItem component in frontend/src/components/tasks/TaskItem.tsx displaying checkbox, title, edit/delete buttons
- [x] T062 [US2] Create TaskList component in frontend/src/components/tasks/TaskList.tsx rendering array of TaskItem components
- [x] T063 [P] [US2] Create EmptyState component in frontend/src/components/ui/EmptyState.tsx with message and optional action button
- [x] T064 [P] [US2] Create Loading component in frontend/src/components/ui/Loading.tsx with spinner
- [x] T065 [US2] Create TaskForm component in frontend/src/components/tasks/TaskForm.tsx with compact mode (title only) and full mode (title, description, completed)
- [x] T066 [US2] Create protected layout in frontend/src/app/(protected)/layout.tsx with Header including user menu
- [x] T067 [US2] Create dashboard page in frontend/src/app/(protected)/dashboard/page.tsx with TaskForm (compact) and TaskList
- [x] T068 [US2] Create task detail page in frontend/src/app/(protected)/tasks/[id]/page.tsx with TaskForm (full mode) and delete button
- [x] T069 [US2] Implement fetch tasks on dashboard load using GET /api/tasks
- [x] T070 [US2] Implement create task handler calling POST /api/tasks and refreshing task list
- [x] T071 [US2] Implement toggle completion handler calling PATCH /api/tasks/{id} with optimistic UI update
- [x] T072 [US2] Implement delete task handler calling DELETE /api/tasks/{id} with confirmation modal
- [x] T073 [P] [US2] Create Modal component in frontend/src/components/ui/Modal.tsx for delete confirmation
- [x] T074 [US2] Add form validation: title required (max 200 chars), description optional (max 1000 chars)
- [x] T075 [US2] Add error handling for task operations (404 for not found, 403 for forbidden access to other user's task)
- [x] T076 [US2] Add Framer Motion animations for task creation, deletion, and completion toggle
- [x] T077 [US2] Test full CRUD flow: create task → appears in list → edit → update display → toggle → strikethrough → delete → removed from list

**Checkpoint**: Task CRUD is fully functional - users can manage their tasks independently with smooth UX

---

## Phase 5: User Story 3 - Task Priorities & Visual Organization (Priority: P2)

**Goal**: Enable users to assign priorities (High, Medium, Low) to tasks for better focus on important items

**Independent Test**: Create tasks with different priorities → verify color-coded badges → sort by priority → filter by priority

### Implementation for User Story 3

- [x] T078 [US3] Add priority column to tasks table via Alembic migration (002_add_priority.py): priority ENUM('High', 'Medium', 'Low') DEFAULT 'Medium'
- [x] T079 [US3] Update Task SQLModel in backend/src/models/task.py to include priority field with Priority enum
- [x] T080 [US3] Update TaskCreate and TaskUpdate schemas in backend/src/schemas/task.py to include optional priority field
- [x] T081 [US3] Update TaskService.get_tasks() in backend/src/services/task_service.py to support priority filter and sort
- [x] T082 [US3] Update GET /api/tasks endpoint in backend/src/api/tasks.py to accept ?priority=High query parameter
- [x] T083 [US3] Update TaskForm component in frontend/src/components/tasks/TaskForm.tsx to include priority dropdown (High, Medium, Low)
- [x] T084 [US3] Update TaskItem component in frontend/src/components/tasks/TaskItem.tsx to display priority badge with color coding (High=red, Medium=yellow, Low=green)
- [x] T085 [US3] Add priority filter dropdown to dashboard in frontend/src/app/(protected)/dashboard/page.tsx
- [x] T086 [US3] Add priority sort option to dashboard (sort by priority High→Medium→Low)
- [x] T087 [US3] Test priority workflow: create High/Medium/Low priority tasks → verify badges → filter by High → only High tasks shown → sort by priority → correct order

**Checkpoint**: Task priorities are fully functional with visual distinction and filtering/sorting capabilities

---

## Phase 6: User Story 4 - Tags & Categories (Priority: P2)

**Goal**: Enable users to organize tasks with custom tags/categories (Work, Personal, etc.) for grouping related tasks

**Independent Test**: Create tags → assign multiple tags to task → filter by tag → verify only tagged tasks appear

### Implementation for User Story 4

- [x] T088 [US4] Create tags table via Alembic migration (003_add_tags.py): id, user_id, name, color, created_at, updated_at with unique constraint on (user_id, name)
- [x] T089 [US4] Create task_tags join table via same migration: task_id, tag_id with composite primary key
- [x] T090 [P] [US4] Create Tag SQLModel in backend/src/models/tag.py with id, user_id, name, color, created_at, updated_at
- [x] T091 [P] [US4] Create TaskTag SQLModel in backend/src/models/task_tag.py with task_id, tag_id
- [x] T092 [P] [US4] Create Pydantic schemas in backend/src/schemas/tag.py: TagCreate, TagUpdate, TagResponse
- [x] T093 [US4] Update Task model in backend/src/models/task.py to include tags relationship
- [x] T094 [US4] Implement TagService in backend/src/services/tag_service.py with create_tag(), get_tags(), update_tag(), delete_tag() methods
- [x] T095 [US4] Update TaskService in backend/src/services/task_service.py to handle tag associations on create/update
- [x] T096 [US4] Update TaskService.get_tasks() to support ?tag=Work query parameter with JOIN on task_tags and tags
- [x] T097 [US4] Implement POST /api/tags endpoint in backend/src/api/tags.py using TagService.create_tag()
- [x] T098 [US4] Implement GET /api/tags endpoint in backend/src/api/tags.py to list all user's tags
- [x] T099 [US4] Implement PUT /api/tags/{id} endpoint in backend/src/api/tags.py for updating tag name/color
- [x] T100 [US4] Implement DELETE /api/tags/{id} endpoint in backend/src/api/tags.py (cascades to remove from tasks)
- [x] T101 [US4] Register tags router in backend/src/main.py
- [x] T102 [US4] Update TaskCreate/TaskUpdate schemas in backend/src/schemas/task.py to accept tags array (tag names)
- [x] T103 [US4] Update TaskForm component in frontend/src/components/tasks/TaskForm.tsx to include tag multi-select input
- [x] T104 [US4] Update TaskItem component in frontend/src/components/tasks/TaskItem.tsx to display tags as colored chips
- [x] T105 [US4] Add tag management UI to dashboard: create tag button → modal with name/color inputs
- [x] T106 [US4] Add tag filter dropdown to dashboard showing all user's tags
- [x] T107 [US4] Implement tag filtering: select tag → fetch GET /api/tasks?tag={name} → display filtered tasks
- [x] T108 [US4] Enforce 50 character limit on tag names and 50 tag limit per user at frontend and backend
- [x] T109 [US4] Test tag workflow: create tags (Work, Personal) → create task with both tags → verify chips displayed → filter by Work → only Work tasks shown → delete tag → removed from all tasks

**Checkpoint**: Tags are fully functional with creation, assignment, filtering, and visual display

---

## Phase 7: User Story 5 - Search & Filtering (Priority: P2)

**Goal**: Enable users to search tasks by keyword and filter by status/priority/tags for quick task discovery

**Independent Test**: Create diverse tasks → search by keyword → verify matches in title/description → apply multiple filters → verify combined results

### Implementation for User Story 5

- [x] T110 [US5] Update TaskService.get_tasks() in backend/src/services/task_service.py to support ?search=keyword parameter with ILIKE query on title and description
- [x] T111 [US5] Update GET /api/tasks endpoint in backend/src/api/tasks.py to accept ?search, ?completed, ?priority, ?tag parameters and combine filters
- [x] T112 [US5] Add search bar to dashboard in frontend/src/app/(protected)/dashboard/page.tsx with debounced input (500ms delay)
- [x] T113 [US5] Implement real-time search: on input change → debounce → call GET /api/tasks?search={query} → update task list
- [x] T114 [US5] Add completion status filter dropdown to dashboard: All, Active, Completed
- [x] T115 [US5] Implement combined filtering: allow search + status + priority + tag filters simultaneously
- [x] T116 [US5] Display active filters as chips with remove button to clear individual filters
- [x] T117 [US5] Test search workflow: search "documentation" → verify matching tasks → add filter completed=false → verify intersection of results → clear filters → all tasks return

**Checkpoint**: Search and filtering are fully functional with real-time updates and multi-dimensional filtering

---

## Phase 8: User Story 6 - Task Sorting (Priority: P2)

**Goal**: Enable users to sort tasks by date, priority, or alphabetically for preferred viewing order

**Independent Test**: Create tasks with varied dates/priorities/titles → test each sort option → verify correct ordering

### Implementation for User Story 6

- [x] T118 [US6] Update TaskService.get_tasks() in backend/src/services/task_service.py to support ?sort=field&order=asc|desc parameters
- [x] T119 [US6] Update GET /api/tasks endpoint in backend/src/api/tasks.py to accept sort and order query parameters
- [x] T120 [US6] Implement sorting logic for: created_at (newest/oldest), priority (High→Medium→Low or reverse), title (A-Z or Z-A)
- [x] T121 [US6] Add sort dropdown to dashboard in frontend/src/app/(protected)/dashboard/page.tsx with options: Date (newest), Date (oldest), Priority (High first), Priority (Low first), Title (A-Z), Title (Z-A)
- [x] T122 [US6] Implement sort handler: on selection → call GET /api/tasks?sort={field}&order={direction} → update task list
- [x] T123 [US6] Persist sort preference in localStorage so it survives page refresh
- [x] T124 [US6] Test sort workflow: select "Priority (High first)" → verify High tasks at top → select "Title (A-Z)" → verify alphabetical order

**Checkpoint**: Task sorting is fully functional with multiple sort dimensions and persistent preferences

---

## Phase 9: User Story 7 - Due Dates & Time Management (Priority: P3)

**Goal**: Enable users to set due dates and times for tasks to track deadlines and plan work

**Independent Test**: Create task with due date → verify date displays → create overdue task → verify red highlight → sort by due date → verify nearest deadline first

### Implementation for User Story 7

- [x] T125 [US7] Add due_date and due_time columns to tasks table via Alembic migration (004_add_due_dates.py): due_date DATE NULL, due_time TIME NULL
- [x] T126 [US7] Update Task SQLModel in backend/src/models/task.py to include due_date and due_time fields
- [x] T127 [US7] Update TaskCreate and TaskUpdate schemas in backend/src/schemas/task.py to include optional due_date and due_time
- [x] T128 [US7] Update TaskService in backend/src/services/task_service.py to validate due_time requires due_date
- [x] T129 [US7] Update TaskService.get_tasks() to support sorting by due_date and grouping by time periods (Today, This Week, Later)
- [x] T130 [US7] Update GET /api/tasks endpoint to support ?sort=due_date parameter
- [x] T131 [US7] Update TaskForm component in frontend/src/components/tasks/TaskForm.tsx to include date picker for due_date and time picker for due_time
- [x] T132 [US7] Update TaskItem component in frontend/src/components/tasks/TaskItem.tsx to display due date/time prominently
- [x] T133 [US7] Add visual indicator (red highlight/icon) for overdue tasks in TaskItem component (due_date < today)
- [x] T134 [US7] Add "Sort by Due Date" option to dashboard sort dropdown
- [x] T135 [US7] Implement grouped view option: group tasks by "Today", "This Week", "Later" based on due_date
- [x] T136 [US7] Test due date workflow: create task due tomorrow → verify date displays → wait until past due → verify red indicator → sort by due date → nearest deadline first

**Checkpoint**: Due dates are fully functional with overdue indicators and date-based sorting/grouping

---

## Phase 10: User Story 8 - Recurring Tasks (Priority: P3)

**Goal**: Enable users to create recurring tasks (daily, weekly, custom) to avoid manually recreating repetitive tasks

**Independent Test**: Create daily recurring task → complete it → verify new instance created for next day → verify recurrence icon displayed

### Implementation for User Story 8

- [x] T137 [US8] Add is_recurring and recurrence_pattern columns to tasks table via Alembic migration (005_add_recurrence.py): is_recurring BOOLEAN DEFAULT FALSE, recurrence_pattern VARCHAR(100) NULL
- [x] T138 [US8] Update Task SQLModel in backend/src/models/task.py to include is_recurring and recurrence_pattern fields
- [x] T139 [US8] Update TaskCreate and TaskUpdate schemas in backend/src/schemas/task.py to include is_recurring and recurrence_pattern
- [x] T140 [US8] Implement recurrence logic in TaskService.update_task() in backend/src/services/task_service.py: when task is marked completed and is_recurring=true, create new task instance with next occurrence date
- [x] T141 [US8] Implement recurrence pattern parsing: parse "daily", "weekly", "monthly", "custom" and calculate next_due_date
- [x] T142 [US8] Update TaskForm component in frontend/src/components/tasks/TaskForm.tsx to include "Recurring" toggle and frequency dropdown (Daily, Weekly, Monthly, Custom)
- [x] T143 [US8] Update TaskItem component in frontend/src/components/tasks/TaskItem.tsx to display recurring icon/indicator
- [x] T144 [US8] Display next occurrence date for recurring tasks in task detail view
- [x] T145 [US8] Test recurring workflow: create daily recurring task → complete it → verify new instance created with tomorrow's date → verify original task shows completed → verify recurring icon displayed

**Checkpoint**: Recurring tasks are fully functional with auto-generation on completion

---

## Phase 11: User Story 9 - Task Reminders & Notifications (Priority: P3)

**Goal**: Enable users to receive browser notifications for upcoming task deadlines to avoid forgetting important tasks

**Independent Test**: Enable browser notifications → set reminder for task → wait for reminder time → verify browser notification appears → click notification → verify taken to task detail page

### Implementation for User Story 9

- [x] T146 [US9] Request browser notification permission in frontend using Notifications API on first dashboard load
- [x] T147 [US9] Create notification utility in frontend/src/lib/notifications.ts with functions: requestPermission(), scheduleNotification(task), cancelNotification(taskId)
- [x] T148 [US9] Update TaskForm component in frontend/src/components/tasks/TaskForm.tsx to include "Set Reminder" option with time picker
- [x] T149 [US9] Implement client-side reminder scheduling using setTimeout for tasks with due_date and reminder_time
- [x] T150 [US9] Schedule browser notification 15 minutes before due_time if task has due_time set
- [x] T151 [US9] Make notification clickable: on click → navigate to /tasks/{id} (task detail page)
- [x] T152 [US9] Handle notification permission denied gracefully: show inline message, disable reminder UI
- [x] T153 [US9] Persist scheduled reminders in localStorage to survive page refresh
- [x] T154 [US9] Re-schedule reminders on dashboard mount by reading from localStorage and checking due times
- [x] T155 [US9] Test reminder workflow: enable notifications → create task due in 1 hour with reminder → wait → verify notification appears → click → verify navigated to task

**Checkpoint**: Task reminders are fully functional with browser notifications and auto-reminders before due time

---

## Phase 12: User Story 10 - Modern Landing Page & UI/UX (Priority: P1) 🎯 MVP

**Goal**: Attract visitors with professional landing page showing clear value proposition to motivate signups

**Independent Test**: Visit landing page → verify hero section loads → verify animations smooth → click feature cards → scroll → click CTA → verify navigates to signup

### Implementation for User Story 10

- [x] T156 [P] [US10] Install Framer Motion in frontend: npm install framer-motion
- [x] T157 [P] [US10] Create hero section component in landing page (frontend/src/app/page.tsx) with animated heading and CTA buttons
- [x] T158 [P] [US10] Create feature showcase section with 3 cards: "Task Management", "Priorities & Organization", "Reminders & Deadlines"
- [x] T159 [US10] Add scroll animations using Framer Motion for feature cards (fade in on scroll)
- [x] T160 [US10] Implement smooth page transitions using Framer Motion AnimatePresence for route changes
- [x] T161 [US10] Add hover animations to buttons and cards using Framer Motion whileHover
- [x] T162 [US10] Ensure responsive design: test on mobile (320px), tablet (768px), desktop (1024px+) breakpoints
- [x] T163 [US10] Optimize landing page performance: lazy load images, minimize CSS, use Next.js Image component
- [x] T164 [US10] Test landing page: visit / → hero animates → scroll → feature cards animate → click "Get Started" → navigate to /signup → smooth transition

**Checkpoint**: Landing page is professional, animated, and responsive with clear CTAs

---

## Phase 13: User Story 11 - Theme Toggle (Dark/Light Mode) (Priority: P2)

**Goal**: Enable users to switch between dark and light themes for comfortable use in different lighting conditions

**Independent Test**: Click theme toggle → verify all pages update colors → refresh page → verify theme persists → test in both themes

### Implementation for User Story 11

- [x] T165 [US11] Create theme context in frontend/src/lib/theme.ts with theme state (dark/light) and toggleTheme() function
- [x] T166 [US11] Implement theme persistence in localStorage with key "theme-preference"
- [x] T167 [US11] Update TailwindCSS config in tailwind.config.js to use class-based dark mode strategy
- [x] T168 [US11] Add dark mode variant classes to all components using Tailwind's dark: prefix
- [x] T169 [US11] Create theme toggle button component in frontend/src/components/ui/ThemeToggle.tsx with sun/moon icon
- [x] T170 [US11] Add ThemeToggle to Header component in frontend/src/components/layout/Header.tsx
- [x] T171 [US11] Apply theme class to root html element based on theme state (add "dark" class when dark mode)
- [x] T172 [US11] Prevent flash of unstyled content (FOUC) by reading theme from localStorage before first render
- [x] T173 [US11] Test theme toggle: click toggle → all pages switch immediately → refresh → theme persists → verify color contrast meets WCAG AA in both themes

**Checkpoint**: Theme toggle is fully functional with persistent preferences and no visual flashing

---

## Phase 14: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final production readiness

- [x] T174 [P] Update README.md with complete setup instructions, architecture overview, and technology stack
- [x] T175 [P] Create API documentation using FastAPI's /docs endpoint with complete descriptions and examples
- [x] T176 [P] Add comprehensive error messages for all validation failures with field-specific details
- [x] T177 [P] Implement rate limiting on authentication endpoints (5 requests per minute) using slowapi library
- [x] T178 [P] Add request logging middleware to backend with structured JSON logs including user_id, endpoint, duration
- [x] T179 [P] Implement health check endpoint GET /api/health in backend returning database connection status
- [x] T180 [P] Add loading skeletons to dashboard for better perceived performance during data fetching
- [x] T181 [P] Optimize task list rendering with React.memo() and useCallback() for TaskItem components
- [x] T182 [P] Add keyboard shortcuts: Cmd/Ctrl+K for search focus, Cmd/Ctrl+N for new task, Escape to close modals
- [x] T183 [P] Implement accessibility features: ARIA labels on all interactive elements, focus indicators, screen reader announcements
- [x] T184 [P] Validate color contrast in both themes meets WCAG AA standards (4.5:1 for normal text)
- [x] T185 [P] Add meta tags for SEO in Next.js layout: title, description, Open Graph tags
- [x] T186 [P] Create 404 Not Found page in frontend/src/app/not-found.tsx with link to home
- [x] T187 [P] Create 500 Error page in frontend/src/app/error.tsx with reload button
- [x] T188 [P] Implement optimistic UI updates for all task mutations (create, update, delete, toggle)
- [x] T189 [P] Add toast notifications for success/error feedback using a lightweight toast library
- [x] T190 [P] Security audit: verify all endpoints have authentication checks, SQL injection prevention (parameterized queries), XSS prevention (React escaping), CSRF protection (SameSite cookies)
- [x] T191 [P] Performance testing: verify dashboard handles 100+ tasks without lag, API responses <200ms p95
- [x] T192 Validate quickstart.md by running through all steps on fresh environment
- [x] T193 Final integration test: complete all 11 user story workflows end-to-end
- [x] T194 Code cleanup: remove console.logs, unused imports, commented code, TODOs
- [x] T195 Production build verification: npm run build for frontend, verify no errors, test production server

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-13)**: All depend on Foundational phase completion
  - US1 (Auth) and US2 (CRUD) should complete first as they're P1 and MVP-critical
  - US10 (Landing Page) is P1 but can proceed in parallel with US1/US2
  - US3-US6 (P2 features) can proceed in parallel after US2 completes
  - US7-US9 (P3 features) can proceed in parallel after US2 completes (require Task model)
  - US11 (Theme) is P2 and can proceed in parallel with any user story (UI-only)
- **Polish (Phase 14)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (Auth) [P1]**: Foundation only - BLOCKS US2 (tasks need authenticated users)
- **US2 (CRUD) [P1]**: Depends on US1 - BLOCKS US3-US9 (all extend Task model)
- **US3 (Priorities) [P2]**: Depends on US2 - Independent from US4-US11
- **US4 (Tags) [P2]**: Depends on US2 - Independent from US3, US5-US11
- **US5 (Search) [P2]**: Depends on US2 - Can integrate with US3, US4 filters independently
- **US6 (Sorting) [P2]**: Depends on US2 - Can integrate with US3 priority sort independently
- **US7 (Due Dates) [P3]**: Depends on US2 - Independent from US3-US6, US8-US11
- **US8 (Recurring) [P3]**: Depends on US2, ideally US7 (uses due_date) - Independent from others
- **US9 (Reminders) [P3]**: Depends on US7 (uses due_date) - Independent from others
- **US10 (Landing) [P1]**: Foundation only - Completely independent from US1-US9, US11
- **US11 (Theme) [P2]**: Foundation only - Completely independent from US1-US10

### Critical Path for MVP

1. Phase 1 (Setup) → T001-T010
2. Phase 2 (Foundational) → T011-T026
3. US1 (Auth) → T027-T048
4. US2 (CRUD) → T049-T077
5. US10 (Landing Page) → T156-T164 (can parallelize with US1/US2)

**MVP Definition**: US1 + US2 + US10 = User can register, login, manage tasks, and has professional landing page

### Parallel Opportunities by Phase

**Phase 1 (Setup)**:
- T003-T010 can all run in parallel (different files)

**Phase 2 (Foundational)**:
- T015-T020 (backend utilities and middleware) can run in parallel
- T022-T026 (frontend setup) can run in parallel
- Backend and frontend foundational work can proceed simultaneously

**Phase 3 (US1 - Auth)**:
- T027-T028 (models and schemas) can run in parallel
- T035-T038 (form components) can run in parallel
- T039-T043 (context and static pages) can run in parallel
- Backend (T027-T034) and Frontend (T035-T047) can proceed in parallel

**Phase 4 (US2 - CRUD)**:
- T049-T050 (model and schemas) can run in parallel
- T059-T065 (UI components) can run in parallel
- T073 (Modal) can run in parallel with other frontend tasks
- Backend (T049-T058) and Frontend (T059-T077) can proceed in parallel

**Phase 5-13 (US3-US11)**:
- US3, US4, US5, US6 can proceed in parallel after US2 (different features)
- US7, US8, US9 can proceed in parallel (though US8/US9 benefit from US7)
- US10, US11 can proceed in parallel with any user story

**Phase 14 (Polish)**:
- T174-T191 can all run in parallel (different concerns)

---

## Parallel Example: MVP Implementation

```bash
# After Phase 2 (Foundation) completes, launch 3 parallel tracks:

# Track 1: US1 Authentication Backend
Task: "Create User SQLModel in backend/src/models/user.py"
Task: "Create Pydantic schemas in backend/src/schemas/auth.py"
Task: "Implement AuthService in backend/src/services/auth_service.py"
Task: "Implement auth endpoints in backend/src/api/auth.py"

# Track 2: US1 Authentication Frontend (parallel with Track 1)
Task: "Create Input component in frontend/src/components/forms/Input.tsx"
Task: "Create Button component in frontend/src/components/forms/Button.tsx"
Task: "Create SignupForm component in frontend/src/components/auth/SignupForm.tsx"
Task: "Create LoginForm component in frontend/src/components/auth/LoginForm.tsx"

# Track 3: US10 Landing Page (parallel with Tracks 1 & 2)
Task: "Create hero section component in landing page"
Task: "Create feature showcase section"
Task: "Add scroll animations using Framer Motion"
```

---

## Implementation Strategy

### MVP First (Minimum Viable Product)

**Goal**: Deliver basic but complete functionality as fast as possible

1. Complete Phase 1: Setup (T001-T010)
2. Complete Phase 2: Foundational (T011-T026) → **CRITICAL CHECKPOINT**
3. Complete US1: Authentication (T027-T048)
4. Complete US2: Task CRUD (T049-T077)
5. Complete US10: Landing Page (T156-T164)
6. **STOP and VALIDATE**: Test MVP end-to-end
7. Deploy MVP if ready

**MVP Features**: Auth + Basic Task Management + Professional Landing Page
**MVP Task Count**: ~90 tasks (Setup + Foundation + US1 + US2 + US10)

### Incremental Delivery (Post-MVP)

**Wave 2 - Organization Features (P2)**:
1. US3: Priorities (T078-T087)
2. US4: Tags (T088-T109)
3. US5: Search & Filtering (T110-T117)
4. US6: Sorting (T118-T124)
5. US11: Theme Toggle (T165-T173)

**Wave 3 - Advanced Features (P3)**:
1. US7: Due Dates (T125-T136)
2. US8: Recurring Tasks (T137-T145)
3. US9: Reminders (T146-T155)

**Wave 4 - Production Readiness**:
1. Phase 14: Polish & Cross-Cutting (T174-T195)

### Parallel Team Strategy

With 3 developers after Foundation completes:

**Developer A**: US1 (Auth) → US3 (Priorities) → US7 (Due Dates) → Polish
**Developer B**: US2 (CRUD) → US4 (Tags) → US8 (Recurring) → Polish
**Developer C**: US10 (Landing) → US5 (Search) → US6 (Sorting) → US9 (Reminders) → US11 (Theme) → Polish

Each developer completes full user stories independently and integrates periodically.

---

## Task Completion Checklist

For each task, verify:
- [ ] Code written and tested manually
- [ ] File paths match specification exactly
- [ ] User isolation enforced (all queries filter by user_id)
- [ ] Error handling implemented
- [ ] No hardcoded secrets or configuration
- [ ] Code follows project conventions (linting passes)
- [ ] Changes committed with clear message
- [ ] If blocked, document blocker in task notes

---

## Notes

- **Total Task Count**: 195 tasks
- **MVP Task Count**: ~90 tasks (Setup + Foundation + US1 + US2 + US10)
- **Parallel Opportunities**: Extensive - most user stories can proceed in parallel after Foundation
- **Independent User Stories**: US3-US11 are independently testable after US2 completes
- **Critical Path**: Setup → Foundation → US1 → US2 → (all other stories can parallelize)
- **Testing Strategy**: Manual ad-hoc testing per task (no automated tests requested)
- **Commit Strategy**: Commit after completing each task or logical group of related tasks
- **Risk**: US2 is a dependency for US3-US9, so prioritize US2 completion to unblock P2/P3 features

**Next Steps**: Begin with Phase 1 (Setup) tasks T001-T010, then proceed to Phase 2 (Foundational) which BLOCKS all user story work.
