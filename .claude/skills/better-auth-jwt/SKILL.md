---
name: better-auth-jwt
description: |
  Provides secure authentication and authorization patterns using Better Auth with
  JWT tokens. This skill should be used when implementing authentication flows,
  session management, protected routes, and user identity propagation across frontend
  (Next.js) and backend (FastAPI). Enforces security-first approach with no hardcoded
  secrets and user isolation patterns.
---

# Better Auth and JWT Integration

Production-grade authentication and authorization with Better Auth and JWT tokens.

## What This Skill Does

- **Explains authentication flows**: Better Auth setup, email/password, social OAuth, JWT issuance
- **Defines JWT patterns**: Token structure, signing, verification, expiration
- **Frontend authentication**: Next.js client hooks, protected routes, session management
- **Backend authorization**: FastAPI JWT validation, user identity extraction, protected endpoints
- **Enforces security**: No hardcoded secrets, secure token storage, user isolation
- **User identity propagation**: Consistent user_id across frontend and backend

## What This Skill Does NOT Do

- UI component implementation (provides auth logic only)
- Database user management (integrates with existing user models)
- Password reset email sending (provides patterns for implementation)
- OAuth provider setup (provides configuration guidance only)

---

## Before Implementation

Gather context to ensure successful implementation:

| Source | Gather |
|--------|--------|
| **Codebase** | Existing auth setup, user models, protected routes |
| **Conversation** | Auth requirements, providers needed, session duration |
| **Skill References** | Better Auth patterns from `references/` (flows, JWT validation) |
| **User Guidelines** | Project-specific security policies, compliance requirements |

Ensure all required context is gathered before implementing.
Only ask user for THEIR specific requirements (domain expertise is in this skill).

---

## Core Principles

### 1. Security-First Approach

**Never compromise security** - follow industry best practices.

**Key Security Requirements**:
- **No hardcoded secrets** - use environment variables
- **Secure token storage** - HTTP-only cookies (not localStorage)
- **HTTPS required** - in production
- **Strong passwords** - minimum requirements enforced
- **JWT expiration** - short-lived access tokens
- **Refresh tokens** - for session extension

**Example** (Environment Variables):
```typescript
// ✅ GOOD: Secrets in environment
export const auth = betterAuth({
  secret: process.env.AUTH_SECRET,  // ✅ From env
  database: {
    url: process.env.DATABASE_URL   // ✅ From env
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,       // ✅ From env
      clientSecret: process.env.GOOGLE_CLIENT_SECRET // ✅ From env
    }
  }
})
```

```typescript
// ❌ BAD: Hardcoded secrets (security risk!)
export const auth = betterAuth({
  secret: "my-super-secret-key",  // ❌ Exposed in code
  socialProviders: {
    google: {
      clientId: "123456",           // ❌ Exposed
      clientSecret: "abcdef"        // ❌ Exposed
    }
  }
})
```

### 2. User Identity Propagation

**Consistent user_id across frontend and backend** - maintain authentication context.

**Flow**:
```
1. User signs in → Better Auth creates session
2. Frontend gets session → Extracts user.id
3. Frontend calls API → Sends JWT in Authorization header
4. Backend validates JWT → Extracts user_id
5. Backend queries data → Filters by user_id
```

**Example**:
```typescript
// Frontend: Extract user from session
const { data: session } = useSession()
const userId = session?.user.id

// API call with JWT
const response = await fetch('/api/tasks', {
  headers: {
    'Authorization': `Bearer ${session.token}`
  }
})
```

```python
# Backend: Extract user from JWT
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def get_current_user(credentials = Depends(security)):
    token = credentials.credentials
    payload = verify_jwt(token)  # Verify and decode
    user_id = payload["sub"]      # Extract user_id
    return user_id

@router.get("/tasks")
async def get_tasks(user_id: str = Depends(get_current_user)):
    # Query filtered by user_id
    return await db.query(Task).filter(Task.user_id == user_id).all()
```

### 3. JWT Token Structure

**JWTs are stateless** - contain all necessary claims.

**Standard Claims**:
- `sub` (subject) - User ID
- `iat` (issued at) - Timestamp when token was created
- `exp` (expiration) - When token expires
- `iss` (issuer) - Who issued the token

**Example JWT Payload**:
```json
{
  "sub": "user_abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "iat": 1234567890,
  "exp": 1234571490,
  "iss": "better-auth"
}
```

### 4. Session Management

**Better Auth manages sessions** - handles token lifecycle.

**Key Concepts**:
- **Access Token** - Short-lived (15-30 minutes)
- **Refresh Token** - Long-lived (7-30 days)
- **Session Cookie** - HTTP-only, secure, sameSite
- **Auto-refresh** - Seamless token renewal

---

## Better Auth Setup

### Installation

```bash
npm install better-auth
```

### Server Configuration

```typescript
// lib/auth.ts (Server-side auth instance)
import { betterAuth } from "better-auth"
import { PrismaClient } from "@prisma/client"
import { prismaAdapter } from "better-auth/adapters/prisma"

const prisma = new PrismaClient()

export const auth = betterAuth({
  // Database adapter
  database: prismaAdapter(prisma, {
    provider: "postgresql" // or "mysql", "sqlite"
  }),

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8
  },

  // Social OAuth providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: process.env.NEXT_PUBLIC_APP_URL + "/api/auth/callback/google"
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      redirectURI: process.env.NEXT_PUBLIC_APP_URL + "/api/auth/callback/github"
    }
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // 5 minutes
    }
  },

  // Security
  secret: process.env.AUTH_SECRET!,

  // Base URL
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,

  // Advanced options
  advanced: {
    cookiePrefix: "better-auth",
    crossSubDomainCookies: {
      enabled: false
    }
  }
})
```

### Environment Variables

```env
# .env.local

# Auth
AUTH_SECRET=your-super-secret-key-min-32-chars
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/db

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Next.js API Route

```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

export const { GET, POST } = toNextJsHandler(auth)
```

---

## Frontend Authentication (Next.js)

### Client Setup

```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  useActiveOrganization
} = authClient
```

### Sign Up Component

```typescript
// components/auth/signup-form.tsx
'use client'

import { useState } from 'react'
import { signUp } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export function SignUpForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signUp.email({
        email,
        password,
        name
      })

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}

      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  )
}
```

### Sign In Component

```typescript
// components/auth/signin-form.tsx
'use client'

import { useState } from 'react'
import { signIn } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export function SignInForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn.email({
        email,
        password
      })

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    await signIn.social({
      provider: 'google',
      callbackURL: '/dashboard'
    })
  }

  async function handleGitHubSignIn() {
    await signIn.social({
      provider: 'github',
      callbackURL: '/dashboard'
    })
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {error && <div className="error">{error}</div>}

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="social-signin">
        <button onClick={handleGoogleSignIn}>
          Sign in with Google
        </button>
        <button onClick={handleGitHubSignIn}>
          Sign in with GitHub
        </button>
      </div>
    </div>
  )
}
```

### Protected Page (Server Component)

```typescript
// app/dashboard/page.tsx
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  // Get session server-side
  const session = await auth.api.getSession({
    headers: await headers()
  })

  // Redirect if not authenticated
  if (!session) {
    redirect('/signin')
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      <p>Email: {session.user.email}</p>
      <p>User ID: {session.user.id}</p>
    </div>
  )
}
```

### Protected Route with Middleware

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function middleware(request: NextRequest) {
  // Validate session
  const session = await auth.api.getSession({
    headers: await headers()
  })

  // Redirect if not authenticated
  if (!session) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  runtime: "nodejs",  // Required for database session validation
  matcher: ["/dashboard/:path*", "/profile/:path*"]
}
```

### useSession Hook (Client Component)

```typescript
// components/user-menu.tsx
'use client'

import { useSession, signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export function UserMenu() {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  if (isPending) {
    return <div>Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="user-menu">
      <p>Signed in as {session.user.email}</p>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  )
}
```

---

## Backend JWT Validation (FastAPI)

### JWT Utilities

```python
# app/core/security.py
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import HTTPException, status

from app.core.config import settings

def verify_jwt_token(token: str) -> dict:
    """
    Verify and decode JWT token.
    Returns payload if valid, raises exception if invalid.
    """
    try:
        payload = jwt.decode(
            token,
            settings.AUTH_SECRET,
            algorithms=["HS256"]
        )

        # Check expiration
        exp = payload.get("exp")
        if exp and datetime.utcnow().timestamp() > exp:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expired",
                headers={"WWW-Authenticate": "Bearer"}
            )

        return payload

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )

def extract_user_id(token: str) -> str:
    """
    Extract user_id from JWT token.
    """
    payload = verify_jwt_token(token)
    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing subject"
        )

    return user_id
```

### Authentication Dependency

```python
# app/api/dependencies/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.security import verify_jwt_token, extract_user_id
from app.services.user_service import UserService
from app.api.dependencies.services import get_user_service

security = HTTPBearer()

async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Extract and return user_id from JWT token.
    """
    token = credentials.credentials
    return extract_user_id(token)

async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    user_service: UserService = Depends(get_user_service)
):
    """
    Get full user object from database.
    """
    user = await user_service.get_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )

    return user

async def require_admin(
    current_user = Depends(get_current_user)
):
    """
    Require admin role.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )

    return current_user
```

### Protected Routes

```python
# app/api/routes/tasks.py
from fastapi import APIRouter, Depends
from typing import List

from app.models.schemas.task import TaskResponse, TaskCreate
from app.services.task_service import TaskService
from app.api.dependencies.services import get_task_service
from app.api.dependencies.auth import get_current_user_id

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    user_id: str = Depends(get_current_user_id),
    service: TaskService = Depends(get_task_service)
):
    """
    List tasks for authenticated user.
    Requires valid JWT token.
    """
    return await service.get_tasks(user_id)

@router.post("", response_model=TaskResponse, status_code=201)
async def create_task(
    task_data: TaskCreate,
    user_id: str = Depends(get_current_user_id),
    service: TaskService = Depends(get_task_service)
):
    """
    Create task for authenticated user.
    Requires valid JWT token.
    """
    return await service.create_task(task_data, user_id)
```

### CORS Configuration

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

app = FastAPI()

# CORS - allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],  # Next.js URL
    allow_credentials=True,  # Allow cookies
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Frontend-Backend Integration

### API Client with JWT

```typescript
// lib/api-client.ts
import { authClient } from './auth-client'

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  // Get session to extract token
  const session = await authClient.getSession()

  if (!session) {
    throw new Error('Not authenticated')
  }

  // Extract JWT token (Better Auth stores it in session)
  const token = session.token  // or get from cookie

  // Make API call with JWT in Authorization header
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired, redirect to login
      window.location.href = '/signin'
    }
    throw new Error(`API Error: ${response.statusText}`)
  }

  return response.json()
}

// Usage example
export async function getTasks() {
  return apiCall('/api/v1/tasks')
}

export async function createTask(data: any) {
  return apiCall('/api/v1/tasks', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}
```

### Using API Client in Components

```typescript
// app/tasks/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { getTasks, createTask } from '@/lib/api-client'
import { useSession } from '@/lib/auth-client'

export default function TasksPage() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      loadTasks()
    }
  }, [session])

  async function loadTasks() {
    try {
      const data = await getTasks()
      setTasks(data)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateTask(title: string) {
    try {
      const newTask = await createTask({ title })
      setTasks([...tasks, newTask])
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  if (!session) {
    return <div>Please sign in</div>
  }

  if (loading) {
    return <div>Loading tasks...</div>
  }

  return (
    <div>
      <h1>My Tasks</h1>
      {/* Task list and form */}
    </div>
  )
}
```

---

## Security Best Practices

### Environment Variables

✅ **DO**:
- Store secrets in `.env.local` (gitignored)
- Use different secrets per environment
- Rotate secrets regularly
- Use strong, random secrets (min 32 characters)
- Never commit `.env.local` to version control

❌ **DON'T**:
- Hardcode secrets in code
- Use weak or predictable secrets
- Reuse secrets across projects
- Expose secrets in client-side code
- Commit secrets to git

### Token Storage

✅ **DO**:
- Store tokens in HTTP-only cookies
- Set `secure` flag in production (HTTPS only)
- Set `sameSite` to 'lax' or 'strict'
- Use short expiration times (15-30 min)
- Implement token refresh

❌ **DON'T**:
- Store tokens in localStorage (XSS vulnerable)
- Store tokens in sessionStorage
- Use long-lived tokens without refresh
- Skip `httpOnly` flag

### Password Requirements

✅ **DO**:
- Minimum 8 characters
- Require mix of uppercase, lowercase, numbers
- Hash passwords (bcrypt, argon2)
- Implement rate limiting on login
- Allow password reset

❌ **DON'T**:
- Store plain text passwords
- Use weak hashing (MD5, SHA1)
- Skip rate limiting
- Allow common passwords

### API Security

✅ **DO**:
- Validate JWT on every request
- Check token expiration
- Implement rate limiting
- Use HTTPS in production
- Log failed auth attempts

❌ **DON'T**:
- Trust client-provided user_id
- Skip JWT verification
- Expose detailed error messages
- Allow unlimited login attempts

---

## Quick Reference

### Better Auth Setup

```typescript
export const auth = betterAuth({
  secret: process.env.AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: { clientId, clientSecret },
    github: { clientId, clientSecret }
  }
})
```

### Frontend Sign In

```typescript
await signIn.email({ email, password })
await signIn.social({ provider: 'google' })
```

### Frontend Session

```typescript
const { data: session } = useSession()
const userId = session?.user.id
```

### Backend JWT Validation

```python
async def get_current_user_id(credentials = Depends(security)):
    token = credentials.credentials
    payload = verify_jwt_token(token)
    return payload["sub"]
```

### Protected Route

```python
@router.get("/tasks")
async def get_tasks(user_id: str = Depends(get_current_user_id)):
    return await service.get_tasks(user_id)
```

---

## References

See `references/` for detailed documentation:
- `auth-flows.md` - Complete authentication flows and patterns
- `jwt-validation.md` - JWT structure, signing, verification
- `security-guide.md` - Security best practices and compliance
- `integration-examples.md` - Full-stack integration examples
