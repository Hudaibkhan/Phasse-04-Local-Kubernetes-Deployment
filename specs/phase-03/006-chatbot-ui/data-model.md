# Data Model: Frontend Chatbot UI Integration

**Feature**: 006-chatbot-ui
**Date**: 2026-02-09
**Status**: Complete

## Overview

This document defines the client-side data structures for the chatbot UI feature. All data is session-based and stored in React component state. No database persistence is required for this feature.

---

## Core Entities

### 1. Message

Represents a single message in the chat conversation.

**Purpose**: Store message content, role (user/assistant), timestamp, and status.

**Attributes**:
- `id`: Unique identifier for the message (string, UUID v4)
- `content`: The text content of the message (string, max 2000 characters)
- `role`: Who sent the message (enum: 'user' | 'assistant')
- `timestamp`: When the message was created (Date)
- `status`: Current status of the message (enum: 'pending' | 'sent' | 'delivered' | 'error')
- `error`: Error message if status is 'error' (string | null)

**TypeScript Interface**:
```typescript
interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  status: 'pending' | 'sent' | 'delivered' | 'error'
  error?: string | null
}
```

**Validation Rules**:
- `content` must not be empty (after trimming whitespace)
- `content` must not exceed 2000 characters
- `role` must be either 'user' or 'assistant'
- `timestamp` must be a valid Date object
- `status` must be one of the defined enum values

**State Transitions**:
```
User Message Flow:
pending → sent → delivered
pending → sent → error

Assistant Message Flow:
(created directly as 'delivered' when received from backend)
```

**Example**:
```typescript
const userMessage: Message = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  content: 'Add a task to buy groceries',
  role: 'user',
  timestamp: new Date('2026-02-09T10:30:00Z'),
  status: 'delivered',
  error: null
}

const assistantMessage: Message = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  content: 'I\'ve added a task to buy groceries for you!',
  role: 'assistant',
  timestamp: new Date('2026-02-09T10:30:05Z'),
  status: 'delivered',
  error: null
}
```

---

### 2. ChatState

Represents the complete state of the chat interface.

**Purpose**: Manage all chat-related state including messages, modal visibility, loading state, and errors.

**Attributes**:
- `messages`: Array of all messages in the conversation (Message[])
- `isOpen`: Whether the chat modal is currently open (boolean)
- `isLoading`: Whether a message is currently being sent/processed (boolean)
- `error`: Current error message, if any (string | null)

**TypeScript Interface**:
```typescript
interface ChatState {
  messages: Message[]
  isOpen: boolean
  isLoading: boolean
  error: string | null
}
```

**Initial State**:
```typescript
const initialChatState: ChatState = {
  messages: [],
  isOpen: false,
  isLoading: false,
  error: null
}
```

**State Invariants**:
- `messages` array is always sorted by timestamp (oldest first)
- `isLoading` is true only when waiting for backend response
- `error` is cleared when user sends a new message or closes modal
- `isOpen` controls modal visibility

---

### 3. ChatAction

Represents actions that can be dispatched to update chat state.

**Purpose**: Define all possible state transitions for the chat reducer.

**TypeScript Type**:
```typescript
type ChatAction =
  | { type: 'OPEN_MODAL' }
  | { type: 'CLOSE_MODAL' }
  | { type: 'SEND_MESSAGE'; payload: { content: string } }
  | { type: 'MESSAGE_SENT'; payload: { messageId: string } }
  | { type: 'MESSAGE_SUCCESS'; payload: { userMessageId: string; assistantMessage: Message } }
  | { type: 'MESSAGE_ERROR'; payload: { messageId: string; error: string } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CLEAR_MESSAGES' }
```

**Action Descriptions**:

1. **OPEN_MODAL**: Opens the chat modal
   - Sets `isOpen` to true
   - No payload

2. **CLOSE_MODAL**: Closes the chat modal
   - Sets `isOpen` to false
   - No payload

3. **SEND_MESSAGE**: User initiates sending a message
   - Creates new user message with status 'pending'
   - Sets `isLoading` to true
   - Clears any existing error
   - Payload: `{ content: string }`

4. **MESSAGE_SENT**: Message successfully sent to backend
   - Updates user message status to 'sent'
   - Payload: `{ messageId: string }`

5. **MESSAGE_SUCCESS**: Backend response received
   - Updates user message status to 'delivered'
   - Adds assistant message to messages array
   - Sets `isLoading` to false
   - Payload: `{ userMessageId: string; assistantMessage: Message }`

6. **MESSAGE_ERROR**: Error occurred during message sending
   - Updates user message status to 'error'
   - Sets error message
   - Sets `isLoading` to false
   - Payload: `{ messageId: string; error: string }`

7. **CLEAR_ERROR**: Clears current error message
   - Sets `error` to null
   - No payload

8. **CLEAR_MESSAGES**: Clears all messages (for testing/reset)
   - Resets `messages` to empty array
   - No payload

---

### 4. ChatResponse (Backend API Response)

Represents the response from the POST /api/chat endpoint.

**Purpose**: Type definition for backend API response.

**TypeScript Interface**:
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

**Attributes**:
- `response`: The assistant's text response (string)
- `tool_calls`: Optional array of tool invocations made by the agent

**Example**:
```typescript
const apiResponse: ChatResponse = {
  response: "I've added a task to buy groceries for you!",
  tool_calls: [
    {
      tool: "add_task",
      arguments: { title: "Buy groceries" },
      result: { success: true, task_id: "..." }
    }
  ]
}
```

---

### 5. ChatRequest (Backend API Request)

Represents the request sent to POST /api/chat endpoint.

**Purpose**: Type definition for backend API request.

**TypeScript Interface**:
```typescript
interface ChatRequest {
  message: string
}
```

**Attributes**:
- `message`: The user's message content (string, max 2000 characters)

**Example**:
```typescript
const apiRequest: ChatRequest = {
  message: "Add a task to buy groceries"
}
```

---

## Data Flow

### 1. User Sends Message

```
User types message → Clicks send button
  ↓
Dispatch SEND_MESSAGE action
  ↓
Reducer creates Message with status 'pending'
  ↓
useEffect triggers API call
  ↓
Dispatch MESSAGE_SENT action (status → 'sent')
  ↓
Backend processes request
  ↓
Success: Dispatch MESSAGE_SUCCESS (status → 'delivered', add assistant message)
Error: Dispatch MESSAGE_ERROR (status → 'error', set error message)
```

### 2. Modal Open/Close

```
User clicks floating button
  ↓
Dispatch OPEN_MODAL action
  ↓
Reducer sets isOpen to true
  ↓
Modal renders with current messages
  ↓
User clicks close button or outside modal
  ↓
Dispatch CLOSE_MODAL action
  ↓
Reducer sets isOpen to false
```

### 3. Error Handling

```
API call fails
  ↓
Dispatch MESSAGE_ERROR action
  ↓
Reducer sets error message and updates message status
  ↓
Error displayed in UI
  ↓
User clicks retry or sends new message
  ↓
Dispatch CLEAR_ERROR action
  ↓
Reducer clears error
```

---

## State Management Pattern

### Reducer Implementation

```typescript
function chatReducer(state: ChatState, action: ChatAction): ChatState {
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

## Persistence Strategy

**Session-Based Only**: All chat data is stored in React component state and is lost when:
- User refreshes the page
- User navigates away from the dashboard
- User logs out
- Browser tab is closed

**No Database Persistence**: This is intentional per the feature specification. Conversation history persistence is out of scope and may be added in a future enhancement.

**Local Storage**: Not used. Session-based state is sufficient for MVP.

---

## Performance Considerations

### Memory Management

- Maximum 50 messages per conversation (spec requirement)
- Each message ~200 bytes (estimated)
- Total memory: ~10KB for 50 messages
- No memory leaks expected with proper React cleanup

### State Updates

- Immutable state updates (spread operator)
- Reducer ensures predictable state transitions
- No unnecessary re-renders (React.memo on message components)

---

## Validation & Constraints

### Message Content Validation

```typescript
function validateMessageContent(content: string): { valid: boolean; error?: string } {
  const trimmed = content.trim()

  if (trimmed.length === 0) {
    return { valid: false, error: 'Message cannot be empty' }
  }

  if (trimmed.length > 2000) {
    return { valid: false, error: 'Message too long (max 2000 characters)' }
  }

  return { valid: true }
}
```

### State Invariants

- Messages array is always sorted by timestamp
- Only one message can be in 'pending' or 'sent' status at a time
- isLoading is true only when a message is being processed
- error is null when isLoading is true

---

## Testing Considerations

### Unit Tests

- Test reducer with all action types
- Test message validation
- Test state transitions
- Test error handling

### Integration Tests

- Test full message send flow
- Test modal open/close
- Test error recovery
- Test message list rendering

---

**Data Model Status**: ✅ Complete
**Next**: Component API Contracts (contracts/component-api.md)
