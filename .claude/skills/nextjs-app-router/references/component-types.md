# Server Components vs Client Components

Complete guide to understanding and choosing between Server and Client Components in Next.js App Router.

## Overview

App Router uses **React Server Components** by default. This is a fundamental shift from the Pages Router where everything was a Client Component.

### Key Principle

**Server Components are the default. Use Client Components only when necessary for interactivity.**

---

## Server Components (Default)

### Characteristics

- **Execute on server only** - Code never sent to browser
- **Direct backend access** - Can query databases, read files, use server-only libraries
- **Secrets stay secure** - API keys, tokens, credentials never exposed
- **Zero JavaScript** - Reduces bundle size significantly
- **Cannot use browser APIs** - No window, document, localStorage, etc.
- **Cannot use hooks** - No useState, useEffect, useContext, etc.
- **Cannot use event handlers** - No onClick, onChange, etc.

### When to Use Server Components

✅ **Always use Server Components for**:
- Fetching data from databases or APIs
- Accessing backend resources directly
- Keeping sensitive information secure
- Rendering static content
- SEO-critical content
- Large dependencies that don't need client-side execution

### Example: Data Fetching

```typescript
// app/posts/page.tsx - Server Component (default, no directive needed)
export default async function PostsPage() {
  // Direct fetch - no need for useEffect
  const response = await fetch('https://api.example.com/posts', {
    cache: 'no-store' // or use caching strategies
  });
  const posts = await response.json();

  return (
    <div>
      <h1>Posts</h1>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  );
}
```

### Example: Database Query

```typescript
// app/users/page.tsx - Server Component
import { db } from '@/lib/database';

export default async function UsersPage() {
  // Direct database access - secure on server
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true
    }
  });

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Example: Using Secrets

```typescript
// app/api-data/page.tsx - Server Component
export default async function ApiDataPage() {
  // API key stays secure on server
  const response = await fetch('https://api.example.com/data', {
    headers: {
      'Authorization': `Bearer ${process.env.API_SECRET_KEY}`
    }
  });
  const data = await response.json();

  return <div>{JSON.stringify(data)}</div>;
}
```

---

## Client Components

### Characteristics

- **Execute in browser** - JavaScript sent to client
- **Support interactivity** - Event handlers, state, effects
- **Use React hooks** - useState, useEffect, useContext, etc.
- **Access browser APIs** - window, localStorage, navigator, etc.
- **Require 'use client' directive** - Must be explicitly marked
- **Increase bundle size** - Every Client Component adds to JavaScript payload
- **Cannot directly access backend** - No database queries or server-only resources

### When to Use Client Components

✅ **Use Client Components for**:
- Interactive features (buttons, forms with state)
- Event handlers (onClick, onChange, onSubmit, etc.)
- React hooks (useState, useEffect, useContext, useReducer)
- Browser APIs (localStorage, sessionStorage, window, navigator)
- Real-time updates (WebSocket, polling)
- Client-side routing hooks (useRouter, usePathname, useSearchParams)
- Third-party libraries that require browser APIs

### The 'use client' Directive

Place `'use client'` at the **top of the file** before any imports:

```typescript
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

❌ **Wrong placement**:
```typescript
import { useState } from 'react';

'use client'; // ❌ Too late - must be first line

export default function Counter() {
  // ...
}
```

### Example: Interactive Form

```typescript
'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Handle form submission
    console.log({ name, email, message });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message"
      />
      <button type="submit">Send</button>
    </form>
  );
}
```

### Example: Using Browser APIs

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function WindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Access window object (browser API)
    function updateSize() {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div>
      Window size: {size.width} x {size.height}
    </div>
  );
}
```

### Example: Client-Side Routing

```typescript
'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav>
      <button
        onClick={() => router.push('/dashboard')}
        disabled={pathname === '/dashboard'}
      >
        Dashboard
      </button>
      <button
        onClick={() => router.push('/settings')}
        disabled={pathname === '/settings'}
      >
        Settings
      </button>
    </nav>
  );
}
```

---

## Composition Pattern (The Right Way)

### The Golden Rule

**Keep Server Components at the top, nest Client Components as children.**

This allows you to:
- Fetch data on the server (fast, secure)
- Pass data to Client Components via props
- Minimize JavaScript sent to browser
- Maintain optimal performance

### Pattern 1: Data Fetching + Interactivity

```typescript
// app/products/page.tsx - Server Component
import ProductList from './product-list'; // Client Component

export default async function ProductsPage() {
  // Fetch data on server
  const products = await fetch('https://api.example.com/products')
    .then(res => res.json());

  return (
    <div>
      <h1>Products</h1>
      {/* Pass data to Client Component */}
      <ProductList products={products} />
    </div>
  );
}
```

```typescript
// app/products/product-list.tsx - Client Component
'use client';

import { useState } from 'react';

export default function ProductList({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');

  const filtered = products
    .filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      return sort === 'asc'
        ? a.price - b.price
        : b.price - a.price;
    });

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter products..."
      />
      <button onClick={() => setSort(sort === 'asc' ? 'desc' : 'asc')}>
        Sort {sort === 'asc' ? '↑' : '↓'}
      </button>
      <ul>
        {filtered.map(product => (
          <li key={product.id}>
            {product.name} - ${product.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Pattern 2: Nested Server and Client Components

```typescript
// app/dashboard/page.tsx - Server Component
import UserStats from './user-stats'; // Server Component
import ActivityFeed from './activity-feed'; // Client Component

export default async function DashboardPage() {
  const [stats, activities] = await Promise.all([
    fetchStats(),
    fetchActivities()
  ]);

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {/* Server Component - no interactivity */}
      <UserStats data={stats} />

      {/* Client Component - real-time updates */}
      <ActivityFeed initialData={activities} />
    </div>
  );
}
```

```typescript
// app/dashboard/user-stats.tsx - Server Component
export default function UserStats({ data }: { data: Stats }) {
  return (
    <div className="stats">
      <div>Total Users: {data.totalUsers}</div>
      <div>Active Today: {data.activeToday}</div>
      <div>Revenue: ${data.revenue}</div>
    </div>
  );
}
```

```typescript
// app/dashboard/activity-feed.tsx - Client Component
'use client';

import { useEffect, useState } from 'react';

export default function ActivityFeed({ initialData }: { initialData: Activity[] }) {
  const [activities, setActivities] = useState(initialData);

  useEffect(() => {
    // Poll for new activities every 30 seconds
    const interval = setInterval(async () => {
      const response = await fetch('/api/activities');
      const newActivities = await response.json();
      setActivities(newActivities);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="feed">
      <h2>Recent Activity</h2>
      <ul>
        {activities.map(activity => (
          <li key={activity.id}>
            {activity.user} - {activity.action}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Pattern 3: Server Component Wrapping Client Component

```typescript
// app/posts/[id]/page.tsx - Server Component
import CommentForm from './comment-form'; // Client Component
import CommentList from './comment-list'; // Server Component

export default async function PostPage({ params }: { params: { id: string } }) {
  const [post, comments] = await Promise.all([
    fetchPost(params.id),
    fetchComments(params.id)
  ]);

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>

      <section>
        <h2>Comments</h2>
        {/* Server Component - rendered on server */}
        <CommentList comments={comments} />

        {/* Client Component - interactive form */}
        <CommentForm postId={params.id} />
      </section>
    </article>
  );
}
```

---

## Common Mistakes

### ❌ Mistake 1: Using Client Component for Data Fetching

```typescript
// ❌ BAD: Fetching in Client Component
'use client';

import { useEffect, useState } from 'react';

export default function PostsPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(setPosts);
  }, []);

  return <div>{/* ... */}</div>;
}
```

```typescript
// ✅ GOOD: Fetching in Server Component
export default async function PostsPage() {
  const posts = await fetch('https://api.example.com/posts')
    .then(res => res.json());

  return <div>{/* ... */}</div>;
}
```

### ❌ Mistake 2: Making Everything Client Components

```typescript
// ❌ BAD: Entire page is Client Component
'use client';

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Static content that doesn't need interactivity</p>
    </div>
  );
}
```

```typescript
// ✅ GOOD: Server Component with Client Components only where needed
import InteractiveWidget from './interactive-widget';

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Static content that doesn't need interactivity</p>
      <InteractiveWidget /> {/* Only this needs 'use client' */}
    </div>
  );
}
```

### ❌ Mistake 3: Passing Non-Serializable Props

```typescript
// ❌ BAD: Passing functions from Server to Client Component
export default function ServerComponent() {
  function handleClick() {
    console.log('clicked');
  }

  return <ClientComponent onClick={handleClick} />; // ❌ Error!
}
```

```typescript
// ✅ GOOD: Use Server Actions instead
// app/actions.ts
'use server';

export async function handleClick() {
  console.log('clicked');
}

// app/page.tsx
import ClientComponent from './client-component';
import { handleClick } from './actions';

export default function ServerComponent() {
  return <ClientComponent action={handleClick} />;
}
```

---

## Decision Tree

Use this flowchart to decide between Server and Client Components:

```
Does the component need interactivity?
│
├─ NO ─→ Use Server Component
│        ├─ Fetching data? ✅ Server Component
│        ├─ Static content? ✅ Server Component
│        ├─ SEO critical? ✅ Server Component
│        └─ Using secrets? ✅ Server Component
│
└─ YES ─→ Ask: What kind of interactivity?
         │
         ├─ Event handlers (onClick, etc.)? ─→ Client Component
         ├─ React hooks (useState, etc.)? ─→ Client Component
         ├─ Browser APIs (localStorage, etc.)? ─→ Client Component
         └─ Form with state management? ─→ Client Component
```

---

## Performance Implications

### Server Components

**Benefits**:
- ✅ Zero JavaScript sent to browser
- ✅ Faster initial page load
- ✅ Better Core Web Vitals
- ✅ Smaller bundle size
- ✅ Direct backend access

**Limitations**:
- ❌ No interactivity
- ❌ No hooks
- ❌ No browser APIs

### Client Components

**Benefits**:
- ✅ Full interactivity
- ✅ React hooks support
- ✅ Browser API access

**Limitations**:
- ❌ Increases JavaScript bundle
- ❌ Slower initial load
- ❌ No direct backend access
- ❌ Secrets would be exposed

### Bundle Size Example

```
Server Component only:
  HTML: 10 KB
  JavaScript: 0 KB
  Total: 10 KB

Client Component:
  HTML: 10 KB
  JavaScript: 50 KB (React + your code)
  Total: 60 KB

Difference: 6x larger!
```

---

## Summary

### Use Server Components (Default) For:
- Data fetching
- Backend resource access
- Static content rendering
- SEO-critical content
- Keeping secrets secure
- Reducing bundle size

### Use Client Components Only For:
- Interactive features
- Event handlers
- React hooks
- Browser APIs
- Real-time updates
- Client-side state management

### Composition Strategy:
1. Start with Server Components
2. Identify interactive parts
3. Extract interactive parts to Client Components
4. Pass data from Server to Client via props
5. Keep Client Components small and focused
