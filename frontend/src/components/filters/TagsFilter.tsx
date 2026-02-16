'use client';

import React from 'react';

interface TagsFilterProps {
  availableTags: string[];
  selectedTags: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

const TagsFilter: React.FC<TagsFilterProps> = ({
  availableTags,
  selectedTags,
  onChange,
  className = ""
}) => {
  const handleTagToggle = (tag: string) => {
    let newSelections: string[];

    if (selectedTags.includes(tag)) {
      newSelections = selectedTags.filter(t => t !== tag);
    } else {
      newSelections = [...selectedTags, tag];
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Tags
        </h3>
        {selectedTags.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors duration-200 underline underline-offset-2"
          >
            Clear all
          </button>
        )}
      </div>

      {availableTags.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 italic">No tags available</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagToggle(tag)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border-2 cursor-pointer transition-all duration-200 active:scale-95 ${
                selectedTags.includes(tag)
                  ? 'bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 shadow-md'
                  : 'bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:border-slate-400 dark:hover:border-slate-600'
              }`}
            >
              <span>{tag}</span>
              {selectedTags.includes(tag) && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgb(241 245 249 / 0.5);
          border-radius: 10px;
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: rgb(30 41 59 / 0.5);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgb(99 102 241), rgb(168 85 247));
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgb(79 70 229), rgb(147 51 234));
        }
      `}</style>
    </div>
  );
};

export default TagsFilter;