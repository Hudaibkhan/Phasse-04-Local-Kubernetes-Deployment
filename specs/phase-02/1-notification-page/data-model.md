# Data Model: Notification System

## Notification Entity

### Properties
- **id** (string): Unique identifier for the notification
- **type** (enum): Type of notification ('upcoming_due_date', 'due_today', 'overdue', 'recurring_reminder')
- **taskTitle** (string): Title of the associated task
- **message** (string): Short descriptive message about the notification
- **dueDate** (Date | null): Associated due date if applicable
- **taskId** (string): Reference to the associated task
- **createdAt** (Date): Timestamp when notification was generated
- **isRead** (boolean): Whether the notification has been viewed

### Notification Types
- **upcoming_due_date**: Task due within the configured window (e.g., next 3 days)
- **due_today**: Task due on the current date
- **overdue**: Task past due date and not completed
- **recurring_reminder**: Reminder for recurring task

## Task Data Interface (Reference)

For notification calculation, the system will use existing task data with these properties:
- **id** (string): Unique task identifier
- **title** (string): Task title
- **dueDate** (Date | null): When the task is due
- **completed** (boolean): Whether the task is completed
- **recurrence** (object | null): Recurrence pattern if applicable
- **userId** (string): Owner of the task (for user isolation)

## Calculated Notification Properties

The following properties will be calculated in the frontend based on task data:

### Is Upcoming
- Task has a dueDate
- Due date is within the configured window (e.g., next 1-3 days)
- Task is not completed

### Is Due Today
- Task has a dueDate
- Due date equals the current date
- Task is not completed

### Is Overdue
- Task has a dueDate
- Due date is before the current date
- Task is not completed

### Is Recurring Reminder
- Task has a recurrence pattern
- Based on recurrence rules, a reminder should be shown
- Task is not completed

## Relationships
- Each notification is associated with exactly one task (1:1 relationship with tasks)
- Each task may generate 0 to many notifications depending on its properties and current date