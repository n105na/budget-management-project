from rest_framework import serializers
from personnel.serializers import PersonnelSerializer
from personnel.models import Personnel
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
    mission = serializers.PrimaryKeyRelatedField(
        queryset=Mission.objects.all(), write_only=True
    )
    personnel = serializers.PrimaryKeyRelatedField(
        queryset=Personnel.objects.all(), write_only=True
    )

    mission_detail = MissionSerializer(source='mission', read_only=True)
    personnel_detail = PersonnelSerializer(source='personnel', read_only=True)

    class Meta:
        model = MissionPersonnel
        fields = [
            "id",
            "mission",         # for write
            "personnel",       # for write
            "mission_detail",  # for read
            "personnel_detail",# for read
            "transport_payment",
            "meal_payment",
            "lodging_payment",
            "total_payment",
        ]
