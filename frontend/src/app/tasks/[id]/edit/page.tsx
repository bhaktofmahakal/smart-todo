'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useTasks } from '@/hooks/useTasks';
import { useAIAnalysis } from '@/hooks/useAI';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import {
  Save,
  ArrowLeft,
  Brain,
  Calendar,
  Tag,
  Loader2,
  Sparkles,
  Clock,
} from 'lucide-react';
// Import types for task editing
import { Task, TaskUpdate, Category, Tag as TagType } from '@/types';
import Link from 'next/link';
import { format } from 'date-fns';

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const { user } = useAuth();
  const { updateTask } = useTasks({ autoFetch: false });
  const { suggestDeadline, categorizeTask, enhanceTask, loading: aiLoading } = useAIAnalysis();

  const [task, setTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskUpdate>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    category: null,
    tags: [],
    deadline: null,
    estimated_duration: null,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState({
    deadline: null as any,
    category: null as any,
    enhancement: null as any,
  });

  useEffect(() => {
    fetchTaskAndData();
  }, [taskId]);

  const fetchTaskAndData = async () => {
    try {
      setFetchLoading(true);
      const [taskData, categoriesData, tagsData] = await Promise.all([
        apiClient.getTask(parseInt(taskId)),
        apiClient.getCategories(),
        apiClient.getTags(),
      ]);

      console.log('Loaded task data:', taskData);
      setTask(taskData);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setTags(Array.isArray(tagsData) ? tagsData : []);

      // Populate form with existing task data
      setFormData({
        title: taskData.title || '',
        description: taskData.description || '',
        priority: taskData.priority || 'medium',
        status: taskData.status || 'pending',
        category: typeof taskData.category === 'number' ? taskData.category : taskData.category?.id || null,
        tags: Array.isArray(taskData.tags) ? taskData.tags.map(tag => typeof tag === 'number' ? tag : tag.id) : [],
        deadline: taskData.deadline || null,
        estimated_duration: taskData.estimated_duration || null,
      });
    } catch (error) {
      console.error('Failed to fetch task data:', error);
      // Set empty arrays as fallback
      setCategories([]);
      setTags([]);
      router.push('/tasks');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: TaskUpdate) => ({
      ...prev,
      [name]: value === '' ? null : value,
    }));
  };

  const handleTagChange = (tagId: number, checked: boolean) => {
    setFormData((prev: TaskUpdate) => ({
      ...prev,
      tags: checked
        ? [...(prev.tags || []), tagId]
        : (prev.tags || []).filter((id: number) => id !== tagId),
    }));
  };

  const handleAISuggestions = async () => {
    if (!formData.title?.trim()) return;

    try {
      const [deadlineSuggestion, categorization, enhancement] = await Promise.all([
        suggestDeadline(formData.title, formData.description || '', user?.id),
        categorizeTask(formData.title, formData.description || ''),
        enhanceTask(formData.title, formData.description || '', user?.id),
      ]);

      setAiSuggestions({
        deadline: deadlineSuggestion,
        category: categorization,
        enhancement: enhancement,
      });
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
    }
  };

  const applyAISuggestion = (type: 'deadline' | 'category' | 'enhancement') => {
    switch (type) {
      case 'deadline':
        if (aiSuggestions.deadline?.suggested_deadline) {
          try {
            // Ensure the deadline is in the correct format for datetime-local input
            const deadlineDate = new Date(aiSuggestions.deadline.suggested_deadline);
            const formattedDeadline = deadlineDate.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm format
            
            setFormData((prev: TaskUpdate) => ({
              ...prev,
              deadline: formattedDeadline,
            }));
          } catch (error) {
            console.error('Error formatting deadline:', error);
            // Fallback to original value
            setFormData((prev: TaskUpdate) => ({
              ...prev,
              deadline: aiSuggestions.deadline.suggested_deadline,
            }));
          }
        }
        break;
      case 'category':
        if (aiSuggestions.category?.suggested_category) {
          let category = categories.find((c: Category) => c.name.toLowerCase() === aiSuggestions.category.suggested_category.toLowerCase());
          
          // If exact match not found, try partial matching
          if (!category) {
            const suggestedLower = aiSuggestions.category.suggested_category.toLowerCase();
            category = categories.find((c: Category) => 
              c.name.toLowerCase().includes(suggestedLower) || 
              suggestedLower.includes(c.name.toLowerCase())
            );
          }
          
          // If still no match and suggestion is "general", default to "Personal"
          if (!category && aiSuggestions.category.suggested_category.toLowerCase() === 'general') {
            category = categories.find((c: Category) => c.name.toLowerCase() === 'personal');
          }
          
          if (category) {
            setFormData((prev: TaskUpdate) => ({
              ...prev,
              category: category.id,
            }));
          }
        }
        break;
      case 'enhancement':
        if (aiSuggestions.enhancement?.enhanced_description) {
          setFormData((prev: TaskUpdate) => ({
            ...prev,
            description: aiSuggestions.enhancement.enhanced_description,
          }));
        }
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up form data - remove undefined values and ensure proper types
      const cleanFormData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          // Handle tags array specifically
          if (key === 'tags') {
            acc[key] = Array.isArray(value) ? value : [];
          } 
          // Handle estimated_duration - convert hours to duration string
          else if (key === 'estimated_duration' && value && value !== '') {
            const hours = parseFloat(value as string);
            if (!isNaN(hours) && hours > 0) {
              // Convert hours to HH:MM:SS format
              const totalMinutes = Math.round(hours * 60);
              const h = Math.floor(totalMinutes / 60);
              const m = totalMinutes % 60;
              acc[key] = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
            }
          } else {
            acc[key] = value;
          }
        }
        return acc;
      }, {} as any);
      
      // Ensure tags is always an array
      if (!cleanFormData.tags) {
        cleanFormData.tags = [];
      }
      
      console.log('Submitting form data:', cleanFormData);
      const updatedTask = await updateTask(parseInt(taskId), cleanFormData);
      if (updatedTask) {
        router.push('/tasks');
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      console.error('Form data that failed:', formData);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
            <p className="mt-2 text-sm text-gray-600">Loading task...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!task) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <p className="text-red-600">Task not found</p>
          <Link href="/tasks" className="text-blue-600 hover:underline">
            Back to Tasks
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/tasks"
              className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Tasks
            </Link>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Edit Task</h1>
          <p className="mt-1 text-sm text-gray-600">
            Update task details with AI-powered suggestions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Task Details</h2>
                
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter task title"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter task description"
                    />
                  </div>

                  {/* Priority and Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a category</option>
                      {Array.isArray(categories) && categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tags */}
                  {Array.isArray(tags) && tags.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <label key={tag.id} className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={(formData.tags || []).includes(tag.id)}
                              onChange={(e) => handleTagChange(tag.id, e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-700">{tag.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Deadline */}
                  <div>
                    <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                      Deadline
                    </label>
                    <input
                      type="datetime-local"
                      id="deadline"
                      name="deadline"
                      value={formData.deadline ? format(new Date(formData.deadline), "yyyy-MM-dd'T'HH:mm") : ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Estimated Duration */}
                  <div>
                    <label htmlFor="estimated_duration" className="block text-sm font-medium text-gray-700">
                      Estimated Duration (hours)
                    </label>
                    <input
                      type="number"
                      id="estimated_duration"
                      name="estimated_duration"
                      min="0.5"
                      step="0.5"
                      value={formData.estimated_duration || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 2.5"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <Link
                  href="/tasks"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Update Task
                </button>
              </div>
            </form>
          </div>

          {/* AI Suggestions Sidebar */}
          <div className="space-y-6">
            {/* AI Suggestions Trigger */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">AI Assistance</h3>
              <button
                type="button"
                onClick={handleAISuggestions}
                disabled={!formData.title?.trim() || aiLoading}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {aiLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4 mr-2" />
                )}
                Get AI Suggestions
              </button>
            </div>

            {/* AI Suggestions Results */}
            {(aiSuggestions.deadline || aiSuggestions.category || aiSuggestions.enhancement) && (
              <div className="space-y-4">
                {/* Deadline Suggestion */}
                {aiSuggestions.deadline && (
                  <div className="bg-white shadow rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Deadline Suggestion
                      </h4>
                      <button
                        onClick={() => applyAISuggestion('deadline')}
                        className="text-xs text-blue-600 hover:text-blue-500"
                      >
                        Apply
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {format(new Date(aiSuggestions.deadline.suggested_deadline), 'PPP')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {aiSuggestions.deadline.reasoning}
                    </p>
                  </div>
                )}

                {/* Category Suggestion */}
                {aiSuggestions.category && (
                  <div className="bg-white shadow rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 flex items-center">
                        <Tag className="h-4 w-4 mr-1" />
                        Category Suggestion
                      </h4>
                      <button
                        onClick={() => applyAISuggestion('category')}
                        className="text-xs text-blue-600 hover:text-blue-500"
                      >
                        Apply
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {aiSuggestions.category.suggested_category}
                    </p>
                    <p className="text-xs text-gray-500">
                      {aiSuggestions.category.reasoning}
                    </p>
                  </div>
                )}

                {/* Enhancement Suggestion */}
                {aiSuggestions.enhancement && (
                  <div className="bg-white shadow rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 flex items-center">
                        <Sparkles className="h-4 w-4 mr-1" />
                        Enhanced Description
                      </h4>
                      <button
                        onClick={() => applyAISuggestion('enhancement')}
                        className="text-xs text-blue-600 hover:text-blue-500"
                      >
                        Apply
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">
                      {aiSuggestions.enhancement.enhanced_description}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}