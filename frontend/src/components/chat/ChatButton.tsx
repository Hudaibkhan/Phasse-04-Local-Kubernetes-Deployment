'use client'
import { forwardRef } from 'react'

interface ChatButtonProps {
  onClick: () => void
}

export const ChatButton = forwardRef<HTMLButtonElement, ChatButtonProps>(
  function ChatButton({ onClick }, ref) {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 active:scale-95"
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
)
