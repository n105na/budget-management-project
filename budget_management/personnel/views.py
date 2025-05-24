from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Personnel, Grade, Wilaya
from .serializers import PersonnelSerializer, GradeSerializer, WilayaSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from users.permissions import IsViewerOrEditor, IsEditorOnly


class PersonnelViewSet(viewsets.ModelViewSet):
    queryset = Personnel.objects.all()
    serializer_class = PersonnelSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        'name': ['icontains'],  # filter by partial name match
        'profession': ['exact'],  # exact match: Teacher, Worker...
        'grade': ['exact'],  # grade ID
        'grade__name': ['exact'],  # grade name contains
        'wilaya': ['exact'],  # wilaya ID
        'wilaya__name': ['icontains'],  # wilaya name contains
        'is_ccp_account': ['exact'],  # true/false
    }
    ordering_fields = ['name', 'wilaya__name', 'grade__name']
    
    def get_permissions(self):
        """
        Instantiate and return the list of permissions that this view requires.
        """
        if self.action in ['list', 'retrieve']:
            # Both viewers and editors can list and retrieve personnel
            permission_classes = [IsViewerOrEditor]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Only editors can create, update, or delete personnel
            permission_classes = [IsEditorOnly]
        else:
            # For any other actions, require editor permissions
            permission_classes = [IsEditorOnly]
        
        return [permission() for permission in permission_classes]


class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    
    def get_permissions(self):
        """
        Instantiate and return the list of permissions that this view requires.
        """
        if self.action in ['list', 'retrieve', 'by_profession']:
            # Both viewers and editors can list, retrieve, and filter grades
            permission_classes = [IsViewerOrEditor]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Only editors can create, update, or delete grades
            permission_classes = [IsEditorOnly]
        else:
            # Default to editor permissions for other actions
            permission_classes = [IsEditorOnly]
        
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get'], permission_classes=[IsViewerOrEditor])
    def by_profession(self, request):
        """
        API endpoint to filter grades by profession.
        Example: GET /api/grades/by_profession/?profession=Teacher
        """
        profession = request.query_params.get('profession', None)
        if profession:
            grades = Grade.objects.filter(profession=profession)
            serializer = self.get_serializer(grades, many=True)
            return Response(serializer.data)
        return Response({"error": "Profession is required"}, status=400)


class WilayaViewSet(viewsets.ModelViewSet):
    queryset = Wilaya.objects.all()
    serializer_class = WilayaSerializer
    
    def get_permissions(self):
        """
        Instantiate and return the list of permissions that this view requires.
        """
        if self.action in ['list', 'retrieve']:
            # Both viewers and editors can list and retrieve wilayas
            permission_classes = [IsViewerOrEditor]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Only editors can create, update, or delete wilayas
            permission_classes = [IsEditorOnly]
        else:
            # Default to editor permissions for other actions
            permission_classes = [IsEditorOnly]
        
        return [permission() for permission in permission_classes]


# Alternative approach: If you want simpler, uniform permissions across all ViewSets
class BasePermissionViewSet(viewsets.ModelViewSet):
    """
    Base ViewSet with consistent permission handling
    """
    
    def get_permissions(self):
        """
        Apply consistent permissions across all ViewSets
        """
        if self.action in ['list', 'retrieve']:
            # Read operations: viewers and editors
            permission_classes = [IsViewerOrEditor]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Write operations: editors only
            permission_classes = [IsEditorOnly]
        else:
            # Custom actions: editors only by default
            permission_classes = [IsEditorOnly]
        
        return [permission() for permission in permission_classes]


# Simplified versions using the base class
class SimplePersonnelViewSet(BasePermissionViewSet):
    queryset = Personnel.objects.all()
    serializer_class = PersonnelSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        'name': ['icontains'],
        'profession': ['exact'],
        'grade': ['exact'],
        'grade__name': ['exact'],
        'wilaya': ['exact'],
        'wilaya__name': ['icontains'],
        'is_ccp_account': ['exact'],
    }
    ordering_fields = ['name', 'wilaya__name', 'grade__name']


class SimpleGradeViewSet(BasePermissionViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    
    @action(detail=False, methods=['get'], permission_classes=[IsViewerOrEditor])
    def by_profession(self, request):
        """
        API endpoint to filter grades by profession.
        Both viewers and editors can access this.
        """
        profession = request.query_params.get('profession', None)
        if profession:
            grades = Grade.objects.filter(profession=profession)
            serializer = self.get_serializer(grades, many=True)
            return Response(serializer.data)
        return Response({"error": "Profession is required"}, status=400)


class SimpleWilayaViewSet(BasePermissionViewSet):
    queryset = Wilaya.objects.all()
    serializer_class = WilayaSerializer


# If you need even more granular control, you can create action-specific permissions
class AdvancedPersonnelViewSet(viewsets.ModelViewSet):
    queryset = Personnel.objects.all()
    serializer_class = PersonnelSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        'name': ['icontains'],
        'profession': ['exact'],
        'grade': ['exact'],
        'grade__name': ['exact'],
        'wilaya': ['exact'],
        'wilaya__name': ['icontains'],
        'is_ccp_account': ['exact'],
    }
    ordering_fields = ['name', 'wilaya__name', 'grade__name']
    
    def get_permissions(self):
        permission_map = {
            'list': [IsViewerOrEditor],
            'retrieve': [IsViewerOrEditor],
            'create': [IsEditorOnly],
            'update': [IsEditorOnly],
            'partial_update': [IsEditorOnly],
            'destroy': [IsEditorOnly],
        }
        
        permission_classes = permission_map.get(self.action, [IsEditorOnly])
        return [permission() for permission in permission_classes]
    
    # Add custom actions with specific permissions
    @action(detail=False, methods=['get'], permission_classes=[IsViewerOrEditor])
    def statistics(self, request):
        """Custom action accessible by both viewers and editors"""
        total_personnel = self.queryset.count()
        return Response({'total_personnel': total_personnel})
    
    @action(detail=False, methods=['post'], permission_classes=[IsEditorOnly])
    def bulk_update(self, request):
        """Custom action only accessible by editors"""
        # Your bulk update logic here
        return Response({'message': 'Bulk update completed'})
