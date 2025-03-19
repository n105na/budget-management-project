from rest_framework import serializers
from .models import WilayaDistance

class WilayaDistanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WilayaDistance
        fields = '__all__'
