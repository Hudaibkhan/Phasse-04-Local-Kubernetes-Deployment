'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Task } from '../../types/notification'; // Import Task from the same file
import { generateNotificationsFromTasks, SimpleNotification } from '../../utils/simple-notifications';
import NotificationList from '../notifications/NotificationList';
import { API_URL } from '../../lib/api';

export default function NotificationPage() {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<SimpleNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token && user) {
          const response = await fetch(`${API_URL}/tasks/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            const taskList = data?.tasks || data || [];
            setTasks(taskList);

            // Generate notifications from tasks
            const generatedNotifications = generateNotificationsFromTasks(taskList);
            setNotifications(generatedNotifications);
          }
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleDeleteAllNotifications = () => {
    setNotifications([]);
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-700"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-indigo-600 dark:border-t-indigo-400 absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="text-center">
            <div className="mx-auto w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-4">
              Access Denied
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Please sign in to view your notifications and stay updated with your tasks.
            </p>
            <div className="mt-8">
              <a
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-200 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-10 bg-gradient-to-b from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 rounded-full"></div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Notifications
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base ml-4">
            Stay updated with your task reminders and important deadlines
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Notification Content */}
        <NotificationList
          notifications={notifications}
          onDelete={handleDeleteNotification}
          onDeleteAll={handleDeleteAllNotifications}
        />
      </div>
    </div>
  );
}