from rest_framework import serializers
from .models import GradePayment
from .models import Mission, MissionPersonnel

class GradePaymentSerializer(serializers.ModelSerializer):
    grade_name = serializers.CharField(source="grade.name", read_only=True)

    class Meta:
        model = GradePayment
        fields = ['id', 'meal_payment_north', 'meal_payment_south', 'lodging_payment_north', 'lodging_payment_south', 'grade', 'grade_name']



class MissionSerializer(serializers.ModelSerializer):
    destination_name = serializers.CharField(source="destination_wilaya.name", read_only=True)
    nights_stayed = serializers.IntegerField(read_only=True)
    meals_covered = serializers.CharField(read_only=True)

    class Meta:
        model = Mission
        fields = '__all__'


class MissionPersonnelSerializer(serializers.ModelSerializer):
    total_payment = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = MissionPersonnel
        fields = '__all__'
