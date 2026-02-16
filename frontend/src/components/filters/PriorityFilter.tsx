'use client';

import React, { useState } from 'react';
import { Badge } from '../ui/Badge';

type PriorityOption = 'high' | 'medium' | 'low';

interface PriorityFilterProps {
  selectedPriorities: PriorityOption[];
  onChange: (selected: PriorityOption[]) => void;
  className?: string;
}

const PriorityFilter: React.FC<PriorityFilterProps> = ({
  selectedPriorities,
  onChange,
  className = ""
}) => {
  const priorityOptions: PriorityOption[] = ['high', 'medium', 'low'];

  const getPriorityLabel = (priority: PriorityOption) => {
    switch (priority) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return priority;
    }
  };

  const getPriorityClass = (priority: PriorityOption) => {
    const baseClass = "cursor-pointer transition-all duration-200 active:scale-95";
    if (selectedPriorities.includes(priority)) {
      switch (priority) {
        case 'high':
          return `${baseClass} bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/50 dark:to-rose-900/50 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 shadow-md`;
        case 'medium':
          return `${baseClass} bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/50 dark:to-amber-900/50 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700 shadow-md`;
        case 'low':
          return `${baseClass} bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 shadow-md`;
        default:
          return baseClass;
      }
    } else {
      return `${baseClass} bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:border-slate-400 dark:hover:border-slate-600`;
    }
  };

  const handlePriorityToggle = (priority: PriorityOption) => {
    let newSelections: PriorityOption[];

    if (selectedPriorities.includes(priority)) {
      newSelections = selectedPriorities.filter(p => p !== priority);
    } else {
      newSelections = [...selectedPriorities, priority];
    }

    onChange(newSelections);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className={`p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
          </svg>
          Priority
        </h3>
        {selectedPriorities.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors duration-200 underline underline-offset-2"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {priorityOptions.map((priority) => (
          <button
            key={priority}
            type="button"
            onClick={() => handlePriorityToggle(priority)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border-2 ${getPriorityClass(priority)}`}
          >
            <span>{getPriorityLabel(priority)}</span>
            {selectedPriorities.includes(priority) && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PriorityFilter;