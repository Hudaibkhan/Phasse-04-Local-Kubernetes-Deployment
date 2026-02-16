# Quickstart Guide: Notification System Implementation

## Overview
This guide provides the essential steps to implement the frontend-only notification system that calculates and displays task-related notifications without backend changes.

## Prerequisites
- Understanding of the existing task data structure
- Access to current authentication mechanism
- Knowledge of existing UI framework and components
- Familiarity with the current routing setup

## Step 1: Set Up Notification Calculation Utilities

Create `frontend/src/utils/notification-calculator.ts`:

```typescript
import { Task } from '../types/task'; // Adjust import based on actual task type

export interface Notification {
  id: string;
  type: 'upcoming_due_date' | 'due_today' | 'overdue' | 'recurring_reminder';
  taskTitle: string;
  message: string;
  dueDate?: Date;
  taskId: string;
  createdAt: Date;
  isRead: boolean;
}

export const calculateNotifications = (tasks: Task[]): Notification[] => {
  const notifications: Notification[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate upcoming due date notifications
  const upcomingWindowDays = 3; // Configurable window
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + upcomingWindowDays);

  tasks.forEach(task => {
    if (!task.completed && task.dueDate) {
      const taskDueDate = new Date(task.dueDate);
      taskDueDate.setHours(0, 0, 0, 0);

      // Due today notifications
      if (taskDueDate.getTime() === today.getTime()) {
        notifications.push({
          id: `notification-${task.id}-today`,
          type: 'due_today',
          taskTitle: task.title,
          message: 'Task is due today',
          dueDate: taskDueDate,
          taskId: task.id,
          createdAt: new Date(),
          isRead: false
        });
      }
      // Upcoming due date notifications
      else if (taskDueDate > today && taskDueDate <= futureDate) {
        notifications.push({
          id: `notification-${task.id}-upcoming`,
          type: 'upcoming_due_date',
          taskTitle: task.title,
          message: `Task is due soon (${taskDueDate.toDateString()})`,
          dueDate: taskDueDate,
          taskId: task.id,
          createdAt: new Date(),
          isRead: false
        });
      }
      // Overdue notifications
      else if (taskDueDate < today) {
        notifications.push({
          id: `notification-${task.id}-overdue`,
          type: 'overdue',
          taskTitle: task.title,
          message: `Task is overdue (${taskDueDate.toDateString()})`,
          dueDate: taskDueDate,
          taskId: task.id,
          createdAt: new Date(),
          isRead: false
        });
      }
    }

    // Recurring task reminders (if recurrence data exists)
    if (task.recurrence) {
      // Implementation depends on recurrence pattern
      // This is a placeholder for recurring reminder logic
    }
  });

  return notifications;
};
```

## Step 2: Create Notification Components

Create `frontend/src/components/notifications/NotificationItem.tsx`:

```tsx
import React from 'react';

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'due_today':
        return 'border-l-blue-500 bg-blue-50';
      case 'overdue':
        return 'border-l-red-500 bg-red-50';
      case 'upcoming_due_date':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'recurring_reminder':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div
      className={`border-l-4 p-4 mb-2 rounded ${getTypeStyle(notification.type)} cursor-pointer hover:bg-opacity-80`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-semibold">{notification.taskTitle}</h3>
        <span className="text-xs text-gray-500">
          {notification.dueDate ? new Date(notification.dueDate).toLocaleDateString() : ''}
        </span>
      </div>
      <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
    </div>
  );
};

export default NotificationItem;
```

Create `frontend/src/components/notifications/NotificationPage.tsx`:

```tsx
import React, { useState, useEffect } from 'react';
import { calculateNotifications, Notification } from '../../utils/notification-calculator';
import { Task } from '../../types/task'; // Adjust import based on actual task type
import NotificationItem from './NotificationItem';

interface NotificationPageProps {
  tasks: Task[];
}

const NotificationPage: React.FC<NotificationPageProps> = ({ tasks }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Calculate notifications when tasks change
    if (tasks) {
      const calculatedNotifications = calculateNotifications(tasks);
      setNotifications(calculatedNotifications);
      setLoading(false);
    }
  }, [tasks]);

  if (loading) {
    return <div className="p-4">Loading notifications...</div>;
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold mb-2">No notifications</h2>
        <p className="text-gray-600">You're all caught up! No tasks require your attention.</p>
      </div>
    );
  }

  // Group notifications by type
  const groupedNotifications = notifications.reduce((acc, notification) => {
    if (!acc[notification.type]) {
      acc[notification.type] = [];
    }
    acc[notification.type].push(notification);
    return acc;
  }, {} as Record<string, Notification[]>);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'due_today': return 'Due Today';
      case 'overdue': return 'Overdue';
      case 'upcoming_due_date': return 'Due Soon';
      case 'recurring_reminder': return 'Recurring Reminders';
      default: return type;
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>

      {Object.entries(groupedNotifications).map(([type, notifications]) => (
        <div key={type} className="mb-6">
          <h2 className="text-lg font-semibold mb-3 border-b pb-1">{getTypeLabel(type)}</h2>
          {notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={() => {
                // Navigate to the task detail page
                console.log(`Navigate to task ${notification.taskId}`);
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default NotificationPage;
```

## Step 3: Implement Header Notification Badge

Create `frontend/src/components/HeaderWithBadge.tsx` (or modify existing header):

```tsx
import React from 'react';
import { calculateNotifications } from '../utils/notification-calculator';
import { Task } from '../types/task'; // Adjust import based on actual task type

interface HeaderWithBadgeProps {
  tasks: Task[];
  onNotificationClick?: () => void;
}

const HeaderWithBadge: React.FC<HeaderWithBadgeProps> = ({ tasks, onNotificationClick }) => {
  const notificationCount = calculateNotifications(tasks).length;

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
```

## Step 4: Integrate with Existing Task Data

Update the main application or dashboard component to pass task data to notification components:

```tsx
// In your main component (e.g., Dashboard or App)
import { useEffect, useState } from 'react';
import { Task } from '../types/task'; // Adjust import based on actual task type
import NotificationPage from '../components/notifications/NotificationPage';
import HeaderWithBadge from '../components/HeaderWithBadge';

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'notifications'>('dashboard');

  useEffect(() => {
    // Fetch tasks from your existing API
    // Example:
    // fetchTasks().then(fetchedTasks => {
    //   setTasks(fetchedTasks);
    //   setLoading(false);
    // });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderWithBadge
        tasks={tasks}
        onNotificationClick={() => setView('notifications')}
      />

      <main className="py-6">
        {view === 'dashboard' ? (
          // Your existing dashboard content
          <div>Dashboard content here</div>
        ) : (
          <NotificationPage tasks={tasks} />
        )}
      </main>
    </div>
  );
};
```

## Step 5: Testing Checklist

- [ ] Notification calculation works with various task configurations
- [ ] Different notification types are visually distinct
- [ ] Header badge updates correctly
- [ ] Empty state displays appropriately
- [ ] Clicking notifications navigates to correct task
- [ ] No backend changes were made
- [ ] Performance is acceptable with various task loads
- [ ] Accessibility features work properly
- [ ] Responsive design works on different screen sizes