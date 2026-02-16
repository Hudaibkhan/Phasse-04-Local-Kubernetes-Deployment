import React, { useState } from 'react';
import { Notification } from '../../types/notification';
import { SimpleNotification } from '../../utils/simple-notifications';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  notifications: SimpleNotification[];
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onDelete,
  onDeleteAll
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'due_today' | 'overdue' | 'upcoming_due_date' | 'recurring_reminder'>('all');

  // Apply filter to notifications
  const filteredNotifications = selectedFilter === 'all'
    ? notifications
    : notifications.filter(notification => notification.type === selectedFilter);

  // Group notifications by type
  const groupedNotifications: Record<string, SimpleNotification[]> = {};
  filteredNotifications.forEach(notification => {
    if (!groupedNotifications[notification.type]) {
      groupedNotifications[notification.type] = [];
    }
    groupedNotifications[notification.type].push(notification);
  });

  // Get type label and count for header
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'due_today':
        return 'Due Today';
      case 'overdue':
        return 'Overdue';
      case 'upcoming_due_date':
        return 'Due Soon';
      case 'recurring_reminder':
        return 'Recurring';
      default:
        return type;
    }
  };

  // Get type style for header
  const getTypeHeaderStyle = (type: string) => {
    switch (type) {
      case 'due_today':
        return 'bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700';
      case 'overdue':
        return 'bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-700 dark:to-rose-700';
      case 'upcoming_due_date':
        return 'bg-gradient-to-r from-yellow-600 to-amber-600 dark:from-yellow-700 dark:to-amber-700';
      case 'recurring_reminder':
        return 'bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700';
      default:
        return 'bg-gradient-to-r from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800';
    }
  };

  // Determine if there are no notifications after filtering
  const hasNoNotifications = notifications.length === 0;
  const hasNoFilteredNotifications = filteredNotifications.length === 0 && notifications.length > 0;

  if (hasNoNotifications) {
    return (
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 sm:p-12 rounded-2xl shadow-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-center">
        <div className="mx-auto w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
          <svg className="w-10 h-10 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          No notifications
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          You&aposs all caught up! No recent alerts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar - Always visible */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl shadow-xl border-2 border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                selectedFilter === 'all'
                  ? 'border-indigo-500 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 text-indigo-700 dark:text-indigo-300 shadow-lg'
                  : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedFilter('due_today')}
              className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                selectedFilter === 'due_today'
                  ? 'border-blue-500 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 text-blue-700 dark:text-blue-300 shadow-lg'
                  : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Due Today
            </button>
            <button
              onClick={() => setSelectedFilter('overdue')}
              className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                selectedFilter === 'overdue'
                  ? 'border-red-500 bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/50 dark:to-rose-900/50 text-red-700 dark:text-red-300 shadow-lg'
                  : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Overdue
            </button>
            <button
              onClick={() => setSelectedFilter('upcoming_due_date')}
              className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                selectedFilter === 'upcoming_due_date'
                  ? 'border-yellow-500 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/50 dark:to-amber-900/50 text-yellow-700 dark:text-yellow-300 shadow-lg'
                  : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Due Soon
            </button>
            <button
              onClick={() => setSelectedFilter('recurring_reminder')}
              className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                selectedFilter === 'recurring_reminder'
                  ? 'border-purple-500 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-700 dark:text-purple-300 shadow-lg'
                  : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Recurring
            </button>
          </div>

          {/* Clear All button */}
          <button
            onClick={onDeleteAll}
            className="px-4 py-2 rounded-lg border-2 text-sm font-semibold border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 active:scale-95"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
        {hasNoFilteredNotifications ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
              No notifications found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              There are no {selectedFilter.replace('_', ' ')} notifications.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {Object.entries(groupedNotifications).map(([type, groupNotifications]) => (
              <div key={type} className="overflow-hidden">
                {/* Group header with type and count */}
                <div className={`${getTypeHeaderStyle(type)} px-5 sm:px-6 py-3 text-white`}>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    {getTypeLabel(type)}
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold">
                      {groupNotifications.length}
                    </span>
                  </h2>
                </div>

                {/* Group notifications */}
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {groupNotifications.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;