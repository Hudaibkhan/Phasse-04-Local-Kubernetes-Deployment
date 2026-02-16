import { TaskFormData } from '../components/tasks/TaskForm';
import { API_URL } from './api';

// Define the Task type to match what the backend returns
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
}

export interface TaskApiService {
  getTasks: (token: string, skip?: number, limit?: number) => Promise<TaskListResponse>;
  getTask: (id: string, token: string) => Promise<Task>;
  createTask: (taskData: TaskFormData, token: string) => Promise<Task>;
  updateTask: (id: string, taskData: Partial<TaskFormData>, token: string) => Promise<Task>;
  deleteTask: (id: string, token: string) => Promise<{ message: string }>;
}

class TaskService implements TaskApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  async getTasks(token: string, skip: number = 0, limit: number = 100): Promise<TaskListResponse> {
    const response = await fetch(`${this.baseUrl}/tasks?skip=${skip}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getTask(id: string, token: string): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/tasks/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch task: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async createTask(taskData: TaskFormData, token: string): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async updateTask(id: string, taskData: Partial<TaskFormData>, token: string): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update task: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async deleteTask(id: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

export default new TaskService();