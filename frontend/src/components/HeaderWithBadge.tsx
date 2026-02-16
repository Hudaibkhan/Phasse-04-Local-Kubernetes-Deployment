import React from 'react';
import { calculateNotificationCount } from '../utils/notification-calculator';
import { Task } from '../types/task';

interface HeaderWithBadgeProps {
  tasks: Task[];
  onNotificationClick?: () => void;
}

const HeaderWithBadge: React.FC<HeaderWithBadgeProps> = ({ tasks, onNotificationClick }) => {
  const notificationCount = calculateNotificationCount(tasks);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">Evolution Todo</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notification icon with badge */}
            <button
              onClick={onNotificationClick}
              className="relative p-2 text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderWithBadge;