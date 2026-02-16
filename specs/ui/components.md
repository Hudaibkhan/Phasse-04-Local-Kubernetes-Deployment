# UI Components Specification

## Status
📝 **Draft** - Phase II Frontend Component Library

## Overview

Reusable component library for the Evolution Todo frontend application. All components follow React best practices, TypeScript typing, and TailwindCSS styling conventions.

## Component Design Principles

1. **Composability**: Small, focused components that can be combined
2. **Reusability**: Generic where appropriate, specific when needed
3. **Accessibility**: WCAG AA compliant with ARIA labels
4. **Type Safety**: Full TypeScript with proper prop types
5. **Testability**: Easy to unit test in isolation

## Technology Context

- **Framework**: React 18+ via Next.js 15+
- **Language**: TypeScript
- **Styling**: TailwindCSS with utility classes
- **State**: React hooks (useState, useEffect, useContext)
- **Forms**: Controlled components with validation

---

## Component Inventory

### Layout Components
1. Header
2. Footer

### Form Components
3. Input
4. Button
5. Textarea
6. Checkbox

### Authentication Components
7. LoginForm
8. SignupForm

### Task Components
9. TaskList
10. TaskItem
11. TaskForm

### Utility Components
12. Loading (Spinner)
13. EmptyState
14. Modal
15. Toast (future)

---

## Component Specifications

### 1. Header

**Purpose**: Top navigation bar with branding and user menu

**Props**:
```typescript
interface HeaderProps {
  user?: {
    email: string
  }
  onLogout?: () => void
}
```

**Behavior**:
- If `user` prop provided → Show email and logout button
- If no `user` prop → Show login/signup links

**Structure**:
```
<header>
  <div> (container)
    <Logo />
    {user ? <UserMenu /> : <AuthLinks />}
  </div>
</header>
```

**File**: `frontend/src/components/layout/Header.tsx`

---

### 2. Footer

**Purpose**: Simple footer with copyright

**Props**: None

**Structure**:
```
<footer>
  <p>© 2026 Evolution Todo. All rights reserved.</p>
</footer>
```

**File**: `frontend/src/components/layout/Footer.tsx`

---

### 3. Input

**Purpose**: Reusable form input with validation states

**Props**:
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
}
```

**States**:
- Default
- Focus
- Error (with error message)
- Disabled

**Structure**:
```
<div>
  <label>{label}</label>
  <input {...props} />
  {error && <span>{error}</span>}
  {helperText && <span>{helperText}</span>}
</div>
```

**Styling**:
- Focus ring (blue, visible)
- Error state (red border + text)
- Disabled state (gray, cursor not-allowed)

**File**: `frontend/src/components/forms/Input.tsx`

---

### 4. Button

**Purpose**: Reusable button with variants and loading state

**Props**:
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  loading?: boolean
  fullWidth?: boolean
}
```

**Variants**:
- **Primary**: Blue background, white text
- **Secondary**: Gray background, dark text
- **Danger**: Red background, white text

**States**:
- Default
- Hover
- Active (pressed)
- Disabled
- Loading (spinner + disabled)

**Structure**:
```
<button className={variants[variant]}>
  {loading && <Spinner />}
  {children}
</button>
```

**File**: `frontend/src/components/forms/Button.tsx`

---

### 5. Textarea

**Purpose**: Multi-line text input for descriptions

**Props**:
```typescript
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  helperText?: string
}
```

**Behavior**:
- Auto-resize (optional)
- Character count display (optional)
- Max length enforcement

**File**: `frontend/src/components/forms/Textarea.tsx`

---

### 6. Checkbox

**Purpose**: Checkbox input for task completion toggle

**Props**:
```typescript
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}
```

**States**:
- Unchecked
- Checked
- Indeterminate (future)

**Accessibility**:
- Label associated with input
- Keyboard accessible (Space to toggle)

**File**: `frontend/src/components/forms/Checkbox.tsx`

---

### 7. LoginForm

**Purpose**: Login form with email/password inputs

**Props**:
```typescript
interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => Promise<void>
  error?: string
}
```

**State**:
```typescript
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [loading, setLoading] = useState(false)
```

**Validation**:
- Email: Required, valid format
- Password: Required, min 8 characters

**Structure**:
```
<form onSubmit={handleSubmit}>
  <Input label="Email" type="email" />
  <Input label="Password" type="password" />
  {error && <ErrorMessage />}
  <Button type="submit" loading={loading}>Sign In</Button>
  <Link to="/signup">Don't have an account?</Link>
</form>
```

**File**: `frontend/src/components/auth/LoginForm.tsx`

---

### 8. SignupForm

**Purpose**: Registration form with email/password inputs

**Props**:
```typescript
interface SignupFormProps {
  onSubmit: (data: { email: string; password: string }) => Promise<void>
  error?: string
}
```

**State**: Same as LoginForm

**Validation**:
- Email: Required, valid format, not already registered
- Password: Required, min 8 characters

**Structure**: Similar to LoginForm with "Create Account" button

**File**: `frontend/src/components/auth/SignupForm.tsx`

---

### 9. TaskList

**Purpose**: Display list of tasks

**Props**:
```typescript
interface TaskListProps {
  tasks: Task[]
  onToggle: (taskId: string) => void
  onDelete: (taskId: string) => void
  loading?: boolean
}

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  created_at: string
  updated_at: string
}
```

**Behavior**:
- If `tasks.length === 0` → Show EmptyState
- If `loading` → Show skeleton loaders
- Otherwise → Render TaskItem for each task

**Structure**:
```
<div>
  {tasks.length === 0 ? (
    <EmptyState />
  ) : (
    tasks.map(task => (
      <TaskItem key={task.id} {...task} onToggle={onToggle} onDelete={onDelete} />
    ))
  )}
</div>
```

**File**: `frontend/src/components/tasks/TaskList.tsx`

---

### 10. TaskItem

**Purpose**: Individual task display with actions

**Props**:
```typescript
interface TaskItemProps {
  id: string
  title: string
  completed: boolean
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}
```

**Behavior**:
- Click checkbox → Call `onToggle(id)`
- Click title → Navigate to `/tasks/{id}`
- Click delete → Call `onDelete(id)` after confirmation
- Completed tasks → Show strikethrough

**Structure**:
```
<div>
  <Checkbox checked={completed} onChange={() => onToggle(id)} />
  <span className={completed ? 'line-through' : ''}>{title}</span>
  <button onClick={() => onDelete(id)}>Delete</button>
</div>
```

**File**: `frontend/src/components/tasks/TaskItem.tsx`

---

### 11. TaskForm

**Purpose**: Form for creating/editing tasks

**Props**:
```typescript
interface TaskFormProps {
  initialData?: {
    title: string
    description?: string
    completed?: boolean
  }
  onSubmit: (data: TaskFormData) => Promise<void>
  onCancel?: () => void
  mode: 'create' | 'edit'
}

interface TaskFormData {
  title: string
  description?: string
  completed?: boolean
}
```

**State**:
```typescript
const [title, setTitle] = useState(initialData?.title || '')
const [description, setDescription] = useState(initialData?.description || '')
const [completed, setCompleted] = useState(initialData?.completed || false)
const [loading, setLoading] = useState(false)
```

**Validation**:
- Title: Required, max 200 characters
- Description: Optional, max 1000 characters

**Variants**:
- **Compact** (for dashboard quick add): Only title input + button
- **Full** (for task detail page): Title, description, completed checkbox + save/cancel buttons

**Structure**:
```
<form onSubmit={handleSubmit}>
  <Input label="Title" value={title} onChange={setTitle} required maxLength={200} />
  {mode === 'edit' && (
    <>
      <Textarea label="Description" value={description} onChange={setDescription} maxLength={1000} />
      <Checkbox label="Completed" checked={completed} onChange={setCompleted} />
    </>
  )}
  <div>
    <Button type="submit" loading={loading}>
      {mode === 'create' ? 'Add Task' : 'Save Changes'}
    </Button>
    {onCancel && <Button variant="secondary" onClick={onCancel}>Cancel</Button>}
  </div>
</form>
```

**File**: `frontend/src/components/tasks/TaskForm.tsx`

---

### 12. Loading (Spinner)

**Purpose**: Loading indicator

**Props**:
```typescript
interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}
```

**Variants**:
- Spinner only
- Spinner with text
- Skeleton screens (for lists)

**Structure**:
```
<div>
  <div className="animate-spin">{/* SVG spinner */}</div>
  {text && <p>{text}</p>}
</div>
```

**File**: `frontend/src/components/ui/Loading.tsx`

---

### 13. EmptyState

**Purpose**: Display when no tasks exist

**Props**:
```typescript
interface EmptyStateProps {
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
}
```

**Default Message**: "No tasks yet. Create your first task!"

**Structure**:
```
<div>
  <svg>{/* Empty state icon */}</svg>
  <p>{message}</p>
  {action && <Button onClick={action.onClick}>{action.label}</Button>}
</div>
```

**File**: `frontend/src/components/ui/EmptyState.tsx`

---

### 14. Modal

**Purpose**: Confirmation dialogs and overlays

**Props**:
```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
}
```

**Behavior**:
- Click overlay → Close modal
- Press Escape → Close modal
- Trap focus within modal
- Scroll lock on body

**Structure**:
```
{isOpen && (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <h2>{title}</h2>
      <div>{children}</div>
      {actions && <div>{actions}</div>}
    </div>
  </div>
)}
```

**Use Cases**:
- Delete confirmation
- Error messages
- Success notifications

**File**: `frontend/src/components/ui/Modal.tsx`

---

### 15. Toast (Phase III)

**Purpose**: Temporary notification messages

**Props**:
```typescript
interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
  onClose: () => void
}
```

**Behavior**:
- Auto-dismiss after `duration` (default 3000ms)
- Slide in from top/bottom
- Can be manually dismissed

**File**: `frontend/src/components/ui/Toast.tsx` (Phase III)

---

## Component Organization

```
frontend/
└── src/
    └── components/
        ├── layout/
        │   ├── Header.tsx
        │   └── Footer.tsx
        ├── forms/
        │   ├── Input.tsx
        │   ├── Button.tsx
        │   ├── Textarea.tsx
        │   └── Checkbox.tsx
        ├── auth/
        │   ├── LoginForm.tsx
        │   └── SignupForm.tsx
        ├── tasks/
        │   ├── TaskList.tsx
        │   ├── TaskItem.tsx
        │   └── TaskForm.tsx
        └── ui/
            ├── Loading.tsx
            ├── EmptyState.tsx
            ├── Modal.tsx
            └── Toast.tsx (Phase III)
```

---

## Styling Guidelines

### TailwindCSS Classes

**Spacing**:
- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Section gaps: `space-y-4` or `gap-4`

**Typography**:
- Page title: `text-3xl font-bold`
- Section title: `text-xl font-semibold`
- Body text: `text-base`
- Small text: `text-sm text-gray-600`

**Colors**:
- Primary: `bg-blue-600 hover:bg-blue-700 text-white`
- Secondary: `bg-gray-200 hover:bg-gray-300 text-gray-800`
- Danger: `bg-red-600 hover:bg-red-700 text-white`
- Success: `bg-green-600 text-white`

**Forms**:
- Input: `border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500`
- Label: `block text-sm font-medium text-gray-700 mb-1`
- Error: `text-red-600 text-sm mt-1`

---

## Accessibility Checklist

For each component:
- [ ] Semantic HTML elements used
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation supported
- [ ] Focus indicators visible
- [ ] Color contrast WCAG AA compliant
- [ ] Screen reader tested
- [ ] Error messages announced

---

## State Management

### Local State (useState)
- Form inputs
- Component-specific UI state (open/closed, loading)

### Context API (useContext)
- User authentication state
- Theme (future)
- Toast notifications (future)

### Example Auth Context:
```typescript
interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
```

---

## Testing Strategy (Phase III)

### Unit Tests
- Props rendering correctly
- Event handlers called with correct arguments
- State updates work as expected
- Error states display properly

### Integration Tests
- Forms submit with valid data
- API calls made correctly
- Navigation works as expected

### Tools
- Jest for unit tests
- React Testing Library for component tests
- Playwright for E2E tests (Phase III)

---

## Performance Optimizations

### React Best Practices
- `React.memo()` for expensive components (TaskList)
- `useMemo()` for expensive computations
- `useCallback()` for stable function references
- Lazy loading with `React.lazy()` for modals

### Code Splitting
- Route-based splitting (automatic with Next.js)
- Component-based splitting for heavy components

---

## Notes

This component specification defines all reusable UI components for Phase II. The design prioritizes:

1. **Reusability**: Components used across multiple pages
2. **Accessibility**: WCAG AA compliant with keyboard support
3. **Type Safety**: Full TypeScript coverage
4. **Consistency**: Unified styling with TailwindCSS
5. **Testability**: Isolated, easy-to-test components

**Implementation Checklist**:
- [ ] Create component directory structure
- [ ] Implement form components (Input, Button, Textarea, Checkbox)
- [ ] Implement auth components (LoginForm, SignupForm)
- [ ] Implement task components (TaskList, TaskItem, TaskForm)
- [ ] Implement utility components (Loading, EmptyState, Modal)
- [ ] Add TypeScript types for all props
- [ ] Style with TailwindCSS
- [ ] Test keyboard navigation
- [ ] Validate accessibility with screen reader

**Next Steps**:
- Implement components in Next.js frontend
- Create component Storybook (Phase III)
- Write unit tests for components
- Document component API with JSDoc comments
