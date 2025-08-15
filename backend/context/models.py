from django.db import models
from django.contrib.auth.models import User


class ContextEntry(models.Model):
    """Store daily context data for AI analysis"""
    
    SOURCE_CHOICES = [
        ('whatsapp', 'WhatsApp'),
        ('email', 'Email'),
        ('notes', 'Notes'),
        ('calendar', 'Calendar'),
        ('manual', 'Manual Entry'),
    ]
    
    # Basic information
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='context_entries')
    source_type = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    content = models.TextField(help_text="Raw context content")
    
    # AI processing
    processed_insights = models.JSONField(default=dict, blank=True, help_text="AI-extracted insights")
    keywords = models.JSONField(default=list, blank=True, help_text="Extracted keywords")
    sentiment_score = models.FloatField(null=True, blank=True, help_text="Sentiment analysis score (-1 to 1)")
    urgency_indicators = models.JSONField(default=list, blank=True, help_text="Detected urgency keywords/phrases")
    
    # Metadata
    original_timestamp = models.DateTimeField(null=True, blank=True, help_text="Original timestamp from source")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_processed = models.BooleanField(default=False)
    
    # Context relevance
    relevance_score = models.FloatField(default=0.0, help_text="AI-calculated relevance for task management")
    related_tasks = models.ManyToManyField('tasks.Task', blank=True, help_text="Tasks related to this context")
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'source_type']),
            models.Index(fields=['created_at']),
            models.Index(fields=['relevance_score']),
        ]
    
    def __str__(self):
        return f"{self.get_source_type_display()} - {self.content[:50]}..."


class ContextInsight(models.Model):
    """Store AI-generated insights from context analysis"""
    
    INSIGHT_TYPES = [
        ('deadline', 'Deadline Suggestion'),
        ('priority', 'Priority Indication'),
        ('category', 'Category Suggestion'),
        ('task_creation', 'New Task Suggestion'),
        ('schedule', 'Schedule Conflict'),
        ('reminder', 'Reminder Needed'),
    ]
    
    context_entry = models.ForeignKey(ContextEntry, on_delete=models.CASCADE, related_name='insights')
    insight_type = models.CharField(max_length=20, choices=INSIGHT_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    confidence_score = models.FloatField(help_text="AI confidence in this insight (0-1)")
    
    # Action suggestions
    suggested_action = models.JSONField(default=dict, help_text="Suggested actions based on insight")
    is_applied = models.BooleanField(default=False)
    applied_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-confidence_score', '-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.get_insight_type_display()})"


class DailyContextSummary(models.Model):
    """Daily summary of context analysis for better task management"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='daily_summaries')
    date = models.DateField()
    
    # Summary data
    total_entries = models.IntegerField(default=0)
    high_priority_indicators = models.IntegerField(default=0)
    new_task_suggestions = models.IntegerField(default=0)
    deadline_mentions = models.IntegerField(default=0)
    
    # AI-generated summary
    summary_text = models.TextField(blank=True)
    key_themes = models.JSONField(default=list, blank=True)
    priority_areas = models.JSONField(default=list, blank=True)
    
    # Recommendations
    recommended_actions = models.JSONField(default=list, blank=True)
    schedule_suggestions = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.user.username} - {self.date}"
