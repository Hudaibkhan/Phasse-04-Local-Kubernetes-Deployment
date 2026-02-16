'use client';

import React, { useState, useEffect } from 'react';
import Input from '../forms/Input';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search tasks...",
  className = ""
}) => {
  const [inputValue, setInputValue] = useState(value);

  // Sync internal state with prop value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle input change with debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(inputValue);
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-11 pr-11"
      />
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 rounded-full p-0.5"
          aria-label="Clear search"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchInput;