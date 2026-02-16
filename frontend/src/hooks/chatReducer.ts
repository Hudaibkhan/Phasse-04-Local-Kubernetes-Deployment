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
              ? { ...msg, status: 'delivered' as const }
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

    case 'RETRY_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.messageId
            ? { ...msg, status: 'pending', error: null }
            : msg
        ),
        isLoading: true,
        error: null
      }

    case 'CLEAR_ERROR':
      return { ...state, error: null }

    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] }

    default:
      return state
  }
}
