from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Personnel, Grade, Wilaya
from .serializers import PersonnelSerializer, GradeSerializer, WilayaSerializer
from rest_framework.decorators import action
from rest_framework.response import Response

class PersonnelViewSet(viewsets.ModelViewSet):
    queryset = Personnel.objects.all()
    serializer_class = PersonnelSerializer
    permission_classes = [IsAuthenticated]

class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated]

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
    