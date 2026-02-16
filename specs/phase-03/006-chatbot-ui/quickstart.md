# Quickstart Guide: Frontend Chatbot UI Integration

**Feature**: 006-chatbot-ui
**Date**: 2026-02-09
**Audience**: Frontend developers implementing the chatbot UI

## Overview

This guide provides step-by-step instructions for implementing the chatbot UI widget in the Quantum Todo frontend. The feature adds a floating chat button and modal interface that allows users to manage tasks through natural language.

**What You'll Build**:
- Floating chat button (bottom-right corner)
- Modal chat interface with message bubbles
- Integration with POST /api/chat backend endpoint
- Session-based conversation management
- Responsive design (mobile + desktop)

**Prerequisites**:
- Feature 002-openai-agent-integration deployed (backend chat endpoint)
- Next.js 15+ frontend running
- Tailwind CSS configured
- TypeScript 5.x
- Authentication system working (JWT tokens)

---

## Step 1: Review Design Documents

Before coding, familiarize yourself with:

1. **Feature Specification**: `specs/006-chatbot-ui/spec.md`
   - User stories and acceptance criteria
   - Functional requirements
   - Success criteria

2. **Research Document**: `specs/006-chatbot-ui/research.md`
   - Technology decisions (useReducer, Portal pattern, etc.)
   - Best practices for modals, accessibility, performance

3. **Data Model**: `specs/006-chatbot-ui/data-model.md`
   - Message and ChatState interfaces
   - State transitions and validation rules

4. **Component API**: `specs/006-chatbot-ui/contracts/component-api.md`
   - Component props and interfaces
   - Component hierarchy
   - Integration points

---

## Step 2: Set Up Type Definitions

Create TypeScript interfaces for chat functionality.

**File**: `frontend/src/types/chat.ts`

```typescript
// Message entity
export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  status: 'pending' | 'sent' | 'delivered' | 'error'
  error?: string | null
}

// Chat state
export interface ChatState {
  messages: Message[]
  isOpen: boolean
  isLoading: boolean
  error: string | null
}

// Chat actions
export type ChatAction =
  | { type: 'OPEN_MODAL' }
  | { type: 'CLOSE_MODAL' }
  | { type: 'SEND_MESSAGE'; payload: { content: string } }
  | { type: 'MESSAGE_SENT'; payload: { messageId: string } }
  | { type: 'MESSAGE_SUCCESS'; payload: { userMessageId: string; assistantMessage: Message } }
  | { type: 'MESSAGE_ERROR'; payload: { messageId: string; error: string } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CLEAR_MESSAGES' }

// API types
export interface ChatRequest {
  message: string
}

export interface ChatResponse {
  response: string
  tool_calls?: Array<{
    tool: string
    arguments: Record<string, any>
    result: any
  }>
}
```

---

## Step 3: Create API Service

Implement the backend integration service.

**File**: `frontend/src/services/chatService.ts`

```typescript
import { ChatRequest, ChatResponse } from '@/types/chat'

// Get auth token from your existing auth system
function getAuthToken(): string {
  // TODO: Replace with your actual auth token retrieval
  return localStorage.getItem('auth_token') || ''
}

export async function sendMessage(message: string): Promise<ChatResponse> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ message } as ChatRequest)
    })

    if (!response.ok) {
      // Handle specific error codes
      if (response.status === 401) {
        throw new Error('Session expired. Please log in again.')
      }
      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment.')
      }

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

**Testing the Service**:
```typescript
// Test in browser console or component
import { sendMessage } from '@/services/chatService'

sendMessage('Add a task to buy groceries')
  .then(response => console.log(response))
  .catch(error => console.error(error.message))
```

---

## Step 4: Implement Chat Reducer

Create the state management reducer.

**File**: `frontend/src/hooks/chatReducer.ts`

```typescript
import { ChatState, ChatAction, Message } from '@/types/chat'

export const initialChatState: ChatState = {
  messages: [],
  isOpen: false,
  isLoading: false,
  error: null
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'OPEN_MODAL':
      return { ...state, isOpen: true }

    case 'CLOSE_MODAL':
      return { ...state, isOpen: false }

    case 'SEND_MESSAGE': {
      const newMessage: Message = {
        id: crypto.randomUUID(),
        content: action.payload.content,
        role: 'user',
        timestamp: new Date(),
        status: 'pending',
        error: null
      }
      return {
        ...state,
        messages: [...state.messages, newMessage],
        isLoading: true,
        error: null
      }
    }

    case 'MESSAGE_SENT':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.messageId
            ? { ...msg, status: 'sent' }
            : msg
        )
      }

    case 'MESSAGE_SUCCESS':
      return {
        ...state,
        messages: [
          ...state.messages.map(msg =>
            msg.id === action.payload.userMessageId
              ? { ...msg, status: 'delivered' }
              : msg
          ),
          action.payload.assistantMessage
        ],
        isLoading: false
      }

    case 'MESSAGE_ERROR':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.messageId
            ? { ...msg, status: 'error', error: action.payload.error }
            : msg
        ),
        isLoading: false,
        error: action.payload.error
      }

    case 'CLEAR_ERROR':
      return { ...state, error: null }

    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] }

    default:
      return state
  }
}
```

---

## Step 5: Create useChat Hook

Implement the custom hook for chat logic.

**File**: `frontend/src/hooks/useChat.ts`

```typescript
import { useReducer, useCallback } from 'react'
import { chatReducer, initialChatState } from './chatReducer'
import { sendMessage as sendMessageAPI } from '@/services/chatService'
import { Message } from '@/types/chat'

export function useChat() {
  const [state, dispatch] = useReducer(chatReducer, initialChatState)

  const openModal = useCallback(() => {
    dispatch({ type: 'OPEN_MODAL' })
  }, [])

  const closeModal = useCallback(() => {
    dispatch({ type: 'CLOSE_MODAL' })
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    // Validate message
    const trimmed = content.trim()
    if (trimmed.length === 0) {
      return
    }
    if (trimmed.length > 2000) {
      dispatch({
        type: 'MESSAGE_ERROR',
        payload: {
          messageId: '',
          error: 'Message too long (max 2000 characters)'
        }
      })
      return
    }

    // Create pending message
    dispatch({ type: 'SEND_MESSAGE', payload: { content: trimmed } })

    // Get the message ID (last message in array)
    const messageId = crypto.randomUUID() // In real implementation, get from state

    try {
      // Send to backend
      const response = await sendMessageAPI(trimmed)

      // Create assistant message
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: response.response,
        role: 'assistant',
        timestamp: new Date(),
        status: 'delivered',
        error: null
      }

      // Update state with success
      dispatch({
        type: 'MESSAGE_SUCCESS',
        payload: {
          userMessageId: messageId,
          assistantMessage
        }
      })
    } catch (error) {
      // Update state with error
      dispatch({
        type: 'MESSAGE_ERROR',
        payload: {
          messageId,
          error: error instanceof Error ? error.message : 'Failed to send message'
        }
      })
    }
  }, [])

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  const clearMessages = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' })
  }, [])

  return {
    messages: state.messages,
    isOpen: state.isOpen,
    isLoading: state.isLoading,
    error: state.error,
    openModal,
    closeModal,
    sendMessage,
    clearError,
    clearMessages
  }
}
```

---

## Step 6: Build UI Components

Create the chat UI components in order of dependency.

### 6.1 ChatButton Component

**File**: `frontend/src/components/chat/ChatButton.tsx`

```tsx
'use client'

interface ChatButtonProps {
  onClick: () => void
}

export function ChatButton({ onClick }: ChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-30 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
      aria-label="Open chat"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
    </button>
  )
}
```

### 6.2 ChatMessage Component

**File**: `frontend/src/components/chat/ChatMessage.tsx`

```tsx
'use client'
import { Message } from '@/types/chat'
import { memo } from 'react'

interface ChatMessageProps {
  message: Message
}

function ChatMessageComponent({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isError = message.status === 'error'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isError
            ? 'bg-red-100 border border-red-300 text-red-800'
            : isUser
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-900 rounded-bl-none'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>
        {isError && message.error && (
          <p className="text-xs mt-1 text-red-600">{message.error}</p>
        )}
      </div>
    </div>
  )
}

export const ChatMessage = memo(ChatMessageComponent)
```

### 6.3 ChatMessages Component

**File**: `frontend/src/components/chat/ChatMessages.tsx`

```tsx
'use client'
import { Message } from '@/types/chat'
import { ChatMessage } from './ChatMessage'
import { useEffect, useRef } from 'react'

interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-8">
        <div className="text-gray-500">
          <p className="text-lg font-medium">Start a conversation!</p>
          <p className="text-sm mt-2">Ask me to manage your tasks</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto p-4 space-y-4">
      {messages.map(message => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-200 rounded-lg rounded-bl-none p-3">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
```

### 6.4 ChatInput Component

**File**: `frontend/src/components/chat/ChatInput.tsx`

```tsx
'use client'
import { useState, KeyboardEvent } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  maxLength?: number
}

export function ChatInput({
  onSend,
  disabled = false,
  maxLength = 2000
}: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message)
      setMessage('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isNearLimit = message.length > maxLength * 0.9
  const isOverLimit = message.length > maxLength

  return (
    <div className="border-t p-4">
      <div className="flex gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={disabled}
          className="flex-1 resize-none rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          rows={1}
          aria-label="Type your message"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim() || isOverLimit}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
      {isNearLimit && (
        <p className={`text-xs mt-1 ${isOverLimit ? 'text-red-600' : 'text-gray-500'}`}>
          {message.length} / {maxLength} characters
        </p>
      )}
    </div>
  )
}
```

### 6.5 ChatModal Component

**File**: `frontend/src/components/chat/ChatModal.tsx`

```tsx
'use client'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function ChatModal({ isOpen, onClose, children }: ChatModalProps) {
  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Only render portal on client side
  if (typeof window === 'undefined') return null

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 id="chat-modal-title" className="text-lg font-semibold">
              Chat Assistant
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          {children}
        </div>
      </div>
    </>,
    document.body
  )
}
```

### 6.6 ChatWidget Component (Main)

**File**: `frontend/src/components/chat/ChatWidget.tsx`

```tsx
'use client'
import { useChat } from '@/hooks/useChat'
import { ChatButton } from './ChatButton'
import { ChatModal } from './ChatModal'
import { ChatMessages } from './ChatMessages'
import { ChatInput } from './ChatInput'

export function ChatWidget() {
  const {
    messages,
    isOpen,
    isLoading,
    error,
    openModal,
    closeModal,
    sendMessage,
    clearError
  } = useChat()

  return (
    <>
      {!isOpen && <ChatButton onClick={openModal} />}

      <ChatModal isOpen={isOpen} onClose={closeModal}>
        <ChatMessages messages={messages} isLoading={isLoading} />

        {error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={clearError}
              className="text-xs text-red-600 hover:text-red-800 mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </ChatModal>
    </>
  )
}
```

---

## Step 7: Integrate with Dashboard

Add the ChatWidget to your dashboard layout.

**File**: `frontend/src/app/dashboard/layout.tsx`

```tsx
import { ChatWidget } from '@/components/chat/ChatWidget'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav>{/* Your existing navigation */}</nav>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <ChatWidget />
    </div>
  )
}
```

---

## Step 8: Test the Implementation

### Manual Testing Checklist

1. **Floating Button**:
   - [ ] Button visible in bottom-right corner
   - [ ] Button has hover effect
   - [ ] Button opens modal on click

2. **Modal**:
   - [ ] Modal opens centered on screen
   - [ ] Overlay blurs background
   - [ ] Modal closes on Escape key
   - [ ] Modal closes on overlay click
   - [ ] Modal closes on close button click

3. **Messaging**:
   - [ ] Can type message in input field
   - [ ] Send button disabled when input empty
   - [ ] Message appears as user bubble (right-aligned)
   - [ ] Loading indicator shows while waiting
   - [ ] Assistant response appears as bubble (left-aligned)
   - [ ] Auto-scrolls to latest message

4. **Error Handling**:
   - [ ] Empty message prevented
   - [ ] Character limit enforced (2000 chars)
   - [ ] Network errors show user-friendly message
   - [ ] Error can be dismissed

5. **Responsive Design**:
   - [ ] Works on mobile (<768px)
   - [ ] Works on tablet (768-1024px)
   - [ ] Works on desktop (>1024px)

### Automated Testing

Run the test suite:

```bash
cd frontend
npm test -- --testPathPattern=chat
```

---

## Step 9: Verify Backend Integration

Test the complete flow with the backend:

```bash
# 1. Ensure backend is running
cd Quantum-Todo-Backend
python -m uvicorn main:app --reload

# 2. Test chat endpoint directly
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message": "Add a task to buy groceries"}'

# 3. Test in browser
# Open dashboard, click chat button, send message
```

---

## Step 10: Verify No Regression

Ensure existing features still work:

1. **Task CRUD**: Create, read, update, delete tasks via existing UI
2. **Authentication**: Login, logout, session management
3. **Dashboard**: All existing dashboard features functional

---

## Troubleshooting

### Issue: Modal doesn't open

**Solution**: Check that `'use client'` directive is present in all components

### Issue: Messages not sending

**Solution**: Verify backend endpoint is running and JWT token is valid

### Issue: Styling doesn't match theme

**Solution**: Check Tailwind config and use existing color variables

### Issue: Portal not rendering

**Solution**: Ensure `typeof window !== 'undefined'` check in ChatModal

---

## Performance Optimization

### After Basic Implementation

1. **Memoization**: Ensure React.memo on ChatMessage
2. **Lazy Loading**: Consider lazy loading ChatWidget
3. **Bundle Size**: Check bundle size impact

```bash
npm run build
npm run analyze
```

---

## Next Steps

1. ✅ Complete implementation following this guide
2. ⏳ Run `/sp.tasks 006-chatbot-ui` to generate detailed task breakdown
3. ⏳ Implement tasks in priority order (P1 → P2 → P3)
4. ⏳ Test thoroughly (manual + automated)
5. ⏳ Deploy to staging
6. ⏳ Deploy to production

---

## Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **React Hooks**: https://react.dev/reference/react
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs

---

**Quickstart Status**: ✅ Complete
**Estimated Implementation Time**: 4-6 hours for experienced developer
