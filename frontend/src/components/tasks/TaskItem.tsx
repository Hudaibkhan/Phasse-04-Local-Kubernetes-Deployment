import React from 'react';
import Checkbox from '../forms/Checkbox';
import Button from '../forms/Button';
import { Badge } from '../ui/Badge';

interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  tags?: (Tag | string)[];
  is_recurring?: boolean;
  recurrence_pattern?: string;
}

interface TaskItemProps {
  task?: Task;
  id?: string;
  title?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  tags?: (Tag | string)[];
  is_recurring?: boolean;
  recurrence_pattern?: string;
  onToggle?: (id: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  id: propId,
  title: propTitle,
  completed: propCompleted,
  priority: propPriority,
  due_date: propDueDate,
  tags: propTags,
  is_recurring: propIsRecurring,
  recurrence_pattern: propRecurrencePattern,
  onToggle,
  onEdit,
  onDelete
}) => {
  const taskId = task?.id || propId || '';
  const taskTitle = task?.title || propTitle || '';
  const taskCompleted = task?.completed ?? propCompleted ?? false;
  const taskPriority = task?.priority || propPriority || 'medium';
  const taskDueDate = task?.due_date || propDueDate;
  const taskTags = task?.tags || propTags || [];
  const taskIsRecurring = task?.is_recurring ?? propIsRecurring ?? false;
  const taskRecurrencePattern = task?.recurrence_pattern || propRecurrencePattern;
  
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

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const isOverdue = (dateString?: string, taskCompleted: boolean = false): boolean => {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    const now = new Date();
    return !taskCompleted && dueDate < now;
  };

  const dueDateClass = isOverdue(taskDueDate, taskCompleted) 
    ? 'text-red-600 dark:text-red-400 font-bold' 
    : 'text-slate-600 dark:text-slate-400';

  const getTagColorClass = (color: string) => {
    const colorClasses: Record<string, string> = {
      red: 'border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30',
      blue: 'border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30',
      green: 'border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30',
      yellow: 'border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/30',
      purple: 'border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30',
      gray: 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/30',
      pink: 'border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-900/30',
      indigo: 'border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30',
    };

    return colorClasses[color] || colorClasses.gray;
  };

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-md hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300">
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-grow min-w-0">
        <div className="flex-shrink-0 pt-1 sm:pt-0">
          <Checkbox
            id={`task-${taskId}`}
            checked={taskCompleted}
            onChange={() => {
              console.log('Checkbox onChange fired, onToggle function exists:', !!onToggle, 'taskId:', taskId);
              onToggle && onToggle(taskId);
            }}
          />
        </div>
        <div className="flex flex-col flex-grow min-w-0 gap-2">
          <span className={`text-base sm:text-lg font-semibold break-words ${taskCompleted ? 'line-through text-slate-500 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
            {taskTitle}
          </span>
          
          {taskDueDate && (
            <div className="flex items-center gap-1.5">
              <svg className={`w-4 h-4 flex-shrink-0 ${dueDateClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className={`text-xs sm:text-sm font-medium ${dueDateClass}`}>
                {formatDate(taskDueDate)}
              </span>
            </div>
          )}
          
          {taskTags && taskTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {taskTags.map((tag, index) => {
                if (typeof tag === 'string') {
                  return (
                    <span key={`${taskId}-tag-${index}`} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/30">
                      {tag}
                    </span>
                  );
                } else {
                  return (
                    <span key={(tag as any).id} className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border-2 ${getTagColorClass((tag as any).color)}`}>
                      {(tag as any).name}
                    </span>
                  );
                }
              })}
            </div>
          )}
          
          {taskIsRecurring && taskRecurrencePattern && (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-800">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {taskRecurrencePattern.replace(/_/g, ' ')}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-row sm:flex-col lg:flex-row items-center gap-2 sm:gap-3 flex-shrink-0">
        <span className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 capitalize whitespace-nowrap ${getPriorityClass(taskPriority)}`}>
          {taskPriority}
        </span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log('Edit button clicked, onEdit function exists:', !!onEdit, 'task:', task);
              onEdit && onEdit({
                id: taskId,
                title: taskTitle,
                completed: taskCompleted,
                priority: taskPriority,
                due_date: taskDueDate,
                tags: taskTags,
                is_recurring: taskIsRecurring,
                recurrence_pattern: taskRecurrencePattern
              } as Task);
            }}
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
            onClick={() => {
              console.log('Delete button clicked, onDelete function exists:', !!onDelete, 'taskId:', taskId);
              onDelete && onDelete(taskId);
            }}
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

export default TaskItem;