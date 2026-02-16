'use client'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function ChatModal({ isOpen, onClose, children }: ChatModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen || !modalRef.current) return

    const modal = modalRef.current
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      // Shift + Tab on first element -> go to last
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      }
      // Tab on last element -> go to first
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }

    modal.addEventListener('keydown', handleTabKey as EventListener)
    return () => modal.removeEventListener('keydown', handleTabKey as EventListener)
  }, [isOpen])

  if (!isOpen) return null

  // Only render portal on client side
  if (typeof window === 'undefined') return null

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <div
          ref={modalRef}
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 w-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[95vh] sm:max-h-[85vh] md:max-h-[80vh] flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 id="chat-modal-title" className="text-lg font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Chat Assistant
            </h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-700"
              aria-label="Close chat"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          {children}
        </div>
      </div>
    </>,
    document.body
  )
}
