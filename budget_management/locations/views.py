from rest_framework import viewsets
from .models import WilayaDistance
from .serializers import WilayaDistanceSerializer
from core.logging_viewset import LoggingModelViewSet

class WilayaDistanceViewSet(LoggingModelViewSet):
    queryset = WilayaDistance.objects.all()
    serializer_class = WilayaDistanceSerializer
