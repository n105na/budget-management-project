# core/views.py
from rest_framework import viewsets
from django.contrib.admin.models import LogEntry
from rest_framework.permissions import BasePermission
from rest_framework_simplejwt.authentication import JWTAuthentication
from .serializers import LogEntrySerializer
import logging

logger = logging.getLogger(__name__)

class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_superuser)
        

class LogEntryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LogEntry.objects.all().order_by('-action_time')
    serializer_class = LogEntrySerializer
    permission_classes = [IsAdminRole]  # Use custom permission
    #authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        logger.debug(f"LogEntry accessed by user: {self.request.user}")
        return super().get_queryset()