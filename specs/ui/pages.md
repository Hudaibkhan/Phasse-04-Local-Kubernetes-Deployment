# UI Pages Specification

## Status
📝 **Draft** - Phase II Frontend Pages Design

## Overview

Page structure and routing for the Evolution Todo frontend application using Next.js 15+ App Router. All pages follow consistent layout patterns and implement authentication requirements.

## Technology Context

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: React hooks + Context API
- **Authentication**: Client-side JWT validation with HTTP-only cookies

## Routing Strategy

- **App Router**: File-based routing with `app/` directory
- **Server Components**: Default for static content
- **Client Components**: For interactive elements ("use client" directive)
- **Middleware**: Authentication checks on protected routes
- **Layouts**: Shared layouts for consistent UI structure

---

## Page Inventory

### Public Pages (No Authentication Required)

1. `/` - Landing/Home Page
2. `/login` - User Login
3. `/signup` - User Registration

### Protected Pages (Authentication Required)

4. `/dashboard` - Main Task Management Dashboard
5. `/tasks/[id]` - Individual Task Detail/Edit View

### Error Pages

6. `/404` - Not Found
7. `/500` - Server Error

---

## Page Specifications

### 1. Landing Page: `/`

**Purpose**: Welcome users and provide navigation to authentication pages

**Access**: Public (redirects to /dashboard if already authenticated)

**Layout**: Standalone layout with header and footer

**Content**:
- Application logo and branding
- Brief description: "Simple, secure task management"
- Call-to-action buttons:
  - "Get Started" → /signup
  - "Sign In" → /login
- Feature highlights (optional):
  - "Secure multi-user support"
  - "Simple task management"
  - "Always accessible"

**File Structure**:
```
app/
├── layout.tsx (root layout)
├── page.tsx (landing page)
└── globals.css
```

**Key Components Used**:
- Header (with logo, login/signup links)
- Hero section
- CTA buttons
- Footer

**Navigation**:
- User not authenticated → Show page
- User authenticated → Redirect to /dashboard

---

### 2. Login Page: `/login`

**Purpose**: Authenticate existing users

**Access**: Public (redirects to /dashboard if already authenticated)

**Layout**: Centered authentication layout

**Content**:
- Page title: "Welcome Back"
- Login form (LoginForm component):
  - Email input (type="email", required)
  - Password input (type="password", required, min 8 chars)
  - "Sign In" button
  - Error message display area
- Link to signup: "Don't have an account? Sign up"
- Minimal branding (logo)

**File Structure**:
```
app/
└── login/
    └── page.tsx
```

**Key Components Used**:
- LoginForm
- Input (email, password)
- Button (primary)
- Error display

**Form Behavior**:
1. On submit → POST /api/auth/login
2. On success → Redirect to /dashboard
3. On error → Display error message inline
4. Loading state → Disable button, show spinner

**Validation**:
- Client-side: Email format, password min length
- Server-side: Credentials validation

**Navigation**:
- User not authenticated → Show page
- User authenticated → Redirect to /dashboard
- After successful login → Redirect to /dashboard

---

### 3. Signup Page: `/signup`

**Purpose**: Register new user accounts

**Access**: Public (redirects to /dashboard if already authenticated)

**Layout**: Centered authentication layout

**Content**:
- Page title: "Create Account"
- Registration form (SignupForm component):
  - Email input (type="email", required)
  - Password input (type="password", required, min 8 chars)
  - "Create Account" button
  - Error message display area
- Link to login: "Already have an account? Sign in"
- Minimal branding (logo)

**File Structure**:
```
app/
└── signup/
    └── page.tsx
```

**Key Components Used**:
- SignupForm
- Input (email, password)
- Button (primary)
- Error display

**Form Behavior**:
1. On submit → POST /api/auth/register
2. On success → Redirect to /login with success message
3. On error → Display error message inline (e.g., "Email already registered")
4. Loading state → Disable button, show spinner

**Validation**:
- Client-side: Email format, password min 8 characters
- Server-side: Email uniqueness, password requirements

**Navigation**:
- User not authenticated → Show page
- User authenticated → Redirect to /dashboard
- After successful signup → Redirect to /login

---

### 4. Dashboard Page: `/dashboard`

**Purpose**: Main task management interface - view, create, and manage tasks

**Access**: Protected (requires authentication)

**Layout**: Authenticated app layout with header and main content

**Content**:
- Page title: "My Tasks"
- User menu (top right): Email, Logout button
- Task creation section:
  - Quick add task form (TaskForm compact)
  - Input for title
  - "Add Task" button
- Task list section:
  - List of all user's tasks (TaskList component)
  - Each task shows: checkbox, title, edit/delete actions
  - Empty state: "No tasks yet. Create your first task!" (if no tasks)
- Task count: "X tasks" or "X tasks, Y completed"

**File Structure**:
```
app/
└── (protected)/
    ├── layout.tsx (authenticated layout)
    └── dashboard/
        └── page.tsx
```

**Key Components Used**:
- Header (with user menu)
- TaskForm (compact version for quick add)
- TaskList
- TaskItem (multiple, for each task)
- EmptyState (when no tasks)

**Data Loading**:
1. On page load → GET /api/tasks
2. Display loading skeleton while fetching
3. Render task list on success
4. Show error message on failure

**Interactions**:
- Create task → Refresh task list
- Toggle completion → PATCH /api/tasks/{id}, update UI optimistically
- Click task title → Navigate to /tasks/{id}
- Delete task → Show confirmation, DELETE /api/tasks/{id}, refresh list

**Navigation**:
- User not authenticated → Redirect to /login
- User authenticated → Show page
- Logout button → POST /api/auth/logout, redirect to /

---

### 5. Task Detail Page: `/tasks/[id]`

**Purpose**: View and edit individual task details

**Access**: Protected (requires authentication and task ownership)

**Layout**: Authenticated app layout with back navigation

**Content**:
- Back button: "← Back to Dashboard"
- Page title: Task title (editable)
- Task edit form (TaskForm full version):
  - Title input (pre-filled)
  - Description textarea (pre-filled, optional)
  - Completed checkbox
  - "Save Changes" button
  - "Cancel" button (navigates back)
- Delete button (bottom, destructive styling)
- Metadata:
  - Created: [timestamp]
  - Last updated: [timestamp]

**File Structure**:
```
app/
└── (protected)/
    └── tasks/
        └── [id]/
            └── page.tsx
```

**Key Components Used**:
- Header (with user menu)
- TaskForm (full version for editing)
- Button (save, cancel, delete)
- Confirmation modal (for delete)

**Data Loading**:
1. On page load → GET /api/tasks/{id}
2. Display loading skeleton while fetching
3. Pre-fill form on success
4. Show 404 if task not found
5. Show 403 if user doesn't own task

**Form Behavior**:
1. On submit → PUT /api/tasks/{id}
2. On success → Show success message, optionally navigate back
3. On error → Display error message
4. Cancel → Navigate back to /dashboard without saving

**Delete Flow**:
1. Click "Delete Task" → Show confirmation modal
2. Confirm → DELETE /api/tasks/{id}
3. On success → Navigate to /dashboard
4. On error → Show error message
5. Cancel → Close modal, stay on page

**Navigation**:
- User not authenticated → Redirect to /login
- User not owner → Show 403 Forbidden
- Task not found → Show 404 Not Found
- After save → Stay on page or redirect to /dashboard
- After delete → Redirect to /dashboard
- Cancel → Navigate to /dashboard

---

### 6. 404 Not Found Page

**Purpose**: Handle non-existent routes

**Access**: Public

**Layout**: Minimal layout

**Content**:
- "404 - Page Not Found"
- Friendly message: "The page you're looking for doesn't exist."
- Link to home: "Go Home" → /

**File Structure**:
```
app/
└── not-found.tsx
```

---

### 7. 500 Server Error Page

**Purpose**: Handle unexpected server errors

**Access**: Public

**Layout**: Minimal layout

**Content**:
- "500 - Something Went Wrong"
- Friendly message: "We're experiencing technical difficulties. Please try again later."
- "Try Again" button (reloads page)
- Link to home: "Go Home" → /

**File Structure**:
```
app/
└── error.tsx
```

---

## Layout Hierarchy

```
app/
├── layout.tsx                 # Root layout (all pages)
├── page.tsx                   # Landing page (/)
├── login/
│   └── page.tsx               # Login page (/login)
├── signup/
│   └── page.tsx               # Signup page (/signup)
└── (protected)/               # Route group for protected routes
    ├── layout.tsx             # Authenticated layout
    ├── dashboard/
    │   └── page.tsx           # Dashboard (/dashboard)
    └── tasks/
        └── [id]/
            └── page.tsx       # Task detail (/tasks/[id])
```

**Root Layout** (`app/layout.tsx`):
- HTML structure
- Global styles
- Font configuration
- Meta tags

**Protected Layout** (`app/(protected)/layout.tsx`):
- Authentication check (middleware)
- Header with user menu
- Logout functionality
- Consistent page structure

---

## Navigation Flow

### Public User Journey
```
/ (Landing) → /signup → /login → /dashboard (after auth)
            ↘ /login → /dashboard (after auth)
```

### Authenticated User Journey
```
/dashboard → /tasks/[id] → /dashboard
           ↘ Logout → /
```

### Error Handling
```
Any invalid route → /404
Server error → /500
Unauthorized access → /login (with redirect back)
```

---

## Authentication Middleware

**File**: `middleware.ts`

**Purpose**: Protect routes and redirect unauthenticated users

**Logic**:
```typescript
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')
  const { pathname } = request.nextUrl

  // Protected routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/tasks')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if ((pathname === '/login' || pathname === '/signup') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard', '/tasks/:path*', '/login', '/signup']
}
```

---

## Responsive Design

All pages must be responsive:

### Mobile (< 768px)
- Single column layout
- Stacked navigation
- Touch-friendly buttons (min 44x44px)
- Simplified task list

### Tablet (768px - 1024px)
- Two-column layout where appropriate
- Expanded navigation
- Larger touch targets

### Desktop (> 1024px)
- Full layout with sidebar (future)
- Hover states
- Keyboard navigation

---

## Accessibility Requirements

- Semantic HTML (headings, nav, main, etc.)
- ARIA labels on interactive elements
- Keyboard navigation support (Tab, Enter, Esc)
- Focus indicators visible
- Color contrast WCAG AA compliant
- Screen reader friendly error messages

---

## Performance Considerations

- **Server Components**: Use by default for static content
- **Client Components**: Only when interactivity needed
- **Code Splitting**: Automatic with Next.js App Router
- **Lazy Loading**: For modals and heavy components
- **Optimistic UI**: For task completion toggle
- **Loading States**: Skeleton screens for better perceived performance

---

## Notes

This page specification defines all frontend pages for Phase II. The design prioritizes:

1. **Simplicity**: Clean, focused interfaces
2. **Security**: Protected routes with middleware
3. **User Experience**: Clear navigation and feedback
4. **Accessibility**: WCAG AA compliance
5. **Performance**: Server components and code splitting

**Implementation Checklist**:
- [ ] Create root layout with global styles
- [ ] Implement authentication middleware
- [ ] Build public pages (landing, login, signup)
- [ ] Build protected pages (dashboard, task detail)
- [ ] Create error pages (404, 500)
- [ ] Add loading states and skeletons
- [ ] Test responsive design on all breakpoints
- [ ] Validate accessibility with screen reader

**Next Steps**:
- Implement pages in Next.js
- Create reusable components (see components.md)
- Setup routing and middleware
- Integrate with API endpoints
- Add error boundaries
