import { NextRequest } from 'next/server'
import { API_URL } from '../../../lib/api'

export async function POST(request: NextRequest) {
  try {
    // Get the auth token from headers
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.split(' ')[1] // Extract bearer token

    if (!token) {
      return new Response(JSON.stringify({ detail: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get the request body
    const body = await request.json()

    console.log('Forwarding chat request to backend:', `${API_URL}/chat`)

    // Forward the request to the backend
    const backendResponse = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log('Backend response status:', backendResponse.status)

    // Try to parse as JSON, fallback to text if it fails
    let data
    const contentType = backendResponse.headers.get('content-type')

    if (contentType && contentType.includes('application/json')) {
      data = await backendResponse.json()
    } else {
      // If not JSON, get text and wrap it in an error object
      const text = await backendResponse.text()
      console.error('Backend returned non-JSON response:', text)
      data = {
        detail: text || 'Internal server error',
        error: true
      }
    }

    return new Response(JSON.stringify(data), {
      status: backendResponse.status,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in chat API route:', error)
    return new Response(JSON.stringify({
      detail: error instanceof Error ? error.message : 'Internal server error',
      error: true
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
