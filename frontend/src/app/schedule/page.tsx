'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useScheduling } from '@/hooks/useAI';
import { useAuth } from '@/contexts/AuthContext';
import {
  Calendar,
  Clock,
  Target,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function SchedulePage() {
  const { user } = useAuth();
  const { getScheduleSuggestions, getTimeBlockingSuggestions, loading } = useScheduling();
  const [scheduleSuggestions, setScheduleSuggestions] = useState<any[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<any[]>([]);
  const [availableHours, setAvailableHours] = useState(8);

  const handleGetScheduleSuggestions = async () => {
    if (!user?.id) return;
    
    const result = await getScheduleSuggestions(user.id);
    if (result) {
      setScheduleSuggestions(result);
    }
  };

  const handleGetTimeBlocks = async () => {
    if (!user?.id) return;
    
    const result = await getTimeBlockingSuggestions(user.id, availableHours);
    if (result) {
      setTimeBlocks(result);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Smart Schedule</h1>
            <p className="mt-1 text-sm text-gray-600">
              AI-powered scheduling and time blocking suggestions
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleGetScheduleSuggestions}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4 mr-2" />
              )}
              Get Schedule
            </button>
          </div>
        </div>

        {/* Time Blocking Configuration */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Time Blocking Settings</h2>
          <div className="flex items-center space-x-4">
            <div>
              <label htmlFor="available_hours" className="block text-sm font-medium text-gray-700">
                Available Hours per Day
              </label>
              <input
                type="number"
                id="available_hours"
                min="1"
                max="16"
                step="0.5"
                value={availableHours}
                onChange={(e) => setAvailableHours(parseFloat(e.target.value))}
                className="mt-1 block w-32 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="pt-6">
              <button
                onClick={handleGetTimeBlocks}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Clock className="h-4 w-4 mr-2" />
                )}
                Generate Time Blocks
              </button>
            </div>
          </div>
        </div>

        {/* Schedule Suggestions */}
        {scheduleSuggestions.length > 0 && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Schedule Suggestions
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {scheduleSuggestions.map((suggestion, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        Task ID: {suggestion.task_id}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          Priority: {(suggestion.priority_score * 100).toFixed(0)}%
                        </span>
                        <span className="text-sm text-gray-500">
                          Duration: {suggestion.duration}h
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {suggestion.suggested_time_slot}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{suggestion.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Time Blocks */}
        {timeBlocks.length > 0 && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Time Blocks ({availableHours}h available)
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {timeBlocks.map((block, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {block.task_title}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          block.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          block.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          block.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {block.priority}
                        </span>
                        <span>Duration: {block.estimated_duration}h</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {block.start_time} - {block.end_time}
                      </div>
                      <div className="text-xs text-gray-500">
                        Task ID: {block.task_id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Getting Started */}
        {scheduleSuggestions.length === 0 && timeBlocks.length === 0 && (
          <div className="bg-white shadow rounded-lg">
            <div className="p-6 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No schedule generated yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Generate AI-powered schedule suggestions and time blocks for your tasks.
              </p>
              <div className="mt-6 flex justify-center space-x-3">
                <button
                  onClick={handleGetScheduleSuggestions}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Calendar className="h-4 w-4 mr-2" />
                  )}
                  Get Schedule
                </button>
                <button
                  onClick={handleGetTimeBlocks}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Clock className="h-4 w-4 mr-2" />
                  )}
                  Time Blocks
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Smart Scheduling
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      AI-Optimized Timeline
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Get intelligent scheduling suggestions based on task priority, deadlines, and your context.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Time Blocking
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Focused Work Sessions
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Automatically create time blocks for your tasks to maximize productivity and focus.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}