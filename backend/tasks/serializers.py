from rest_framework import serializers
from .models import Task, Category, Tag, TaskHistory


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'color', 'usage_frequency', 'created_at']
        read_only_fields = ['usage_frequency', 'created_at']


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'color', 'usage_count', 'created_at']
        read_only_fields = ['usage_count', 'created_at']


class TaskSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    tags_list = TagSerializer(source='tags', many=True, read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'ai_enhanced_description',
            'priority', 'ai_priority_score', 'ai_priority_reasoning',
            'status', 'category', 'category_name', 'tags', 'tags_list',
            'deadline', 'ai_suggested_deadline', 'estimated_duration',
            'user', 'created_at', 'updated_at', 'completed_at',
            'context_used', 'ai_insights'
        ]
        read_only_fields = [
            'user', 'created_at', 'updated_at', 'completed_at',
            'ai_priority_score', 'ai_priority_reasoning', 'ai_enhanced_description',
            'ai_suggested_deadline', 'context_used', 'ai_insights'
        ]
    
    def create(self, validated_data):
        # Set user from request
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class TaskCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating tasks with AI enhancement"""
    enhance_with_ai = serializers.BooleanField(default=False, write_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'priority', 'status', 'category',
            'deadline', 'estimated_duration', 'enhance_with_ai'
        ]
        read_only_fields = ['id']
    
    def create(self, validated_data):
        enhance_with_ai = validated_data.pop('enhance_with_ai', False)
        validated_data['user'] = self.context['request'].user
        
        task = super().create(validated_data)
        
        # If AI enhancement is requested, trigger AI analysis
        if enhance_with_ai:
            from ai_module.gemini_client import GeminiAIClient
            from context.models import ContextEntry
            
            try:
                ai_client = GeminiAIClient()
                
                # Get recent context for the user
                context_entries = ContextEntry.objects.filter(
                    user=task.user
                ).order_by('-created_at')[:5]
                
                context_data = [
                    {
                        'content': entry.content,
                        'source_type': entry.source_type
                    }
                    for entry in context_entries
                ]
                
                # Enhance description
                enhancement = ai_client.enhance_task_description(
                    task.title, task.description, context_data
                )
                task.ai_enhanced_description = enhancement.get('enhanced_description', '')
                
                # Suggest deadline if not provided
                if not task.deadline:
                    deadline_suggestion = ai_client.suggest_deadline(
                        task.title, task.description, context_data
                    )
                    if deadline_suggestion.get('suggested_deadline'):
                        from datetime import datetime
                        task.ai_suggested_deadline = datetime.fromisoformat(
                            deadline_suggestion['suggested_deadline'].replace('Z', '+00:00')
                        )
                
                # Get category suggestion if not provided
                if not task.category:
                    existing_categories = list(
                        Category.objects.values_list('name', flat=True)
                    )
                    categorization = ai_client.categorize_task(
                        task.title, task.description, existing_categories
                    )
                    
                    category_name = categorization.get('suggested_category')
                    if category_name:
                        category, created = Category.objects.get_or_create(
                            name=category_name,
                            defaults={'color': '#3B82F6'}
                        )
                        task.category = category
                
                # Store AI insights
                task.ai_insights = {
                    'enhancement': enhancement,
                    'deadline_suggestion': deadline_suggestion if 'deadline_suggestion' in locals() else {},
                    'categorization': categorization if 'categorization' in locals() else {}
                }
                
                task.save()
                
            except Exception as e:
                # If AI enhancement fails, continue with basic task creation
                print(f"AI enhancement failed: {e}")
        
        return task


class TaskHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskHistory
        fields = ['id', 'task', 'action', 'changes', 'ai_suggestions', 'timestamp']
        read_only_fields = ['timestamp']