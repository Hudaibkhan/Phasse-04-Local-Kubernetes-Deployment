import { useState, useEffect } from 'react';
import { calculateNotificationCount } from '../utils/notification-calculator';
import { Task } from '../types/task';

interface UseNotificationCountOptions {
  tasks?: Task[];
  fetchTasks?: () => Promise<Task[]>;
}

export const useNotificationCount = ({ tasks, fetchTasks }: UseNotificationCountOptions = {}) => {
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const calculateCount = async () => {
      try {
        setLoading(true);

        let taskData: Task[] = [];

        if (tasks) {
          // Use provided tasks
          taskData = tasks;
        } else if (fetchTasks) {
          // Fetch tasks if needed
          taskData = await fetchTasks();
        }

        const count = calculateNotificationCount(taskData);
        setNotificationCount(count);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.error('Error calculating notification count:', err);
      } finally {
        setLoading(false);
      }
    };

    calculateCount();
  }, [tasks, fetchTasks]);

  return { notificationCount, loading, error };
};