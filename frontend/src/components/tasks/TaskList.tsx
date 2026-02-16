import React from 'react';
import TaskItem from './TaskItem';

interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  tags: string[]; // Array of tag names
  recurrence_pattern?: string;
  created_at: string;
  updated_at: string;
}

interface TaskListProps {
  tasks: Task[];
  onTaskToggle?: (taskId: string) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskEdit?: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskToggle,
  onTaskDelete,
  onTaskEdit
}) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No tasks found. Create your first task!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          id={task.id}
          title={task.title}
          completed={task.completed}
          priority={task.priority}
          due_date={task.due_date}
          tags={task.tags}
          is_recurring={!!task.recurrence_pattern}
          recurrence_pattern={task.recurrence_pattern}
          onToggle={onTaskToggle ? (id) => onTaskToggle(id) : undefined}
          onEdit={onTaskEdit}
          onDelete={onTaskDelete ? (id) => onTaskDelete(id) : undefined}
        />
      ))}
    </div>
  );
};

export default TaskList;