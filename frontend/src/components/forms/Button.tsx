import React, { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'destructive' | 'ghost' | 'outline' | 'link'

type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
  size?: ButtonSize
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  loading = false,
  disabled,
  className,
  size = 'md',
  ...props
}) => {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base"
  }

  const baseClasses = "inline-flex justify-center items-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"

  const variantClasses = {
    primary: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 border-0",
    secondary: "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg shadow-slate-500/30 hover:shadow-xl hover:shadow-slate-500/40 focus:ring-slate-200 dark:focus:ring-slate-900/50 border-0",
    danger: "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 focus:ring-red-200 dark:focus:ring-red-900/50 border-0",
    success: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 focus:ring-green-200 dark:focus:ring-green-900/50 border-0",
    destructive: "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 focus:ring-red-200 dark:focus:ring-red-900/50 border-0",
    ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-slate-200 dark:focus:ring-slate-700 border-0",
    outline: "bg-transparent border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 focus:ring-slate-200 dark:focus:ring-slate-700",
    link: "bg-transparent text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline underline-offset-4 decoration-2 hover:decoration-indigo-800 dark:hover:decoration-indigo-300 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 border-0 shadow-none"
  }

  const disabledClass = disabled || loading ? "opacity-50 cursor-not-allowed hover:shadow-none active:scale-100" : ""

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClass} ${className || ''}`}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : children}
    </button>
  )
}

export default Button