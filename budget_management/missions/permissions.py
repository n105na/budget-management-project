from rest_framework.permissions import BasePermission
from users.models import User

class IsDashboardViewer(BasePermission):
    """
    Allows access only to Doyen, Commission, and Comptable AND SECRETAIRE GENERAL .
    """

    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in [
                User.Role.DOYEN, 
                User.Role.COMMISSION, 
                User.Role.COMPTABLE,
                User.Role.SECRETAIRE_GENERALE
            ]
        )
