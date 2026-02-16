import { ChatRequest, ChatResponse } from '@/types/chat'

// Get auth token from localStorage (matches existing auth pattern)
function getAuthToken(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || ''
  }
  return ''
}

export async function sendMessage(message: string): Promise<ChatResponse> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ message } as ChatRequest)
    })

    if (!response.ok) {
      // Handle specific error codes
      if (response.status === 401) {
        throw new Error('Session expired. Please log in again.')
      }
      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment.')
      }

      const error = await response.json()
      throw new Error(error.detail || 'Failed to send message')
    }

    return await response.json()
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Network error. Please check your connection.')
    }
    throw error
  }
}
