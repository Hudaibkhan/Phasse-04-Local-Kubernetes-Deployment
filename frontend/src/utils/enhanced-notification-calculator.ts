import { Task } from '../types/task';
import { Notification } from '../types/notification';
import {
  safeNormalizeDate,
  isToday,
  isFutureDate,
  isPastDate,
  formatDateForDisplay,
  getDateRange,
  isYesterday,
  isThisWeek
} from './date-utils';

// Define types for the enhanced calculator functions
interface NotificationPriority {
  level: 'critical' | 'high' | 'medium' | 'low';
  score: number; // 0-100 scale for sorting
}

interface NotificationGroup {
  key: 'today' | 'yesterday' | 'this_week' | 'earlier';
  label: string;
  notifications: Notification[];
}

interface NotificationTimelineEntry {
  date: Date;
  formattedDate: string;
  notifications: Notification[];
}

interface NotificationFilter {
  type?: string[];
  priority?: ('critical' | 'high' | 'medium' | 'low')[];
  dateRange?: { start: Date; end: Date };
  searchQuery?: string;
}

/**
 * Calculate enhanced notifications from task data
 */
export const calculateEnhancedNotifications = (tasks: Task[]): Notification[] => {
  const notifications: Notification[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate upcoming due date notifications
  const upcomingWindowDays = 7; // Extended window for smart notifications
  const { endDate: futureDate } = getDateRange(upcomingWindowDays);

  tasks.forEach(task => {
    // Process tasks that are not completed and have due dates
    if (!task.completed && task.due_date) {
      const taskDueDate = safeNormalizeDate(task.due_date);

      if (taskDueDate) {
        // Due today notifications
        if (isToday(taskDueDate)) {
          notifications.push({
            id: `notification-${task.id}-today`,
            userId: task.user_id,
            taskId: task.id,
            type: 'due_today',
            title: `Due Today: ${task.title}`,
            message: `'${task.title}' is due today.`,
            dueDate: task.due_date,
            createdAt: new Date().toISOString()
          });
        }
        // Upcoming due date notifications
        else if (isFutureDate(taskDueDate) && taskDueDate <= futureDate) {
          notifications.push({
            id: `notification-${task.id}-upcoming`,
            userId: task.user_id,
            taskId: task.id,
            type: 'upcoming_due_date',
            title: `Upcoming Due Date: ${task.title}`,
            message: `'${task.title}' is due on ${formatDateForDisplay(taskDueDate)}.`,
            dueDate: task.due_date,
            createdAt: new Date().toISOString()
          });
        }
        // Overdue notifications
        else if (isPastDate(taskDueDate)) {
          notifications.push({
            id: `notification-${task.id}-overdue`,
            userId: task.user_id,
            taskId: task.id,
            type: 'overdue',
            title: `Overdue: ${task.title}`,
            message: `'${task.title}' was due on ${formatDateForDisplay(taskDueDate)} and is overdue.`,
            dueDate: task.due_date,
            createdAt: new Date().toISOString()
          });
        }
      }
    }

    // Recurring task reminders
    if (task.recurrence_pattern && !task.completed) {
      notifications.push({
        id: `notification-${task.id}-recurring`,
        userId: task.user_id,
        taskId: task.id,
        type: 'recurring_reminder',
        title: `Recurring Reminder: ${task.title}`,
        message: `'${task.title}' is a recurring task.`,
        dueDate: task.due_date,
        createdAt: new Date().toISOString()
      });
    }
  });

  return notifications;
};

/**
 * Group notifications by date/time periods
 */
export const groupNotificationsByTime = (notifications: Notification[]): NotificationGroup[] => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - todayStart.getDay());

  const groups: NotificationGroup[] = [
    { key: 'today', label: 'Today', notifications: [] },
    { key: 'yesterday', label: 'Yesterday', notifications: [] },
    { key: 'this_week', label: 'This Week', notifications: [] },
    { key: 'earlier', label: 'Earlier', notifications: [] }
  ];

  notifications.forEach(notification => {
    const notificationDate = new Date(notification.createdAt);

    if (notificationDate >= todayStart) {
      groups[0].notifications.push(notification);
    } else if (notificationDate >= yesterdayStart) {
      groups[1].notifications.push(notification);
    } else if (notificationDate >= weekStart) {
      groups[2].notifications.push(notification);
    } else {
      groups[3].notifications.push(notification);
    }
  });

  // Filter out empty groups
  return groups.filter(group => group.notifications.length > 0);
};

/**
 * Create timeline view of notifications
 */
export const createNotificationTimeline = (notifications: Notification[]): NotificationTimelineEntry[] => {
  // Group notifications by date
  const dateMap = new Map<string, Notification[]>();

  notifications.forEach(notification => {
    const dateStr = new Date(notification.createdAt).toDateString();
    if (!dateMap.has(dateStr)) {
      dateMap.set(dateStr, []);
    }
    dateMap.get(dateStr)!.push(notification);
  });

  // Convert to timeline entries and sort by date (most recent first)
  const timelineEntries: NotificationTimelineEntry[] = Array.from(dateMap.entries()).map(([dateStr, notifications]) => {
    const date = new Date(dateStr);
    return {
      date,
      formattedDate: formatDateForDisplay(date),
      notifications: [...notifications]
    };
  });

  // Sort timeline entries by date (most recent first)
  return timelineEntries.sort((a, b) => b.date.getTime() - a.date.getTime());
};

/**
 * Calculate the count of notifications from tasks
 */
export const calculateUnreadNotificationCount = (tasks: Task[]): number => {
  if (!tasks || tasks.length === 0) {
    return 0;
  }

  // Calculate all enhanced notifications first
  const notifications = calculateEnhancedNotifications(tasks);

  // Count the notifications
  return notifications.length;
};

/**
 * Filter notifications based on criteria
 */
export const filterNotifications = (
  notifications: Notification[],
  filter: NotificationFilter
): Notification[] => {
  return notifications.filter(notification => {
    // Type filter
    if (filter.type && !filter.type.includes(notification.type)) {
      return false;
    }

    return true;
  });
};


