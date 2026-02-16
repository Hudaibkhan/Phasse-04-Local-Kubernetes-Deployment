/**
 * Constants for notification types
 */

export const NOTIFICATION_TYPES = {
  UPCOMING_DUE_DATE: 'upcoming_due_date',
  DUE_TODAY: 'due_today',
  OVERDUE: 'overdue',
  RECURRING_REMINDER: 'recurring_reminder'
} as const;

export type NotificationType = keyof typeof NOTIFICATION_TYPES;