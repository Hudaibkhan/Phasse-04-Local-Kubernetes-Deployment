---
name: nextjs-app-router
description: |
  Provides authoritative guidance for building production-grade Next.js applications
  using the App Router. This skill should be used when architecting, designing, or
  implementing Next.js frontend features with App Router, server components, client
  components, routing, data fetching, and performance optimization. Always references
  official Next.js documentation patterns.
---

# Next.js App Router Architecture

Production-grade guidance for Next.js App Router applications based on official documentation.

## What This Skill Does

- **Teaches App Router architecture**: Layouts, pages, routing patterns, file conventions
- **Distinguishes component types**: Server Components vs Client Components with clear usage guidelines
- **Defines data fetching patterns**: Server-side data fetching, caching, revalidation strategies
- **Optimizes performance**: Image optimization, font loading, code splitting, streaming
- **Manages environment variables**: Client vs server-side variables with security best practices
- **Follows modern conventions**: Official Next.js patterns, no deprecated approaches

## What This Skill Does NOT Do

- Backend API implementation (use FastAPI or other backend frameworks)
- Database schema design (frontend only)
- Authentication implementation (provides guidance only)
- Deploy applications (focuses on code architecture)

---

## Before Implementation

Gather context to ensure successful implementation:

| Source | Gather |
|--------|--------|
| **Codebase** | Existing Next.js structure, app/ directory layout, component patterns |
| **Conversation** | User's specific requirements, feature details, data needs |
| **Skill References** | Official Next.js patterns from `references/` (App Router docs, best practices) |
| **User Guidelines** | Project-specific conventions, team standards |

Ensure all required context is gathered before implementing.
Only ask user for THEIR specific requirements (domain expertise is in this skill).

---

## Core Principles

### 1. Server Components First (Default)

Server Components are the default in App Router. They execute on the server only.

**Benefits**:
- Direct database/API access
- Keep secrets secure on server
- Reduce JavaScript bundle size
- Better performance

**When to use**:
- Fetching data from databases/APIs
- Accessing backend resources
- Rendering static content
- SEO-critical content

**Example**:
```typescript
// app/posts/page.tsx - Server Component (default)
export default async function PostsPage() {
  const response = await fetch('https://api.example.com/posts');
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

### 2. Client Components for Interactivity Only

Use `'use client'` directive only when needed for interactivity.

**When to use**:
- Event handlers (onClick, onChange, etc.)
- React hooks (useState, useEffect, useContext)
- Browser APIs (localStorage, window, navigator)
- Real-time updates
- Interactive features

**Example**:
```typescript
// components/Counter.tsx - Client Component
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

### 3. Composition Pattern

Compose Server and Client Components together for optimal performance.

**Pattern**: Keep Server Components at the top, nest Client Components as children.

**Example**:
```typescript
// app/products/page.tsx - Server Component
import ProductFilter from './product-filter'; // Client Component

export default async function ProductsPage() {
  const products = await fetchProducts();

  return (
    <div>
      <h1>Products</h1>
      {/* Pass data from Server to Client Component via props */}
      <ProductFilter products={products} />
    </div>
  );
}
```

```typescript
// app/products/product-filter.tsx - Client Component
'use client';

import { useState } from 'react';

export default function ProductFilter({ products }) {
  const [filter, setFilter] = useState('');

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search products..."
      />
      <ul>
        {filtered.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## File-System Conventions

Next.js App Router uses file-based routing with special file conventions.

### Core Files

| File | Purpose | Component Type |
|------|---------|----------------|
| **page.tsx** | Route UI - makes route publicly accessible | Server (default) |
| **layout.tsx** | Shared UI for route segment and children | Server (default) |
| **loading.tsx** | Loading UI during data fetching | Server (default) |
| **error.tsx** | Error boundary UI | Client (required) |
| **not-found.tsx** | Not found UI (404) | Server (default) |
| **route.ts** | API route handler | N/A |

### Special Files

| File | Purpose |
|------|---------|
| **default.tsx** | Fallback UI for parallel routes |
| **template.tsx** | Re-rendered layout (vs persistent layout) |
| **middleware.ts** | Request/response middleware (root only) |

### Example Structure

```
app/
├── layout.tsx          # Root layout (required)
├── page.tsx            # Home page (/)
├── loading.tsx         # Root loading UI
├── error.tsx           # Root error boundary
├── not-found.tsx       # Root 404
│
├── dashboard/
│   ├── layout.tsx      # Dashboard layout
│   ├── page.tsx        # Dashboard page (/dashboard)
│   ├── loading.tsx     # Dashboard loading
│   └── settings/
│       └── page.tsx    # Settings page (/dashboard/settings)
│
└── posts/
    ├── page.tsx        # Posts list (/posts)
    └── [id]/
        └── page.tsx    # Single post (/posts/:id)
```

---

## Routing Patterns

### Dynamic Routes

**Single dynamic segment**: `[param]`

```
app/
  posts/
    [id]/
      page.tsx
```

```typescript
// app/posts/[id]/page.tsx
export default function PostPage({ params }: { params: { id: string } }) {
  return <h1>Post {params.id}</h1>;
}
```

**Access params in Client Components**:
```typescript
'use client';

import { useParams } from 'next/navigation';

export default function Component() {
  const params = useParams();
  return <p>ID: {params.id}</p>;
}
```

### Catch-All Routes

**Multiple segments**: `[...slug]`

```
app/
  docs/
    [...slug]/
      page.tsx
```

```typescript
// app/docs/[...slug]/page.tsx
export default function DocsPage({ params }: { params: { slug: string[] } }) {
  // /docs/a/b/c -> params.slug = ['a', 'b', 'c']
  return <h1>Docs: {params.slug.join('/')}</h1>;
}
```

**Optional catch-all**: `[[...slug]]`

```typescript
// app/docs/[[...slug]]/page.tsx
export default function DocsPage({ params }: { params: { slug?: string[] } }) {
  // /docs -> params.slug = undefined
  // /docs/a/b -> params.slug = ['a', 'b']
  return <h1>Docs</h1>;
}
```

### Parallel Routes

**Multiple content areas**: `@folder`

```
app/
  dashboard/
    @sidebar/
      page.tsx
    @content/
      page.tsx
    layout.tsx
```

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  sidebar,
  content
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  content: React.ReactNode;
}) {
  return (
    <div className="dashboard">
      <aside>{sidebar}</aside>
      <main>{content}</main>
      {children}
    </div>
  );
}
```

### Route Groups

**Organize without affecting URL**: `(folder)`

```
app/
  (marketing)/
    about/
      page.tsx      # /about
    contact/
      page.tsx      # /contact
  (shop)/
    products/
      page.tsx      # /products
```

---

## Layouts and Pages

### Root Layout (Required)

```typescript
// app/layout.tsx
export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**Requirements**:
- Must be present at app/layout.tsx
- Must include `<html>` and `<body>` tags
- Only root layout can contain these tags

### Nested Layouts

Layouts persist across route changes and maintain state.

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard">
      <nav>
        <a href="/dashboard">Dashboard</a>
        <a href="/dashboard/settings">Settings</a>
      </nav>
      <main>{children}</main>
    </div>
  );
}
```

### Pages

Pages are unique UI for a route.

```typescript
// app/dashboard/page.tsx
export default function DashboardPage() {
  return <h1>Dashboard</h1>;
}
```

**Key differences from layouts**:
- Pages are re-rendered on navigation
- Layouts persist and maintain state
- Pages make routes publicly accessible

---

## Data Fetching

### Server Component Data Fetching (Recommended)

Fetch data directly in Server Components using async/await.

```typescript
// app/posts/page.tsx
export default async function PostsPage() {
  const response = await fetch('https://api.example.com/posts');
  const posts = await response.json();

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
        </article>
      ))}
    </div>
  );
}
```

### Caching Strategies

**Static (default)** - Cache until manually invalidated:
```typescript
const data = await fetch('https://api.example.com/data', {
  cache: 'force-cache' // default, can be omitted
});
```

**Dynamic** - Fetch fresh on every request:
```typescript
const data = await fetch('https://api.example.com/data', {
  cache: 'no-store'
});
```

**Revalidate** - Cache with time-based revalidation:
```typescript
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 } // Revalidate every 60 seconds
});
```

### Route Segment Config

Configure caching behavior for entire route:

```typescript
// app/posts/page.tsx
export const revalidate = 3600; // Revalidate every hour
export const dynamic = 'force-dynamic'; // Always dynamic
export const fetchCache = 'force-no-store'; // Never cache

export default async function PostsPage() {
  const posts = await fetchPosts();
  return <div>{/* ... */}</div>;
}
```

### Static Site Generation (SSG)

Generate static pages at build time:

```typescript
// app/posts/[id]/page.tsx
export const revalidate = 3600; // ISR: Revalidate every hour

export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts')
    .then(res => res.json());

  return posts.map(post => ({
    id: post.id.toString()
  }));
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await fetch(`https://api.example.com/posts/${params.id}`)
    .then(res => res.json());

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

### Manual Revalidation

Revalidate on-demand using revalidatePath or revalidateTag:

```typescript
// app/actions.ts
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

export async function revalidatePosts() {
  revalidatePath('/posts');
}

export async function revalidatePostTag() {
  revalidateTag('posts');
}
```

### Client-Side Data Fetching

Use for user-specific or real-time data:

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function ClientPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

---

## Server Actions

Server Actions are asynchronous functions that run on the server.

### Definition

```typescript
// app/actions.ts
'use server';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  // Server-side logic
  await db.posts.create({ title, content });

  // Revalidate cache
  revalidatePath('/posts');
}
```

### Usage in Client Components

```typescript
// app/new-post.tsx
'use client';

import { createPost } from './actions';

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="Title" required />
      <textarea name="content" placeholder="Content" required />
      <button type="submit">Create Post</button>
    </form>
  );
}
```

### Programmatic Call

```typescript
'use client';

import { createPost } from './actions';
import { useState } from 'react';

export default function NewPost() {
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const formData = new FormData(e.currentTarget);
    await createPost(formData);

    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" required />
      <button disabled={pending}>
        {pending ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
}
```

---

## Loading and Error States

### Loading UI

Create instant loading states with `loading.tsx`:

```typescript
// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="loading">
      <div className="spinner" />
      <p>Loading dashboard...</p>
    </div>
  );
}
```

### Streaming with Suspense

Stream components as they load:

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react';
import Analytics from './analytics';
import Posts from './posts';

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>

      <Suspense fallback={<div>Loading analytics...</div>}>
        <Analytics />
      </Suspense>

      <Suspense fallback={<div>Loading posts...</div>}>
        <Posts />
      </Suspense>
    </div>
  );
}
```

### Error Handling

Error boundaries catch errors in route segments:

```typescript
// app/dashboard/error.tsx
'use client'; // Error components must be Client Components

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### Not Found UI

```typescript
// app/posts/[id]/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>Post Not Found</h2>
      <p>Could not find the requested post.</p>
    </div>
  );
}
```

Trigger manually:
```typescript
import { notFound } from 'next/navigation';

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await fetchPost(params.id);

  if (!post) {
    notFound();
  }

  return <article>{/* ... */}</article>;
}
```

---

## Performance Optimization

### Image Optimization

Use the `Image` component for automatic optimization:

```typescript
import Image from 'next/image';

export default function Profile() {
  return (
    <Image
      src="/profile.jpg"
      alt="Profile picture"
      width={200}
      height={200}
      priority // For above-fold images (LCP)
    />
  );
}
```

**Key props**:
- `src` - Image source (local or remote)
- `alt` - Alternative text (required)
- `width` / `height` - Dimensions in pixels
- `priority` - Disable lazy loading (for LCP images)
- `fill` - Fill parent container
- `sizes` - Responsive image sizes
- `quality` - 1-100 (default: 75)
- `placeholder` - 'blur' or 'empty'

**Responsive images**:
```typescript
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

**Fill container**:
```typescript
<div style={{ position: 'relative', width: '100%', height: 400 }}>
  <Image
    src="/banner.jpg"
    alt="Banner"
    fill
    style={{ objectFit: 'cover' }}
  />
</div>
```

### Font Optimization

Use `next/font` for automatic font optimization:

**Google Fonts**:
```typescript
// app/layout.tsx
import { Inter, Roboto } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

const roboto = Roboto({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto'
});

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${roboto.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

**Local fonts**:
```typescript
import localFont from 'next/font/local';

const myFont = localFont({
  src: [
    {
      path: './fonts/MyFont-Regular.woff2',
      weight: '400',
      style: 'normal'
    },
    {
      path: './fonts/MyFont-Bold.woff2',
      weight: '700',
      style: 'normal'
    }
  ],
  variable: '--font-my'
});
```

### Code Splitting and Lazy Loading

Dynamic imports for code splitting:

```typescript
import dynamic from 'next/dynamic';

const DynamicChart = dynamic(() => import('@/components/Chart'), {
  loading: () => <p>Loading chart...</p>,
  ssr: false // Disable server-side rendering if needed
});

export default function Analytics() {
  return (
    <div>
      <h1>Analytics</h1>
      <DynamicChart />
    </div>
  );
}
```

---

## Environment Variables

### Server-Side Variables (Secure)

Variables without `NEXT_PUBLIC_` prefix are server-only:

```
# .env.local
DATABASE_URL=postgresql://user:pass@localhost/db
API_SECRET_KEY=super_secret_key
```

**Usage** (Server Components and API routes only):
```typescript
// app/page.tsx (Server Component)
export default async function Page() {
  const dbUrl = process.env.DATABASE_URL;
  // Use for server-side operations
  return <div>...</div>;
}
```

### Client-Side Variables (Public)

Variables with `NEXT_PUBLIC_` prefix are exposed to the browser:

```
# .env.local
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_ANALYTICS_ID=GA-123456
```

**Usage** (Client Components):
```typescript
'use client';

export default function Component() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  // Accessible in browser
  return <div>API: {apiUrl}</div>;
}
```

### Environment Files

Priority (highest to lowest):
1. `.env.local` - Local overrides (gitignored)
2. `.env.production` - Production environment
3. `.env.development` - Development environment
4. `.env` - Default values

### Security Best Practices

✅ **DO**:
- Keep secrets in `.env.local` (gitignored)
- Use `NEXT_PUBLIC_` only for truly public values
- Rotate secrets regularly
- Use different keys per environment
- Document required variables in README

❌ **DON'T**:
- Commit `.env.local` to git
- Use `NEXT_PUBLIC_` for API keys or secrets
- Hardcode credentials in code
- Share production secrets in development

---

## Navigation

### Link Component

Client-side navigation with prefetching:

```typescript
import Link from 'next/link';

export default function Nav() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href={`/posts/${postId}`}>Post</Link>
    </nav>
  );
}
```

### Programmatic Navigation

```typescript
'use client';

import { useRouter } from 'next/navigation';

export default function LoginButton() {
  const router = useRouter();

  function handleLogin() {
    // Perform login
    router.push('/dashboard');
  }

  return <button onClick={handleLogin}>Login</button>;
}
```

**Router methods**:
- `router.push(href)` - Navigate to route
- `router.replace(href)` - Replace current history entry
- `router.back()` - Go back
- `router.forward()` - Go forward
- `router.refresh()` - Refresh current route
- `router.prefetch(href)` - Prefetch route

### usePathname and useSearchParams

```typescript
'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export default function Component() {
  const pathname = usePathname(); // '/posts/123'
  const searchParams = useSearchParams(); // ?page=2
  const page = searchParams.get('page'); // '2'

  return (
    <div>
      <p>Path: {pathname}</p>
      <p>Page: {page}</p>
    </div>
  );
}
```

---

## Metadata and SEO

### Static Metadata

```typescript
// app/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My App',
  description: 'App description',
  openGraph: {
    title: 'My App',
    description: 'App description',
    images: ['/og-image.jpg']
  }
};

export default function Page() {
  return <h1>Home</h1>;
}
```

### Dynamic Metadata

```typescript
// app/posts/[id]/page.tsx
import { Metadata } from 'next';

export async function generateMetadata({
  params
}: {
  params: { id: string }
}): Promise<Metadata> {
  const post = await fetchPost(params.id);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage]
    }
  };
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await fetchPost(params.id);
  return <article>{/* ... */}</article>;
}
```

---

## Best Practices Summary

### Component Type Selection

| Need | Use |
|------|-----|
| Fetch data from API/DB | Server Component |
| Render static content | Server Component |
| Interactive features (forms, buttons) | Client Component |
| Use React hooks | Client Component |
| Access browser APIs | Client Component |
| SEO-critical content | Server Component |

### Performance

✅ **DO**:
- Use Server Components by default
- Minimize Client Component boundaries
- Use `loading.tsx` for instant feedback
- Implement streaming with Suspense
- Optimize images with `next/image`
- Optimize fonts with `next/font`
- Use dynamic imports for large components

❌ **DON'T**:
- Make everything a Client Component
- Fetch data in Client Components unnecessarily
- Use `img` tag instead of `Image` component
- Load fonts manually
- Block entire page load for slow operations

### Data Fetching

✅ **DO**:
- Fetch in Server Components when possible
- Use appropriate cache strategies
- Implement revalidation for dynamic data
- Use Server Actions for mutations
- Parallelize independent requests

❌ **DON'T**:
- Fetch in Client Components unless necessary
- Over-cache dynamic data
- Use client-side fetching for public data
- Forget to handle loading and error states

### File Organization

✅ **DO**:
- Colocate components with routes
- Use route groups for organization
- Keep Client Components small and focused
- Use consistent naming conventions

❌ **DON'T**:
- Mix concerns in single files
- Create unnecessary nesting
- Use Client Components at root level unnecessarily

---

## Common Patterns

### Authentication Check

```typescript
// app/dashboard/layout.tsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return <div className="dashboard">{children}</div>;
}
```

### Form Handling

```typescript
// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createTask(formData: FormData) {
  const title = formData.get('title') as string;

  await db.tasks.create({ title });
  revalidatePath('/tasks');
}
```

```typescript
// app/new-task.tsx
'use client';

import { createTask } from './actions';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button disabled={pending}>
      {pending ? 'Creating...' : 'Create Task'}
    </button>
  );
}

export default function NewTask() {
  return (
    <form action={createTask}>
      <input name="title" required />
      <SubmitButton />
    </form>
  );
}
```

### Search with URL State

```typescript
// app/search/page.tsx
import SearchResults from './search-results';

export default function SearchPage({
  searchParams
}: {
  searchParams: { q?: string }
}) {
  const query = searchParams.q || '';

  return (
    <div>
      <SearchForm />
      <SearchResults query={query} />
    </div>
  );
}
```

```typescript
// app/search/search-form.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <button type="submit">Search</button>
    </form>
  );
}
```

---

## Quick Reference

### Directives

```typescript
'use client'  // Mark component as Client Component
'use server'  // Mark function as Server Action
```

### Special Files

```
page.tsx      // Route UI
layout.tsx    // Shared UI
loading.tsx   // Loading UI
error.tsx     // Error boundary
not-found.tsx // 404 UI
route.ts      // API route
```

### Dynamic Routes

```
[id]          // Single segment
[...slug]     // Catch-all
[[...slug]]   // Optional catch-all
```

### Data Fetching Cache Options

```typescript
{ cache: 'force-cache' }      // Static (default)
{ cache: 'no-store' }         // Dynamic
{ next: { revalidate: 60 } }  // ISR (60 seconds)
```

### Imports

```typescript
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath, revalidateTag } from 'next/cache'
```

---

## References

See `references/` for detailed documentation:
- `component-types.md` - Server vs Client Components deep dive
- `routing-guide.md` - Complete routing patterns
- `data-fetching-guide.md` - Data fetching strategies
- `performance-guide.md` - Optimization techniques
- `examples.md` - Common implementation patterns
