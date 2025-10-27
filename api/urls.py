from django.urls import include, path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter(trailing_slash='/?')  # accept with or without trailing slash
router.register('tasks', views.TaskViewSet, basename='task')

urlpatterns = [
   path('', include(router.urls)),
]
