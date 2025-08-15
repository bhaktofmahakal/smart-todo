from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContextEntryViewSet, ContextInsightViewSet, DailyContextSummaryViewSet

router = DefaultRouter()
router.register(r'entries', ContextEntryViewSet, basename='contextentry')
router.register(r'insights', ContextInsightViewSet, basename='contextinsight')
router.register(r'summaries', DailyContextSummaryViewSet, basename='dailysummary')

urlpatterns = [
    path('', include(router.urls)),
]