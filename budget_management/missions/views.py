from rest_framework import viewsets
from .models import GradePayment, Mission, MissionPersonnel
from .serializers import GradePaymentSerializer, MissionSerializer, MissionPersonnelSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter  


class GradePaymentViewSet(viewsets.ModelViewSet):
    queryset = GradePayment.objects.all()
    serializer_class = GradePaymentSerializer

    

class MissionViewSet(viewsets.ModelViewSet):
    queryset = Mission.objects.all()
    serializer_class = MissionSerializer

    filter_backends = [DjangoFilterBackend, OrderingFilter]
    
    
    filterset_fields = {
       
        
        'destination_wilaya': ['exact'],              
           
        'transport_type': ['exact'],      # bus taxi or Personal Car or Faculty Driver or other  
    }
    ordering_fields = ['destination_wilaya', 'transport_type']
   # GET /api/personnel/?ordering=name



#class MissionPersonnelViewSet(viewsets.ModelViewSet):
    #queryset = MissionPersonnel.objects.all()
    #serializer_class = MissionPersonnelSerializer
class MissionPersonnelViewSet(viewsets.ModelViewSet):
    queryset = MissionPersonnel.objects.all().select_related("mission", "personnel")
    serializer_class = MissionPersonnelSerializer
