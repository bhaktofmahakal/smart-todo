from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    """Task categories and tags"""
    name = models.CharField(max_length=100, unique=True)
    color = models.CharField(max_length=7, default='#3B82F6')  # Hex color
    usage_frequency = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['-usage_frequency', 'name']
    
    def __str__(self):
        return self.name


class Task(models.Model):
    """Main task model with AI-enhanced features"""
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Basic task information
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # AI-enhanced fields
    ai_enhanced_description = models.TextField(blank=True, help_text="AI-generated enhanced description")
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    ai_priority_score = models.FloatField(default=0.5, help_text="AI-calculated priority score (0-1)")
    ai_priority_reasoning = models.TextField(blank=True, help_text="AI reasoning for priority")
    
    # Task management
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    tags = models.ManyToManyField('Tag', blank=True)
    
    # Deadlines and scheduling
    deadline = models.DateTimeField(null=True, blank=True)
    ai_suggested_deadline = models.DateTimeField(null=True, blank=True)
    estimated_duration = models.DurationField(null=True, blank=True, help_text="Estimated time to complete")
    
    # User and timestamps
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Context and AI insights
    context_used = models.JSONField(default=dict, blank=True, help_text="Context data used for AI analysis")
    ai_insights = models.JSONField(default=dict, blank=True, help_text="AI-generated insights and suggestions")
    
    class Meta:
        ordering = ['-ai_priority_score', '-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['priority', 'deadline']),
            models.Index(fields=['ai_priority_score']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.get_priority_display()})"
    
    def save(self, *args, **kwargs):
        # Update category usage frequency
        if self.category:
            self.category.usage_frequency += 1
            self.category.save()
        
        # Set completed_at when status changes to completed
        if self.status == 'completed' and not self.completed_at:
            from django.utils import timezone
            self.completed_at = timezone.now()
        
        super().save(*args, **kwargs)


class Tag(models.Model):
    """Task tags for better organization"""
    name = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=7, default='#6B7280')  # Hex color
    usage_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-usage_count', 'name']
    
    def __str__(self):
        return self.name


class TaskHistory(models.Model):
    """Track task changes and AI suggestions history"""
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='history')
    action = models.CharField(max_length=50)  # created, updated, ai_analyzed, etc.
    changes = models.JSONField(default=dict)
    ai_suggestions = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = "Task histories"
    
    def __str__(self):
        return f"{self.task.title} - {self.action} at {self.timestamp}"
