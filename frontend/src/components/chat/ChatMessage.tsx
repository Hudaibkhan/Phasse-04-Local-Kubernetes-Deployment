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
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200'
            : isUser
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-none shadow-md'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-none shadow-sm'
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
