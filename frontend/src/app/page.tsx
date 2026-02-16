'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState({
    hero: false,
    features: false,
    howItWorks: false,
    cta: false
  })

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: true
          }))
        }
      })
    }, observerOptions)

    const sections = ['hero', 'features', 'howItWorks', 'cta']
    sections.forEach(id => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors overflow-hidden">
      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section 
          id="hero"
          className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32"
        >
          {/* Animated Background Orbs */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-30 dark:opacity-20 pointer-events-none">
            <div className="w-96 h-96 bg-indigo-500 rounded-full blur-3xl animate-blob"></div>
          </div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 opacity-30 dark:opacity-20 pointer-events-none">
            <div className="w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 dark:opacity-10 pointer-events-none">
            <div className="w-[600px] h-[600px] bg-pink-500 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              {/* Animated Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-2 border-indigo-200 dark:border-indigo-800 shadow-lg mb-8 animate-fade-in-down">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Now with Smart Recurring Tasks
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 animate-fade-in-up animation-delay-200">
                Quantum{' '}
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-text">
                    Todo
                  </span>
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-40 animate-pulse"></div>
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl sm:text-2xl md:text-3xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-400 font-medium">
                The next generation of task management.{' '}
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">Simple</span> enough for a grocery list,{' '}
                <span className="text-purple-600 dark:text-purple-400 font-bold">powerful</span> enough for your life&aposs ambitions.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16 animate-fade-in-up animation-delay-600">
                <Link
                  href="/signup"
                  className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    Start Organizing Free
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-900 dark:text-white font-bold rounded-xl border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
                >
                  Sign In
                </Link>
              </div>

              {/* Mockup Preview with Parallax */}
              <div 
                className="relative mx-auto max-w-5xl animate-fade-in-up animation-delay-800"
                style={{ transform: `translateY(${scrollY * 0.1}px)` }}
              >
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
                  
                  {/* Mockup */}
                  {/* <div className="relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-3 shadow-2xl border-2 border-slate-200 dark:border-slate-700">
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl overflow-hidden aspect-video relative border-2 border-slate-200 dark:border-slate-700">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center p-8">
                          <div className="relative mb-6">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
                            <div className="relative w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-xl animate-bounce-slow">
                              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 font-semibold text-lg">
                            Experience the minimalist interface
                          </p>
                        </div>
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>

              {/* Scroll Indicator */}
              <div className="mt-16 flex justify-center animate-fade-in animation-delay-1000">
                <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400 animate-bounce-slow">
                  <span className="text-sm font-medium">Scroll to explore</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section 
          id="features"
          className="py-24 relative"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className={`text-center mb-16 transition-all duration-1000 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border-2 border-indigo-200 dark:border-indigo-800 mb-4">
                <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Capabilities
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-4">
                Engineered for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  Productivity
                </span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Everything you need to stay organized and focused
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Feature 1 */}
              <div className={`group bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-lg border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-2xl transition-all duration-500 hover:scale-105 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} animation-delay-100`}>
                <div className="relative mb-6">
                  <div className="absolute -inset-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur opacity-0 transition duration-500"></div>
                  <div className="relative w-14 h-14 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-7 h-7 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                  Fluid Task Management
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Quickly capture ideas and transform them into actionable tasks. Clean, intuitive UI designed to stay out of your way.
                </p>
              </div>

              {/* Feature 2 */}
              <div className={`group bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-lg border-2 border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-700 hover:shadow-2xl transition-all duration-500 hover:scale-105 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} animation-delay-200`}>
                <div className="relative mb-6">
                  <div className="absolute -inset-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur opacity-0  transition duration-500"></div>
                  <div className="relative w-14 h-14 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 group-hover:rotate-180">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                  Smart Recurrence
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Set it once, never forget again. Daily, weekly, or complex custom patterns — we&aposs got you covered.
                </p>
              </div>

              {/* Feature 3 */}
              <div className={`group bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-lg border-2 border-slate-200 dark:border-slate-700 hover:border-yellow-300 dark:hover:border-yellow-700 hover:shadow-2xl transition-all duration-500 hover:scale-105 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} animation-delay-300`}>
                <div className="relative mb-6">
                  <div className="absolute -inset-2 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-xl blur opacity-0  transition duration-500"></div>
                  <div className="relative w-14 h-14 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/50 dark:to-amber-900/50 text-yellow-600 dark:text-yellow-400 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 group-hover:animate-shake">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors duration-300">
                  Timely Reminders
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Stay ahead of your schedule with smart notifications. Get alerts for due tasks, overdue items, and reminders.
                </p>
              </div>

              {/* Feature 4 */}
              <div className={`group bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-lg border-2 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-2xl transition-all duration-500 hover:scale-105 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} animation-delay-400`}>
                <div className="relative mb-6">
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-0 transition duration-500"></div>
                  <div className="relative w-14 h-14 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                  Deep Organization
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Organize by project, theme, or context. Use multiple tags to build a system that works exactly like your brain does.
                </p>
              </div>

              {/* Feature 5 */}
              <div className={`group bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-lg border-2 border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-700 hover:shadow-2xl transition-all duration-500 hover:scale-105 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} animation-delay-500`}>
                <div className="relative mb-6">
                  <div className="absolute -inset-2 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl blur opacity-0  transition duration-500"></div>
                  <div className="relative w-14 h-14 bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/50 dark:to-rose-900/50 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                  Prioritization
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Focus on what matters. Use levels of priority to visualize your urgent tasks and manage your time effectively.
                </p>
              </div>

              {/* Feature 6 */}
              <div className={`group bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-lg border-2 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-2xl transition-all duration-500 hover:scale-105 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} animation-delay-600`}>
                <div className="relative mb-6">
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-0  transition duration-500"></div>
                  <div className="relative w-14 h-14 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 group-hover:rotate-12">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  Adaptive Design
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Beautiful dark and light modes. Seamlessly switches with your system preferences or manually with a toggle.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section 
          id="howItWorks"
          className="py-24 relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 opacity-50"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Section Header */}
            <div className={`text-center mb-20 transition-all duration-1000 ${isVisible.howItWorks ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/50 border-2 border-purple-200 dark:border-purple-800 mb-4">
                <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  How It Works
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-4">
                Get Started in{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  3 Simple Steps
                </span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                From chaos to clarity in minutes
              </p>
            </div>

            {/* Steps */}
            <div className="relative">
              {/* Connecting Line */}
              <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-20"></div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                {/* Step 1 */}
                <div className={`relative transition-all duration-1000 ${isVisible.howItWorks ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'} animation-delay-200`}>
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-500 hover:scale-105 group">
                    {/* Step Number */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                        <div className="relative w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-xl">
                          1
                        </div>
                      </div>
                    </div>

                    {/* Icon */}
                    <div className="flex justify-center mb-6 mt-4">
                      <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <svg className="w-10 h-10 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 text-center">
                      Create Tasks
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-center leading-relaxed">
                      Capture your thoughts instantly. Add tasks with titles, descriptions, and due dates in seconds.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className={`relative transition-all duration-1000 ${isVisible.howItWorks ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} animation-delay-400`}>
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border-2 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-500 hover:scale-105 group">
                    {/* Step Number */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                        <div className="relative w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-xl">
                          2
                        </div>
                      </div>
                    </div>

                    {/* Icon */}
                    <div className="flex justify-center mb-6 mt-4">
                      <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <svg className="w-10 h-10 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 text-center">
                      Organize & Prioritize
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-center leading-relaxed">
                      Add tags, set priorities, and categorize. Build a system that matches your workflow perfectly.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className={`relative transition-all duration-1000 ${isVisible.howItWorks ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'} animation-delay-600`}>
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border-2 border-slate-200 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-700 transition-all duration-500 hover:scale-105 group">
                    {/* Step Number */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                        <div className="relative w-12 h-12 bg-gradient-to-r from-pink-600 to-rose-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-xl">
                          3
                        </div>
                      </div>
                    </div>

                    {/* Icon */}
                    <div className="flex justify-center mb-6 mt-4">
                      <div className="w-20 h-20 bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/50 dark:to-rose-900/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <svg className="w-10 h-10 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 text-center">
                      Complete & Track
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-center leading-relaxed">
                      Check off completed tasks and watch your progress. Feel the satisfaction of getting things done.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className={`text-center mt-16 transition-all duration-1000 ${isVisible.howItWorks ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} animation-delay-800`}>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Start Your Journey
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section 
          id="cta"
          className="py-24 relative overflow-hidden"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient"></div>
          
          {/* Floating Orbs */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          
          <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 transition-all duration-1000 ${isVisible.cta ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-white rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <div className="relative w-20 h-20 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
              Ready to evolve your workflow?
            </h2>
            <p className="text-xl sm:text-2xl text-indigo-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of users who have streamlined their productivity and transformed their daily routines.
            </p>
            
            {/* CTA Button */}
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-indigo-600 font-bold rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span className="text-lg">Get Started for Free</span>
              <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            {/* Social Proof */}
            {/* <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-white/90">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-semibold">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-semibold">10,000+ Users</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Free Forever</span>
              </div>
            </div> */}
          </div>
        </section>
      </main>

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes gradient-text {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        .animate-blob { animation: blob 7s infinite; }
        .animate-gradient-text {
          background-size: 200% 200%;
          animation: gradient-text 3s ease infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animate-fade-in-down { animation: fade-in-down 0.6s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .animate-shake { animation: shake 0.5s; }

        .animation-delay-100 { animation-delay: 0.1s; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-500 { animation-delay: 0.5s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-700 { animation-delay: 0.7s; }
        .animation-delay-800 { animation-delay: 0.8s; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  )
}