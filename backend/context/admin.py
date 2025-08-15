from django.contrib import admin
from .models import ContextEntry, ContextInsight, DailyContextSummary


@admin.register(ContextEntry)
class ContextEntryAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'source_type', 'content_preview', 'relevance_score',
        'sentiment_score', 'is_processed', 'created_at'
    ]
    list_filter = ['source_type', 'is_processed', 'created_at']
    search_fields = ['content', 'keywords', 'user__username']
    readonly_fields = [
        'processed_insights', 'keywords', 'sentiment_score',
        'urgency_indicators', 'relevance_score', 'created_at', 'updated_at'
    ]
    filter_horizontal = ['related_tasks']
    
    def content_preview(self, obj):
        return obj.content[:100] + "..." if len(obj.content) > 100 else obj.content
    content_preview.short_description = 'Content Preview'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'source_type', 'content', 'original_timestamp')
        }),
        ('AI Processing', {
            'fields': (
                'is_processed', 'processed_insights', 'keywords',
                'sentiment_score', 'urgency_indicators', 'relevance_score'
            ),
            'classes': ('collapse',)
        }),
        ('Relations', {
            'fields': ('related_tasks',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(ContextInsight)
class ContextInsightAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'insight_type', 'confidence_score', 
        'is_applied', 'created_at'
    ]
    list_filter = ['insight_type', 'is_applied', 'created_at']
    search_fields = ['title', 'description', 'context_entry__content']
    readonly_fields = ['created_at', 'applied_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('context_entry', 'insight_type', 'title', 'description')
        }),
        ('AI Analysis', {
            'fields': ('confidence_score', 'suggested_action')
        }),
        ('Status', {
            'fields': ('is_applied', 'applied_at')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        })
    )


@admin.register(DailyContextSummary)
class DailyContextSummaryAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'date', 'total_entries', 'high_priority_indicators',
        'new_task_suggestions', 'created_at'
    ]
    list_filter = ['date', 'created_at']
    search_fields = ['user__username', 'summary_text']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'date')
        }),
        ('Statistics', {
            'fields': (
                'total_entries', 'high_priority_indicators',
                'new_task_suggestions', 'deadline_mentions'
            )
        }),
        ('AI Summary', {
            'fields': (
                'summary_text', 'key_themes', 'priority_areas',
                'recommended_actions', 'schedule_suggestions'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        })
    )
