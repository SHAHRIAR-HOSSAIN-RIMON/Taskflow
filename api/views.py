from rest_framework import viewsets, filters
from .models import Task
from .serializers import TaskSerializers


class TaskViewSet(viewsets.ModelViewSet):
   """
   One class = all CRUD for Task.
   DRF chooses the right method based on HTTP verb + URL.
   """
   queryset = Task.objects.all()
   serializer_class = TaskSerializers
   filter_backends = [filters.SearchFilter, filters.OrderingFilter]
   search_fields = ['title', 'description']
   ordering_fields = ['priority', 'due_date', 'created_at']