from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from tasks.models import Task, Category
from context.models import ContextEntry
from .gemini_client import GeminiAIClient
import json


@api_view(['POST'])
def analyze_context(request):
    """Analyze context content using AI"""
    try:
        content = request.data.get('content', '')
        source_type = request.data.get('source_type', 'manual')
        
        if not content:
            return Response(
                {'error': 'Content is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ai_client = GeminiAIClient()
        analysis = ai_client.analyze_context(content, source_type)
        
        return Response(analysis, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def prioritize_tasks(request):
    """Get AI-powered task prioritization"""
    try:
        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {'error': 'User ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get user's tasks
        tasks = Task.objects.filter(user_id=user_id, status__in=['pending', 'in_progress'])
        tasks_data = [
            {
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'current_priority': task.priority,
                'deadline': task.deadline.isoformat() if task.deadline else None,
                'category': task.category.name if task.category else None
            }
            for task in tasks
        ]
        
        # Get recent context
        context_entries = ContextEntry.objects.filter(
            user_id=user_id
        ).order_by('-created_at')[:10]
        
        context_data = [
            {
                'content': entry.content,
                'source_type': entry.source_type,
                'created_at': entry.created_at.isoformat()
            }
            for entry in context_entries
        ]
        
        ai_client = GeminiAIClient()
        prioritization = ai_client.prioritize_tasks(tasks_data, context_data)
        
        return Response(prioritization, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def suggest_deadline(request):
    """Get AI deadline suggestions for a task"""
    try:
        task_title = request.data.get('title', '')
        task_description = request.data.get('description', '')
        user_id = request.data.get('user_id')
        
        if not task_title:
            return Response(
                {'error': 'Task title is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        context_data = []
        if user_id:
            # Get recent context for better deadline suggestions
            context_entries = ContextEntry.objects.filter(
                user_id=user_id
            ).order_by('-created_at')[:5]
            
            context_data = [
                {
                    'content': entry.content,
                    'source_type': entry.source_type
                }
                for entry in context_entries
            ]
        
        ai_client = GeminiAIClient()
        deadline_suggestion = ai_client.suggest_deadline(
            task_title, task_description, context_data
        )
        
        return Response(deadline_suggestion, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def categorize_task(request):
    """Get AI category suggestions for a task"""
    try:
        task_title = request.data.get('title', '')
        task_description = request.data.get('description', '')
        
        if not task_title:
            return Response(
                {'error': 'Task title is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get existing categories
        existing_categories = list(
            Category.objects.values_list('name', flat=True)
        )
        
        ai_client = GeminiAIClient()
        categorization = ai_client.categorize_task(
            task_title, task_description, existing_categories
        )
        
        return Response(categorization, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def enhance_task(request):
    """Get AI-enhanced task description"""
    try:
        task_title = request.data.get('title', '')
        task_description = request.data.get('description', '')
        user_id = request.data.get('user_id')
        
        if not task_title:
            return Response(
                {'error': 'Task title is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        context_data = []
        if user_id:
            # Get relevant context
            context_entries = ContextEntry.objects.filter(
                user_id=user_id
            ).order_by('-created_at')[:5]
            
            context_data = [
                {
                    'content': entry.content,
                    'source_type': entry.source_type
                }
                for entry in context_entries
            ]
        
        ai_client = GeminiAIClient()
        enhancement = ai_client.enhance_task_description(
            task_title, task_description, context_data
        )
        
        return Response(enhancement, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def daily_summary(request):
    """Generate daily summary and recommendations"""
    try:
        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {'error': 'User ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get today's context entries
        from django.utils import timezone
        today = timezone.now().date()
        
        context_entries = ContextEntry.objects.filter(
            user_id=user_id,
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
            user_id=user_id,
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
        
        ai_client = GeminiAIClient()
        summary = ai_client.generate_daily_summary(context_data, tasks_data)
        
        return Response(summary, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def schedule_suggestions(request):
    """Generate task scheduling suggestions based on context"""
    try:
        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {'error': 'User ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get user's tasks and context
        tasks = Task.objects.filter(
            user_id=user_id,
            status__in=['pending', 'in_progress']
        ).order_by('-ai_priority_score')
        
        context_entries = ContextEntry.objects.filter(
            user_id=user_id
        ).order_by('-created_at')[:10]
        
        tasks_data = [
            {
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'priority': task.priority,
                'estimated_duration': task.estimated_duration.total_seconds() / 3600 if task.estimated_duration else 1,
                'deadline': task.deadline.isoformat() if task.deadline else None,
                'ai_priority_score': task.ai_priority_score
            }
            for task in tasks
        ]
        
        context_data = [
            {
                'content': entry.content,
                'source_type': entry.source_type,
                'created_at': entry.created_at.isoformat()
            }
            for entry in context_entries
        ]
        
        ai_client = GeminiAIClient()
        schedule = ai_client.generate_schedule_suggestions(tasks_data, context_data)
        
        return Response(schedule)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def time_blocking_suggestions(request):
    """Generate time-blocking suggestions for tasks"""
    try:
        user_id = request.data.get('user_id')
        available_hours = request.data.get('available_hours', 8)
        
        if not user_id:
            return Response(
                {'error': 'User ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get high priority tasks
        tasks = Task.objects.filter(
            user_id=user_id,
            status__in=['pending', 'in_progress']
        ).order_by('-ai_priority_score')[:10]
        
        tasks_data = [
            {
                'id': task.id,
                'title': task.title,
                'priority': task.priority,
                'estimated_duration': task.estimated_duration.total_seconds() / 3600 if task.estimated_duration else 1,
                'deadline': task.deadline.isoformat() if task.deadline else None,
                'ai_priority_score': task.ai_priority_score
            }
            for task in tasks
        ]
        
        ai_client = GeminiAIClient()
        time_blocks = ai_client.generate_time_blocks(tasks_data, available_hours)
        
        return Response(time_blocks)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
