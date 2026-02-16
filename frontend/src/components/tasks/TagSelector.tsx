import { useState, useEffect } from 'react';
import { Badge } from '../ui/Badge';
import Input from '../forms/Input';
import Button from '../forms/Button';

interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tagNames: string[]) => void;
  availableTags: Tag[];
  onAddTag?: (tagName: string) => Promise<Tag>;
}

export const TagSelector = ({
  selectedTags,
  onTagsChange,
  availableTags,
  onAddTag
}: TagSelectorProps) => {
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedTagObjects = availableTags && Array.isArray(availableTags) ? availableTags.filter(tag => selectedTags.includes(tag.name)) : [];

  const handleAddTag = async () => {
    if (!inputValue.trim()) return;

    const existingTag = availableTags && Array.isArray(availableTags) ? availableTags.find(tag => tag.name.toLowerCase() === inputValue.trim().toLowerCase()) : null;
    if (existingTag) {
      if (!selectedTags.includes(existingTag.name)) {
        onTagsChange([...selectedTags, existingTag.name]);
      }
      setInputValue('');
      return;
    }

    if (onAddTag) {
      try {
        const newTag = await onAddTag(inputValue.trim());
        onTagsChange([...selectedTags, newTag.name]);
        setInputValue('');
      } catch (error) {
        console.error('Failed to create tag:', error);
      }
    } else {
      if (!selectedTags.includes(inputValue.trim())) {
        onTagsChange([...selectedTags, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagName: string) => {
    onTagsChange(selectedTags.filter(name => name !== tagName));
  };

  const filteredTags = availableTags && Array.isArray(availableTags) ? availableTags.filter(
    tag => !selectedTags.includes(tag.name) &&
           tag.name.toLowerCase().includes(inputValue.toLowerCase())
  ) : [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 min-h-[32px]">
        {selectedTags.length > 0 ? (
          selectedTags.map((tagName, index) => (
            <button
              key={`${tagName}-${index}`}
              type="button"
              onClick={() => handleRemoveTag(tagName)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 text-indigo-700 dark:text-indigo-300 border-2 border-indigo-200/50 dark:border-indigo-700/50 hover:from-indigo-200 hover:to-purple-200 dark:hover:from-indigo-800/50 dark:hover:to-purple-800/50 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 cursor-pointer active:scale-95"
            >
              {tagName}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ))
        ) : (
          <span className="text-sm text-slate-400 dark:text-slate-500 italic">
            No tags selected
          </span>
        )}
      </div>

      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Search or add tags..."
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddTag}
            disabled={!inputValue.trim()}
            size="md"
          >
            Add
          </Button>
        </div>

        {showDropdown && inputValue && filteredTags.length > 0 && (
          <div className="absolute z-10 mt-2 w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-auto custom-scrollbar">
            {filteredTags.map(tag => (
              <button
                type="button"
                key={tag.id}
                className={`w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer transition-colors duration-150 border-b border-slate-100 dark:border-slate-700/50 last:border-b-0 font-medium ${getTagColorClass(tag.color)}`}
                onClick={() => {
                  onTagsChange([...selectedTags, tag.name]);
                  setInputValue('');
                  setShowDropdown(false);
                }}
              >
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getTagDotColor(tag.color)}`}></span>
                  {tag.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

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

const getTagColorClass = (color: string) => {
  const colorClasses: Record<string, string> = {
    red: 'text-red-700 dark:text-red-400',
    blue: 'text-blue-700 dark:text-blue-400',
    green: 'text-green-700 dark:text-green-400',
    yellow: 'text-yellow-700 dark:text-yellow-400',
    purple: 'text-purple-700 dark:text-purple-400',
    gray: 'text-slate-700 dark:text-slate-400',
    pink: 'text-pink-700 dark:text-pink-400',
    indigo: 'text-indigo-700 dark:text-indigo-400',
  };

  return colorClasses[color] || colorClasses.gray;
};

const getTagDotColor = (color: string) => {
  const dotColors: Record<string, string> = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    gray: 'bg-slate-500',
    pink: 'bg-pink-500',
    indigo: 'bg-indigo-500',
  };

  return dotColors[color] || dotColors.gray;
};