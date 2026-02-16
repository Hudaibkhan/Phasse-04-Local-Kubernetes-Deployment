'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ClientApiClient } from './api'
import { Divide } from 'lucide-react'

interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string) => Promise<void>
  loading: boolean
  api: ClientApiClient
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const apiClient = new ClientApiClient()

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuthStatus = async () => {
      try {
        const userData = await apiClient.get<User>('/auth/me')
        setUser(userData)
      } catch (error) {
        // If not authenticated, user remains null
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      await apiClient.post('/auth/login', { email, password })
      // After login, fetch user data
      const userData = await apiClient.get<User>('/auth/me')
      setUser(userData)
      router.push('/dashboard')
    } catch (error: any) {
      throw new Error(error.message || 'Login failed')
    }
  }

  const register = async (email: string, password: string) => {
    try {
      await apiClient.post('/auth/register', { email, password })
      // After registration, redirect to login
      router.push('/login')
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed')
    }
  }

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout')
      setUser(null)
      router.push('/')
    } catch (error) {
      // Even if logout fails, clear local state and redirect
      setUser(null)
      router.push('/')
    }
  }

  const value = {
    user,
    login,
    logout,
    register,
    loading,
    api: apiClient
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
    
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
