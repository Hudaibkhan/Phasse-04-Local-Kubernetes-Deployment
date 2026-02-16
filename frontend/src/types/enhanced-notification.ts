import { Notification } from './notification';

export type { Notification };

export interface NotificationPreferences {
  enableSmartGrouping: boolean;
  enableAnimations: boolean;
  enableBatchOperations: boolean;
  enableFilters: boolean;
  enableSearch: boolean;
  enableTimelineView: boolean;
  enableSnooze: boolean;
  defaultSnoozeDuration: number; // in minutes
  showUnreadBadge: boolean;
  autoArchiveAfterDays: number;
}