# Next.js App Router - Common Implementation Patterns

Real-world examples of common Next.js App Router patterns and use cases.

## Table of Contents

1. [Authentication Patterns](#authentication-patterns)
2. [Form Handling](#form-handling)
3. [Search and Filtering](#search-and-filtering)
4. [Pagination](#pagination)
5. [Modal Dialogs](#modal-dialogs)
6. [Tabs and Navigation](#tabs-and-navigation)
7. [Real-time Updates](#real-time-updates)
8. [File Uploads](#file-uploads)
9. [Error Handling](#error-handling)
10. [Loading States](#loading-states)

---

## Authentication Patterns

### Protected Routes with Middleware

```typescript
// middleware.ts (root level)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session-token');

  // Protect /dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
};
```

### Protected Layout

```typescript
// app/dashboard/layout.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

async function getSession() {
  const sessionToken = cookies().get('session-token');
  if (!sessionToken) return null;

  // Validate session
  const response = await fetch('https://api.example.com/session', {
    headers: { Authorization: `Bearer ${sessionToken.value}` }
  });

  if (!response.ok) return null;
  return response.json();
}

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="dashboard">
      <nav>
        <p>Welcome, {session.user.name}</p>
        <a href="/dashboard/profile">Profile</a>
        <a href="/dashboard/settings">Settings</a>
      </nav>
      <main>{children}</main>
    </div>
  );
}
```

### Login Form with Server Action

```typescript
// app/actions/auth.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const response = await fetch('https://api.example.com/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    return { error: 'Invalid credentials' };
  }

  const { token } = await response.json();

  // Set session cookie
  cookies().set('session-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });

  redirect('/dashboard');
}
```

```typescript
// app/login/page.tsx
import LoginForm from './login-form';

export default function LoginPage() {
  return (
    <div>
      <h1>Login</h1>
      <LoginForm />
    </div>
  );
}
```

```typescript
// app/login/login-form.tsx
'use client';

import { login } from '../actions/auth';
import { useFormState, useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button disabled={pending}>
      {pending ? 'Logging in...' : 'Login'}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useFormState(login, null);

  return (
    <form action={formAction}>
      {state?.error && (
        <div className="error">{state.error}</div>
      )}

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
        />
      </div>

      <SubmitButton />
    </form>
  );
}
```

---

## Form Handling

### CRUD Operations with Server Actions

```typescript
// app/actions/tasks.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createTask(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  await fetch('https://api.example.com/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description })
  });

  revalidatePath('/tasks');
}

export async function updateTask(id: string, formData: FormData) {
  const title = formData.get('title') as string;
  const completed = formData.get('completed') === 'on';

  await fetch(`https://api.example.com/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, completed })
  });

  revalidatePath('/tasks');
}

export async function deleteTask(id: string) {
  await fetch(`https://api.example.com/tasks/${id}`, {
    method: 'DELETE'
  });

  revalidatePath('/tasks');
}
```

```typescript
// app/tasks/new-task-form.tsx
'use client';

import { createTask } from '../actions/tasks';
import { useRef } from 'react';

export default function NewTaskForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await createTask(formData);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleSubmit}>
      <input name="title" placeholder="Task title" required />
      <textarea name="description" placeholder="Description" />
      <button type="submit">Create Task</button>
    </form>
  );
}
```

### Form with Validation

```typescript
// app/actions/contact.ts
'use server';

import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

export async function submitContactForm(formData: FormData) {
  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message')
  };

  const result = contactSchema.safeParse(data);

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors
    };
  }

  // Send email or save to database
  await sendEmail(result.data);

  return { success: true };
}
```

```typescript
// app/contact/contact-form.tsx
'use client';

import { submitContactForm } from '../actions/contact';
import { useFormState } from 'react-dom';

export default function ContactForm() {
  const [state, formAction] = useFormState(submitContactForm, null);

  return (
    <form action={formAction}>
      {state?.success && (
        <div className="success">Message sent successfully!</div>
      )}

      <div>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" required />
        {state?.errors?.name && (
          <span className="error">{state.errors.name[0]}</span>
        )}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />
        {state?.errors?.email && (
          <span className="error">{state.errors.email[0]}</span>
        )}
      </div>

      <div>
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" required />
        {state?.errors?.message && (
          <span className="error">{state.errors.message[0]}</span>
        )}
      </div>

      <button type="submit">Send Message</button>
    </form>
  );
}
```

---

## Search and Filtering

### Search with URL State

```typescript
// app/products/page.tsx
import SearchForm from './search-form';
import ProductList from './product-list';

export default async function ProductsPage({
  searchParams
}: {
  searchParams: { q?: string; category?: string }
}) {
  const query = searchParams.q || '';
  const category = searchParams.category || '';

  const products = await fetch(
    `https://api.example.com/products?q=${query}&category=${category}`
  ).then(res => res.json());

  return (
    <div>
      <h1>Products</h1>
      <SearchForm />
      <ProductList products={products} />
    </div>
  );
}
```

```typescript
// app/products/search-form.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

export default function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);

    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
      />

      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="clothing">Clothing</option>
        <option value="books">Books</option>
      </select>

      <button type="submit" disabled={isPending}>
        {isPending ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}
```

### Client-Side Filtering

```typescript
// app/products/product-filter.tsx
'use client';

import { useState, useMemo } from 'react';

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
};

export default function ProductFilter({ products }: { products: Product[] }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');

  const filtered = useMemo(() => {
    return products
      .filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !category || p.category === category;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return a.price - b.price;
      });
  }, [products, search, category, sortBy]);

  return (
    <div>
      <div className="filters">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
        </select>
      </div>

      <div className="results">
        <p>{filtered.length} products found</p>
        <ul>
          {filtered.map(product => (
            <li key={product.id}>
              {product.name} - ${product.price}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

---

## Pagination

### Server-Side Pagination

```typescript
// app/posts/page.tsx
import Pagination from './pagination';

export default async function PostsPage({
  searchParams
}: {
  searchParams: { page?: string }
}) {
  const page = Number(searchParams.page) || 1;
  const perPage = 10;

  const response = await fetch(
    `https://api.example.com/posts?page=${page}&per_page=${perPage}`
  );
  const data = await response.json();

  return (
    <div>
      <h1>Posts</h1>

      <ul>
        {data.posts.map(post => (
          <li key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
          </li>
        ))}
      </ul>

      <Pagination currentPage={page} totalPages={data.totalPages} />
    </div>
  );
}
```

```typescript
// app/posts/pagination.tsx
'use client';

import Link from 'next/link';

export default function Pagination({
  currentPage,
  totalPages
}: {
  currentPage: number;
  totalPages: number;
}) {
  return (
    <nav className="pagination">
      {currentPage > 1 && (
        <Link href={`/posts?page=${currentPage - 1}`}>
          Previous
        </Link>
      )}

      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <Link
          key={page}
          href={`/posts?page=${page}`}
          className={page === currentPage ? 'active' : ''}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link href={`/posts?page=${currentPage + 1}`}>
          Next
        </Link>
      )}
    </nav>
  );
}
```

---

## Modal Dialogs

### Modal with Intercepting Routes

```
app/
  photos/
    page.tsx
    [id]/
      page.tsx
    @modal/
      (.)photos/
        [id]/
          page.tsx
    layout.tsx
```

```typescript
// app/photos/layout.tsx
export default function PhotosLayout({
  children,
  modal
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
```

```typescript
// app/photos/@modal/(.)photos/[id]/page.tsx
import Modal from '@/components/modal';
import Image from 'next/image';

export default async function PhotoModal({
  params
}: {
  params: { id: string }
}) {
  const photo = await fetchPhoto(params.id);

  return (
    <Modal>
      <Image
        src={photo.url}
        alt={photo.title}
        width={800}
        height={600}
      />
      <h2>{photo.title}</h2>
      <p>{photo.description}</p>
    </Modal>
  );
}
```

```typescript
// components/modal.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function handleClose() {
    router.back();
  }

  return (
    <dialog ref={dialogRef} onClose={handleClose} className="modal">
      <button onClick={handleClose}>Close</button>
      {children}
    </dialog>
  );
}
```

---

## Tabs and Navigation

### Tab Navigation with Route Groups

```typescript
// app/dashboard/@tabs/default.tsx
export default function DefaultTab() {
  return null;
}
```

```typescript
// app/dashboard/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();

  return (
    <div className="dashboard">
      <nav className="tabs">
        <Link
          href="/dashboard/overview"
          className={pathname === '/dashboard/overview' ? 'active' : ''}
        >
          Overview
        </Link>
        <Link
          href="/dashboard/analytics"
          className={pathname === '/dashboard/analytics' ? 'active' : ''}
        >
          Analytics
        </Link>
        <Link
          href="/dashboard/settings"
          className={pathname === '/dashboard/settings' ? 'active' : ''}
        >
          Settings
        </Link>
      </nav>

      <main>{children}</main>
    </div>
  );
}
```

---

## Real-time Updates

### Polling Pattern

```typescript
// app/dashboard/live-stats.tsx
'use client';

import { useState, useEffect } from 'react';

export default function LiveStats({ initialData }: { initialData: Stats }) {
  const [stats, setStats] = useState(initialData);

  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch('/api/stats');
      const newStats = await response.json();
      setStats(newStats);
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="stats">
      <div>Active Users: {stats.activeUsers}</div>
      <div>Total Revenue: ${stats.revenue}</div>
      <div>Orders Today: {stats.ordersToday}</div>
    </div>
  );
}
```

---

This covers the most common patterns. See the main SKILL.md for more architectural guidance.
