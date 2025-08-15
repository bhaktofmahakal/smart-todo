'use client';

import { useState, useEffect, useCallback } from 'react';
import { ContextEntry, ContextCreate, DailySummary } from '@/types';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface UseContextOptions {
  source_type?: string;
  autoFetch?: boolean;
}

export function useContext(options: UseContextOptions = {}) {
  const [entries, setEntries] = useState<ContextEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchEntries = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentPage = reset ? 1 : page;
      const response = await apiClient.getContextEntries({
        ...options,
        page: currentPage,
      });

      if (reset) {
        setEntries(response.results || []);
        setPage(2);
      } else {
        setEntries(prev => [...(prev || []), ...(response.results || [])]);
        setPage(prev => prev + 1);
      }

      setHasMore(!!response.next);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch context entries');
      toast.error('Failed to fetch context entries');
    } finally {
      setLoading(false);
    }
  }, [options, page]);

  const createEntry = async (data: ContextCreate): Promise<ContextEntry | null> => {
    try {
      const newEntry = await apiClient.createContextEntry(data);
      setEntries(prev => [newEntry, ...prev]);
      toast.success('Context entry added successfully!');
      return newEntry;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add context entry');
      return null;
    }
  };

  const deleteEntry = async (id: number): Promise<boolean> => {
    try {
      await apiClient.deleteContextEntry(id);
      setEntries(prev => prev.filter(entry => entry.id !== id));
      toast.success('Context entry deleted successfully!');
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete context entry');
      return false;
    }
  };

  const refreshEntries = () => {
    setPage(1);
    fetchEntries(true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchEntries(false);
    }
  };

  useEffect(() => {
    if (options.autoFetch !== false) {
      refreshEntries();
    }
  }, [options.source_type]);

  return {
    entries: entries || [],
    loading,
    error,
    hasMore,
    createEntry,
    deleteEntry,
    refreshEntries,
    loadMore,
  };
}

export function useDailySummary(userId?: number) {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getDailySummary(userId);
      setSummary(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch daily summary');
      console.error('Daily summary error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    // Only fetch if we have a token and userId
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token && userId) {
      fetchSummary();
    }
  }, [fetchSummary, userId]);

  return { summary, loading, error, refreshSummary: fetchSummary };
}