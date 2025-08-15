from django.contrib import admin
from .models import Task, Category, Tag, TaskHistory


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'color', 'usage_frequency', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name']
    ordering = ['-usage_frequency', 'name']


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'color', 'usage_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name']
    ordering = ['-usage_count', 'name']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'user', 'priority', 'ai_priority_score', 
        'status', 'category', 'deadline', 'created_at'
    ]
    list_filter = [
        'status', 'priority', 'category', 'created_at', 'deadline'
    ]
    search_fields = ['title', 'description', 'user__username']
    filter_horizontal = ['tags']
    readonly_fields = [
        'ai_priority_score', 'ai_priority_reasoning', 'ai_enhanced_description',
        'ai_suggested_deadline', 'context_used', 'ai_insights', 'completed_at'
    ]
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'user', 'category', 'tags')
        }),
        ('Task Management', {
            'fields': ('status', 'priority', 'deadline', 'estimated_duration')
        }),
        ('AI Enhancements', {
            'fields': (
                'ai_enhanced_description', 'ai_priority_score', 'ai_priority_reasoning',
                'ai_suggested_deadline', 'context_used', 'ai_insights'
            ),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'completed_at'),
            'classes': ('collapse',)
        })
    )
    ordering = ['-ai_priority_score', '-created_at']


@admin.register(TaskHistory)
class TaskHistoryAdmin(admin.ModelAdmin):
    list_display = ['task', 'action', 'timestamp']
    list_filter = ['action', 'timestamp']
    search_fields = ['task__title', 'action']
    readonly_fields = ['timestamp']
    ordering = ['-timestamp']
