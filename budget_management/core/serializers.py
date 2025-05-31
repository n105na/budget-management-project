from rest_framework import serializers
from django.contrib.admin.models import LogEntry
from django.contrib.contenttypes.models import ContentType

class LogEntrySerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  # Display username
    content_type = serializers.StringRelatedField()  # Display model name
    action_flag = serializers.CharField(source='get_action_flag_display')  # Display action (e.g., Addition)

    class Meta:
        model = LogEntry
        fields = ['action_time', 'user', 'content_type', 'object_id', 'object_repr', 'action_flag', 'change_message']