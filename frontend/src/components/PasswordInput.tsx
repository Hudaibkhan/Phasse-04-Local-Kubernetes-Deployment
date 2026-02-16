'use client';

import { useState } from 'react';

interface PasswordInputProps {
  id?: string;
  name?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export function PasswordInput({
  id,
  name,
  placeholder,
  value,
  onChange,
  className = ''
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div>
      <label 
        htmlFor={id} 
        className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
      >
        Password
      </label>
      <div className="relative group">
        {/* Focus ring effect */}
        <div 
          className={`absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300 ${
            isFocused ? 'opacity-30' : ''
          }`}
        />
        
        <div className="relative">
          <input
            id={id}
            name={name}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            className={`
              relative block w-full px-4 py-2.5 pr-12
              border-2 rounded-xl
              bg-white dark:bg-slate-900
              border-slate-300 dark:border-slate-600
              placeholder-slate-400 dark:placeholder-slate-500
              text-slate-800 dark:text-slate-100
              font-medium
              focus:outline-none 
              focus:ring-4 
              focus:ring-indigo-100 dark:focus:ring-indigo-900/30
              focus:border-indigo-500 dark:focus:border-indigo-400
              hover:border-slate-400 dark:hover:border-slate-500
              transition-all duration-200
              ${className}
            `}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          
          <button
            type="button"
            className={`
              absolute inset-y-0 right-0 pr-4 
              flex items-center
              text-slate-500 dark:text-slate-400
              hover:text-indigo-600 dark:hover:text-indigo-400
              focus:outline-none
              transition-all duration-200
              active:scale-95
              ${showPassword ? 'text-indigo-600 dark:text-indigo-400' : ''}
            `}
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            <div className="relative">
              {/* Icon glow effect when active */}
              {showPassword && (
                <div className="absolute inset-0 bg-indigo-500 rounded-full blur-md opacity-20 animate-pulse" />
              )}
              
              {showPassword ? (
                // Eye closed icon
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 relative z-10 transition-transform duration-200 hover:scale-110" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.963 9.963 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" 
                    clipRule="evenodd" 
                  />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              ) : (
                // Eye open icon
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 relative z-10 transition-transform duration-200 hover:scale-110" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path 
                    fillRule="evenodd" 
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}