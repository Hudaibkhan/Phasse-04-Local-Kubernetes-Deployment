"use client";
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Notification, NotificationPreferences } from '../types/enhanced-notification';
import { NotificationPreferenceService } from '../services/notification-preference-service';

interface NotificationState {
  notifications: Notification[];
  preferences: NotificationPreferences;
  selectedNotifications: string[];
  showFilterPanel: boolean;
}

type NotificationAction =
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'UPDATE_NOTIFICATION'; payload: { id: string; updates: Partial<Notification> } }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'TOGGLE_SELECTION'; payload: string }
  | { type: 'SELECT_ALL' }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'TOGGLE_FILTER_PANEL' }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<NotificationPreferences> }
  | { type: 'RESET_PREFERENCES' };

const initialState: NotificationState = {
  notifications: [],
  preferences: NotificationPreferenceService.getPreferences(),
  selectedNotifications: [],
  showFilterPanel: false
};

const NotificationContext = createContext<{
  state: NotificationState;
  dispatch: React.Dispatch<NotificationAction>;
} | undefined>(undefined);

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload
      };

    case 'ADD_NOTIFICATION':
      const newNotifications = [...state.notifications, action.payload];
      return {
        ...state,
        notifications: newNotifications
      };

    case 'UPDATE_NOTIFICATION':
      const updatedNotifications = state.notifications.map(notification =>
        notification.id === action.payload.id
          ? { ...notification, ...action.payload.updates }
          : notification
      );
      return {
        ...state,
        notifications: updatedNotifications
      };

    case 'DELETE_NOTIFICATION':
      const filteredNotifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
      return {
        ...state,
        notifications: filteredNotifications
      };

    case 'TOGGLE_SELECTION':
      const isSelected = state.selectedNotifications.includes(action.payload);
      return {
        ...state,
        selectedNotifications: isSelected
          ? state.selectedNotifications.filter(id => id !== action.payload)
          : [...state.selectedNotifications, action.payload]
      };

    case 'SELECT_ALL':
      return {
        ...state,
        selectedNotifications: state.notifications.map(n => n.id)
      };

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedNotifications: []
      };

    case 'TOGGLE_FILTER_PANEL':
      return {
        ...state,
        showFilterPanel: !state.showFilterPanel
      };

    case 'UPDATE_PREFERENCES':
      const newPreferences = { ...state.preferences, ...action.payload };
      NotificationPreferenceService.savePreferences(newPreferences);
      return {
        ...state,
        preferences: newPreferences
      };

    case 'RESET_PREFERENCES':
      const defaultPreferences = NotificationPreferenceService.getDefaultPreferences();
      NotificationPreferenceService.savePreferences(defaultPreferences);
      return {
        ...state,
        preferences: defaultPreferences
      };

    default:
      return state;
  }
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Initialize preferences from localStorage
  useEffect(() => {
    const preferences = NotificationPreferenceService.getPreferences();
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
  }, []);

  return (
    <NotificationContext.Provider value={{ state, dispatch }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};