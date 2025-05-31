from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.admin.models import LogEntry, ADDITION, CHANGE, DELETION
from django.contrib.contenttypes.models import ContentType
from rest_framework.exceptions import PermissionDenied
import logging

logger = logging.getLogger(__name__)

class LoggingModelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def perform_create(self, serializer):
        if not self.request.user.is_authenticated:
            logger.error("User not authenticated for create")
            raise PermissionDenied("Authentication required")
        instance = serializer.save()
        LogEntry.objects.log_action(
            user_id=self.request.user.id,
            content_type_id=ContentType.objects.get_for_model(instance).id,
            object_id=instance.pk,
            object_repr=str(instance),
            action_flag=ADDITION,
            change_message="Created via API",
        )

    def perform_update(self, serializer):
        if not self.request.user.is_authenticated:
            logger.error("User not authenticated for update")
            raise PermissionDenied("Authentication required")
        instance = serializer.save()
        LogEntry.objects.log_action(
            user_id=self.request.user.id,
            content_type_id=ContentType.objects.get_for_model(instance).id,
            object_id=instance.pk,
            object_repr=str(instance),
            action_flag=CHANGE,
            change_message="Updated via API",
        )

    def perform_destroy(self, instance):
        if not self.request.user.is_authenticated:
            logger.error("User not authenticated for delete")
            raise PermissionDenied("Authentication required")
        LogEntry.objects.log_action(
            user_id=self.request.user.id,
            content_type_id=ContentType.objects.get_for_model(instance).id,
            object_id=instance.pk,
            object_repr=str(instance),
            action_flag=DELETION,
            change_message="Deleted via API",
        )
        instance.delete()