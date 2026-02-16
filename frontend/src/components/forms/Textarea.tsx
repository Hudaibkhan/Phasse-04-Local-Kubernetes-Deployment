import React, { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

const Textarea: React.FC<TextareaProps> = ({ label, error, helperText, className, value, defaultValue, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={props.id} 
          className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2"
        >
          {label}
        </label>
      )}
      <textarea
        {...props}
        value={value ?? ''}
        className={`
          w-full px-4 py-2.5 
          rounded-xl 
          border-2 
          bg-white dark:bg-slate-900
          text-slate-900 dark:text-slate-100
          placeholder:text-slate-400 dark:placeholder:text-slate-500
          transition-all duration-200
          focus:outline-none focus:ring-4
          disabled:opacity-50 disabled:cursor-not-allowed
          resize-y
          min-h-[100px]
          ${
            error 
              ? 'border-red-400 dark:border-red-500 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-100 dark:focus:ring-red-900/30' 
              : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 hover:border-slate-300 dark:hover:border-slate-600'
          } 
          ${className || ''}
        `}
      />
      {error && (
        <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  )
}

export default Textarea