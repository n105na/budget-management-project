from django.contrib import admin
from django.contrib.admin.models import LogEntry

@admin.register(LogEntry)
class LogEntryAdmin(admin.ModelAdmin):
    list_display = ('action_time', 'user', 'content_type', 'object_repr', 'action_flag', 'change_message')
    list_filter = ('action_time', 'action_flag', 'content_type')
    search_fields = ('user__username', 'object_repr', 'change_message')
    date_hierarchy = 'action_time'
    readonly_fields = ('action_time', 'user', 'content_type', 'object_id', 'object_repr', 'action_flag', 'change_message')

    def has_add_permission(self, request):
        return False  # Prevent manual additions
    def has_change_permission(self, request, obj=None):
        return False  # Prevent editing
    def has_delete_permission(self, request, obj=None):
        return False  # Prevent deletion