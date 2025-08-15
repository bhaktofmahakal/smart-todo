'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useContext } from '@/hooks/useContext';
import { useAIAnalysis } from '@/hooks/useAI';
import {
  Plus,
  MessageSquare,
  Mail,
  FileText,
  Calendar,
  User,
  Brain,
  Trash2,
  Search,
  Filter,
} from 'lucide-react';
import { formatRelativeTime, truncateText } from '@/lib/utils';
import { ContextEntry, ContextCreate } from '@/types';
import Link from 'next/link';

const sourceIcons = {
  whatsapp: MessageSquare,
  email: Mail,
  notes: FileText,
  calendar: Calendar,
  manual: User,
};

const sourceColors = {
  whatsapp: 'bg-green-100 text-green-800',
  email: 'bg-blue-100 text-blue-800',
  notes: 'bg-yellow-100 text-yellow-800',
  calendar: 'bg-purple-100 text-purple-800',
  manual: 'bg-gray-100 text-gray-800',
};

export default function ContextPage() {
  const [filters, setFilters] = useState({
    source_type: '',
  });

  const [newEntry, setNewEntry] = useState<ContextCreate>({
    source_type: 'manual',
    content: '',
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [analyzingEntry, setAnalyzingEntry] = useState<number | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const {
    entries,
    loading,
    hasMore,
    createEntry,
    deleteEntry,
    refreshEntries,
    loadMore,
  } = useContext(filters);

  const { analyzeContext, loading: aiLoading } = useAIAnalysis();

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.content.trim()) return;

    const entry = await createEntry(newEntry);
    if (entry) {
      setNewEntry({ source_type: 'manual', content: '' });
      setShowAddForm(false);
    }
  };

  const handleAnalyzeEntry = async (entry: ContextEntry) => {
    setAnalyzingEntry(entry.id);
    try {
      const analysis = await analyzeContext(entry.content, entry.source_type);
      if (analysis) {
        setAnalysisResult(analysis);
        setShowAnalysis(true);
        console.log('Analysis results:', analysis);
      }
    } finally {
      setAnalyzingEntry(null);
    }
  };

  const handleDeleteEntry = async (id: number) => {
    if (confirm('Are you sure you want to delete this context entry?')) {
      await deleteEntry(id);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daily Context</h1>
            <p className="mt-1 text-sm text-gray-600">
              Add and manage your daily context for AI-powered insights
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Context
          </button>
        </div>

        {/* Add Context Form */}
        {showAddForm && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Context</h2>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label htmlFor="source_type" className="block text-sm font-medium text-gray-700">
                  Source Type
                </label>
                <select
                  id="source_type"
                  value={newEntry.source_type}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, source_type: e.target.value as any }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="manual">Manual Entry</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="notes">Notes</option>
                  <option value="calendar">Calendar</option>
                </select>
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <textarea
                  id="content"
                  rows={4}
                  required
                  value={newEntry.content}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your context content..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Context
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="source_filter" className="block text-sm font-medium text-gray-700">
                Filter by Source
              </label>
              <select
                id="source_filter"
                value={filters.source_type}
                onChange={(e) => handleFilterChange('source_type', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Sources</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="notes">Notes</option>
                <option value="calendar">Calendar</option>
                <option value="manual">Manual Entry</option>
              </select>
            </div>
          </div>
        </div>

        {/* Context Entries */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading && (!entries || entries.length === 0) ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : entries && entries.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {entries.map((entry) => (
                <ContextEntryItem
                  key={entry.id}
                  entry={entry}
                  onAnalyze={() => handleAnalyzeEntry(entry)}
                  onDelete={() => handleDeleteEntry(entry.id)}
                  analyzing={analyzingEntry === entry.id}
                />
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No context entries</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start by adding your daily context for AI insights.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Context
                </button>
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
      <AnalysisModal open={showAnalysis} onClose={() => setShowAnalysis(false)} result={analysisResult} />
    </DashboardLayout>
  );
}

interface ContextEntryItemProps {
  entry: ContextEntry;
  onAnalyze: () => void;
  onDelete: () => void;
  analyzing: boolean;
}

function ContextEntryItem({ entry, onAnalyze, onDelete, analyzing }: ContextEntryItemProps) {
  const SourceIcon = sourceIcons[entry.source_type];

  return (
    <li className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sourceColors[entry.source_type]}`}>
              <SourceIcon className="h-3 w-3 mr-1" />
              {entry.source_type.charAt(0).toUpperCase() + entry.source_type.slice(1)}
            </div>
            <span className="text-xs text-gray-500">
              {formatRelativeTime(entry.created_at)}
            </span>
            {entry.relevance_score > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                Relevance: {(entry.relevance_score * 100).toFixed(0)}%
              </span>
            )}
          </div>

          <p className="text-sm text-gray-900 mb-2">
            {truncateText(entry.content, 200)}
          </p>

          {/* Keywords */}
          {entry.keywords && entry.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {entry.keywords.slice(0, 5).map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}

          {/* Urgency Indicators */}
          {entry.urgency_indicators && entry.urgency_indicators.length > 0 && (
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs text-orange-600 font-medium">Urgency indicators:</span>
              <div className="flex flex-wrap gap-1">
                {entry.urgency_indicators.slice(0, 3).map((indicator, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800"
                  >
                    {indicator}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sentiment Score */}
          {entry.sentiment_score !== null && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Sentiment:</span>
              <span className={`text-xs font-medium ${
                entry.sentiment_score > 0.1 ? 'text-green-600' :
                entry.sentiment_score < -0.1 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {entry.sentiment_score > 0.1 ? 'Positive' :
                 entry.sentiment_score < -0.1 ? 'Negative' : 'Neutral'}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={onAnalyze}
            disabled={analyzing}
            className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            title="Analyze with AI"
          >
            <Brain className={`h-4 w-4 ${analyzing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            title="Delete entry"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  );
}

// Simple modal to show AI analysis (supports multiple response shapes)
function AnalysisModal({ open, onClose, result }: { open: boolean; onClose: () => void; result: any | null }) {
  if (!open || !result) return null;

  // Normalize possible backend shapes
  const keywords: string[] = result.keywords || [];

  const numericSentiment: number | null =
    typeof result.sentiment_score === 'number'
      ? result.sentiment_score
      : typeof result.sentiment_analysis?.sentiment_score === 'number'
      ? result.sentiment_analysis.sentiment_score
      : null;

  const overallSentiment: string | undefined = result.sentiment_analysis?.overall_sentiment;

  const urgencyIndicators: string[] =
    result.urgency_indicators || result.urgency_analysis?.urgency_indicators || [];

  const priorityIndicators: string[] =
    result.priority_indicators || result.context_classification?.subcategories || [];

  const deadlineMentions: string[] = result.deadline_mentions || [];

  const taskSuggestions: string[] = Array.isArray(result.task_suggestions)
    ? (typeof result.task_suggestions[0] === 'string'
        ? result.task_suggestions
        : result.task_suggestions.map((t: any) => t?.title || t?.suggestion || t?.text || JSON.stringify(t)))
    : [];

  const sentimentLabel = numericSentiment !== null
    ? (numericSentiment > 0.1 ? 'Positive' : numericSentiment < -0.1 ? 'Negative' : 'Neutral')
    : (overallSentiment ? overallSentiment.charAt(0).toUpperCase() + overallSentiment.slice(1) : 'Neutral');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-semibold text-gray-900">AI Analysis</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="space-y-4 p-4">
          {/* Sentiment */}
          {(numericSentiment !== null || overallSentiment) && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sentiment:</span>
              <span className={`text-sm font-medium ${
                numericSentiment !== null
                  ? (numericSentiment > 0.1 ? 'text-green-600' : numericSentiment < -0.1 ? 'text-red-600' : 'text-gray-700')
                  : (overallSentiment === 'positive' ? 'text-green-600' : overallSentiment === 'negative' ? 'text-red-600' : 'text-gray-700')
              }`}>
                {sentimentLabel}{numericSentiment !== null ? ` (${numericSentiment.toFixed(2)})` : ''}
              </span>
            </div>
          )}

          {/* Keywords */}
          {keywords?.length > 0 && (
            <div>
              <div className="mb-1 text-sm font-medium text-gray-700">Keywords</div>
              <div className="flex flex-wrap gap-1">
                {keywords.slice(0, 20).map((k: string, i: number) => (
                  <span key={i} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-800">{k}</span>
                ))}
              </div>
            </div>
          )}

          {/* Urgency */}
          {urgencyIndicators?.length > 0 && (
            <div>
              <div className="mb-1 text-sm font-medium text-gray-700">Urgency indicators</div>
              <div className="flex flex-wrap gap-1">
                {urgencyIndicators.map((u: string, i: number) => (
                  <span key={i} className="rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-800">{u}</span>
                ))}
              </div>
            </div>
          )}

          {/* Priority indicators */}
          {priorityIndicators?.length > 0 && (
            <div>
              <div className="mb-1 text-sm font-medium text-gray-700">Priority indicators</div>
              <div className="flex flex-wrap gap-1">
                {priorityIndicators.map((p: string, i: number) => (
                  <span key={i} className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-800">{p}</span>
                ))}
              </div>
            </div>
          )}

          {/* Deadline mentions */}
          {deadlineMentions?.length > 0 && (
            <div>
              <div className="mb-1 text-sm font-medium text-gray-700">Deadline mentions</div>
              <div className="flex flex-wrap gap-1">
                {deadlineMentions.map((d: string, i: number) => (
                  <span key={i} className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">{d}</span>
                ))}
              </div>
            </div>
          )}

          {/* Task suggestions */}
          {taskSuggestions?.length > 0 && (
            <div>
              <div className="mb-1 text-sm font-medium text-gray-700">Task suggestions</div>
              <ul className="list-disc pl-5 text-sm text-gray-800">
                {taskSuggestions.map((t: string, i: number) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t p-4">
          <button onClick={onClose} className="rounded-md border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>
  );
}