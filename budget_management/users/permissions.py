from rest_framework import permissions

class IsViewerOrEditor(permissions.BasePermission):
    """
    Custom permission to allow viewers and editors to access objects.
    Editors can modify, viewers can only read.
    """
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return False
            
        # Allow access if user is viewer or editor
        return request.user.is_viewer() or request.user.is_editor()
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for viewers and editors
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_viewer() or request.user.is_editor()
        
        # Write permissions only for editors
        return request.user.is_editor()


class IsEditorOnly(permissions.BasePermission):
    """
    Custom permission to only allow editors to access.
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.is_editor()


class IsViewerOnly(permissions.BasePermission):
    """
    Custom permission to only allow viewers (read-only access).
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Only allow safe methods for viewers
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_viewer()
        return False

