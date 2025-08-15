'use client';

import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useDashboardStats, usePriorityDistribution, useUpcomingDeadlines } from '@/hooks/useTasks';
import { useDailySummary } from '@/hooks/useContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Brain,
  Plus,
} from 'lucide-react';
import { formatDate, getPriorityColor, getStatusColor } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { distribution, loading: distributionLoading } = usePriorityDistribution();
  const { tasks: upcomingTasks, loading: upcomingLoading } = useUpcomingDeadlines();
  const { summary, loading: summaryLoading } = useDailySummary(user?.id);

  // Show loading state while authentication is being checked
  if (authLoading || !user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.first_name || user?.username}!
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Here's what's happening with your tasks today.
            </p>
          </div>
          <Link
            href="/tasks/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Tasks"
            value={stats?.total_tasks || 0}
            icon={CheckSquare}
            color="blue"
            loading={statsLoading}
          />
          <StatsCard
            title="Pending"
            value={stats?.pending_tasks || 0}
            icon={Clock}
            color="yellow"
            loading={statsLoading}
          />
          <StatsCard
            title="In Progress"
            value={stats?.in_progress_tasks || 0}
            icon={TrendingUp}
            color="blue"
            loading={statsLoading}
          />
          <StatsCard
            title="Completed"
            value={stats?.completed_tasks || 0}
            icon={CheckSquare}
            color="green"
            loading={statsLoading}
          />
        </div>

        {/* Priority Distribution & Upcoming Deadlines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Priority Distribution */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Priority Distribution
              </h3>
              {distributionLoading ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {distribution && Object.entries(distribution).map(([priority, count]) => (
                    <div key={priority} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Upcoming Deadlines
                </h3>
                <Link
                  href="/tasks"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  View all
                </Link>
              </div>
              {upcomingLoading ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : upcomingTasks.length > 0 ? (
                <div className="space-y-3">
                  {upcomingTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {task.title}
                        </p>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className="text-xs text-gray-500">
                            {task.deadline && formatDate(task.deadline)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No upcoming deadlines</p>
              )}
            </div>
          </div>
        </div>

        {/* AI Daily Summary */}
        {summary && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Brain className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  AI Daily Summary
                </h3>
              </div>
              {summaryLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {summary.summary_text && (
                    <p className="text-sm text-gray-700">{summary.summary_text}</p>
                  )}
                  
                  {summary.key_themes && summary.key_themes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Key Themes</h4>
                      <div className="flex flex-wrap gap-2">
                        {summary.key_themes.map((theme, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(summary.recommendations || summary.recommended_actions) && (summary.recommendations || summary.recommended_actions)!.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {(summary.recommendations || summary.recommended_actions)!.slice(0, 3).map((action: any, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            {typeof action === 'string' ? action : action.title || action.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/tasks/new"
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="h-6 w-6 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-blue-900">Add Task</span>
              </Link>
              <Link
                href="/context/new"
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Plus className="h-6 w-6 text-green-600 mr-3" />
                <span className="text-sm font-medium text-green-900">Add Context</span>
              </Link>
              <Link
                href="/ai-insights"
                className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Brain className="h-6 w-6 text-purple-600 mr-3" />
                <span className="text-sm font-medium text-purple-900">AI Insights</span>
              </Link>
              <Link
                href="/schedule"
                className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <Calendar className="h-6 w-6 text-orange-600 mr-3" />
                <span className="text-sm font-medium text-orange-900">Schedule</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'yellow' | 'red';
  loading?: boolean;
}

function StatsCard({ title, value, icon: Icon, color, loading }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 ${colorClasses[color]} rounded-md flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">
                {loading ? (
                  <div className="animate-pulse h-6 bg-gray-200 rounded w-12"></div>
                ) : (
                  value
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}