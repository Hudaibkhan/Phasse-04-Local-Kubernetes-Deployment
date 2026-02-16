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
  | { type: 'RETRY_MESSAGE'; payload: { messageId: string } }
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
