import { Task } from '../types/task';
import { Notification } from '../types/notification';
import {
  safeNormalizeDate,
  isToday,
  isFutureDate,
  isPastDate,
  formatDateForDisplay,
  getDateRange
} from './date-utils';

/**
 * Calculate notifications from task data
 */
export const calculateNotifications = (tasks: Task[]): Notification[] => {
  const notifications: Notification[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate upcoming due date notifications
  const upcomingWindowDays = 3; // Configurable window
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
 * Calculate notification count from task data
 */
export const calculateNotificationCount = (tasks: Task[]): number => {
  const notifications = calculateNotifications(tasks);
  return notifications.length;
};

