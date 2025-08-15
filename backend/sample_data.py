"""
Sample data for Smart Todo List application
Run this script to populate the database with sample data for testing
"""

import os
import django
from datetime import datetime, timedelta
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smart_todo.settings')
django.setup()

from django.contrib.auth.models import User
from tasks.models import Task, Category, Tag
from context.models import ContextEntry


def create_sample_data():
    """Create sample data for testing"""
    
    # Create sample user
    user, created = User.objects.get_or_create(
        username='testuser',
        defaults={
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User'
        }
    )
    
    if created:
        user.set_password('shriram@108')
        user.save()
        print("Created test user: testuser / shriram@108")
    else:
        # Update existing user password
        user.set_password('shriram@108')
        user.save()
        print("Updated test user password: testuser / shriram@108")
    
    # Create sample categories
    categories_data = [
        {'name': 'Work', 'color': '#3B82F6'},
        {'name': 'Personal', 'color': '#10B981'},
        {'name': 'Health', 'color': '#F59E0B'},
        {'name': 'Learning', 'color': '#8B5CF6'},
        {'name': 'Finance', 'color': '#EF4444'},
        {'name': 'Shopping', 'color': '#F97316'},
    ]
    
    categories = []
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults={'color': cat_data['color']}
        )
        categories.append(category)
        if created:
            print(f"Created category: {category.name}")
    
    # Create sample tags
    tags_data = [
        {'name': 'urgent', 'color': '#EF4444'},
        {'name': 'meeting', 'color': '#3B82F6'},
        {'name': 'project', 'color': '#8B5CF6'},
        {'name': 'research', 'color': '#10B981'},
        {'name': 'review', 'color': '#F59E0B'},
        {'name': 'planning', 'color': '#6B7280'},
    ]
    
    tags = []
    for tag_data in tags_data:
        tag, created = Tag.objects.get_or_create(
            name=tag_data['name'],
            defaults={'color': tag_data['color']}
        )
        tags.append(tag)
        if created:
            print(f"Created tag: {tag.name}")
    
    # Create sample tasks
    tasks_data = [
        {
            'title': 'Complete project proposal',
            'description': 'Finish the Q1 project proposal document and send for review',
            'priority': 'high',
            'status': 'in_progress',
            'category': categories[0],  # Work
            'deadline': timezone.now() + timedelta(days=2),
            'tags': [tags[0], tags[2]]  # urgent, project
        },
        {
            'title': 'Team meeting preparation',
            'description': 'Prepare agenda and materials for weekly team meeting',
            'priority': 'medium',
            'status': 'pending',
            'category': categories[0],  # Work
            'deadline': timezone.now() + timedelta(days=1),
            'tags': [tags[1]]  # meeting
        },
        {
            'title': 'Gym workout',
            'description': 'Complete cardio and strength training session',
            'priority': 'medium',
            'status': 'pending',
            'category': categories[2],  # Health
            'deadline': timezone.now() + timedelta(hours=6),
            'tags': []
        },
        {
            'title': 'Learn React hooks',
            'description': 'Study advanced React hooks patterns and best practices',
            'priority': 'low',
            'status': 'pending',
            'category': categories[3],  # Learning
            'deadline': timezone.now() + timedelta(days=7),
            'tags': [tags[3]]  # research
        },
        {
            'title': 'Monthly budget review',
            'description': 'Review and analyze monthly expenses and savings',
            'priority': 'medium',
            'status': 'pending',
            'category': categories[4],  # Finance
            'deadline': timezone.now() + timedelta(days=3),
            'tags': [tags[4]]  # review
        },
        {
            'title': 'Buy groceries',
            'description': 'Weekly grocery shopping - milk, bread, vegetables, fruits',
            'priority': 'low',
            'status': 'pending',
            'category': categories[5],  # Shopping
            'deadline': timezone.now() + timedelta(days=1),
            'tags': []
        },
        {
            'title': 'Code review for new feature',
            'description': 'Review pull request for authentication module',
            'priority': 'high',
            'status': 'completed',
            'category': categories[0],  # Work
            'deadline': timezone.now() - timedelta(days=1),
            'tags': [tags[4]]  # review
        },
    ]
    
    for task_data in tasks_data:
        task_tags = task_data.pop('tags', [])
        task, created = Task.objects.get_or_create(
            title=task_data['title'],
            user=user,
            defaults=task_data
        )
        
        if created:
            # Add tags
            for tag in task_tags:
                task.tags.add(tag)
            
            # Set completed_at for completed tasks
            if task.status == 'completed':
                task.completed_at = timezone.now() - timedelta(hours=2)
                task.save()
            
            print(f"Created task: {task.title}")
    
    # Create sample context entries
    context_data = [
        {
            'source_type': 'whatsapp',
            'content': 'Hey, don\'t forget about the client meeting tomorrow at 2 PM. We need to present the project proposal.',
            'original_timestamp': timezone.now() - timedelta(hours=3)
        },
        {
            'source_type': 'email',
            'content': 'Subject: Urgent - Budget Review Due\n\nHi, please complete the monthly budget review by Friday. The finance team needs the numbers for the quarterly report.',
            'original_timestamp': timezone.now() - timedelta(hours=5)
        },
        {
            'source_type': 'notes',
            'content': 'Research topics for React learning:\n- Advanced hooks patterns\n- Context API best practices\n- Performance optimization\n- Testing strategies',
            'original_timestamp': timezone.now() - timedelta(hours=1)
        },
        {
            'source_type': 'whatsapp',
            'content': 'Gym session at 6 PM today? Let me know if you\'re joining.',
            'original_timestamp': timezone.now() - timedelta(hours=2)
        },
        {
            'source_type': 'email',
            'content': 'Subject: Code Review Request\n\nPlease review the authentication module PR. It\'s ready for testing and needs approval before deployment.',
            'original_timestamp': timezone.now() - timedelta(hours=4)
        },
        {
            'source_type': 'notes',
            'content': 'Shopping list:\n- Milk (2 liters)\n- Whole wheat bread\n- Fresh vegetables (tomatoes, onions, spinach)\n- Fruits (apples, bananas)\n- Yogurt',
            'original_timestamp': timezone.now() - timedelta(minutes=30)
        }
    ]
    
    for context_item in context_data:
        context_entry, created = ContextEntry.objects.get_or_create(
            user=user,
            content=context_item['content'],
            defaults={
                'source_type': context_item['source_type'],
                'original_timestamp': context_item['original_timestamp']
            }
        )
        
        if created:
            print(f"Created context entry: {context_entry.source_type} - {context_entry.content[:50]}...")
    
    print("\n✅ Sample data created successfully!")
    print(f"📊 Created {Task.objects.filter(user=user).count()} tasks")
    print(f"📝 Created {ContextEntry.objects.filter(user=user).count()} context entries")
    print(f"🏷️ Created {Category.objects.count()} categories")
    print(f"🔖 Created {Tag.objects.count()} tags")
    print("\n🔑 Login credentials:")
    print("Username: testuser")
    print("Password: shriram@108")


if __name__ == '__main__':
    create_sample_data()