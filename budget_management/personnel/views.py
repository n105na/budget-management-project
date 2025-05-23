from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Personnel, Grade, Wilaya
from .serializers import PersonnelSerializer, GradeSerializer, WilayaSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter  
from users.permissions2 import IsViewer, IsEditor 



class PersonnelViewSet(viewsets.ModelViewSet):
    queryset = Personnel.objects.all()
    serializer_class = PersonnelSerializer
    permission_classes = [IsAuthenticated]
    permission_classes = [IsEditor]
    permission_classes = [IsViewer]
    
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    
    
    filterset_fields = {
        'name': ['icontains'],            # filter by partial name match
        'profession': ['exact'],          # exact match: Teacher, Worker...
        'grade': ['exact'],               # grade ID
        'grade__name': ['exact'],     # grade name contains
        'wilaya': ['exact'],              # wilaya ID
        'wilaya__name': ['icontains'],    # wilaya name contains
        'is_ccp_account': ['exact'],
                    # true/false
    }
    ordering_fields = ['name', 'wilaya__name', 'grade__name']
   # GET /api/personnel/?ordering=name
   #GET /api/personnel/?profession=Teacher
   # GET /api/personnel/?name__icontains=a searching for all name that has a .... 
class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated]
    permission_classes = [IsEditor]
    permission_classes = [IsViewer]

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
    permission_classes = [IsAuthenticated]
    permission_classes = [IsEditor]
    permission_classes = [IsViewer]
    