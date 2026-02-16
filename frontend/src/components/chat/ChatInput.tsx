'use client'
import { useState, KeyboardEvent, useRef, useEffect } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  maxLength?: number
  autoFocus?: boolean
}

export function ChatInput({
  onSend,
  disabled = false,
  maxLength = 2000,
  autoFocus = false
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus when component mounts or autoFocus prop changes
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

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
    <div className="border-t border-slate-200 dark:border-slate-700 p-3 sm:p-4 bg-slate-50/50 dark:bg-slate-800/50">
      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={disabled}
          className="flex-1 resize-none rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 p-2 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
          rows={1}
          aria-label="Type your message"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim() || isOverLimit}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base font-medium shadow-md hover:shadow-lg flex items-center gap-2"
        >
          {disabled ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Sending...</span>
            </>
          ) : (
            'Send'
          )}
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
