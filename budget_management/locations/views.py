from rest_framework import viewsets
from .models import WilayaDistance
from .serializers import WilayaDistanceSerializer

class WilayaDistanceViewSet(viewsets.ModelViewSet):
    queryset = WilayaDistance.objects.all()
    serializer_class = WilayaDistanceSerializer
