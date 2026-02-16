# Component API Contracts: Frontend Chatbot UI Integration

**Feature**: 006-chatbot-ui
**Date**: 2026-02-09
**Status**: Complete

## Overview

This document defines the API contracts (props, interfaces, and usage) for all React components in the chatbot UI feature.

---

## 1. ChatWidget Component

**Purpose**: Main orchestrator component that manages the entire chat interface.

**File**: `frontend/src/components/chat/ChatWidget.tsx`

**Props**: None (self-contained)

**Usage**:
```tsx
import { ChatWidget } from '@/components/chat/ChatWidget'

export default function DashboardLayout({ children }) {
  return (
    <div>
      {children}
      <ChatWidget />
    </div>
  )
}
```

**Behavior**:
- Renders ChatButton when modal is closed
- Renders ChatModal when modal is open
- Manages chat state via useChat hook
- Handles all user interactions

**State Management**:
- Uses `useChat` hook internally
- No props needed (self-contained state)

---

## 2. ChatButton Component

**Purpose**: Floating button that opens the chat modal.

**File**: `frontend/src/components/chat/ChatButton.tsx`

**Props**:
```typescript
interface ChatButtonProps {
  onClick: () => void
  className?: string
}
```

**Prop Descriptions**:
- `onClick`: Callback function when button is clicked
- `className`: Optional additional CSS classes

**Usage**:
```tsx
<ChatButton onClick={handleOpenModal} />
```

**Styling**:
- Fixed position: bottom-right corner
- z-index: 30
- Responsive: visible on all screen sizes
- Theme: matches dashboard gradient colors

**Accessibility**:
- `aria-label="Open chat"`
- `role="button"`
- Keyboard accessible (Tab + Enter)

---

## 3. ChatModal Component

**Purpose**: Modal container with overlay and close functionality.

**File**: `frontend/src/components/chat/ChatModal.tsx`

**Props**:
```typescript
interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}
```

**Prop Descriptions**:
- `isOpen`: Controls modal visibility
- `onClose`: Callback when modal should close
- `children`: Modal content (ChatMessages + ChatInput)

**Usage**:
```tsx
<ChatModal isOpen={isOpen} onClose={handleClose}>
  <ChatMessages messages={messages} />
  <ChatInput onSend={handleSend} />
</ChatModal>
```

**Behavior**:
- Renders using React Portal (document.body)
- Closes on Escape key press
- Closes on overlay click
- Closes on close button click
- Traps focus within modal when open

**Styling**:
- Overlay: fixed inset-0, bg-black/50, backdrop-blur
- Modal: centered, max-w-md (desktop), full-width (mobile)
- z-index: 40 (overlay), 50 (modal)

**Accessibility**:
- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby="chat-modal-title"`
- Focus management (auto-focus input, restore focus on close)

---

## 4. ChatMessages Component

**Purpose**: Scrollable list of all messages in the conversation.

**File**: `frontend/src/components/chat/ChatMessages.tsx`

**Props**:
```typescript
interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
  className?: string
}
```

**Prop Descriptions**:
- `messages`: Array of messages to display
- `isLoading`: Whether a message is being processed
- `className`: Optional additional CSS classes

**Usage**:
```tsx
<ChatMessages
  messages={messages}
  isLoading={isLoading}
/>
```

**Behavior**:
- Auto-scrolls to latest message when new message added
- Shows loading indicator when isLoading is true
- Renders empty state when no messages
- Scrollable with overflow-auto

**Styling**:
- flex-1 (takes available space)
- overflow-auto (scrollable)
- p-4 (padding)
- space-y-4 (gap between messages)

**Empty State**:
```tsx
<div className="text-center text-gray-500">
  <p>Start a conversation!</p>
  <p className="text-sm">Ask me to manage your tasks</p>
</div>
```

---

## 5. ChatMessage Component

**Purpose**: Single message bubble (user or assistant).

**File**: `frontend/src/components/chat/ChatMessage.tsx`

**Props**:
```typescript
interface ChatMessageProps {
  message: Message
  className?: string
}
```

**Prop Descriptions**:
- `message`: Message object to display
- `className`: Optional additional CSS classes

**Usage**:
```tsx
<ChatMessage message={message} />
```

**Behavior**:
- Renders user messages right-aligned
- Renders assistant messages left-aligned
- Shows error state if message.status === 'error'
- Shows timestamp (optional)

**Styling**:
- User messages: bg-blue-500, text-white, rounded-l-lg, ml-auto
- Assistant messages: bg-gray-200, text-gray-900, rounded-r-lg, mr-auto
- Max width: 80% of container
- Padding: p-3
- Error state: bg-red-100, border-red-500

**Memoization**:
```tsx
export const ChatMessage = React.memo(ChatMessageComponent)
```

---

## 6. ChatInput Component

**Purpose**: Input field with send button for composing messages.

**File**: `frontend/src/components/chat/ChatInput.tsx`

**Props**:
```typescript
interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  maxLength?: number
  className?: string
}
```

**Prop Descriptions**:
- `onSend`: Callback when user sends a message
- `disabled`: Whether input is disabled (during loading)
- `maxLength`: Maximum character limit (default: 2000)
- `className`: Optional additional CSS classes

**Usage**:
```tsx
<ChatInput
  onSend={handleSendMessage}
  disabled={isLoading}
  maxLength={2000}
/>
```

**Behavior**:
- Validates message before sending (not empty, within length limit)
- Clears input after successful send
- Shows character count when approaching limit
- Disables send button when input is empty or disabled
- Sends message on Enter key (Shift+Enter for new line)

**Validation**:
```typescript
const isValid = message.trim().length > 0 && message.length <= maxLength
```

**Styling**:
- flex container (input + button)
- Input: flex-1, rounded-l-lg, border
- Button: rounded-r-lg, bg-blue-500, disabled:opacity-50

**Accessibility**:
- `aria-label="Type your message"`
- `aria-describedby="char-count"`
- Keyboard accessible (Tab, Enter)

---

## 7. ChatLoading Component

**Purpose**: Loading indicator shown while waiting for response.

**File**: `frontend/src/components/chat/ChatLoading.tsx`

**Props**:
```typescript
interface ChatLoadingProps {
  className?: string
}
```

**Prop Descriptions**:
- `className`: Optional additional CSS classes

**Usage**:
```tsx
{isLoading && <ChatLoading />}
```

**Behavior**:
- Shows animated dots or spinner
- Positioned at bottom of messages list
- Left-aligned (assistant side)

**Styling**:
- Animated dots: "Thinking..."
- bg-gray-200, rounded-r-lg, p-3
- Animation: pulse or bounce

---

## 8. ChatError Component

**Purpose**: Error message display with retry option.

**File**: `frontend/src/components/chat/ChatError.tsx`

**Props**:
```typescript
interface ChatErrorProps {
  error: string
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}
```

**Prop Descriptions**:
- `error`: Error message to display
- `onRetry`: Optional callback to retry failed action
- `onDismiss`: Optional callback to dismiss error
- `className`: Optional additional CSS classes

**Usage**:
```tsx
{error && (
  <ChatError
    error={error}
    onRetry={handleRetry}
    onDismiss={handleDismissError}
  />
)}
```

**Behavior**:
- Shows error message in red/warning style
- Provides retry button if onRetry provided
- Provides dismiss button if onDismiss provided
- Auto-dismisses after 5 seconds (optional)

**Styling**:
- bg-red-50, border-red-200, text-red-800
- rounded-lg, p-3, mb-4
- flex layout (message + buttons)

---

## 9. useChat Hook

**Purpose**: Custom hook for managing chat state and logic.

**File**: `frontend/src/hooks/useChat.ts`

**Return Type**:
```typescript
interface UseChatReturn {
  // State
  messages: Message[]
  isOpen: boolean
  isLoading: boolean
  error: string | null

  // Actions
  openModal: () => void
  closeModal: () => void
  sendMessage: (content: string) => Promise<void>
  clearError: () => void
  clearMessages: () => void
}
```

**Usage**:
```tsx
function ChatWidget() {
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
      {isOpen && (
        <ChatModal isOpen={isOpen} onClose={closeModal}>
          <ChatMessages messages={messages} isLoading={isLoading} />
          {error && <ChatError error={error} onDismiss={clearError} />}
          <ChatInput onSend={sendMessage} disabled={isLoading} />
        </ChatModal>
      )}
    </>
  )
}
```

**Implementation Details**:
- Uses `useReducer` for state management
- Uses `useEffect` for API calls
- Uses `useCallback` for memoized callbacks
- Handles all business logic (validation, API calls, error handling)

**Internal State**:
```typescript
const [state, dispatch] = useReducer(chatReducer, initialChatState)
```

---

## 10. chatService

**Purpose**: API service for backend communication.

**File**: `frontend/src/services/chatService.ts`

**API**:
```typescript
interface ChatService {
  sendMessage(message: string): Promise<ChatResponse>
}
```

**Function Signature**:
```typescript
async function sendMessage(message: string): Promise<ChatResponse>
```

**Parameters**:
- `message`: User's message content (string, max 2000 chars)

**Returns**:
```typescript
interface ChatResponse {
  response: string
  tool_calls?: Array<{
    tool: string
    arguments: Record<string, any>
    result: any
  }>
}
```

**Throws**:
- `Error` with user-friendly message on failure

**Usage**:
```typescript
import { sendMessage } from '@/services/chatService'

try {
  const response = await sendMessage('Add a task to buy groceries')
  console.log(response.response)
} catch (error) {
  console.error(error.message)
}
```

**Implementation**:
```typescript
export async function sendMessage(message: string): Promise<ChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify({ message })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to send message')
  }

  return await response.json()
}
```

**Error Handling**:
- Network errors: "Network error. Please check your connection."
- 401 Unauthorized: "Session expired. Please log in again."
- 429 Rate Limit: "Too many requests. Please wait a moment."
- 500 Server Error: "Something went wrong. Please try again."

---

## Type Definitions Summary

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

// Hook return type
export interface UseChatReturn {
  messages: Message[]
  isOpen: boolean
  isLoading: boolean
  error: string | null
  openModal: () => void
  closeModal: () => void
  sendMessage: (content: string) => Promise<void>
  clearError: () => void
  clearMessages: () => void
}
```

---

## Component Hierarchy

```
ChatWidget (container)
├── ChatButton (when modal closed)
└── ChatModal (when modal open)
    ├── ChatMessages
    │   ├── Empty State (when no messages)
    │   ├── ChatMessage (for each message)
    │   └── ChatLoading (when isLoading)
    ├── ChatError (when error exists)
    └── ChatInput
```

---

## Integration Points

### 1. Dashboard Layout Integration

**File**: `frontend/src/app/dashboard/layout.tsx`

```tsx
import { ChatWidget } from '@/components/chat/ChatWidget'

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav>{/* existing nav */}</nav>
      <main>{children}</main>
      <ChatWidget />
    </div>
  )
}
```

### 2. Authentication Integration

**File**: `frontend/src/services/chatService.ts`

```typescript
import { getAuthToken } from '@/lib/auth'

// Use existing auth token for API calls
headers: {
  'Authorization': `Bearer ${getAuthToken()}`
}
```

### 3. Theme Integration

**File**: `frontend/tailwind.config.js`

```javascript
// Use existing theme colors
colors: {
  primary: colors.blue,
  // ... existing colors
}
```

---

## Testing Contracts

### Unit Tests

```typescript
// ChatMessage.test.tsx
describe('ChatMessage', () => {
  it('renders user message right-aligned', () => {})
  it('renders assistant message left-aligned', () => {})
  it('shows error state for failed messages', () => {})
})

// useChat.test.ts
describe('useChat', () => {
  it('opens and closes modal', () => {})
  it('sends message and updates state', () => {})
  it('handles API errors gracefully', () => {})
})
```

### Integration Tests

```typescript
// ChatWidget.test.tsx
describe('ChatWidget Integration', () => {
  it('complete message flow: send → loading → response', () => {})
  it('handles network errors with retry', () => {})
  it('validates message length', () => {})
})
```

---

**Component API Status**: ✅ Complete
**Next**: Quickstart Guide (quickstart.md)
