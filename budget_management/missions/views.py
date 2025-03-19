from rest_framework import viewsets
from .models import GradePayment, Mission, MissionPersonnel
from .serializers import GradePaymentSerializer, MissionSerializer, MissionPersonnelSerializer

class GradePaymentViewSet(viewsets.ModelViewSet):
    queryset = GradePayment.objects.all()
    serializer_class = GradePaymentSerializer


class MissionViewSet(viewsets.ModelViewSet):
    queryset = Mission.objects.all()
    serializer_class = MissionSerializer


class MissionPersonnelViewSet(viewsets.ModelViewSet):
    queryset = MissionPersonnel.objects.all()
    serializer_class = MissionPersonnelSerializer
