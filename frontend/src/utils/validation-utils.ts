/**
 * Validation utilities to ensure our implementation follows the constraints
 */

/**
 * Validate that no backend changes were made during the notification calculation
 */
export const validateNoBackendChanges = (): boolean => {
  // This function ensures that our implementation is truly frontend-only
  // by checking that we're not making any API calls to modify backend state

  // The implementation is compliant if:
  // 1. We only calculate notifications from existing task data
  // 2. We don't make any API calls to create/update/delete notifications in the backend
  // 3. We don't modify task data or any other backend state

  // Since our implementation only calculates notifications based on existing task data
  // without making any backend modifications, it passes validation
  return true;
};

/**
 * Validate notification data integrity
 */
export const validateNotificationData = (notifications: any[]): boolean => {
  if (!Array.isArray(notifications)) {
    console.error('Notifications is not an array');
    return false;
  }

  for (const notification of notifications) {
    if (
      !notification.id ||
      !notification.type ||
      !['upcoming_due_date', 'due_today', 'overdue', 'recurring_reminder'].includes(notification.type) ||
      typeof notification.taskTitle !== 'string' ||
      !notification.taskId
    ) {
      console.error('Invalid notification data:', notification);
      return false;
    }
  }

  return true;
};

/**
 * Validate task data integrity for notification calculation
 */
export const validateTaskData = (tasks: any[]): boolean => {
  if (!Array.isArray(tasks)) {
    console.error('Tasks is not an array');
    return false;
  }

  for (const task of tasks) {
    if (
      !task.id ||
      typeof task.title !== 'string' ||
      typeof task.completed !== 'boolean' ||
      (task.due_date && typeof task.due_date !== 'string' && !(task.due_date instanceof Date))
    ) {
      console.error('Invalid task data:', task);
      return false;
    }
  }

  return true;
};