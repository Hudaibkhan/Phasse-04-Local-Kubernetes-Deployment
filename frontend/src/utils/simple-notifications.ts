import { Task } from '../types/task';

export interface SimpleNotification {
  id: string;
  taskId: string;
  taskTitle: string;
  message: string;
  type: 'due_today' | 'overdue' | 'upcoming_due_date' | 'recurring_reminder';
  dueDate: string | null;
}

export function generateNotificationsFromTasks(tasks: Task[]): SimpleNotification[] {
  const notifications: SimpleNotification[] = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(today.getDate() + 3);

  tasks.forEach(task => {
    // Skip completed tasks
    if (task.completed) return;

    // Skip tasks without due dates (except recurring)
    if (!task.due_date && !task.recurrence_pattern) return;

    if (task.due_date) {
      const dueDate = new Date(task.due_date);
      const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

      // Overdue
      if (dueDateOnly < today) {
        notifications.push({
          id: `${task.id}-overdue`,
          taskId: task.id,
          taskTitle: task.title,
          message: `This task is overdue!`,
          type: 'overdue',
          dueDate: task.due_date
        });
      }
      // Due today
      else if (dueDateOnly.getTime() === today.getTime()) {
        notifications.push({
          id: `${task.id}-today`,
          taskId: task.id,
          taskTitle: task.title,
          message: `This task is due today!`,
          type: 'due_today',
          dueDate: task.due_date
        });
      }
      // Due soon (within 3 days)
      else if (dueDateOnly > today && dueDateOnly <= threeDaysFromNow) {
        notifications.push({
          id: `${task.id}-upcoming`,
          taskId: task.id,
          taskTitle: task.title,
          message: `This task is due soon!`,
          type: 'upcoming_due_date',
          dueDate: task.due_date
        });
      }
    }

    // Recurring tasks
    if (task.recurrence_pattern) {
      notifications.push({
        id: `${task.id}-recurring`,
        taskId: task.id,
        taskTitle: task.title,
        message: `Recurring: ${task.recurrence_pattern || 'Regular reminder'}`,
        type: 'recurring_reminder',
        dueDate: task.due_date || null
      });
    }
  });

  return notifications;
}