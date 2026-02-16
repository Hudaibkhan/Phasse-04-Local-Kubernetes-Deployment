// Define the Task interface with all the enhanced metadata fields
export interface Task {
  id: string; // UUID as string
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | null;
  due_date: string | null; // ISO date string
  tags: string[];
  recurrence_pattern: string | null;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  user_id: string; // UUID as string
}

// Define the form data interface for creating/updating tasks
export interface TaskFormData {
  id?: string; // Optional ID for editing tasks
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | null;
  due_date?: string | null; // ISO date string
  tags?: string[];
  recurrence_pattern?: string | null;
  completed?: boolean;
}