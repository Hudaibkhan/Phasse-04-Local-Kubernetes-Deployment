import React from 'react'

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Checkbox: React.FC<CheckboxProps> = ({ label, className, ...props }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="relative flex items-center group">
        <input
          {...props}
          type="checkbox"
          className={`
            peer
            h-5 w-5
            appearance-none
            rounded-lg
            border-2 border-slate-300 dark:border-slate-600
            bg-white dark:bg-slate-900
            cursor-pointer
            transition-all duration-300 ease-out
            shadow-sm

            hover:border-indigo-400 dark:hover:border-indigo-500
            hover:shadow-md
            hover:scale-105

            checked:border-transparent
            checked:bg-gradient-to-br checked:from-indigo-600 checked:to-purple-600
            dark:checked:from-indigo-500 dark:checked:to-purple-500
            checked:shadow-lg checked:shadow-indigo-500/50
            checked:scale-110

            focus:outline-none focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-900/40
            focus:scale-105

            active:scale-95

            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            ${className || ''}
          `}
        />

        {/* Animated ripple effect on check */}
        <span className="absolute inset-0 rounded-lg bg-indigo-500/30 opacity-0 scale-50 peer-checked:animate-ping-once pointer-events-none" />

        {/* Animated check icon with bounce */}
        <svg
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white opacity-0 scale-0 rotate-12 transition-all duration-300 ease-out peer-checked:opacity-100 peer-checked:scale-100 peer-checked:rotate-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>

        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-400 opacity-0 blur-md peer-checked:opacity-20 transition-opacity duration-300 pointer-events-none -z-10" />
      </div>

      {label && (
        <label
          htmlFor={props.id}
          className="text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer select-none transition-colors duration-200 hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          {label}
        </label>
      )}

      <style jsx>{`
        @keyframes ping-once {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.4;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .peer-checked\:animate-ping-once {
          animation: ping-once 0.6s cubic-bezier(0, 0, 0.2, 1);
        }
      `}</style>
    </div>
  )
}

export default Checkbox