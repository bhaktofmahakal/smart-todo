'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/contexts/AuthContext';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  CheckSquare,
  Clock,
  AlertTriangle,
  Calendar,
  Tag,
  Brain,
  Edit,
  Trash2,
} from 'lucide-react';
import { formatDate, getPriorityColor, getStatusColor, truncateText } from '@/lib/utils';
import Link from 'next/link';
import { Task } from '@/types';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function TasksPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    ordering: '-ai_priority_score',
  });

  const {
    tasks,
    loading,
    hasMore,
    createTask,
    updateTask,
    deleteTask,
    markCompleted,
    analyzeTask,
    refreshTasks,
    loadMore,
  } = useTasks(filters);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleTaskAction = async (action: string, taskId: number) => {
    switch (action) {
      case 'complete':
        await markCompleted(taskId);
        break;
      case 'analyze':
        await analyzeTask(taskId);
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this task?')) {
          await deleteTask(taskId);
        }
        break;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your tasks with AI-powered insights
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

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Sort */}
            <select
              value={filters.ordering}
              onChange={(e) => handleFilterChange('ordering', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="-ai_priority_score">AI Priority</option>
              <option value="-created_at">Newest First</option>
              <option value="created_at">Oldest First</option>
              <option value="deadline">Deadline</option>
              <option value="-deadline">Deadline (Desc)</option>
            </select>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading && tasks.length === 0 ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : tasks.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onAction={handleTaskAction}
                />
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center">
              <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new task.
              </p>
              <div className="mt-6">
                <Link
                  href="/tasks/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Link>
              </div>
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={loadMore}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

interface TaskItemProps {
  task: Task;
  onAction: (action: string, taskId: number) => void;
}

function TaskItem({ task, onAction }: TaskItemProps) {
  return (
    <li className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className={`w-3 h-3 rounded-full ${
                task.status === 'completed' ? 'bg-green-400' :
                task.status === 'in_progress' ? 'bg-blue-400' :
                task.status === 'cancelled' ? 'bg-red-400' : 'bg-gray-300'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {task.title}
                </h3>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
              {task.description && (
                <p className="text-sm text-gray-600 mb-2">
                  {truncateText(task.description, 150)}
                </p>
              )}
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                {task.deadline && (
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(task.deadline)}
                  </div>
                )}
                {task.category && (
                  <div className="flex items-center">
                    <Tag className="h-3 w-3 mr-1" />
                    {task.category.name}
                  </div>
                )}
                {task.ai_priority_score > 0 && (
                  <div className="flex items-center">
                    <Brain className="h-3 w-3 mr-1" />
                    AI Score: {(task.ai_priority_score * 100).toFixed(0)}%
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="flex-shrink-0">
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button className="flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <MoreVertical className="h-5 w-5" />
              </Menu.Button>
            </div>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href={`/tasks/${task.id}/edit`}
                        className={`${
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } flex items-center px-4 py-2 text-sm`}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    )}
                  </Menu.Item>
                  {task.status !== 'completed' && (
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => onAction('complete', task.id)}
                          className={`${
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          } flex items-center w-full px-4 py-2 text-sm text-left`}
                        >
                          <CheckSquare className="h-4 w-4 mr-2" />
                          Mark Complete
                        </button>
                      )}
                    </Menu.Item>
                  )}
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => onAction('analyze', task.id)}
                        className={`${
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } flex items-center w-full px-4 py-2 text-sm text-left`}
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        AI Analyze
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => onAction('delete', task.id)}
                        className={`${
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } flex items-center w-full px-4 py-2 text-sm text-left text-red-600`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </li>
  );
}