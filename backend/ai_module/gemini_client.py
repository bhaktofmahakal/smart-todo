import google.generativeai as genai
from django.conf import settings
import json
import re
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional


class GeminiAIClient:
    """Gemini AI client for Smart Todo List features"""
    
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        # self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.model = genai.GenerativeModel('gemini-2.0-flash')
    
    def analyze_context(self, context_content: str, source_type: str) -> Dict[str, Any]:
        """Advanced context analysis with sentiment analysis and keyword extraction"""
        
        # Get current date and time
        current_datetime = datetime.now()
        
        prompt = f"""
        CURRENT DATE AND TIME: {current_datetime.strftime("%Y-%m-%d %H:%M:%S")} (Use this as reference for time-sensitive analysis)
        
        Perform advanced analysis of the following {source_type} content for intelligent task management:
        
        Content: "{context_content}"
        
        Please provide a comprehensive JSON response with the following structure:
        {{
            "keywords": ["extracted", "relevant", "keywords", "from", "content"],
            "sentiment_analysis": {{
                "overall_sentiment": "positive|negative|neutral",
                "sentiment_score": 0.5,
                "emotional_indicators": ["stressed", "excited", "urgent", "calm"],
                "confidence": 0.9
            }},
            "urgency_analysis": {{
                "urgency_level": "low|medium|high|critical",
                "urgency_score": 0.7,
                "urgency_indicators": ["urgent", "asap", "deadline", "immediately"],
                "time_sensitivity": "immediate|today|this_week|flexible"
            }},
            "context_classification": {{
                "primary_category": "work|personal|health|finance|social|education",
                "subcategories": ["meeting", "project", "appointment"],
                "relevance_score": 0.8
            }},
            "task_extraction": {{
                "potential_tasks": [
                    {{
                        "title": "Extracted task title",
                        "description": "Task description",
                        "priority": "low|medium|high|urgent",
                        "category": "suggested category",
                        "deadline": "2024-01-15T10:00:00Z",
                        "confidence": 0.8
                    }}
                ]
            }},
            "insights": [
                {{
                    "type": "deadline|priority|category|task_creation|schedule|reminder|pattern",
                    "title": "Brief insight title",
                    "description": "Detailed description with context",
                    "confidence": 0.9,
                    "impact": "high|medium|low",
                    "suggested_action": {{
                        "action_type": "create_task|update_priority|set_deadline|schedule_reminder",
                        "details": "specific action details",
                        "parameters": {{}}
                    }}
                }}
            ],
            "task_suggestions": [
                {{
                    "title": "Suggested task title",
                    "description": "Task description",
                    "priority": "high|medium|low",
                    "category": "suggested category",
                    "deadline": "2024-01-15T10:00:00Z or null"
                }}
            ]
        }}
        
        Focus on:
        1. Identifying deadlines, meetings, appointments
        2. Detecting urgency levels and priority indicators
        3. Extracting actionable tasks
        4. Understanding context and sentiment
        5. Suggesting relevant categories
        """
        
        try:
            response = self.model.generate_content(prompt)
            # Extract JSON from response
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return self._default_context_analysis()
        except Exception as e:
            print(f"Error analyzing context: {e}")
            return self._default_context_analysis()
    
    def prioritize_tasks(self, tasks_data: List[Dict], context_data: List[Dict] = None) -> Dict[str, Any]:
        """AI-powered task prioritization based on context"""
        
        # Get current date and time
        current_datetime = datetime.now()
        
        context_summary = ""
        if context_data:
            context_summary = "\n".join([f"- {ctx.get('content', '')[:100]}" for ctx in context_data[-5:]])
        
        tasks_summary = "\n".join([
            f"- {task.get('title', '')}: {task.get('description', '')[:100]}"
            for task in tasks_data
        ])
        
        prompt = f"""
        CURRENT DATE AND TIME: {current_datetime.strftime("%Y-%m-%d %H:%M:%S")} (Use this for deadline urgency analysis)
        
        Analyze and prioritize the following tasks based on the recent context:
        
        Recent Context:
        {context_summary}
        
        Tasks to prioritize:
        {tasks_summary}
        
        Please provide a JSON response with prioritization:
        {{
            "prioritized_tasks": [
                {{
                    "task_id": "task_identifier",
                    "priority_score": 0.95,
                    "priority_level": "urgent|high|medium|low",
                    "reasoning": "Why this priority was assigned",
                    "suggested_deadline": "2024-01-15T10:00:00Z or null",
                    "estimated_duration": "2 hours",
                    "dependencies": ["other task titles if any"]
                }}
            ],
            "overall_insights": "General insights about the task load and priorities"
        }}
        
        Consider:
        1. Deadlines mentioned in context
        2. Urgency indicators
        3. Task dependencies
        4. Workload balance
        5. Context relevance
        """
        
        try:
            response = self.model.generate_content(prompt)
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return self._default_prioritization(tasks_data)
        except Exception as e:
            print(f"Error prioritizing tasks: {e}")
            return self._default_prioritization(tasks_data)
    
    def suggest_deadline(self, task_title: str, task_description: str, context_data: List[Dict] = None) -> Dict[str, Any]:
        """Suggest realistic deadlines for tasks"""
        
        # Get current date and time
        current_datetime = datetime.now()
        current_date_str = current_datetime.strftime("%Y-%m-%d")
        current_time_str = current_datetime.strftime("%H:%M")
        
        context_summary = ""
        if context_data:
            context_summary = "\n".join([f"- {ctx.get('content', '')[:100]}" for ctx in context_data[-3:]])
        
        prompt = f"""
        CURRENT DATE AND TIME: {current_datetime.strftime("%Y-%m-%d %H:%M:%S")} (Use this as reference for all suggestions)
        
        Suggest a realistic deadline for the following task based on context:
        
        Task: {task_title}
        Description: {task_description}
        
        Recent Context:
        {context_summary}
        
        Please provide a JSON response with dates AFTER the current date ({current_date_str}):
        {{
            "suggested_deadline": "{(current_datetime + timedelta(hours=2)).strftime('%Y-%m-%dT%H:%M:%S')}Z",
            "reasoning": "Why this deadline makes sense based on current time",
            "estimated_duration": "2 hours",
            "complexity_score": 0.7,
            "alternative_deadlines": [
                {{
                    "deadline": "{(current_datetime + timedelta(days=1)).strftime('%Y-%m-%dT%H:%M:%S')}Z",
                    "scenario": "If more time needed"
                }}
            ]
        }}
        
        IMPORTANT: All suggested deadlines must be AFTER {current_datetime.strftime("%Y-%m-%d %H:%M:%S")}
        
        Consider:
        1. Current date/time: {current_datetime.strftime("%Y-%m-%d %H:%M:%S")}
        2. Task complexity
        3. Mentioned deadlines in context
        4. Realistic time estimates
        5. Buffer time for unexpected issues
        """
        
        try:
            response = self.model.generate_content(prompt)
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return self._default_deadline_suggestion()
        except Exception as e:
            print(f"Error suggesting deadline: {e}")
            return self._default_deadline_suggestion()
    
    def categorize_task(self, task_title: str, task_description: str, existing_categories: List[str] = None) -> Dict[str, Any]:
        """Auto-suggest task categories and tags"""
        
        categories_list = existing_categories or []
        
        prompt = f"""
        Categorize the following task and suggest relevant tags:
        
        Task: {task_title}
        Description: {task_description}
        
        Existing Categories: {', '.join(categories_list)}
        
        Please provide a JSON response:
        {{
            "suggested_category": "Work|Personal|Health|Finance|Learning|Shopping|etc",
            "confidence": 0.9,
            "alternative_categories": ["category1", "category2"],
            "suggested_tags": ["tag1", "tag2", "tag3"],
            "reasoning": "Why these categories and tags were suggested"
        }}
        
        If the task fits an existing category, prefer that. Otherwise, suggest a new appropriate category.
        """
        
        try:
            response = self.model.generate_content(prompt)
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return self._default_categorization()
        except Exception as e:
            print(f"Error categorizing task: {e}")
            return self._default_categorization()
    
    def enhance_task_description(self, task_title: str, task_description: str, context_data: List[Dict] = None) -> Dict[str, Any]:
        """Enhance task description with context-aware details"""
        
        # Get current date and time
        current_datetime = datetime.now()
        
        context_summary = ""
        if context_data:
            context_summary = "\n".join([f"- {ctx.get('content', '')[:100]}" for ctx in context_data[-3:]])
        
        prompt = f"""
        CURRENT DATE AND TIME: {current_datetime.strftime("%Y-%m-%d %H:%M:%S")} (Use this as reference)
        
        Enhance the following task description with relevant context and details:
        
        Task: {task_title}
        Current Description: {task_description}
        
        Relevant Context:
        {context_summary}
        
        Please provide a JSON response:
        {{
            "enhanced_description": "Improved task description with current context and timing",
            "added_details": ["detail1", "detail2"],
            "suggested_subtasks": [
                {{
                    "title": "Subtask 1",
                    "description": "Subtask description"
                }}
            ],
            "resources_needed": ["resource1", "resource2"],
            "potential_blockers": ["blocker1", "blocker2"]
        }}
        
        Make the description more actionable and specific while keeping it concise.
        Consider the current time ({current_datetime.strftime("%Y-%m-%d %H:%M:%S")}) when enhancing.
        """
        
        try:
            response = self.model.generate_content(prompt)
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return self._default_enhancement(task_description)
        except Exception as e:
            print(f"Error enhancing task: {e}")
            return self._default_enhancement(task_description)
    
    def generate_daily_summary(self, context_entries: List[Dict], tasks: List[Dict]) -> Dict[str, Any]:
        """Generate daily summary and recommendations"""
        
        context_summary = "\n".join([f"- {ctx.get('content', '')[:100]}" for ctx in context_entries])
        tasks_summary = "\n".join([f"- {task.get('title', '')}" for task in tasks])
        
        prompt = f"""
        Generate a daily summary and recommendations based on:
        
        Today's Context:
        {context_summary}
        
        Current Tasks:
        {tasks_summary}
        
        Please provide a JSON response:
        {{
            "summary": "Brief summary of the day's context and tasks",
            "key_themes": ["theme1", "theme2"],
            "priority_areas": ["area1", "area2"],
            "recommendations": [
                {{
                    "type": "task_creation|priority_adjustment|schedule_change",
                    "title": "Recommendation title",
                    "description": "Detailed recommendation",
                    "urgency": "high|medium|low"
                }}
            ],
            "schedule_suggestions": [
                {{
                    "time_slot": "09:00-10:00",
                    "activity": "Suggested activity",
                    "reasoning": "Why this time slot"
                }}
            ]
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return self._default_daily_summary()
        except Exception as e:
            print(f"Error generating daily summary: {e}")
            return self._default_daily_summary()
    
    def generate_schedule_suggestions(self, tasks_data: List[Dict], context_data: List[Dict]) -> Dict[str, Any]:
        """Generate intelligent task scheduling suggestions"""
        
        prompt = f"""
        Based on the following tasks and context, create an optimal daily schedule:
        
        Tasks: {json.dumps(tasks_data, indent=2)}
        Context: {json.dumps(context_data, indent=2)}
        
        Please provide a JSON response with intelligent scheduling:
        {{
            "schedule": [
                {{
                    "time_slot": "09:00-10:30",
                    "task_id": "task_id",
                    "task_title": "Task title",
                    "duration": 90,
                    "priority": "high",
                    "reasoning": "Why this time slot is optimal",
                    "energy_level": "high|medium|low",
                    "focus_required": "high|medium|low"
                }}
            ],
            "schedule_insights": {{
                "total_scheduled_hours": 6.5,
                "high_priority_tasks": 3,
                "optimal_productivity_windows": ["09:00-11:00", "14:00-16:00"],
                "break_suggestions": ["11:00-11:15", "15:00-15:15"]
            }},
            "recommendations": [
                {{
                    "type": "scheduling|productivity|break",
                    "title": "Recommendation title",
                    "description": "Detailed recommendation"
                }}
            ]
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return self._default_schedule_suggestions(tasks_data)
        except Exception as e:
            print(f"Error generating schedule suggestions: {e}")
            return self._default_schedule_suggestions(tasks_data)
    
    def generate_time_blocks(self, tasks_data: List[Dict], available_hours: int) -> Dict[str, Any]:
        """Generate time-blocking suggestions for tasks"""
        
        prompt = f"""
        Create time-blocking suggestions for the following tasks within {available_hours} hours:
        
        Tasks: {json.dumps(tasks_data, indent=2)}
        Available Hours: {available_hours}
        
        Please provide a JSON response with time-blocking strategy:
        {{
            "time_blocks": [
                {{
                    "block_name": "Deep Work Block 1",
                    "start_time": "09:00",
                    "end_time": "11:00",
                    "duration": 120,
                    "tasks": [
                        {{
                            "task_id": "task_id",
                            "task_title": "Task title",
                            "allocated_time": 90,
                            "priority": "high"
                        }}
                    ],
                    "block_type": "deep_work|admin|creative|communication",
                    "energy_requirement": "high|medium|low",
                    "break_after": 15
                }}
            ],
            "blocking_strategy": {{
                "total_blocks": 4,
                "deep_work_blocks": 2,
                "admin_blocks": 1,
                "buffer_time": 30,
                "break_time": 45
            }},
            "productivity_tips": [
                "Schedule high-priority tasks during peak energy hours",
                "Group similar tasks together",
                "Include buffer time between blocks"
            ]
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return self._default_time_blocks(tasks_data, available_hours)
        except Exception as e:
            print(f"Error generating time blocks: {e}")
            return self._default_time_blocks(tasks_data, available_hours)
    
    # Default fallback methods
    def _default_context_analysis(self) -> Dict[str, Any]:
        return {
            "keywords": [],
            "sentiment_score": 0.5,
            "urgency_indicators": [],
            "relevance_score": 0.5,
            "insights": [],
            "task_suggestions": []
        }
    
    def _default_prioritization(self, tasks_data: List[Dict]) -> Dict[str, Any]:
        return {
            "prioritized_tasks": [
                {
                    "task_id": task.get("id", ""),
                    "priority_score": 0.5,
                    "priority_level": "medium",
                    "reasoning": "Default prioritization",
                    "suggested_deadline": None,
                    "estimated_duration": "1 hour",
                    "dependencies": []
                }
                for task in tasks_data
            ],
            "overall_insights": "Tasks prioritized with default settings"
        }
    
    def _default_deadline_suggestion(self) -> Dict[str, Any]:
        tomorrow = datetime.now() + timedelta(days=1)
        return {
            "suggested_deadline": tomorrow.isoformat(),
            "reasoning": "Default 1-day deadline",
            "estimated_duration": "1 hour",
            "complexity_score": 0.5,
            "alternative_deadlines": []
        }
    
    def _default_categorization(self) -> Dict[str, Any]:
        return {
            "suggested_category": "General",
            "confidence": 0.5,
            "alternative_categories": ["Work", "Personal"],
            "suggested_tags": ["general"],
            "reasoning": "Default categorization"
        }
    
    def _default_enhancement(self, description: str) -> Dict[str, Any]:
        return {
            "enhanced_description": description,
            "added_details": [],
            "suggested_subtasks": [],
            "resources_needed": [],
            "potential_blockers": []
        }
    
    def _default_daily_summary(self) -> Dict[str, Any]:
        return {
            "summary": "Daily summary not available",
            "key_themes": [],
            "priority_areas": [],
            "recommendations": [],
            "schedule_suggestions": []
        }
    
    def _default_schedule_suggestions(self, tasks_data: List[Dict]) -> Dict[str, Any]:
        return {
            "schedule": [
                {
                    "time_slot": "09:00-10:00",
                    "task_id": task.get("id", ""),
                    "task_title": task.get("title", "Task"),
                    "duration": 60,
                    "priority": task.get("priority", "medium"),
                    "reasoning": "Default scheduling",
                    "energy_level": "medium",
                    "focus_required": "medium"
                }
                for i, task in enumerate(tasks_data[:8])
            ],
            "schedule_insights": {
                "total_scheduled_hours": min(len(tasks_data), 8),
                "high_priority_tasks": len([t for t in tasks_data if t.get("priority") == "high"]),
                "optimal_productivity_windows": ["09:00-11:00", "14:00-16:00"],
                "break_suggestions": ["11:00-11:15", "15:00-15:15"]
            },
            "recommendations": [
                {
                    "type": "scheduling",
                    "title": "Default Schedule",
                    "description": "Basic task scheduling applied"
                }
            ]
        }
    
    def _default_time_blocks(self, tasks_data: List[Dict], available_hours: int) -> Dict[str, Any]:
        return {
            "time_blocks": [
                {
                    "block_name": f"Work Block {i+1}",
                    "start_time": f"{9+i*2:02d}:00",
                    "end_time": f"{11+i*2:02d}:00",
                    "duration": 120,
                    "tasks": [
                        {
                            "task_id": task.get("id", ""),
                            "task_title": task.get("title", "Task"),
                            "allocated_time": 90,
                            "priority": task.get("priority", "medium")
                        }
                    ],
                    "block_type": "deep_work",
                    "energy_requirement": "medium",
                    "break_after": 15
                }
                for i, task in enumerate(tasks_data[:available_hours//2])
            ],
            "blocking_strategy": {
                "total_blocks": min(len(tasks_data), available_hours//2),
                "deep_work_blocks": min(len(tasks_data), available_hours//2),
                "admin_blocks": 0,
                "buffer_time": 30,
                "break_time": 45
            },
            "productivity_tips": [
                "Default time blocking applied",
                "Consider adjusting based on your energy levels",
                "Include regular breaks between blocks"
            ]
        }