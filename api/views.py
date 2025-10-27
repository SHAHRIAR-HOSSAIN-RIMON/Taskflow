from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Task
from .serializers import TaskSerializers
from . import utils


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

      @action(detail=False, methods=['get'])
      def stats(self, request):
            """Return counts and quick insights about tasks.

            Response example:
                  {
                     "total": 10,
                     "by_status": {"todo": 5, "in_progress": 3, "done": 2},
                     "by_priority": {"low": 2, "medium": 6, "high": 2},
                     "overdue": 1,
                     "next_due": "2025-11-01T12:00:00Z"
                  }
            """
            qs = self.get_queryset()
            stats = utils.compute_stats(qs)
            return Response(stats)

