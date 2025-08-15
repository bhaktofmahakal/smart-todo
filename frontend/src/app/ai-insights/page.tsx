'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useAIAnalysis } from '@/hooks/useAI';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import {
  Brain,
  TrendingUp,
  Target,
  Calendar,
  Lightbulb,
  BarChart3,
  Loader2,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export default function AIInsightsPage() {
  const { user } = useAuth();
  const { getDailySummary, loading } = useAIAnalysis();
  const [dailySummary, setDailySummary] = useState<any>(null);
  const [taskStats, setTaskStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchTaskStats();
      handleGetDailySummary();
    }
  }, [user]);

  const fetchTaskStats = async () => {
    setLoadingStats(true);
    try {
      const response = await apiClient.getTasks();
      const tasks = response.results || response;
      
      const stats = {
        total: tasks.length,
        completed: tasks.filter((t: any) => t.status === 'completed').length,
        pending: tasks.filter((t: any) => t.status === 'pending').length,
        in_progress: tasks.filter((t: any) => t.status === 'in_progress').length,
        high_priority: tasks.filter((t: any) => t.priority === 'high' || t.priority === 'urgent').length,
        overdue: tasks.filter((t: any) => {
          if (!t.deadline) return false;
          return new Date(t.deadline) < new Date() && t.status !== 'completed';
        }).length,
      };
      
      setTaskStats(stats);
    } catch (error) {
      console.error('Failed to fetch task stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleGetDailySummary = async () => {
    if (!user?.id) return;
    
    const result = await getDailySummary(user.id);
    if (result) {
      setDailySummary(result);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI-Powered Analytics</h1>
            <p className="mt-1 text-sm text-gray-600">
              Intelligent insights about your productivity and task patterns
            </p>
          </div>
          <button
            onClick={handleGetDailySummary}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Generate AI Summary
          </button>
        </div>

        {/* Task Statistics */}
        {taskStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Tasks
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {taskStats.total}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Completed
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {taskStats.completed}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        In Progress
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {taskStats.in_progress}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        High Priority
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {taskStats.high_priority}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Task Prioritization
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      AI-Powered Ranking
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Automatically prioritize tasks based on urgency, context, and deadlines using AI analysis
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Smart Categorization
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      95-100% Accuracy
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Auto-suggest task categories and tags with high accuracy based on content analysis
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Deadline Suggestions
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Context-Aware
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Recommend realistic deadlines based on task complexity and current workload
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Summary */}
        {dailySummary && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-600" />
                AI Daily Summary
              </h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Summary</h4>
                  <p className="text-sm text-gray-600">{dailySummary.summary}</p>
                </div>

                {dailySummary.key_themes && dailySummary.key_themes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Key Themes</h4>
                    <div className="flex flex-wrap gap-2">
                      {dailySummary.key_themes.map((theme: string, index: number) => (
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

                {dailySummary.priority_areas && dailySummary.priority_areas.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Priority Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {dailySummary.priority_areas.map((area: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {dailySummary.recommendations && dailySummary.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">AI Recommendations</h4>
                    <div className="space-y-2">
                      {dailySummary.recommendations.map((rec: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{rec.title}</p>
                            <p className="text-sm text-gray-600">{rec.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Context Processing Info */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              AI Context Processing
            </h3>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Supported Sources</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• WhatsApp messages</li>
                  <li>• Email content</li>
                  <li>• Personal notes</li>
                  <li>• Meeting transcripts</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">AI Capabilities</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Sentiment analysis</li>
                  <li>• Keyword extraction</li>
                  <li>• Urgency detection</li>
                  <li>• Task extraction</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}