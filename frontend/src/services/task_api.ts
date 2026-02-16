import { Task, TaskFormData } from '../types/task';
import { API_URL } from '../lib/api';

interface GetTasksParams {
  completed?: boolean;
  priority?: string;
  due_before?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}

class TaskApi {
  /**
   * Create a new task with enhanced metadata
   */
  static async createTask(taskData: TaskFormData): Promise<Task> {
    try {
      const response = await fetch(`${API_URL}/tasks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in requests for auth
        body: JSON.stringify(taskData),
      });

      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({ detail: 'Authentication failed' }));
        throw new Error(`Authentication error: ${errorData.detail || 'Unauthorized'}`);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Get all tasks for the authenticated user with optional filtering
   */
  static async getTasks(params?: GetTasksParams): Promise<Task[]> {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const queryString = queryParams.toString();
      const url = `${API_URL}/tasks/${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in requests for auth
      });

      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({ detail: 'Authentication failed' }));
        throw new Error(`Authentication error: ${errorData.detail || 'Unauthorized'}`);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return Array.isArray(result.tasks) ? result.tasks : [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  /**
   * Get a specific task by ID
   */
  static async getTaskById(taskId: string): Promise<Task> {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in requests for auth
      });

      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({ detail: 'Authentication failed' }));
        throw new Error(`Authentication error: ${errorData.detail || 'Unauthorized'}`);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  /**
   * Update an existing task
   */
  static async updateTask(taskId: string, taskData: Partial<TaskFormData>): Promise<Task> {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in requests for auth
        body: JSON.stringify(taskData),
      });

      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({ detail: 'Authentication failed' }));
        throw new Error(`Authentication error: ${errorData.detail || 'Unauthorized'}`);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Toggle task completion status
   */
  static async toggleTaskCompletion(taskId: string, completed: boolean): Promise<Task> {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in requests for auth
        body: JSON.stringify({ completed }),
      });

      // Check for specific status codes that might indicate auth issues
      if (response.status === 401 || response.status === 403) {
        // Don't throw a generic error that might trigger logout
        const errorData = await response.json().catch(() => ({ detail: 'Authentication failed' }));
        throw new Error(`Authentication error: ${errorData.detail || 'Unauthorized'}`);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error toggling task completion:', error);
      // Re-throw to let caller handle appropriately
      throw error;
    }
  }

  /**
   * Delete a task
   */
  static async deleteTask(taskId: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in requests for auth
      });

      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({ detail: 'Authentication failed' }));
        throw new Error(`Authentication error: ${errorData.detail || 'Unauthorized'}`);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
}

export { TaskApi };