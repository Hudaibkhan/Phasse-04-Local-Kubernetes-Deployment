import React, { useState, useEffect, useMemo } from 'react';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import { Task, TaskFormData } from '../types/task';
import { TaskApi } from '../services/task_api';

interface DashboardProps {
  userId: string; // User ID for filtering tasks
}

const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'priority' | 'due_date'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');

  // Load tasks when component mounts or filters change
  useEffect(() => {
    loadTasks();
  }, [filter, sortBy, sortOrder, priorityFilter, tagFilter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const allTasks = await TaskApi.getTasks({
        completed: filter === 'active' ? false : filter === 'completed' ? true : undefined,
        priority: priorityFilter === 'all' ? undefined : priorityFilter,
        limit: 50,
        offset: 0
      });
      setTasks(allTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: TaskFormData) => {
    try {
      const newTask = await TaskApi.createTask(taskData);
      setTasks([...tasks, newTask]);
      setShowForm(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      setError(errorMessage);

      // Don't automatically redirect on auth errors in this context
      if (errorMessage.includes('Authentication')) {
        console.warn('Authentication error during task creation:', errorMessage);
      }
    }
  };

  const handleUpdateTask = async (taskData: TaskFormData) => {
    if (!editingTask) return;

    try {
      const updatedTask = await TaskApi.updateTask(editingTask.id, taskData);
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      setEditingTask(null);
      setShowForm(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);

      // Don't automatically redirect on auth errors in this context
      if (errorMessage.includes('Authentication')) {
        console.warn('Authentication error during task update:', errorMessage);
      }
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    try {
      // Find the task to get its current completed status
      const taskToToggle = tasks.find(t => t.id === taskId);
      if (!taskToToggle) return;

      // Toggle the completed status
      const newCompletedStatus = !taskToToggle.completed;

      // Use the toggleTaskCompletion API which is designed for this purpose
      const updatedTask = await TaskApi.toggleTaskCompletion(taskId, newCompletedStatus);
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));

      // Clear any previous error on successful completion
      if (error?.includes('Authentication')) {
        setError(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);

      // If it's an authentication error, we might need special handling
      // But we shouldn't automatically redirect or logout here
      if (errorMessage.includes('Authentication')) {
        console.warn('Authentication error during task completion:', errorMessage);
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await TaskApi.deleteTask(taskId);
        setTasks(tasks.filter(t => t.id !== taskId));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
        setError(errorMessage);

        // Don't automatically redirect on auth errors in this context
        if (errorMessage.includes('Authentication')) {
          console.warn('Authentication error during task deletion:', errorMessage);
        }
      }
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFormSubmit = (taskData: TaskFormData) => {
    if (editingTask) {
      handleUpdateTask(taskData);
    } else {
      handleCreateTask(taskData);
    }
  };

  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter(task => {
        // Apply completion filter
        if (filter === 'active' && task.completed) return false;
        if (filter === 'completed' && !task.completed) return false;

        // Apply priority filter
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

        // Apply tag filter
        if (tagFilter !== 'all' && (!task.tags || !task.tags.includes(tagFilter))) return false;

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'priority':
            // Map priority to numeric value for sorting (high = 3, medium = 2, low = 1)
            const priorityValues: Record<string, number> = { 'high': 3, 'medium': 2, 'low': 1 };
            const aPriorityValue = priorityValues[a.priority || 'medium'] || 0;
            const bPriorityValue = priorityValues[b.priority || 'medium'] || 0;
            comparison = aPriorityValue - bPriorityValue;
            break;
          case 'due_date':
            if (!a.due_date && !b.due_date) comparison = 0;
            else if (!a.due_date) comparison = 1;
            else if (!b.due_date) comparison = -1;
            else comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
            break;
          case 'created_at':
          default:
            comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            break;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [tasks, filter, priorityFilter, tagFilter, sortBy, sortOrder]);

  // Get unique tags for filter dropdown
  const allTags = useMemo(() => {
    return Array.from(
      new Set(tasks.flatMap(task => task.tags || []))
    );
  }, [tasks]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Task Dashboard</h1>
        <button
          onClick={() => {
            setEditingTask(null);
            setShowForm(!showForm);
          }}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : 'Add New Task'}
        </button>
      </div>

      {showForm && (
        <div className="task-form-container">
          <TaskForm
            task={editingTask ? {
              title: editingTask.title,
              description: editingTask.description || '',
              priority: editingTask.priority || 'medium',
              due_date: editingTask.due_date || '',
              tags: editingTask.tags || [],
              recurrence_pattern: editingTask.recurrence_pattern || null,
              completed: editingTask.completed || false,
            } : undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingTask(null);
            }}
          />
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="dashboard-controls">
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="filter-status">Status:</label>
            <select
              id="filter-status"
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed')}
            >
              <option value="all">All Tasks</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-priority">Priority:</label>
            <select
              id="filter-priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-tag">Tag:</label>
            <select
              id="filter-tag"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
            >
              <option value="all">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>#{tag}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="sorting">
          <div className="sort-group">
            <label htmlFor="sort-by">Sort by:</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'created_at' | 'priority' | 'due_date')}
            >
              <option value="created_at">Date Created</option>
              <option value="priority">Priority</option>
              <option value="due_date">Due Date</option>
            </select>
          </div>

          <div className="sort-group">
            <label htmlFor="sort-order">Order:</label>
            <select
              id="sort-order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : (
        <div className="tasks-list">
          {filteredAndSortedTasks.length > 0 ? (
            filteredAndSortedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggleComplete}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))
          ) : (
            <div className="no-tasks">
              {tasks.length === 0
                ? 'No tasks yet. Create your first task!'
                : 'No tasks match the current filters.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;