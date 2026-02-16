'use client'
import { useChat } from '@/hooks/useChat'
import { useRef, useEffect } from 'react'
import { ChatButton } from './ChatButton'
import { ChatModal } from './ChatModal'
import { ChatMessages } from './ChatMessages'
import { ChatInput } from './ChatInput'
import { ChatError } from './ChatError'

export function ChatWidget() {
  const { messages, isOpen, isLoading, error, openModal, closeModal, sendMessage, clearError, retryMessage } = useChat()
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Restore focus to button when modal closes
  useEffect(() => {
    if (!isOpen && buttonRef.current) {
      buttonRef.current.focus()
    }
  }, [isOpen])

  return (
    <>
      {/* Floating chat button - always visible */}
      <ChatButton onClick={openModal} ref={buttonRef} />

      {/* Chat modal - conditionally rendered */}
      <ChatModal isOpen={isOpen} onClose={closeModal}>
        {/* Error banner */}
        {error && (
          <ChatError
            message={error}
            onDismiss={clearError}
          />
        )}

        {/* Messages area */}
        <ChatMessages messages={messages} isLoading={isLoading} />

        {/* Input area */}
        <ChatInput
          onSend={sendMessage}
          disabled={isLoading}
          maxLength={2000}
          autoFocus={isOpen}
        />
      </ChatModal>
    </>
  )
}
