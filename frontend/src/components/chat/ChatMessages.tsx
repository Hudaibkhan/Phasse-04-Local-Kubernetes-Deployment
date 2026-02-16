'use client'
import { Message } from '@/types/chat'
import { ChatMessage } from './ChatMessage'
import { ChatLoading } from './ChatLoading'
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
      {isLoading && <ChatLoading />}
      <div ref={messagesEndRef} />
    </div>
  )
}
