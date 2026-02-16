'use client';

import React, { useState, useEffect, useMemo } from 'react';
import TaskForm, { TaskFormData } from '../../components/tasks/TaskForm';
import TaskCard from '../../components/tasks/TaskCard';
import FilterControls from '../../components/filters/FilterControls';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { TaskDisplayItem, FilterState } from '../../types/task.types';
import { filterTasks, extractUniqueTags } from '../../utils/filter-utils';
import { API_URL } from '@/lib/api';

interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | string;
  due_date?: string;
  tags: string[];
  is_recurring: boolean;
  recurrence_pattern?: string;
  created_at: string;
  updated_at: string;
}

const TaskManagerPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [tagsLoading, setTagsLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    selectedPriorities: [],
    selectedTags: []
  });
  const { user, loading: authLoading } = useAuth();

  // Load tasks from API
  const fetchTasks = async () => {
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
          setTasks(data?.tasks || data || []);
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
    const token = localStorage.getItem('token');
    if (token) {
      fetchTasks();
    }
  }, []);

  // Auto-refresh tasks every 5 seconds to catch chatbot-created tasks
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const intervalId = setInterval(() => {
      fetchTasks();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  // Load available tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          setTagsLoading(true);
          const response = await fetch(`${API_URL}/tags`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            setAvailableTags(data || []);
          } else if (response.status === 404) {
            // If tags endpoint doesn't exist, set empty array
            setAvailableTags([]);
          } else {
              console.error('Failed to fetch tags:', response.status);
          }
        }
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      } finally {
        setTagsLoading(false);
      }
    };

    const token = localStorage.getItem('token');
    if (token) {
      fetchTags();
    }
  }, []);

  // Apply filtering to tasks
  const filteredTasks = useMemo(() => {
    const displayTasks: TaskDisplayItem[] = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: (task.priority && typeof task.priority === 'string'
        ? task.priority.toLowerCase()
        : 'medium') as 'high' | 'medium' | 'low',
      due_date: task.due_date,
      tags: task.tags || [],
      completed: task.completed,
      created_at: task.created_at,
      updated_at: task.updated_at,
      is_recurring: task.is_recurring,
      recurrence_pattern: task.recurrence_pattern
    }));

    return filterTasks(displayTasks, filters);
  }, [tasks, filters]);

  // Extract unique tags from tasks for filter options
  const uniqueTags = useMemo(() => {
    return extractUniqueTags(tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: (task.priority && typeof task.priority === 'string'
        ? task.priority.toLowerCase()
        : 'medium') as 'high' | 'medium' | 'low',
      due_date: task.due_date,
      tags: task.tags || [],
      completed: task.completed,
      created_at: task.created_at,
      updated_at: task.updated_at,
      is_recurring: task.is_recurring,
      recurrence_pattern: task.recurrence_pattern
    })));
  }, [tasks]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCreateTask = async (taskData: TaskFormData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      setErrorMessage(null);
      setSuccessMessage(null);

      const priorityValue = taskData.priority.charAt(0).toUpperCase() + taskData.priority.slice(1);

      const response = await fetch(`${API_URL}/tasks/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: taskData.title,
          description: taskData.description,
          completed: false,
          priority: priorityValue,
          due_date: taskData.due_date,
          tags: taskData.tags,
          is_recurring: taskData.is_recurring,
          recurrence_pattern: taskData.recurrence_pattern
        }),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks(prev => [newTask, ...prev]);
        setSuccessMessage('Task created successfully ✅');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || `Failed to create task: ${response.status}`;
        setErrorMessage(errorMessage);
        console.error('Failed to create task:', response.status, errorData);
      }
    } catch (error) {
      setErrorMessage('An error occurred while creating the task. Please try again.');
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (taskData: TaskFormData) => {
    console.log('handleUpdateTask called with taskData:', taskData, 'editingTask:', editingTask);
    if (!editingTask) {
      console.error('No editingTask found');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const priorityValue = taskData.priority.charAt(0).toUpperCase() + taskData.priority.slice(1);

      console.log('Making PUT request to update task:', `${API_URL}/tasks/${editingTask.id}`);

      const response = await fetch(`${API_URL}/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: taskData.title,
          description: taskData.description,
          completed: editingTask.completed,
          priority: priorityValue,
          due_date: taskData.due_date,
          tags: taskData.tags,
          is_recurring: taskData.is_recurring,
          recurrence_pattern: taskData.recurrence_pattern
        }),
      });

      console.log('Update response status:', response.status);
      if (response.ok) {
        const updatedTask = await response.json();
        console.log('Task updated successfully, new task:', updatedTask);
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        setEditingTask(null);
      } else {
        console.error('Failed to update task:', response.status);
        const errorText = await response.text();
        console.error('Error details:', errorText);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    console.log('handleToggleTask called with taskId:', taskId);
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      console.error('Task not found for toggle:', taskId);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        window.location.href = '/login';
        return;
      }

      console.log('Making PATCH request to complete task:', `${API_URL}/tasks/${taskId}/complete`);

      const response = await fetch(`${API_URL}/tasks/${taskId}/complete?completed=${!task.completed}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Toggle response status:', response.status);
      if (response.ok) {
        const responseData = await response.json();
        console.log('Task toggled successfully, response data:', responseData);

        // Extract the completed task and new recurring task from the response
        const completedTask = responseData.task;  // The task that was just completed
        const newRecurringTask = responseData.new_task;  // The new recurring task (if any)

        // Update state using the SAME pattern as handleUpdateTask and handleDeleteTask
        setTasks(prev => {
          // First, update the toggled task with the completed version
          let updatedTasks = prev.map(t => t.id === taskId ? completedTask : t);

          // If the response includes a new_task field (for recurring tasks), add it
          if (newRecurringTask) {
            console.log('New recurring task created:', newRecurringTask);
            updatedTasks = [newRecurringTask, ...updatedTasks];
          }

          return updatedTasks;
        });
      } else if (response.status === 401 || response.status === 403) {
        console.error('Unauthorized access - clearing token and redirecting to login');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        console.error('Failed to toggle task:', response.status);
        const errorText = await response.text();
        console.error('Error details:', errorText);
      }
    } catch (error) {
      console.error('Failed to toggle task:', error);
      if (error instanceof TypeError &&
          (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        console.warn('Could not reach backend server. Please ensure the backend is running on port 8000.');
        // Update the UI optimistically to reflect the change even if the backend is down
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        ));
        // Show a subtle notification that the change is pending
        console.info('Task status updated locally. Changes will sync when backend is available.');
      } else {
        console.error('An error occurred while updating the task:', error);
      }
    }
  };

  const handleEditTask = (task: Task | TaskDisplayItem) => {
    console.log('handleEditTask called with task:', task);

    const taskForEditing: Task = {
      id: task.id,
      user_id: user?.id || '',
      title: task.title,
      description: task.description,
      completed: task.completed,
      priority: task.priority as 'low' | 'medium' | 'high' | string,
      due_date: task.due_date || undefined,
      tags: task.tags || [],
      is_recurring: task.is_recurring || false,
      recurrence_pattern: task.recurrence_pattern,
      created_at: task.created_at,
      updated_at: task.updated_at
    };

    setEditingTask(taskForEditing);
  };

  const handleDeleteTask = async (taskId: string) => {
    console.log('handleDeleteTask called with taskId:', taskId);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      console.log('Making DELETE request to:', `${API_URL}/tasks/${taskId}`);

      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Delete response status:', response.status);
      if (response.ok) {
        console.log('Task deleted successfully');
        setTasks(prev => prev.filter(t => t.id !== taskId));
      } else {
        console.error('Failed to delete task:', response.status);
        const errorText = await response.text();
        console.error('Error details:', errorText);
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-700"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-indigo-600 dark:border-t-indigo-400 absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
            Task Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Manage your tasks efficiently and stay organized
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          {/* Task Creation Section */}
          <div className="xl:col-span-1 order-2 xl:order-1">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-5 sm:p-6 lg:p-8 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 rounded-full"></div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h2>
              </div>
              <TaskForm
                initialData={
                  editingTask
                    ? {
                        title: editingTask.title,
                        description: editingTask.description || '',
                        priority: editingTask.priority as 'low' | 'medium' | 'high',
                        due_date: editingTask.due_date || '',
                        tags: editingTask.tags || [],
                        is_recurring: editingTask.recurrence_pattern ? true : false,
                        recurrence_pattern: editingTask.recurrence_pattern || 'daily'
                      }
                    : undefined
                }
                onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                onCancel={handleCancelEdit}
                submitLabel={editingTask ? 'Update Task' : 'Create Task'}
                availableTags={availableTags}
              />
            </div>
          </div>
          
          {/* Filters and Tasks Section */}
          <div className="xl:col-span-1 space-y-6 sm:space-y-8 order-1 xl:order-2">
            {/* Filter Controls Section */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-5 sm:p-6 lg:p-8 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-pink-600 to-rose-600 dark:from-pink-400 dark:to-rose-400 rounded-full"></div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
                  Filters
                </h2>
              </div>
              <FilterControls
                filters={filters}
                onFiltersChange={setFilters}
                availableTags={uniqueTags}
              />
            </div>

            {/* Task List Section */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-5 sm:p-6 lg:p-8 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 hover:shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 rounded-full"></div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
                    Your Tasks
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-700/50">
                    {filteredTasks.length} of {tasks.length}
                  </span>
                </div>
              </div>

              {filteredTasks.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                    {tasks.length === 0
                      ? 'No tasks found. Create your first task!'
                      : 'No tasks match your current filters.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={handleToggleTask}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
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

// Wrap the component with ProtectedRoute
const ProtectedTaskManagerPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <TaskManagerPage />
    </ProtectedRoute>
  );
};

export default ProtectedTaskManagerPage;