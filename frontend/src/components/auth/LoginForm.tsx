'use client'

import React, { useState } from 'react'
import Input from '../forms/Input'
import Button from '../forms/Button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { PasswordInput } from '@/components/PasswordInput'

interface FormData {
  username: string  // Changed from email to username to allow both
  password: string
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ username: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [usernameOrEmailError, setUsernameOrEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { login } = useAuth()

  const validateUsernameOrEmail = (identifier: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!identifier) {
      setUsernameOrEmailError('Username or email is required')
      return false
    }
    if (!emailRegex.test(identifier) && identifier.length < 3) {
      setUsernameOrEmailError('Please enter a valid username or email')
      return false
    }
    setUsernameOrEmailError(null)
    return true
  }

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required')
      return false
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return false
    }
    setPasswordError(null)
    return true
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (error) setError(null)

    // Validate field as user types
    if (name === 'username') {
      validateUsernameOrEmail(value)
    } else if (name === 'password') {
      validatePassword(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate form before submitting
    const isIdentifierValid = validateUsernameOrEmail(formData.username)
    const isPasswordValid = validatePassword(formData.password)

    if (!isIdentifierValid || !isPasswordValid) {
      setIsLoading(false)
      return
    }

    try {
      // Use the login function from AuthContext
      await login(formData.username, formData.password)

      // The AuthContext will handle the redirect to tasks page
    } catch (err: any) {
      // Handle specific error messages
      setError(err.message || 'Invalid username or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Animated Orbs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-300 dark:bg-indigo-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 dark:bg-pink-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        {/* Header with fade-in animation */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-down">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-2xl shadow-xl">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>

          <h2 className="text-center text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Sign in to continue to your dashboard
          </p>
        </div>

        {/* Form Card with slide-up animation */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up animation-delay-200">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Error Alert with slide-in animation */}
              {error && (
                <div className="rounded-xl bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/50 dark:to-rose-900/50 p-4 border-2 border-red-200 dark:border-red-800 animate-slide-in-left">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-700 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Fields with stagger animation */}
              <div className="space-y-5">
                <div className="animate-fade-in animation-delay-300">
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    label="Username or Email"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="username or email@example.com"
                    error={usernameOrEmailError || undefined}
                    className='text-slate-800 dark:text-slate-100'
                  />
                </div>

                <div className="animate-fade-in animation-delay-400">
                  <PasswordInput
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={passwordError ? 'border-red-500' : ''}
                  />
                  {passwordError && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-shake">{passwordError}</p>
                  )}
                </div>
              </div>

              {/* Remember Me & Forgot Password with fade-in */}
              <div className="flex items-center justify-between animate-fade-in animation-delay-500">
                <div className="flex items-center group">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-5 w-5 rounded-lg border-2 border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all duration-200 cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-all duration-200 hover:underline underline-offset-4">
                    Forgot password?
                  </a>
                </div>
              </div>

              {/* Submit Button with fade-in */}
              <div className="animate-fade-in animation-delay-600">
                <Button
                  type="submit"
                  className="w-full"
                  loading={isLoading}
                  disabled={!formData.username || !formData.password || !!usernameOrEmailError || !!passwordError || isLoading}
                >
                  Sign in
                </Button>
              </div>
            </form>

            {/* Divider with fade-in */}
            <div className="mt-6 animate-fade-in animation-delay-700">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold backdrop-blur-sm rounded-lg">
                    Don&apost have an account?
                  </span>
                </div>
              </div>

              {/* Sign Up Link with fade-in */}
              <div className="mt-6">
                <Link 
                  href="/signup" 
                  className="group w-full flex justify-center items-center py-2.5 px-4 border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-500 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-xl transition-all duration-300 active:scale-95 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
                >
                  <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Create new account
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Login Info with fade-in */}
          <div className="mt-6 flex justify-center animate-fade-in animation-delay-800">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-medium">Quick & secure authentication</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes slide-in-left {
          0% {
            opacity: 0;
            transform: translateX(-20px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.4s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
        }

        .animation-delay-700 {
          animation-delay: 0.7s;
        }

        .animation-delay-800 {
          animation-delay: 0.8s;
        }

        .animation-delay-900 {
          animation-delay: 0.9s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

export default LoginForm