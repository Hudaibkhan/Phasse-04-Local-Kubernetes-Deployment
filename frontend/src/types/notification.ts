/**
 * Notification interface based on the data model specification
 */
export interface Notification {
  id: string;
  userId: string;
  taskId: string | null;
  type: 'due_today' | 'overdue' | 'upcoming_due_date' | 'recurring_reminder';
  title: string;
  message: string;
  dueDate: string | null; // ISO date string
  createdAt: string; // ISO date string
}

/**
 * Task interface aligned with existing task structure
 * Using the structure from frontend/src/types/task.ts
 */
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