# Research: Frontend Chatbot UI Integration

**Feature**: 006-chatbot-ui
**Date**: 2026-02-09
**Status**: Complete

## Overview

This document captures technology decisions and best practices for implementing a chatbot UI widget in the Quantum Todo frontend. The research focuses on Next.js 15 App Router patterns, React state management, Tailwind CSS styling, accessibility, and performance optimization.

---

## Research Area 1: Next.js 15 App Router Patterns for Modal Components

### Decision: Client Component with Portal Pattern

**Rationale**:
- Modals require client-side interactivity (open/close, animations)
- Next.js 15 App Router uses Server Components by default, but modals need `'use client'` directive
- React Portal pattern allows rendering modal outside the DOM hierarchy for proper z-index layering
- Portal prevents CSS conflicts with parent components

**Implementation Approach**:
```typescript
'use client'
import { createPortal } from 'react-dom'

// Render modal at document.body level to avoid z-index issues
{isOpen && createPortal(<ChatModal />, document.body)}
```

**Alternatives Considered**:
- **Server Component**: Rejected - modals require client-side state and event handlers
- **CSS-only modal**: Rejected - need JavaScript for focus management and accessibility
- **Third-party library (Radix UI, Headless UI)**: Rejected - adds dependency, simple modal doesn't justify library

**Best Practices**:
- Use `'use client'` directive at component level
- Implement proper cleanup in useEffect for portal
- Handle SSR gracefully (check for `typeof window !== 'undefined'`)

---

## Research Area 2: React State Management for Chat Interfaces

### Decision: useReducer for Chat State

**Rationale**:
- Chat state has multiple related pieces (messages, loading, error, modal open/close)
- Complex state transitions (sending message → loading → success/error)
- useReducer provides predictable state updates with actions
- Easier to test and debug than multiple useState calls
- Better performance (single state update vs multiple)

**State Structure**:
```typescript
interface ChatState {
  messages: Message[]
  isOpen: boolean
  isLoading: boolean
  error: string | null
}

type ChatAction =
  | { type: 'OPEN_MODAL' }
  | { type: 'CLOSE_MODAL' }
  | { type: 'SEND_MESSAGE'; payload: string }
  | { type: 'MESSAGE_SUCCESS'; payload: Message }
  | { type: 'MESSAGE_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
```

**Alternatives Considered**:
- **useState**: Rejected - too many related state variables, complex updates
- **Context API**: Rejected - overkill for component-local state
- **Zustand/Redux**: Rejected - adds dependency, chat state is component-local

**Best Practices**:
- Keep reducer pure (no side effects)
- Use TypeScript discriminated unions for actions
- Extract reducer to separate file for testability

---

## Research Area 3: Tailwind CSS Modal and Overlay Patterns

### Decision: Tailwind Utility Classes with Custom Animations

**Rationale**:
- Tailwind provides all necessary utilities for modal styling
- Custom animations via tailwind.config.js for smooth transitions
- No additional CSS files needed
- Consistent with existing dashboard theme

**Implementation Pattern**:
```tsx
// Overlay
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

// Modal
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
    {/* Modal content */}
  </div>
</div>
```

**Responsive Breakpoints**:
- Mobile (<768px): Full width with margins, max-h-[90vh]
- Tablet (768-1024px): 80% width, centered
- Desktop (>1024px): Fixed 500px width, centered

**Alternatives Considered**:
- **CSS Modules**: Rejected - Tailwind is already in use, no need for separate CSS
- **Styled Components**: Rejected - adds dependency, Tailwind is sufficient
- **Framer Motion**: Rejected - overkill for simple fade/slide animations

**Best Practices**:
- Use fixed positioning for overlay and modal
- Use backdrop-blur for modern overlay effect
- Use z-index 40 for overlay, 50 for modal
- Use flex for centering
- Use max-h with overflow-auto for scrollable content

---

## Research Area 4: Accessibility Best Practices for Chat Widgets

### Decision: ARIA Attributes + Keyboard Navigation

**Rationale**:
- Chat widgets must be accessible to screen readers and keyboard users
- ARIA dialog role and proper labeling required
- Focus management critical for modal UX
- Keyboard shortcuts enhance usability

**Accessibility Features**:
1. **ARIA Attributes**:
   - `role="dialog"` on modal
   - `aria-labelledby` pointing to modal title
   - `aria-describedby` for modal description
   - `aria-live="polite"` for new messages

2. **Keyboard Navigation**:
   - Escape key closes modal
   - Tab cycles through focusable elements
   - Enter sends message
   - Focus trap within modal when open

3. **Focus Management**:
   - Auto-focus input field when modal opens
   - Return focus to trigger button when modal closes
   - Prevent focus on background elements when modal open

**Implementation**:
```typescript
useEffect(() => {
  if (isOpen) {
    // Save current focus
    const previousFocus = document.activeElement

    // Focus input
    inputRef.current?.focus()

    // Cleanup: restore focus
    return () => previousFocus?.focus()
  }
}, [isOpen])
```

**Alternatives Considered**:
- **No accessibility**: Rejected - violates WCAG guidelines
- **Third-party a11y library**: Rejected - can implement manually

**Best Practices**:
- Use semantic HTML (button, input, etc.)
- Provide visible focus indicators
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Test keyboard-only navigation

---

## Research Area 5: Performance Optimization for Message Lists

### Decision: Auto-scroll + Conditional Rendering

**Rationale**:
- Up to 50 messages per conversation (spec requirement)
- 50 messages is manageable without virtual scrolling
- Auto-scroll to latest message improves UX
- Conditional rendering prevents unnecessary re-renders

**Optimization Techniques**:
1. **Auto-scroll**:
   ```typescript
   const messagesEndRef = useRef<HTMLDivElement>(null)

   useEffect(() => {
     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
   }, [messages])
   ```

2. **Memoization**:
   - Use React.memo for ChatMessage component
   - Prevent re-render of all messages when new message added

3. **Debouncing**:
   - Debounce input field to prevent excessive re-renders
   - Not needed for send button (single action)

**Alternatives Considered**:
- **Virtual scrolling (react-window)**: Rejected - overkill for 50 messages, adds dependency
- **Pagination**: Rejected - breaks conversation flow, not needed for 50 messages
- **Infinite scroll**: Rejected - no persistence, session-based only

**Best Practices**:
- Use useRef for scroll container
- Use React.memo for message components
- Avoid inline functions in render (use useCallback)
- Monitor performance with React DevTools Profiler

---

## Research Area 6: Error Handling Patterns for API Integration

### Decision: Try-Catch with User-Friendly Messages

**Rationale**:
- Backend may return errors (rate limit, timeout, validation)
- Network failures possible (offline, slow connection)
- User needs clear, actionable error messages
- Retry mechanism improves UX

**Error Handling Strategy**:
1. **API Service Layer**:
   ```typescript
   async function sendMessage(message: string): Promise<ChatResponse> {
     try {
       const response = await fetch('/api/chat', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${getToken()}`
         },
         body: JSON.stringify({ message })
       })

       if (!response.ok) {
         const error = await response.json()
         throw new Error(error.detail || 'Failed to send message')
       }

       return await response.json()
     } catch (error) {
       if (error instanceof TypeError) {
         throw new Error('Network error. Please check your connection.')
       }
       throw error
     }
   }
   ```

2. **Error Display**:
   - Show error message in chat UI (not alert)
   - Provide retry button
   - Auto-dismiss after 5 seconds (optional)

3. **Error Types**:
   - Network errors: "Network error. Please check your connection."
   - Rate limit: "Too many requests. Please wait a moment."
   - Validation: "Message is too long. Maximum 2000 characters."
   - Auth: "Session expired. Please log in again."
   - Generic: "Something went wrong. Please try again."

**Alternatives Considered**:
- **Global error boundary**: Rejected - need component-level error handling
- **Toast notifications**: Rejected - inline errors better for chat context
- **Automatic retry**: Rejected - user should control retry

**Best Practices**:
- Never expose technical error details to users
- Log errors to console for debugging
- Provide actionable error messages
- Clear error state when user retries

---

## Technology Stack Summary

| Category | Technology | Rationale |
|----------|-----------|-----------|
| Framework | Next.js 15 (App Router) | Already in use, Server/Client Components |
| Language | TypeScript 5.x | Type safety, better DX |
| UI Library | React 18+ | Already in use |
| Styling | Tailwind CSS 3.x | Already in use, utility-first |
| State Management | useReducer | Complex state, predictable updates |
| API Integration | Fetch API | Native, no dependencies |
| Testing | Jest + React Testing Library | Already in use |
| Accessibility | ARIA + Focus Management | WCAG compliance |

---

## Implementation Priorities

### Phase 1: Core Functionality (MVP)
1. ChatWidget component with floating button
2. ChatModal with overlay
3. ChatMessages with message bubbles
4. ChatInput with send button
5. Basic state management (useReducer)
6. API integration (chatService)

### Phase 2: Polish & UX
1. Loading indicators
2. Error handling and display
3. Auto-scroll to latest message
4. Character count for input
5. Responsive design (mobile/tablet/desktop)

### Phase 3: Accessibility & Performance
1. ARIA attributes
2. Keyboard navigation
3. Focus management
4. Performance optimization (memoization)
5. Testing (unit + integration)

---

## Risks & Mitigations

### Risk 1: Modal Z-Index Conflicts
**Mitigation**: Use React Portal to render at document.body level, use high z-index (40-50)

### Risk 2: Focus Management Complexity
**Mitigation**: Use focus trap library if manual implementation too complex (react-focus-lock)

### Risk 3: Performance with Many Messages
**Mitigation**: Monitor with React DevTools, implement virtual scrolling if needed (future)

### Risk 4: Theme Inconsistency
**Mitigation**: Use existing Tailwind config, review with design team

---

## Open Questions

None. All research areas resolved with clear decisions.

---

## References

- Next.js 15 Documentation: https://nextjs.org/docs
- React 18 Documentation: https://react.dev/
- Tailwind CSS Documentation: https://tailwindcss.com/docs
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- React Testing Library: https://testing-library.com/react

---

**Research Status**: ✅ Complete
**Next Phase**: Design & Contracts (data-model.md, contracts/, quickstart.md)
