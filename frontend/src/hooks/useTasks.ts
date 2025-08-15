'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, TaskCreate, DashboardStats, PriorityDistribution } from '@/types';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface UseTasksOptions {
  status?: string;
  priority?: string;
  category?: number;
  search?: string;
  ordering?: string;
  autoFetch?: boolean;
}

export function useTasks(options: UseTasksOptions = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchTasks = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentPage = reset ? 1 : page;
      const response = await apiClient.getTasks({
        ...options,
        page: currentPage,
      });

      if (reset) {
        setTasks(response.results);
        setPage(2);
      } else {
        setTasks(prev => [...prev, ...response.results]);
        setPage(prev => prev + 1);
      }

      setHasMore(!!response.next);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch tasks');
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [options, page]);

  const createTask = async (data: TaskCreate): Promise<Task | null> => {
    try {
      const newTask = await apiClient.createTask(data);
      setTasks(prev => [newTask, ...prev]);
      toast.success('Task created successfully!');
      return newTask;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create task');
      return null;
    }
  };

  const updateTask = async (id: number, data: Partial<TaskCreate>): Promise<Task | null> => {
    try {
      const updatedTask = await apiClient.updateTask(id, data);
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
      toast.success('Task updated successfully!');
      return updatedTask;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update task');
      return null;
    }
  };

  const deleteTask = async (id: number): Promise<boolean> => {
    try {
      await apiClient.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
      toast.success('Task deleted successfully!');
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete task');
      return false;
    }
  };

  const markCompleted = async (id: number): Promise<boolean> => {
    try {
      const updatedTask = await apiClient.markTaskCompleted(id);
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
      toast.success('Task marked as completed!');
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to mark task as completed');
      return false;
    }
  };

  const analyzeTask = async (id: number): Promise<boolean> => {
    try {
      const analyzedTask = await apiClient.analyzeTask(id);
      setTasks(prev => prev.map(task => task.id === id ? analyzedTask : task));
      toast.success('Task analyzed successfully!');
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to analyze task');
      return false;
    }
  };

  const refreshTasks = () => {
    setPage(1);
    fetchTasks(true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchTasks(false);
    }
  };

  useEffect(() => {
    if (options.autoFetch !== false) {
      refreshTasks();
    }
  }, [options.status, options.priority, options.category, options.search, options.ordering]);

  return {
    tasks,
    loading,
    error,
    hasMore,
    createTask,
    updateTask,
    deleteTask,
    markCompleted,
    analyzeTask,
    refreshTasks,
    loadMore,
  };
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch dashboard stats');
      console.error('Dashboard stats error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch if we have a token
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      fetchStats();
    }
  }, [fetchStats]);

  return { stats, loading, error, refreshStats: fetchStats };
}

export function usePriorityDistribution() {
  const [distribution, setDistribution] = useState<PriorityDistribution | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDistribution = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getPriorityDistribution();
      setDistribution(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch priority distribution');
      console.error('Priority distribution error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch if we have a token
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      fetchDistribution();
    }
  }, [fetchDistribution]);

  return { distribution, loading, error, refreshDistribution: fetchDistribution };
}

export function useUpcomingDeadlines() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUpcomingDeadlines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getUpcomingDeadlines();
      setTasks(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch upcoming deadlines');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch if we have a token
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      fetchUpcomingDeadlines();
    }
  }, [fetchUpcomingDeadlines]);

  return { tasks, loading, error, refreshDeadlines: fetchUpcomingDeadlines };
}