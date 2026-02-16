# Quickstart Guide: Authentication, Database, and UI Fixes

**Feature**: 002-auth-db-fixes
**Date**: 2026-01-13

## Overview
This guide provides step-by-step instructions to implement the critical fixes for authentication, database, and UI issues in the Evolution Todo application.

## Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.9+
- PostgreSQL database (Neon recommended)
- Git

## Step 1: Setup Database Schema

### 1.1 Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 1.2 Configure Database Connection
Create `.env` file in backend directory:
```env
DATABASE_URL=postgresql://username:password@host:port/dbname
SECRET_KEY=your-secret-key-for-jwt
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 1.3 Create Database Models
Implement User, Task, and Session models in `backend/models/` following the data model specification:
- User: id, username, email, password_hash, timestamps
- Task: id, title, description, completed, user_id, timestamps
- Session: id, user_id, token, expires_at, timestamps

### 1.4 Set Up Database Migrations
Configure Alembic for database migrations:
```bash
cd backend
alembic init alemb
```

Create migration files and run:
```bash
alembic revision --autogenerate -m "Create user and task tables"
alembic upgrade head
```

## Step 2: Implement Backend API

### 2.1 Authentication Endpoints
Create auth router in `backend/api/routers/auth.py`:
- POST /register: Create user with hashed password
- POST /login: Authenticate user and return token
- POST /logout: Invalidate session
- GET /me: Get current user info

### 2.2 Task Management Endpoints
Create tasks router in `backend/api/routers/tasks.py`:
- GET /tasks: Get user's tasks
- POST /tasks: Create new task
- PUT /tasks/{id}: Update task
- DELETE /tasks/{id}: Delete task

### 2.3 Security Implementation
- Use bcrypt for password hashing
- Implement JWT token generation/verification
- Apply dependency injection for auth protection
- Validate user isolation (users can only access their own data)

## Step 3: Fix Frontend Authentication UI

### 3.1 Update Password Input Component
In `frontend/components/auth/PasswordInput.jsx`:
- Fix controlled input binding to properly capture and display password
- Implement password masking with ●●● dots
- Add show/hide toggle functionality
- Handle onChange events properly

### 3.2 Update Signup Form
In `frontend/app/signup/page.jsx`:
- Add username field
- Add confirm password field
- Implement password match validation
- Update form submission handler

### 3.3 Update Login Form
In `frontend/app/login/page.jsx`:
- Update to use the improved PasswordInput component
- Add proper error handling and validation

## Step 4: Implement Session Management

### 4.1 Create Auth Context
In `frontend/context/AuthContext.jsx`:
- Implement authentication state management
- Handle login/logout functionality
- Store and manage JWT tokens
- Implement session persistence

### 4.2 Create Protected Route Component
In `frontend/components/ProtectedRoute.jsx`:
- Check authentication status
- Redirect unauthenticated users appropriately
- Handle token expiration

### 4.3 Update Redirects
Fix redirect paths after authentication:
- Change post-signup redirect from `/dashboard` to `/tasks` or `/home`
- Implement proper navigation with React Router

## Step 5: Fix Task Page Loading Issues

### 5.1 Update Tasks Page
In `frontend/app/tasks/page.jsx`:
- Add proper loading states
- Implement error handling
- Remove infinite loading loop
- Fetch tasks from backend API

### 5.2 Implement API Calls
Create API utility functions in `frontend/lib/api.js`:
- Functions to call auth endpoints
- Functions to call task endpoints
- Add authentication headers to requests
- Implement error handling

## Step 6: Database Integration

### 6.1 Connect Frontend to Backend
- Ensure frontend API calls point to correct backend endpoints
- Implement proper error handling for network requests
- Add authentication token to all protected requests

### 6.2 Verify User Isolation
- Confirm that all database queries include proper user_id filtering
- Test that users can only access their own data
- Validate foreign key relationships

## Step 7: Testing

### 7.1 Test Authentication Flow
1. Navigate to signup page
2. Enter username, email, and matching passwords
3. Verify successful registration
4. Verify redirect to correct page
5. Test login with created account
6. Verify session persistence

### 7.2 Test UI Components
1. Password input should display masked dots when typing
2. Show/hide toggle should work properly
3. Confirm password validation should work
4. All forms should have proper error handling

### 7.3 Test Task Management
1. Log in and navigate to tasks page
2. Verify page loads without infinite loading
3. Create new tasks and verify they save
4. Update and delete tasks
5. Verify tasks persist after page refresh

## Troubleshooting

### Common Issues:
- **Password input shows empty**: Check controlled component state management
- **Redirect to /dashboard fails**: Update redirect path in auth flow
- **Database tables missing**: Run alembic migrations
- **Tasks page infinite loading**: Check API endpoint availability and auth headers

### Debug Steps:
1. Check browser console for errors
2. Verify backend is running and accessible
3. Confirm database connection and migration status
4. Validate JWT token handling
5. Test API endpoints individually