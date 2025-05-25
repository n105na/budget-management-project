# Create this file: personnel/permissions.py
from rest_framework import permissions

class RoleBasedPermission(permissions.BasePermission):
    """
    Custom permission to only allow:
    - Doyen and Commission: View only (GET requests)
    - Secretaire Generale and Comptable: Full access (GET, POST, PUT, PATCH, DELETE)
    """
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user has a valid role
        if not hasattr(request.user, 'role'):
            return False
        
        # Viewers (Doyen, Commission) can only perform safe methods (GET, HEAD, OPTIONS)
        if request.user.is_viewer():
            return request.method in permissions.SAFE_METHODS
        
        # Editors (Secretaire Generale, Comptable) can perform all operations
        if request.user.is_editor():
            return True
        
        # Default deny
        return False

    def has_object_permission(self, request, view, obj):
        """
        Object-level permission to only allow owners of an object to edit it.
        This applies the same logic as has_permission but for specific objects.
        """
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Viewers can only view objects
        if request.user.is_viewer():
            return request.method in permissions.SAFE_METHODS
        
        # Editors can modify objects
        if request.user.is_editor():
            return True
        
        return False


class ViewOnlyPermission(permissions.BasePermission):
    """
    Alternative permission class that only allows viewing (GET requests)
    for specific roles if needed for certain endpoints
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Only allow safe methods for viewers
        if request.user.is_viewer():
            return request.method in permissions.SAFE_METHODS
        
        return False


class EditorOnlyPermission(permissions.BasePermission):
    """
    Permission class that only allows editors to access certain endpoints
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Only editors can access
        return request.user.is_editor()