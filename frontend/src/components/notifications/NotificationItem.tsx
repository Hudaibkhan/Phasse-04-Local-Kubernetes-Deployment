import React from 'react';
import { Notification } from '../../types/notification';
import { SimpleNotification } from '../../utils/simple-notifications';

interface NotificationItemProps {
  notification: SimpleNotification;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onDelete }) => {
  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'due_today':
        return {
          border: 'border-l-blue-500 dark:border-l-blue-400',
          bg: 'bg-blue-50/50 dark:bg-blue-900/10',
          iconBg: 'bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50',
          iconColor: 'text-blue-600 dark:text-blue-400'
        };
      case 'overdue':
        return {
          border: 'border-l-red-500 dark:border-l-red-400',
          bg: 'bg-red-50/50 dark:bg-red-900/10',
          iconBg: 'bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/50 dark:to-rose-900/50',
          iconColor: 'text-red-600 dark:text-red-400'
        };
      case 'upcoming_due_date':
        return {
          border: 'border-l-yellow-500 dark:border-l-yellow-400',
          bg: 'bg-yellow-50/50 dark:bg-yellow-900/10',
          iconBg: 'bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/50 dark:to-amber-900/50',
          iconColor: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'recurring_reminder':
        return {
          border: 'border-l-purple-500 dark:border-l-purple-400',
          bg: 'bg-purple-50/50 dark:bg-purple-900/10',
          iconBg: 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50',
          iconColor: 'text-purple-600 dark:text-purple-400'
        };
      default:
        return {
          border: 'border-l-slate-500 dark:border-l-slate-400',
          bg: 'bg-slate-50/50 dark:bg-slate-900/10',
          iconBg: 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700',
          iconColor: 'text-slate-600 dark:text-slate-400'
        };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'due_today':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'overdue':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'upcoming_due_date':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'recurring_reminder':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };

  const style = getTypeStyle(notification.type);
// console.log('Notification type:', notification.type, 'Style:', style);
  return (
    <div
      className={`group border-l-4 ${style.border} ${style.bg} p-4 sm:p-5 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-700/30 transition-all duration-200 active:scale-[0.99]`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${style.iconBg} flex items-center justify-center ${style.iconColor} transition-transform duration-200 group-hover:scale-110`}>
          {getTypeIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-grow min-w-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 break-words">
              {notification.taskTitle}
            </h3>
            {notification.dueDate && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                  {new Date(notification.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 break-words">
            {notification.message}
          </p>
        </div>

        {/* Trash icon appears on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
          aria-label="Delete notification"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;