'use client';

import { useState, useCallback } from 'react';
import {
  AIContextAnalysis,
  AITaskPrioritization,
  AIDeadlineSuggestion,
  AICategorization,
  AITaskEnhancement,
  ScheduleSuggestion,
  TimeBlock,
} from '@/types';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

export function useAIAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeContext = useCallback(async (
    content: string,
    source_type: string
  ): Promise<AIContextAnalysis | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.analyzeContext(content, source_type);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to analyze context';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const prioritizeTasks = useCallback(async (
    userId: number
  ): Promise<AITaskPrioritization | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.prioritizeTasks(userId);
      toast.success('Tasks prioritized successfully!');
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to prioritize tasks';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const suggestDeadline = useCallback(async (
    title: string,
    description?: string,
    userId?: number
  ): Promise<AIDeadlineSuggestion | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.suggestDeadline(title, description, userId);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to suggest deadline';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const categorizeTask = useCallback(async (
    title: string,
    description?: string
  ): Promise<AICategorization | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.categorizeTask(title, description);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to categorize task';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const enhanceTask = useCallback(async (
    title: string,
    description?: string,
    userId?: number
  ): Promise<AITaskEnhancement | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.enhanceTask(title, description, userId);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to enhance task';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    analyzeContext,
    prioritizeTasks,
    suggestDeadline,
    categorizeTask,
    enhanceTask,
  };
}

export function useScheduling() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getScheduleSuggestions = useCallback(async (
    userId: number
  ): Promise<ScheduleSuggestion[] | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.getScheduleSuggestions(userId);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to get schedule suggestions';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTimeBlockingSuggestions = useCallback(async (
    userId: number,
    availableHours: number = 8
  ): Promise<TimeBlock[] | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.getTimeBlockingSuggestions(userId, availableHours);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to get time blocking suggestions';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getScheduleSuggestions,
    getTimeBlockingSuggestions,
  };
}

// useScheduling function is already exported above