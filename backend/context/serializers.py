from rest_framework import serializers
from .models import ContextEntry, ContextInsight, DailyContextSummary


class ContextEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContextEntry
        fields = [
            'id', 'user', 'source_type', 'content', 'processed_insights',
            'keywords', 'sentiment_score', 'urgency_indicators',
            'original_timestamp', 'created_at', 'updated_at',
            'is_processed', 'relevance_score', 'related_tasks'
        ]
        read_only_fields = [
            'user', 'processed_insights', 'keywords', 'sentiment_score',
            'urgency_indicators', 'created_at', 'updated_at', 'is_processed',
            'relevance_score', 'related_tasks'
        ]
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ContextEntryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating context entries with AI processing"""
    process_with_ai = serializers.BooleanField(default=True, write_only=True)
    
    class Meta:
        model = ContextEntry
        fields = [
            'id', 'source_type', 'content', 'original_timestamp', 'process_with_ai'
        ]
        read_only_fields = ['id']
    
    def create(self, validated_data):
        process_with_ai = validated_data.pop('process_with_ai', True)
        validated_data['user'] = self.context['request'].user
        
        context_entry = super().create(validated_data)
        
        # Process with AI if requested
        if process_with_ai:
            from ai_module.gemini_client import GeminiAIClient
            
            try:
                ai_client = GeminiAIClient()
                analysis = ai_client.analyze_context(
                    context_entry.content, 
                    context_entry.source_type
                )
                
                # Update context entry with AI analysis
                context_entry.processed_insights = analysis
                context_entry.keywords = analysis.get('keywords', [])
                context_entry.sentiment_score = analysis.get('sentiment_score', 0.5)
                context_entry.urgency_indicators = analysis.get('urgency_indicators', [])
                context_entry.relevance_score = analysis.get('relevance_score', 0.5)
                context_entry.is_processed = True
                context_entry.save()
                
                # Create insights from AI analysis
                for insight_data in analysis.get('insights', []):
                    ContextInsight.objects.create(
                        context_entry=context_entry,
                        insight_type=insight_data.get('type', 'general'),
                        title=insight_data.get('title', ''),
                        description=insight_data.get('description', ''),
                        confidence_score=insight_data.get('confidence', 0.5),
                        suggested_action=insight_data.get('suggested_action', {})
                    )
                
                # Create suggested tasks if any
                from tasks.models import Task, Category
                for task_suggestion in analysis.get('task_suggestions', []):
                    # Get or create category
                    category = None
                    if task_suggestion.get('category'):
                        category, created = Category.objects.get_or_create(
                            name=task_suggestion['category'],
                            defaults={'color': '#3B82F6'}
                        )
                    
                    # Create suggested task
                    suggested_task = Task.objects.create(
                        user=context_entry.user,
                        title=task_suggestion.get('title', ''),
                        description=task_suggestion.get('description', ''),
                        priority=task_suggestion.get('priority', 'medium'),
                        category=category,
                        context_used={'source_context_id': context_entry.id},
                        ai_insights={'created_from_context': True, 'suggestion_data': task_suggestion}
                    )
                    
                    # Link task to context entry
                    context_entry.related_tasks.add(suggested_task)
                
            except Exception as e:
                print(f"AI processing failed: {e}")
                # Continue with basic context entry creation
        
        return context_entry


class ContextInsightSerializer(serializers.ModelSerializer):
    context_entry_content = serializers.CharField(source='context_entry.content', read_only=True)
    
    class Meta:
        model = ContextInsight
        fields = [
            'id', 'context_entry', 'context_entry_content', 'insight_type',
            'title', 'description', 'confidence_score', 'suggested_action',
            'is_applied', 'applied_at', 'created_at'
        ]
        read_only_fields = ['created_at']


class DailyContextSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyContextSummary
        fields = [
            'id', 'user', 'date', 'total_entries', 'high_priority_indicators',
            'new_task_suggestions', 'deadline_mentions', 'summary_text',
            'key_themes', 'priority_areas', 'recommended_actions',
            'schedule_suggestions', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']