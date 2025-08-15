from django.urls import path
from . import views

urlpatterns = [
    path('analyze-context/', views.analyze_context, name='analyze_context'),
    path('prioritize-tasks/', views.prioritize_tasks, name='prioritize_tasks'),
    path('suggest-deadline/', views.suggest_deadline, name='suggest_deadline'),
    path('categorize-task/', views.categorize_task, name='categorize_task'),
    path('enhance-task/', views.enhance_task, name='enhance_task'),
    path('daily-summary/', views.daily_summary, name='daily_summary'),
    path('schedule-suggestions/', views.schedule_suggestions, name='schedule_suggestions'),
    path('time-blocking/', views.time_blocking_suggestions, name='time_blocking_suggestions'),
]