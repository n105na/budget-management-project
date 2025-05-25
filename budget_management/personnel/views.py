# Updated personnel/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Personnel, Grade, Wilaya
from .serializers import PersonnelSerializer, GradeSerializer, WilayaSerializer
from users.permissions import RoleBasedPermission  # Import your custom permission
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

class PersonnelViewSet(viewsets.ModelViewSet):
    queryset = Personnel.objects.all()
    serializer_class = PersonnelSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]  # Use custom permission
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
        """
        Instantiates and returns the list of permissions that this view requires.
        You can override this method to apply different permissions to different actions.
        """
        if self.action in ['list', 'retrieve']:
            # For viewing, both viewers and editors are allowed
            permission_classes = [IsAuthenticated, RoleBasedPermission]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # For modifications, only editors are allowed
            permission_classes = [IsAuthenticated, RoleBasedPermission]
        else:
            permission_classes = [IsAuthenticated, RoleBasedPermission]
        
        return [permission() for permission in permission_classes]

class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]  # Use custom permission

    @action(detail=False, methods=['get'])
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
    permission_classes = [IsAuthenticated, RoleBasedPermission] 