// Centralized API configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://hudiab-quantum-todo-backend.hf.space/api";

// Ensure proper URL formatting (allow HTTP for localhost)
const ensureProperProtocol = (url: string): string => {
  // Remove trailing slash if present
  let cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;

  // Allow HTTP for localhost and 127.0.0.1 (development)
  if (cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1')) {
    // Keep HTTP for local development
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'http://' + cleanUrl;
    }
    return cleanUrl;
  }

  // For production URLs, ensure HTTPS
  if (cleanUrl.startsWith('http://')) {
    cleanUrl = cleanUrl.replace('http://', 'https://');
  } else if (!cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl;
  }

  return cleanUrl;
};

export const API_URL = ensureProperProtocol(API_BASE_URL);

// Log the API URL to help with debugging
if (typeof window !== 'undefined') {
  console.log("Using API Base URL:", API_URL);
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

export class ClientApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      credentials: 'include', // Include cookies in requests
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    // Properly construct URL to avoid double slashes
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    let fullUrl = `${this.baseUrl}/${cleanEndpoint}`;

    // Only enforce HTTPS for production URLs (not localhost)
    const isLocalhost = fullUrl.includes('localhost') || fullUrl.includes('127.0.0.1');
    if (!isLocalhost && fullUrl.startsWith('http://')) {
      fullUrl = fullUrl.replace('http://', 'https://');
    }

    const response = await fetch(fullUrl, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API request failed: ${response.status}`);
    }

    // For successful responses that have content
    if (response.status !== 204) {
      return await response.json();
    }

    // For 204 No Content responses
    return {} as T;
  }

  get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  post<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, headers });
  }

  put<T>(endpoint: string, body: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, headers });
  }

  patch<T>(endpoint: string, body: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body, headers });
  }

  delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}