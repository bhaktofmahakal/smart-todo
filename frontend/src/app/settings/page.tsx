'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
  User,
  Bell,
  Shield,
  Download,
  Upload,
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    taskReminders: true,
    aiInsights: true,
    dailySummary: true,
  });
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
  });

  // Initialize profile data when user is loaded
  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      });
    }
  }, [user]);

  const handleExportTasks = async () => {
    try {
      const response = await apiClient.exportTasks();
      const blob = new Blob([JSON.stringify(response, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasks-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Tasks exported successfully!');
    } catch (error) {
      toast.error('Failed to export tasks');
    }
  };

  const handleImportTasks = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await apiClient.importTasks(data);
      toast.success('Tasks imported successfully!');
    } catch (error) {
      toast.error('Failed to import tasks. Please check the file format.');
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handleProfileChange = (key: string, value: string) => {
    setProfileData(prev => ({ ...prev, [key]: value }));
  };

  const handleUpdateProfile = async () => {
    try {
      // Create a proper API endpoint for updating profile
      const response = await fetch('http://localhost:8000/api/auth/user/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(profileData),
      });
      
      if (response.ok) {
        toast.success('Profile updated successfully!');
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Information
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={user?.username || ''}
                  readOnly
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={user?.email || ''}
                  readOnly
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  value={profileData.first_name}
                  onChange={(e) => handleProfileChange('first_name', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  value={profileData.last_name}
                  onChange={(e) => handleProfileChange('last_name', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleUpdateProfile}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Task Reminders</h3>
                  <p className="text-sm text-gray-500">Get notified about upcoming deadlines</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.taskReminders}
                  onChange={(e) => handleNotificationChange('taskReminders', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">AI Insights</h3>
                  <p className="text-sm text-gray-500">Receive AI-powered task recommendations</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.aiInsights}
                  onChange={(e) => handleNotificationChange('aiInsights', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Daily Summary</h3>
                  <p className="text-sm text-gray-500">Get daily productivity summaries</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.dailySummary}
                  onChange={(e) => handleNotificationChange('dailySummary', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Data Management
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Export Tasks</h3>
                  <p className="text-sm text-gray-500">Download your tasks as JSON or CSV</p>
                </div>
                <button
                  type="button"
                  onClick={handleExportTasks}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Import Tasks</h3>
                  <p className="text-sm text-gray-500">Upload tasks from JSON file</p>
                </div>
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportTasks}
                    className="hidden"
                    id="import-file"
                  />
                  <label
                    htmlFor="import-file"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Note: Theme toggle is available in the header */}
      </div>
    </DashboardLayout>
  );
}