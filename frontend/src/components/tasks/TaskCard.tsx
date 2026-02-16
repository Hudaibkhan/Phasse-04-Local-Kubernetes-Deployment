'use client';

import React from 'react';
import { TaskDisplayItem } from '../../types/task.types';
import { Badge } from '../ui/Badge';
import Checkbox from '../forms/Checkbox';
import Button from '../forms/Button';
import { formatDate, isOverdue } from '../../utils/date-utils';

interface TaskCardProps {
  task: TaskDisplayItem;
  onToggle?: (id: string) => void;
  onEdit?: (task: TaskDisplayItem) => void;
  onDelete?: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete
}) => {
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/50 dark:to-rose-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'medium':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/50 dark:to-amber-900/50 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'low':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      default:
        return 'bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const dueDateClass = isOverdue(task.due_date || undefined, task.completed) 
    ? 'text-red-600 dark:text-red-400 font-bold' 
    : 'text-slate-600 dark:text-slate-400';

  return (
    <div className={`group p-4 sm:p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 ${
      task.completed 
        ? 'opacity-70 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600' 
        : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3 flex-grow min-w-0">
          <div className="flex-shrink-0 pt-0.5">
            <Checkbox
              id={`task-${task.id}`}
              checked={task.completed}
              onChange={() => onToggle && onToggle(task.id)}
            />
          </div>
          <div className="flex flex-col flex-grow min-w-0 gap-2">
            {/* Task title */}
            <h3 className={`text-base sm:text-lg font-semibold break-words ${
              task.completed
                ? 'line-through text-slate-500 dark:text-slate-500'
                : 'text-slate-800 dark:text-slate-100'
            }`}>
              {task.title}
            </h3>

            {/* Task description */}
            {task.description && (
              <p className={`text-sm break-words ${
                task.completed 
                  ? 'text-slate-400 dark:text-slate-500' 
                  : 'text-slate-600 dark:text-slate-300'
              }`}>
                {task.description}
              </p>
            )}

            {/* Task metadata */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Priority badge */}
              <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg border-2 capitalize ${getPriorityClass(task.priority || 'medium')}`}>
                {task.priority || 'medium'}
              </span>

              {/* Due date */}
              {task.due_date && (
                <div className="flex items-center gap-1.5">
                  <svg className={`w-3.5 h-3.5 flex-shrink-0 ${dueDateClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className={`text-xs font-medium ${dueDateClass}`}>
                    {formatDate(task.due_date)}
                  </span>
                </div>
              )}

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map((tag, index) => (
                    <span
                      key={`${task.id}-tag-${index}`}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Recurrence indicator */}
              {task.is_recurring && task.recurrence_pattern && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-800">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {task.recurrence_pattern.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex sm:flex-col lg:flex-row items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit && onEdit(task)}
            aria-label="Edit task"
            className="hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete && onDelete(task.id)}
            aria-label="Delete task"
            className="hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;