'use client';

import React from 'react';
import SearchInput from './SearchInput';
import PriorityFilter from './PriorityFilter';
import TagsFilter from './TagsFilter';
import { FilterState } from '../../types/task.types';

interface FilterControlsProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableTags: string[];
  className?: string;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFiltersChange,
  availableTags,
  className = ""
}) => {
  const handleSearchChange = (searchTerm: string) => {
    onFiltersChange({
      ...filters,
      searchTerm
    });
  };

  const handlePriorityChange = (selectedPriorities: ('high' | 'medium' | 'low')[]) => {
    onFiltersChange({
      ...filters,
      selectedPriorities
    });
  };

  const handleTagsChange = (selectedTags: string[]) => {
    onFiltersChange({
      ...filters,
      selectedTags
    });
  };

  return (
    <div className={`space-y-5 ${className}`}>
      <div>
        <SearchInput
          value={filters.searchTerm}
          onChange={handleSearchChange}
          placeholder="Search tasks by title or description..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PriorityFilter
          selectedPriorities={filters.selectedPriorities}
          onChange={handlePriorityChange}
        />

        <TagsFilter
          availableTags={availableTags}
          selectedTags={filters.selectedTags}
          onChange={handleTagsChange}
        />
      </div>
    </div>
  );
};

export default FilterControls;