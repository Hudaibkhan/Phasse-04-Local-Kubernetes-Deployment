import { useState, useEffect } from 'react';
import { Task } from '../types/task';
import { calculateUnreadNotificationCount } from '../utils/enhanced-notification-calculator';

export const useEnhancedNotificationCount = (tasks: Task[]) => {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);

    // Calculate notification count
    const notificationCount = calculateUnreadNotificationCount(tasks);
    setCount(notificationCount);

    setLoading(false);
  }, [tasks]);

  return { count, loading, refresh: () => {} };
};