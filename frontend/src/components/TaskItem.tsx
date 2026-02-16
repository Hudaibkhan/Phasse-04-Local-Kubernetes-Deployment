import React from 'react';
import { Task } from '../types/task';

interface TaskItemProps {
  task: Task;
  onToggle?: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onEdit, onDelete }) => {
  // Format due date if it exists
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Determine if task is overdue
  const isOverdue = task.due_date ? new Date(task.due_date) < new Date() && !task.completed : false;

  // Determine priority class for styling
  const getPriorityClass = (priority: string | null) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-none';
    }
  };

  // Determine due date class for styling
  const getDueDateClass = () => {
    if (!task.due_date) return '';
    if (isOverdue) return 'due-date-overdue';
    // Add class for due soon if within 1 day
    const oneDay = 24 * 60 * 60 * 1000;
    const daysDiff = Math.round(Math.abs((new Date().getTime() - new Date(task.due_date).getTime()) / oneDay));
    if (daysDiff <= 1 && !task.completed) return 'due-date-soon';
    return 'due-date-normal';
  };

  return (
    <div className={`task-item ${task.completed ? 'task-completed' : ''}`}>
      <div className="task-header">
        <div className="task-checkbox">
          <input
            type="checkbox"
            id={`task-${task.id}`}
            checked={task.completed}
            onChange={(e) => onToggle && onToggle(task.id)}
          />
          <label htmlFor={`task-${task.id}`}></label>
        </div>

        <div className="task-content">
          <h3 className={`task-title ${task.completed ? 'completed-text' : ''}`}>
            {task.title}
          </h3>

          {task.description && (
            <p className={`task-description ${task.completed ? 'completed-text' : ''}`}>
              {task.description}
            </p>
          )}
        </div>
      </div>

      <div className="task-metadata">
        {task.priority && (
          <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        )}

        {task.due_date && (
          <span className={`due-date-badge ${getDueDateClass()}`}>
            Due: {formatDate(task.due_date)}
          </span>
        )}

        {task.recurrence_pattern && (
          <span className="recurrence-badge">
            🔁 {task.recurrence_pattern.charAt(0).toUpperCase() + task.recurrence_pattern.slice(1)}
          </span>
        )}

        {task.tags && task.tags.length > 0 && (
          <div className="task-tags">
            {task.tags.map((tag, index) => (
              <span key={index} className="tag-badge">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="task-actions">
        <button
          onClick={() => onEdit(task)}
          className="btn btn-small btn-secondary"
          aria-label="Edit task"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="btn btn-small btn-danger"
          aria-label="Delete task"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskItem;