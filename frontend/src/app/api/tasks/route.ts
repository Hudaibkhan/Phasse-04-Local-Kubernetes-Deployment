import { NextRequest } from 'next/server';
import { API_URL } from '../../../lib/api';

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1]; // Extract bearer token

    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Forward the request to the backend
    const backendResponse = await fetch(`${API_URL}/tasks/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await backendResponse.json();

    return new Response(JSON.stringify(data), {
      status: backendResponse.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the auth token from headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1]; // Extract bearer token

    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the request body
    const body = await request.json();

    // Forward the request to the backend
    const backendResponse = await fetch(`${API_URL}/tasks/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    return new Response(JSON.stringify(data), {
      status: backendResponse.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}