from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, CategoryViewSet, TagViewSet, TaskHistoryViewSet, test_categories, test_tags

# Create a single router for all viewsets
router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'history', TaskHistoryViewSet, basename='taskhistory')

urlpatterns = [
    path('', include(router.urls)),
    # Test endpoints
    path('test-categories/', test_categories, name='test-categories'),
    path('test-tags/', test_tags, name='test-tags'),
]