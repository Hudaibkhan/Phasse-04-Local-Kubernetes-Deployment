# Feature Specification: Evolution Todo - Complete Phase II System

**Feature Branch**: `001-phase-2-specs`
**Created**: 2026-01-07
**Status**: 📝 Draft
**Input**: Complete end-to-end Phase II implementation with modern UI/UX, authentication, and advanced task management features

## User Scenarios & Testing

### User Story 1 - User Registration & Authentication (Priority: P1)

As a new user, I want to create an account and log in securely so that I can access my personal task management system with my data isolated from other users.

**Why this priority**: Without authentication, multi-user support is impossible. This is the foundation for all other features.

**Independent Test**: Can be fully tested by completing signup flow, logging in, and verifying JWT token is issued and user can access protected routes.

**Acceptance Scenarios**:

1. **Given** I am on the landing page, **When** I click "Get Started", **Then** I am taken to the signup page with an animated form
2. **Given** I am on the signup page, **When** I enter valid email and password (min 8 chars), **Then** my account is created and I am redirected to login
3. **Given** I have an account, **When** I log in with correct credentials, **Then** I receive JWT token and am redirected to dashboard
4. **Given** I am logged in, **When** I refresh the page, **Then** my session persists and I remain logged in
5. **Given** I am logged in, **When** I click logout, **Then** my token is invalidated and I am redirected to landing page

---

### User Story 2 - Basic Task CRUD Operations (Priority: P1)

As a logged-in user, I want to create, view, update, and delete tasks so that I can manage my todo list effectively.

**Why this priority**: Core functionality of a todo app. Without CRUD operations, the app has no purpose.

**Independent Test**: Can be fully tested by creating tasks, viewing them in the list, editing details, and deleting tasks. All operations must be user-scoped.

**Acceptance Scenarios**:

1. **Given** I am on the dashboard, **When** I click "Add Task" and enter a title, **Then** the task is created with smooth animation and appears in my task list
2. **Given** I have tasks, **When** I view my dashboard, **Then** I see all my tasks displayed as cards with title, description, and status
3. **Given** I am viewing a task, **When** I click edit and update the title/description, **Then** the changes are saved with visual feedback
4. **Given** I am viewing a task, **When** I click the checkbox, **Then** the task is marked complete with strikethrough animation
5. **Given** I am viewing a task, **When** I click delete and confirm, **Then** the task is removed with fade-out animation

---

### User Story 3 - Task Priorities & Visual Organization (Priority: P2)

As a user, I want to assign priorities (High, Medium, Low) to my tasks so that I can focus on what's most important.

**Why this priority**: Helps users organize and prioritize their work, improving productivity.

**Independent Test**: Can be tested by creating tasks with different priorities and verifying visual distinction (colors/badges) and sorting by priority.

**Acceptance Scenarios**:

1. **Given** I am creating/editing a task, **When** I select a priority level, **Then** the task displays with color-coded badge (High=red, Medium=yellow, Low=green)
2. **Given** I have tasks with different priorities, **When** I view my dashboard, **Then** I can sort by priority to see high-priority tasks first
3. **Given** I have prioritized tasks, **When** I filter by priority, **Then** only tasks with selected priority are shown

---

### User Story 4 - Tags & Categories (Priority: P2)

As a user, I want to organize tasks with tags/categories (Work, Personal, etc.) so that I can group related tasks together.

**Why this priority**: Enables better organization for users with diverse responsibilities.

**Independent Test**: Can be tested by creating tasks with tags, filtering by tag, and verifying only tagged tasks appear.

**Acceptance Scenarios**:

1. **Given** I am creating/editing a task, **When** I add tags, **Then** the tags are saved and displayed as colored chips on the task
2. **Given** I have tasks with different tags, **When** I filter by a tag, **Then** only tasks with that tag are displayed
3. **Given** I have multiple tags, **When** I view the dashboard, **Then** I see a tag filter dropdown with all my tags

---

### User Story 5 - Search & Filtering (Priority: P2)

As a user, I want to search tasks by keyword and filter by status/priority/tags so that I can quickly find specific tasks.

**Why this priority**: Essential for usability as task lists grow larger.

**Independent Test**: Can be tested by entering search terms and verifying matching tasks appear, and applying filters to see subset of tasks.

**Acceptance Scenarios**:

1. **Given** I have multiple tasks, **When** I type in the search bar, **Then** tasks are filtered in real-time to show matches in title/description
2. **Given** I have completed and incomplete tasks, **When** I filter by "completed", **Then** only completed tasks are shown
3. **Given** I have tasks with different priorities, **When** I filter by "High priority", **Then** only high-priority tasks are displayed
4. **Given** I apply multiple filters, **When** I view results, **Then** tasks matching ALL filters are shown

---

### User Story 6 - Task Sorting (Priority: P2)

As a user, I want to sort my tasks by date, priority, or alphabetically so that I can view them in my preferred order.

**Why this priority**: Improves user control over how information is presented.

**Independent Test**: Can be tested by clicking sort options and verifying task list reorders correctly.

**Acceptance Scenarios**:

1. **Given** I am on the dashboard, **When** I select "Sort by Date (newest first)", **Then** tasks are reordered with newest at top
2. **Given** I am on the dashboard, **When** I select "Sort by Priority", **Then** tasks are reordered High→Medium→Low
3. **Given** I am on the dashboard, **When** I select "Sort by Title (A-Z)", **Then** tasks are reordered alphabetically

---

### User Story 7 - Due Dates & Time Management (Priority: P3)

As a user, I want to set due dates and times for tasks so that I can track deadlines and plan my work.

**Why this priority**: Advanced feature that adds time-based task management.

**Independent Test**: Can be tested by adding due dates to tasks and verifying tasks are displayed with date/time information.

**Acceptance Scenarios**:

1. **Given** I am creating/editing a task, **When** I set a due date and time, **Then** the task displays the due date prominently
2. **Given** I have tasks with due dates, **When** I sort by due date, **Then** tasks are ordered by nearest deadline first
3. **Given** a task is overdue, **When** I view it, **Then** it displays with visual indicator (red highlight/icon)
4. **Given** I have tasks with due dates, **When** I view the dashboard, **Then** I see upcoming tasks grouped by "Today", "This Week", etc.

---

### User Story 8 - Recurring Tasks (Priority: P3)

As a user, I want to create recurring tasks (daily, weekly, custom) so that I don't have to manually recreate repetitive tasks.

**Why this priority**: Powerful feature for users with routine tasks, but not essential for MVP.

**Independent Test**: Can be tested by creating a recurring task and verifying it auto-generates on the specified schedule.

**Acceptance Scenarios**:

1. **Given** I am creating a task, **When** I enable "Recurring" and select "Daily", **Then** the task is marked as recurring with daily icon
2. **Given** I have a daily recurring task, **When** I complete it, **Then** a new instance is automatically created for the next day
3. **Given** I have a weekly recurring task, **When** I view it, **Then** it shows next occurrence date
4. **Given** I want custom recurrence, **When** I select "Custom", **Then** I can specify days of week or interval

---

### User Story 9 - Task Reminders & Notifications (Priority: P3)

As a user, I want to receive browser notifications for upcoming task deadlines so that I don't forget important tasks.

**Why this priority**: Proactive feature that helps users stay on track, but requires due dates first.

**Independent Test**: Can be tested by setting a reminder time and verifying browser notification appears.

**Acceptance Scenarios**:

1. **Given** I have browser notifications enabled, **When** I set a reminder for a task, **Then** I receive a browser notification at the specified time
2. **Given** I have a task due soon, **When** the due time approaches (15 min before), **Then** I receive an automatic reminder notification
3. **Given** I click a notification, **When** the notification opens, **Then** I am taken directly to that task's detail page

---

### User Story 10 - Modern Landing Page & UI/UX (Priority: P1)

As a visitor, I want to see an attractive landing page with clear value proposition so that I understand what the app does and am motivated to sign up.

**Why this priority**: First impression matters. A professional landing page drives user adoption.

**Independent Test**: Can be tested by viewing the landing page and verifying all elements (hero, features, CTA) are present and functional.

**Acceptance Scenarios**:

1. **Given** I visit the website, **When** the landing page loads, **Then** I see an animated hero section with clear heading and CTA buttons
2. **Given** I am on the landing page, **When** I scroll down, **Then** I see feature showcase cards explaining CRUD, priorities, and reminders
3. **Given** I click "Get Started", **When** the page transitions, **Then** I am smoothly taken to the signup page
4. **Given** I am on the landing page, **When** I click the theme toggle, **Then** the UI switches between dark and light mode

---

### User Story 11 - Theme Toggle (Dark/Light Mode) (Priority: P2)

As a user, I want to switch between dark and light themes so that I can use the app comfortably in different lighting conditions.

**Why this priority**: Improves accessibility and user comfort, especially for extended use.

**Independent Test**: Can be tested by clicking theme toggle and verifying all pages update colors appropriately.

**Acceptance Scenarios**:

1. **Given** I am on any page, **When** I click the theme toggle in the header, **Then** the entire UI switches to dark/light mode
2. **Given** I switch themes, **When** I refresh the page, **Then** my theme preference persists
3. **Given** I am in dark mode, **When** I view task cards, **Then** they display with appropriate dark background and contrasting text

---

### Edge Cases

- What happens when a user tries to access another user's task via direct URL?
- How does the system handle creating a task with extremely long title (>200 chars)?
- What happens if a recurring task's next occurrence conflicts with an existing task?
- How does the app handle browser notifications being disabled by user?
- What happens when sorting/filtering returns zero results?
- How does the system handle network failures during task creation?
- What happens when a user sets a due date in the past?
- How does the app handle rapid toggling of task completion status?

## Requirements

### Functional Requirements

**Authentication (FR-AUTH-001 to FR-AUTH-015)**
- **FR-AUTH-001**: System MUST allow users to register with unique email and password (min 8 characters)
- **FR-AUTH-002**: System MUST hash passwords using bcrypt before storing
- **FR-AUTH-003**: System MUST generate JWT tokens on successful login
- **FR-AUTH-004**: System MUST store JWT in HTTP-only cookies
- **FR-AUTH-005**: System MUST validate JWT on all protected endpoints
- **FR-AUTH-006**: System MUST set token expiration to 24 hours
- **FR-AUTH-007**: System MUST invalidate tokens on logout
- **FR-AUTH-008**: System MUST redirect unauthenticated users to login page
- **FR-AUTH-009**: System MUST redirect authenticated users away from login/signup pages to dashboard
- **FR-AUTH-010**: System MUST display user email in header after login
- **FR-AUTH-011**: System MUST enforce user isolation (users cannot access other users' data)
- **FR-AUTH-012**: System MUST trim and lowercase email addresses before validation
- **FR-AUTH-013**: System MUST validate email format using RFC 5322 regex
- **FR-AUTH-014**: System MUST return generic error "Invalid email or password" for failed login (not specify which)
- **FR-AUTH-015**: System MUST persist sessions across page refreshes until token expires

**Task CRUD (FR-TASK-001 to FR-TASK-020)**
- **FR-TASK-001**: System MUST allow authenticated users to create tasks with title (required) and description (optional)
- **FR-TASK-002**: System MUST limit task title to 200 characters
- **FR-TASK-003**: System MUST limit task description to 1000 characters
- **FR-TASK-004**: System MUST set new tasks as incomplete by default
- **FR-TASK-005**: System MUST allow users to toggle task completion status
- **FR-TASK-006**: System MUST allow users to update task title and description
- **FR-TASK-007**: System MUST allow users to delete their own tasks
- **FR-TASK-008**: System MUST show confirmation dialog before permanent deletion
- **FR-TASK-009**: System MUST display tasks in reverse chronological order by default (newest first)
- **FR-TASK-010**: System MUST show empty state message when user has no tasks
- **FR-TASK-011**: System MUST display task creation and update timestamps
- **FR-TASK-012**: System MUST trim whitespace from task title and description before saving
- **FR-TASK-013**: System MUST validate that task title is not empty or only whitespace
- **FR-TASK-014**: System MUST return 404 error when user attempts to access non-existent task
- **FR-TASK-015**: System MUST return 403 error when user attempts to access another user's task
- **FR-TASK-016**: System MUST associate each task with the creating user's ID
- **FR-TASK-017**: System MUST enforce user isolation at database query level
- **FR-TASK-018**: System MUST display completed tasks with visual distinction (strikethrough)
- **FR-TASK-019**: System MUST support optimistic UI updates for completion toggle
- **FR-TASK-020**: System MUST animate task creation, update, and deletion

**Priorities (FR-PRIO-001 to FR-PRIO-005)**
- **FR-PRIO-001**: System MUST allow users to assign priority to tasks (High, Medium, Low)
- **FR-PRIO-002**: System MUST set default priority to "Medium" if not specified
- **FR-PRIO-003**: System MUST display priority with color-coded badges (High=red, Medium=yellow, Low=green)
- **FR-PRIO-004**: System MUST allow users to sort tasks by priority
- **FR-PRIO-005**: System MUST allow users to filter tasks by priority

**Tags/Categories (FR-TAG-001 to FR-TAG-006)**
- **FR-TAG-001**: System MUST allow users to create custom tags
- **FR-TAG-002**: System MUST allow users to assign multiple tags to a single task
- **FR-TAG-003**: System MUST display tags as colored chips on tasks
- **FR-TAG-004**: System MUST provide tag filter dropdown showing all user's tags
- **FR-TAG-005**: System MUST allow filtering tasks by one or more tags
- **FR-TAG-006**: System MUST limit tag names to 50 characters

**Search & Filter (FR-SEARCH-001 to FR-SEARCH-005)**
- **FR-SEARCH-001**: System MUST provide search bar on dashboard
- **FR-SEARCH-002**: System MUST filter tasks in real-time as user types search query
- **FR-SEARCH-003**: System MUST search task titles and descriptions
- **FR-SEARCH-004**: System MUST allow filtering by completion status (All, Active, Completed)
- **FR-SEARCH-005**: System MUST support combining multiple filters (status + priority + tags)

**Sorting (FR-SORT-001 to FR-SORT-004)**
- **FR-SORT-001**: System MUST allow sorting by date (newest/oldest first)
- **FR-SORT-002**: System MUST allow sorting by priority (High→Medium→Low)
- **FR-SORT-003**: System MUST allow sorting by title alphabetically (A-Z, Z-A)
- **FR-SORT-004**: System MUST allow sorting by due date (nearest deadline first)

**Due Dates (FR-DATE-001 to FR-DATE-006)**
- **FR-DATE-001**: System MUST allow users to set due date and time for tasks
- **FR-DATE-002**: System MUST display due date prominently on task cards
- **FR-DATE-003**: System MUST visually indicate overdue tasks (red highlight/icon)
- **FR-DATE-004**: System MUST allow clearing/removing due dates from tasks
- **FR-DATE-005**: System MUST group tasks by time periods (Today, This Week, Later) based on due dates
- **FR-DATE-006**: System MUST allow users to set due time or date-only (no time)

**Recurring Tasks (FR-RECUR-001 to FR-RECUR-005)**
- **FR-RECUR-001**: System MUST allow users to mark tasks as recurring
- **FR-RECUR-002**: System MUST support recurring frequencies (Daily, Weekly, Monthly, Custom)
- **FR-RECUR-003**: System MUST auto-generate next occurrence when recurring task is completed
- **FR-RECUR-004**: System MUST display recurring icon/indicator on task cards
- **FR-RECUR-005**: System MUST allow users to disable recurrence on a task

**Reminders & Notifications (FR-REMIND-001 to FR-REMIND-005)**
- **FR-REMIND-001**: System MUST allow users to set custom reminder times for tasks
- **FR-REMIND-002**: System MUST send browser notification at specified reminder time
- **FR-REMIND-003**: System MUST auto-remind 15 minutes before task due time (if enabled)
- **FR-REMIND-004**: System MUST request browser notification permission from user
- **FR-REMIND-005**: System MUST handle cases where notifications are disabled gracefully

**UI/UX (FR-UI-001 to FR-UI-015)**
- **FR-UI-001**: System MUST display modern, professional landing page with hero section
- **FR-UI-002**: System MUST include feature showcase section with cards
- **FR-UI-003**: System MUST animate page transitions smoothly
- **FR-UI-004**: System MUST provide theme toggle (dark/light mode)
- **FR-UI-005**: System MUST persist theme preference across sessions
- **FR-UI-006**: System MUST display responsive layout (desktop, tablet, mobile)
- **FR-UI-007**: System MUST animate task operations (add, update, delete, toggle)
- **FR-UI-008**: System MUST show loading states during API calls
- **FR-UI-009**: System MUST display error messages inline with validation feedback
- **FR-UI-010**: System MUST show header with logo, navigation, and auth buttons
- **FR-UI-011**: System MUST replace auth buttons with profile menu after login
- **FR-UI-012**: System MUST provide "Add Task" button/modal on dashboard
- **FR-UI-013**: System MUST display task list as cards with all relevant information
- **FR-UI-014**: System MUST show empty state UI when no tasks exist
- **FR-UI-015**: System MUST ensure WCAG AA accessibility compliance

### Key Entities

- **User**: Represents a registered user account
  - Attributes: id (UUID), email (unique, lowercase), password_hash, created_at, updated_at
  - Relationships: One user has many tasks

- **Task**: Represents a todo item owned by a user
  - Attributes: id (UUID), user_id (UUID, FK), title (string), description (text, nullable), completed (boolean), priority (enum: High/Medium/Low), due_date (datetime, nullable), due_time (time, nullable), is_recurring (boolean), recurrence_pattern (string, nullable), created_at, updated_at
  - Relationships: Each task belongs to one user, has many tags (many-to-many)

- **Tag**: Represents a category/label for organizing tasks
  - Attributes: id (UUID), user_id (UUID, FK), name (string, unique per user), color (string)
  - Relationships: Belongs to one user, associated with many tasks (many-to-many)

- **TaskTag**: Join table for many-to-many relationship
  - Attributes: task_id (UUID, FK), tag_id (UUID, FK)

- **Reminder**: Represents a notification trigger for a task (Phase III - implemented client-side in Phase II)
  - Attributes: id (UUID), task_id (UUID, FK), reminder_time (datetime), sent (boolean)

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can complete signup and login in under 60 seconds combined
- **SC-002**: Tasks are created and displayed in under 2 seconds
- **SC-003**: Task completion toggle provides instant visual feedback (<300ms)
- **SC-004**: Search results appear in real-time as user types (<500ms delay)
- **SC-005**: 100% enforcement of user isolation (zero cross-user data leaks)
- **SC-006**: UI animations are smooth (60fps) on modern browsers
- **SC-007**: Theme switching is instant with no flash of unstyled content
- **SC-008**: System handles 100+ tasks per user without performance degradation
- **SC-009**: Landing page loads and renders in under 3 seconds on 3G connection
- **SC-010**: All interactive elements are keyboard accessible
- **SC-011**: Color contrast meets WCAG AA standards in both themes
- **SC-012**: Mobile responsive layout works on screens 320px and wider

## Assumptions

- Users have modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Users understand browser notification permission prompts
- Recurring task generation happens on task completion (not time-based background job)
- Tags are user-specific (not shared across users)
- Due date times use user's local timezone (no timezone conversion in Phase II)
- Theme preference stored in localStorage (survives browser restart)
- No email verification required in Phase II
- No password reset functionality in Phase II
- Reminders are client-side (browser-based) in Phase II
- Task limits: Users can create up to 1000 tasks (reasonable for Phase II)
- Tag limits: Users can have up to 50 unique tags

## Dependencies

- Next.js 15+ for frontend
- FastAPI for backend
- PostgreSQL (Neon) for database
- SQLModel for ORM
- Better-Auth for JWT handling
- TailwindCSS for styling
- Framer Motion (or similar) for animations
- Browser Notifications API for reminders
- localStorage for theme persistence

## Out of Scope (Explicitly)

- OAuth/Social login (Google, GitHub, etc.)
- Multi-factor authentication (MFA)
- Email notifications (only browser notifications)
- Password reset via email
- Account deletion
- Task sharing between users
- Team/collaborative features
- File attachments on tasks
- Task comments or notes
- Task history/activity log
- Export/import tasks
- Mobile apps (iOS/Android native)
- Offline mode
- Real-time collaboration (WebSockets)
- Advanced analytics or reporting
- Integration with external calendars
- AI-powered task suggestions
- Voice input for tasks

## Notes

This specification defines the complete Evolution Todo Phase II system with:

1. **Basic Features (P1)**: Authentication, CRUD operations, modern landing page
2. **Intermediate Features (P2)**: Priorities, tags, search, filtering, sorting, theme toggle
3. **Advanced Features (P3)**: Due dates, recurring tasks, reminders/notifications

**Design Priorities**:
- **Security**: JWT-based auth, user isolation, no hardcoded secrets
- **User Experience**: Modern UI with animations, responsive design, dark mode
- **Scalability**: Efficient queries with indexes, optimistic UI updates
- **Accessibility**: WCAG AA compliance, keyboard navigation

**Next Steps**:
- Run `/sp.plan` to create detailed implementation plan
- Break down into development phases
- Create tasks with `/sp.tasks`
- Implement feature-by-feature following spec-driven workflow
