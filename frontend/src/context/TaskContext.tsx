'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task } from '../types/task';
import { useAuth } from './AuthContext';
import { API_URL } from '../lib/api';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshTasks = async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${API_URL}/tasks/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const transformedTasks = Array.isArray(data?.tasks) ? data.tasks : data || [];

          // Normalize tasks to match our interface
          const normalizedTasks = transformedTasks.map((task: any) => ({
            id: task.id,
            title: task.title || '',
            description: task.description,
            completed: task.completed || false,
            priority: task.priority || null,
            due_date: task.due_date || null,
            tags: Array.isArray(task.tags) ? task.tags : [],
            recurrence_pattern: task.recurrence_pattern || null,
            created_at: task.created_at || new Date().toISOString(),
            updated_at: task.updated_at || new Date().toISOString(),
            user_id: task.user_id || user.id
          }));

          setTasks(normalizedTasks);
        } else {
          console.error('Failed to fetch tasks:', response.status);
        }
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      refreshTasks();
    } else if (!user) {
      setTasks([]);
      setLoading(false);
    }
  }, [user, authLoading]);

  return (
    <TaskContext.Provider value={{ tasks, loading, refreshTasks }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};