// Type definition for task display item based on research findings
export interface TaskDisplayItem {
  id: string;              // unique identifier
  title: string;           // required task title
  description?: string;    // optional task description
  priority: 'high' | 'medium' | 'low'; // priority level for badge display
  due_date?: string | null; // due date in ISO format or null if not set
  tags: string[];          // array of tag strings to display as chips
  completed: boolean;      // boolean indicating completion status
  created_at: string;      // timestamp
  updated_at: string;      // timestamp
  is_recurring?: boolean;  // indicates if task is recurring
  recurrence_pattern?: string; // pattern of recurrence (e.g., daily, weekly)
}

// Type definition for filter state
export interface FilterState {
  searchTerm: string;                           // text to search for in title and description (case-insensitive)
  selectedPriorities: ('high' | 'medium' | 'low')[]; // array of selected priority levels to show
  selectedTags: string[];                       // array of tag values to filter by
}