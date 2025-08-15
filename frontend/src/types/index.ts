// Types for the Smart Todo application

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  usage_frequency: number;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  usage_count: number;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  ai_enhanced_description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  ai_priority_score: number;
  ai_priority_reasoning: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  category: Category | null;
  tags: Tag[];
  deadline: string | null;
  ai_suggested_deadline: string | null;
  estimated_duration: string | null;
  user: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  context_used: Record<string, any>;
  ai_insights: Record<string, any>;
}

export interface TaskCreate {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  category?: number | null;
  tags?: number[];
  deadline?: string | null;
  estimated_duration?: string | null;
}

// Interface for updating existing tasks
export interface TaskUpdate {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  category?: number | null;
  tags?: number[];
  deadline?: string | null;
  estimated_duration?: string | null;
}

export interface ContextEntry {
  id: number;
  user: number;
  source_type: 'whatsapp' | 'email' | 'notes' | 'calendar' | 'manual';
  content: string;
  processed_insights: Record<string, any>;
  keywords: string[];
  sentiment_score: number | null;
  urgency_indicators: string[];
  original_timestamp: string | null;
  created_at: string;
  updated_at: string;
  is_processed: boolean;
  relevance_score: number;
  related_tasks: number[];
}

export interface ContextCreate {
  source_type: 'whatsapp' | 'email' | 'notes' | 'calendar' | 'manual';
  content: string;
  original_timestamp?: string | null;
}

export interface DashboardStats {
  total_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  high_priority_tasks: number;
  tasks_due_today: number;
}

export interface PriorityDistribution {
  urgent: number;
  high: number;
  medium: number;
  low: number;
}

export interface AIAnalysis {
  enhanced_description?: string;
  priority_score?: number;
  priority_reasoning?: string;
  suggested_deadline?: string;
  category_suggestions?: string[];
  insights?: Record<string, any>;
}

export interface AIContextAnalysis {
  keywords: string[];
  sentiment_score: number;
  urgency_indicators: string[];
  task_suggestions: string[];
  priority_indicators: string[];
  deadline_mentions: string[];
}

export interface AITaskPrioritization {
  task_priorities: Array<{
    task_id: number;
    priority_score: number;
    reasoning: string;
    suggested_priority: string;
  }>;
  overall_insights: string;
  recommendations: string[];
}

export interface AIDeadlineSuggestion {
  suggested_deadline: string;
  reasoning: string;
  confidence_score: number;
  factors_considered: string[];
}

export interface AICategorization {
  suggested_category: string;
  confidence_score: number;
  alternative_categories: string[];
  reasoning: string;
}

export interface AITaskEnhancement {
  enhanced_description: string;
  additional_details: string[];
  context_insights: string[];
  improvement_suggestions: string[];
}

export interface DailySummary {
  summary: string;
  key_themes: string[];
  priority_areas: string[];
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    urgency: string;
  }>;
  schedule_suggestions: Array<{
    time_slot: string;
    activity: string;
    reasoning: string;
  }>;
  // Legacy properties for backward compatibility
  date?: string;
  total_context_entries?: number;
  task_suggestions?: string[];
  schedule_recommendations?: string[];
  summary_text?: string;
  recommended_actions?: Array<{
    type: string;
    title: string;
    description: string;
    urgency: string;
  }>;
}

export interface ScheduleSuggestion {
  task_id: number;
  suggested_time_slot: string;
  duration: number;
  reasoning: string;
  priority_score: number;
}

export interface TimeBlock {
  start_time: string;
  end_time: string;
  task_id: number;
  task_title: string;
  priority: string;
  estimated_duration: number;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface APIResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}