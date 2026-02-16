import { TaskDisplayItem } from '../types/task.types';

/**
 * Client-side filtering function that applies all active filters to task list
 * @param tasks - Array of tasks to filter
 * @param filters - Filter state containing search term, selected priorities, and selected tags
 * @returns Filtered array of tasks that match all active filters
 */
export function filterTasks(tasks: TaskDisplayItem[], filters: {
  searchTerm: string;
  selectedPriorities: ('high' | 'medium' | 'low')[];
  selectedTags: string[];
}): TaskDisplayItem[] {
  return tasks.filter(task => {
    // Apply search filter
    const matchesSearch = !filters.searchTerm ||
      task.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      false;

    // Apply priority filter
    const matchesPriority = filters.selectedPriorities.length === 0 ||
      filters.selectedPriorities.includes(task.priority);

    // Apply tags filter
    const matchesTags = filters.selectedTags.length === 0 ||
      filters.selectedTags.some(tag => task.tags.includes(tag));

    return matchesSearch && matchesPriority && matchesTags;
  });
}

/**
 * Extracts all unique tags from a list of tasks
 * @param tasks - Array of tasks to extract tags from
 * @returns Array of unique tag strings
 */
export function extractUniqueTags(tasks: TaskDisplayItem[]): string[] {
  const tagSet = new Set<string>();
  tasks.forEach(task => {
    task.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet);
}