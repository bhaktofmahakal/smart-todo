from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import ContextEntry, ContextInsight, DailyContextSummary
from .serializers import (
    ContextEntrySerializer, ContextEntryCreateSerializer,
    ContextInsightSerializer, DailyContextSummarySerializer
)
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Count, Q


class ContextEntryViewSet(viewsets.ModelViewSet):
    """ViewSet for managing daily context entries"""
    
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['source_type', 'is_processed']
    search_fields = ['content', 'keywords']
    ordering_fields = ['created_at', 'relevance_score', 'sentiment_score']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return ContextEntry.objects.filter(user=self.request.user).prefetch_related('related_tasks')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ContextEntryCreateSerializer
        return ContextEntrySerializer
    
    @action(detail=False, methods=['get'])
    def today_entries(self, request):
        """Get today's context entries"""
        today = timezone.now().date()
        today_entries = self.get_queryset().filter(created_at__date=today)
        serializer = self.get_serializer(today_entries, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def high_relevance(self, request):
        """Get high relevance context entries"""
        high_relevance = self.get_queryset().filter(relevance_score__gte=0.7)
        serializer = self.get_serializer(high_relevance, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def source_stats(self, request):
        """Get statistics by source type"""
        stats = self.get_queryset().values('source_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        return Response(stats)
    
    @action(detail=False, methods=['post'])
    def bulk_process(self, request):
        """Process multiple unprocessed entries with AI"""
        unprocessed = self.get_queryset().filter(is_processed=False)
        
        if not unprocessed.exists():
            return Response({'message': 'No unprocessed entries found'})
        
        processed_count = 0
        
        try:
            from ai_module.gemini_client import GeminiAIClient
            ai_client = GeminiAIClient()
            
            for entry in unprocessed[:10]:  # Process max 10 at a time
                try:
                    analysis = ai_client.analyze_context(entry.content, entry.source_type)
                    
                    entry.processed_insights = analysis
                    entry.keywords = analysis.get('keywords', [])
                    entry.sentiment_score = analysis.get('sentiment_score', 0.5)
                    entry.urgency_indicators = analysis.get('urgency_indicators', [])
                    entry.relevance_score = analysis.get('relevance_score', 0.5)
                    entry.is_processed = True
                    entry.save()
                    
                    processed_count += 1
                    
                except Exception as e:
                    print(f"Failed to process entry {entry.id}: {e}")
                    continue
            
            return Response({
                'message': f'Processed {processed_count} entries',
                'processed_count': processed_count
            })
            
        except Exception as e:
            return Response(
                {'error': f'Bulk processing failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def reprocess(self, request, pk=None):
        """Reprocess a specific context entry with AI"""
        entry = self.get_object()
        
        try:
            from ai_module.gemini_client import GeminiAIClient
            ai_client = GeminiAIClient()
            
            analysis = ai_client.analyze_context(entry.content, entry.source_type)
            
            entry.processed_insights = analysis
            entry.keywords = analysis.get('keywords', [])
            entry.sentiment_score = analysis.get('sentiment_score', 0.5)
            entry.urgency_indicators = analysis.get('urgency_indicators', [])
            entry.relevance_score = analysis.get('relevance_score', 0.5)
            entry.is_processed = True
            entry.save()
            
            serializer = self.get_serializer(entry)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': f'Reprocessing failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ContextInsightViewSet(viewsets.ModelViewSet):
    """ViewSet for managing context insights"""
    
    permission_classes = [IsAuthenticated]
    serializer_class = ContextInsightSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['insight_type', 'is_applied']
    ordering_fields = ['confidence_score', 'created_at']
    ordering = ['-confidence_score', '-created_at']
    
    def get_queryset(self):
        return ContextInsight.objects.filter(
            context_entry__user=self.request.user
        ).select_related('context_entry')
    
    @action(detail=False, methods=['get'])
    def high_confidence(self, request):
        """Get high confidence insights"""
        high_confidence = self.get_queryset().filter(confidence_score__gte=0.8)
        serializer = self.get_serializer(high_confidence, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unapplied(self, request):
        """Get unapplied insights"""
        unapplied = self.get_queryset().filter(is_applied=False)
        serializer = self.get_serializer(unapplied, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_applied(self, request, pk=None):
        """Mark insight as applied"""
        insight = self.get_object()
        insight.is_applied = True
        insight.applied_at = timezone.now()
        insight.save()
        
        serializer = self.get_serializer(insight)
        return Response(serializer.data)


class DailyContextSummaryViewSet(viewsets.ModelViewSet):
    """ViewSet for managing daily context summaries"""
    
    permission_classes = [IsAuthenticated]
    serializer_class = DailyContextSummarySerializer
    ordering = ['-date']
    
    def get_queryset(self):
        return DailyContextSummary.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def generate_today_summary(self, request):
        """Generate summary for today"""
        today = timezone.now().date()
        
        # Check if summary already exists
        existing_summary = self.get_queryset().filter(date=today).first()
        if existing_summary:
            serializer = self.get_serializer(existing_summary)
            return Response(serializer.data)
        
        try:
            from ai_module.gemini_client import GeminiAIClient
            from tasks.models import Task
            
            # Get today's context entries
            context_entries = ContextEntry.objects.filter(
                user=request.user,
                created_at__date=today
            )
            
            context_data = [
                {
                    'content': entry.content,
                    'source_type': entry.source_type,
                    'created_at': entry.created_at.isoformat()
                }
                for entry in context_entries
            ]
            
            # Get current tasks
            tasks = Task.objects.filter(
                user=request.user,
                status__in=['pending', 'in_progress']
            )
            
            tasks_data = [
                {
                    'title': task.title,
                    'priority': task.priority,
                    'deadline': task.deadline.isoformat() if task.deadline else None
                }
                for task in tasks
            ]
            
            # Generate AI summary
            ai_client = GeminiAIClient()
            summary_data = ai_client.generate_daily_summary(context_data, tasks_data)
            
            # Create summary object
            summary = DailyContextSummary.objects.create(
                user=request.user,
                date=today,
                total_entries=context_entries.count(),
                high_priority_indicators=len([
                    entry for entry in context_entries 
                    if entry.urgency_indicators
                ]),
                new_task_suggestions=len(summary_data.get('recommendations', [])),
                deadline_mentions=len([
                    entry for entry in context_entries 
                    if any(keyword in entry.content.lower() 
                          for keyword in ['deadline', 'due', 'by'])
                ]),
                summary_text=summary_data.get('summary', ''),
                key_themes=summary_data.get('key_themes', []),
                priority_areas=summary_data.get('priority_areas', []),
                recommended_actions=summary_data.get('recommendations', []),
                schedule_suggestions=summary_data.get('schedule_suggestions', [])
            )
            
            serializer = self.get_serializer(summary)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': f'Summary generation failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def recent_summaries(self, request):
        """Get recent summaries (last 7 days)"""
        week_ago = timezone.now().date() - timedelta(days=7)
        recent = self.get_queryset().filter(date__gte=week_ago)
        serializer = self.get_serializer(recent, many=True)
        return Response(serializer.data)
