import { NotificationPreferences } from '../types/enhanced-notification';

const NOTIFICATION_PREFERENCES_KEY = 'notification_preferences';

export class NotificationPreferenceService {
  static getDefaultPreferences(): NotificationPreferences {
    return {
      enableSmartGrouping: true,
      enableAnimations: true,
      enableBatchOperations: true,
      enableFilters: true,
      enableSearch: true,
      enableTimelineView: true,
      enableSnooze: true,
      defaultSnoozeDuration: 60,
      showUnreadBadge: true,
      autoArchiveAfterDays: 30
    };
  }

  static getPreferences(): NotificationPreferences {
    try {
      // Check if running on client side
      if (typeof window === 'undefined') {
        return this.getDefaultPreferences();
      }

      const stored = localStorage.getItem(NOTIFICATION_PREFERENCES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return this.getDefaultPreferences();
    } catch (error) {
      console.error('Error loading notification preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  static savePreferences(preferences: NotificationPreferences): void {
    try {
      // Check if running on client side
      if (typeof window !== 'undefined') {
        localStorage.setItem(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(preferences));
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  }

  static updatePreference(key: keyof NotificationPreferences, value: any): void {
    const currentPrefs = this.getPreferences();
    const newPrefs = { ...currentPrefs, [key]: value };
    this.savePreferences(newPrefs);
  }

  static resetPreferences(): void {
    this.savePreferences(this.getDefaultPreferences());
  }
}