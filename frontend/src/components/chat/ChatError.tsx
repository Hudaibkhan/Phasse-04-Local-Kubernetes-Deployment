'use client'

interface ChatErrorProps {
  message: string
  onRetry?: () => void
  onDismiss?: () => void
}

export function ChatError({ message, onRetry, onDismiss }: ChatErrorProps) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-700 p-4 m-4 rounded-r-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-red-500 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-800 dark:text-red-200">{message}</p>
        </div>
        <div className="ml-4 flex gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
              aria-label="Retry"
            >
              Retry
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-200 transition-colors"
              aria-label="Dismiss error"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
