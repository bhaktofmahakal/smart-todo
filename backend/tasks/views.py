from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.http import HttpResponse, JsonResponse
from .models import Task, Category, Tag, TaskHistory
from .serializers import (
    TaskSerializer, TaskCreateSerializer, CategorySerializer, 
    TagSerializer, TaskHistorySerializer
)
from django.db.models import Q
from datetime import datetime, timedelta
from django.utils import timezone
import json
import csv


class TaskViewSet(viewsets.ModelViewSet):
    """ViewSet for managing tasks with AI features"""
    
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'priority', 'category']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'deadline', 'ai_priority_score', 'priority']
    ordering = ['-ai_priority_score', '-created_at']
    
    def get_queryset(self):
        return Task.objects.filter(user=self.request.user).select_related('category').prefetch_related('tags')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TaskCreateSerializer
        return TaskSerializer
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get dashboard statistics"""
        queryset = self.get_queryset()
        
        stats = {
            'total_tasks': queryset.count(),
            'pending_tasks': queryset.filter(status='pending').count(),
            'in_progress_tasks': queryset.filter(status='in_progress').count(),
            'completed_tasks': queryset.filter(status='completed').count(),
            'overdue_tasks': queryset.filter(
                deadline__lt=timezone.now(),
                status__in=['pending', 'in_progress']
            ).count(),
            'high_priority_tasks': queryset.filter(
                priority__in=['high', 'urgent'],
                status__in=['pending', 'in_progress']
            ).count(),
            'tasks_due_today': queryset.filter(
                deadline__date=timezone.now().date(),
                status__in=['pending', 'in_progress']
            ).count(),
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def priority_distribution(self, request):
        """Get task priority distribution"""
        queryset = self.get_queryset().filter(status__in=['pending', 'in_progress'])
        
        distribution = {
            'urgent': queryset.filter(priority='urgent').count(),
            'high': queryset.filter(priority='high').count(),
            'medium': queryset.filter(priority='medium').count(),
            'low': queryset.filter(priority='low').count(),
        }
        
        return Response(distribution)
    
    @action(detail=False, methods=['get'])
    def upcoming_deadlines(self, request):
        """Get tasks with upcoming deadlines"""
        next_week = timezone.now() + timedelta(days=7)
        
        upcoming_tasks = self.get_queryset().filter(
            deadline__lte=next_week,
            deadline__gte=timezone.now(),
            status__in=['pending', 'in_progress']
        ).order_by('deadline')
        
        serializer = self.get_serializer(upcoming_tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """Mark task as completed"""
        task = self.get_object()
        task.status = 'completed'
        task.completed_at = timezone.now()
        task.save()
        
        # Create history entry
        TaskHistory.objects.create(
            task=task,
            action='completed',
            changes={'status': 'completed', 'completed_at': task.completed_at.isoformat()}
        )
        
        serializer = self.get_serializer(task)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def ai_analyze(self, request, pk=None):
        """Trigger AI analysis for a specific task"""
        task = self.get_object()
        
        try:
            from ai_module.gemini_client import GeminiAIClient
            from context.models import ContextEntry
            
            ai_client = GeminiAIClient()
            
            # Get recent context
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
            
            # Get AI suggestions
            enhancement = ai_client.enhance_task_description(
                task.title, task.description, context_data
            )
            
            deadline_suggestion = ai_client.suggest_deadline(
                task.title, task.description, context_data
            )
            
            categorization = ai_client.categorize_task(
                task.title, task.description,
                list(Category.objects.values_list('name', flat=True))
            )
            
            # Update task with AI insights
            task.ai_enhanced_description = enhancement.get('enhanced_description', '')
            task.ai_insights = {
                'enhancement': enhancement,
                'deadline_suggestion': deadline_suggestion,
                'categorization': categorization,
                'analyzed_at': timezone.now().isoformat()
            }
            
            # Update suggested deadline
            if deadline_suggestion.get('suggested_deadline'):
                task.ai_suggested_deadline = datetime.fromisoformat(
                    deadline_suggestion['suggested_deadline'].replace('Z', '+00:00')
                )
            
            task.save()
            
            # Create history entry
            TaskHistory.objects.create(
                task=task,
                action='ai_analyzed',
                ai_suggestions={
                    'enhancement': enhancement,
                    'deadline_suggestion': deadline_suggestion,
                    'categorization': categorization
                }
            )
            
            serializer = self.get_serializer(task)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': f'AI analysis failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def export_tasks(self, request):
        """Export tasks to CSV or JSON"""
        format_type = request.query_params.get('format', 'json')
        tasks = self.get_queryset()
        
        if format_type == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="tasks.csv"'
            
            writer = csv.writer(response)
            writer.writerow(['Title', 'Description', 'Status', 'Priority', 'Category', 'Deadline', 'Created'])
            
            for task in tasks:
                writer.writerow([
                    task.title,
                    task.description,
                    task.status,
                    task.priority,
                    task.category.name if task.category else '',
                    task.deadline.strftime('%Y-%m-%d') if task.deadline else '',
                    task.created_at.strftime('%Y-%m-%d %H:%M')
                ])
            
            return response
        
        else:  # JSON format
            serializer = self.get_serializer(tasks, many=True)
            response = HttpResponse(
                json.dumps(serializer.data, indent=2, default=str),
                content_type='application/json'
            )
            response['Content-Disposition'] = 'attachment; filename="tasks.json"'
            return response
    
    @action(detail=False, methods=['post'])
    def import_tasks(self, request):
        """Import tasks from JSON"""
        try:
            tasks_data = request.data.get('tasks', [])
            imported_count = 0
            errors = []
            
            for task_data in tasks_data:
                try:
                    # Set user for the task
                    task_data['user'] = request.user.id
                    
                    # Handle category
                    if 'category' in task_data and isinstance(task_data['category'], str):
                        category, created = Category.objects.get_or_create(
                            name=task_data['category']
                        )
                        task_data['category'] = category.id
                    
                    serializer = TaskCreateSerializer(data=task_data, context={'request': request})
                    if serializer.is_valid():
                        serializer.save()
                        imported_count += 1
                    else:
                        errors.append(f"Task '{task_data.get('title', 'Unknown')}': {serializer.errors}")
                        
                except Exception as e:
                    errors.append(f"Task '{task_data.get('title', 'Unknown')}': {str(e)}")
            
            return Response({
                'imported_count': imported_count,
                'errors': errors,
                'message': f'Successfully imported {imported_count} tasks'
            })
            
        except Exception as e:
            return Response(
                {'error': f'Import failed: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for managing task categories"""
    
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    ordering = ['-usage_frequency', 'name']
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get most popular categories"""
        popular_categories = self.get_queryset().filter(usage_frequency__gt=0)[:10]
        serializer = self.get_serializer(popular_categories, many=True)
        return Response(serializer.data)


class TagViewSet(viewsets.ModelViewSet):
    """ViewSet for managing task tags"""
    
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated]
    ordering = ['-usage_count', 'name']
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get most popular tags"""
        popular_tags = self.get_queryset().filter(usage_count__gt=0)[:20]
        serializer = self.get_serializer(popular_tags, many=True)
        return Response(serializer.data)


class TaskHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing task history"""
    
    serializer_class = TaskHistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return TaskHistory.objects.filter(
            task__user=self.request.user
        ).select_related('task')


# Test views to debug the issue
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_categories(request):
    """Test endpoint for categories"""
    try:
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response({
            'count': categories.count(),
            'data': serializer.data
        })
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_tags(request):
    """Test endpoint for tags"""
    try:
        tags = Tag.objects.all()
        serializer = TagSerializer(tags, many=True)
        return Response({
            'count': tags.count(),
            'data': serializer.data
        })
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=500)
