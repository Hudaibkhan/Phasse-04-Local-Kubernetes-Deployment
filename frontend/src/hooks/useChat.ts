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

    // Get the message ID from the last message
    const messageId = crypto.randomUUID()

    try {
      // Mark as sent
      dispatch({ type: 'MESSAGE_SENT', payload: { messageId } })

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

  const retryMessage = useCallback(async (messageId: string) => {
    // Find the failed message
    const failedMessage = state.messages.find(msg => msg.id === messageId)
    if (!failedMessage || failedMessage.status !== 'error') {
      return
    }

    // Retry by resending the message content
    dispatch({ type: 'RETRY_MESSAGE', payload: { messageId } })

    try {
      // Mark as sent
      dispatch({ type: 'MESSAGE_SENT', payload: { messageId } })

      // Send to backend
      const response = await sendMessageAPI(failedMessage.content)

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
  }, [state.messages])

  return {
    messages: state.messages,
    isOpen: state.isOpen,
    isLoading: state.isLoading,
    error: state.error,
    openModal,
    closeModal,
    sendMessage,
    clearError,
    clearMessages,
    retryMessage
  }
}
