/**
 * Formats a date string to a localized date string
 * @param dateString - Date string to format
 * @returns Formatted date string or empty string if no date provided
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

/**
 * Checks if a task is overdue (due date is in the past and task is not completed)
 * @param dateString - Due date string to check
 * @param taskCompleted - Whether the task is completed
 * @returns True if the task is overdue, false otherwise
 */
export function isOverdue(dateString?: string, taskCompleted: boolean = false): boolean {
  if (!dateString) return false;
  const dueDate = new Date(dateString);
  const now = new Date();
  return !taskCompleted && dueDate < now;
}

/**
 * Utility functions for date handling to address edge cases
 */

/**
 * Safely normalize a date value to a Date object
 */
export const safeNormalizeDate = (dateValue: string | Date | null | undefined): Date | null => {
  if (!dateValue) {
    return null;
  }

  try {
    // If it's already a Date object, return it
    if (dateValue instanceof Date) {
      return dateValue;
    }

    // If it's a string, try to parse it
    const parsedDate = new Date(dateValue);

    // Check if the date is valid
    if (isNaN(parsedDate.getTime())) {
      console.warn(`Invalid date value: ${dateValue}`);
      return null;
    }

    return parsedDate;
  } catch (error) {
    console.warn(`Error parsing date: ${dateValue}`, error);
    return null;
  }
};

/**
 * Compare two dates ignoring time components (compare only date parts)
 */
export const compareDatesIgnoreTime = (date1: Date | null, date2: Date | null): number => {
  if (!date1 && !date2) return 0;
  if (!date1) return -1;
  if (!date2) return 1;

  const d1 = new Date(date1);
  d1.setHours(0, 0, 0, 0);

  const d2 = new Date(date2);
  d2.setHours(0, 0, 0, 0);

  return d1.getTime() - d2.getTime();
};

/**
 * Check if a date is today (ignoring time components)
 */
export const isToday = (date: Date | null): boolean => {
  if (!date) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  return checkDate.getTime() === today.getTime();
};

/**
 * Check if a date is in the future (ignoring time components)
 */
export const isFutureDate = (date: Date | null): boolean => {
  if (!date) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  return checkDate.getTime() > today.getTime();
};

/**
 * Check if a date is in the past (ignoring time components)
 */
export const isPastDate = (date: Date | null): boolean => {
  if (!date) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  return checkDate.getTime() < today.getTime();
};

/**
 * Format a date for display in a consistent manner
 */
export const formatDateForDisplay = (date: Date | null): string => {
  if (!date) return '';

  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Check if a date is yesterday (ignoring time components)
 */
export const isYesterday = (date: Date | null): boolean => {
  if (!date) return false;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  return checkDate.getTime() === yesterday.getTime();
};

/**
 * Check if a date is in this week
 */
export const isThisWeek = (date: Date | null): boolean => {
  if (!date) return false;

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  return checkDate >= startOfWeek && checkDate <= endOfWeek;
};

/**
 * Get a date range (e.g., next 3 days)
 */
export const getDateRange = (days: number): { startDate: Date, endDate: Date } => {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + days);

  return { startDate, endDate };
};