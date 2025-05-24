from rest_framework import serializers
from personnel.serializers import PersonnelSerializer
from personnel.models import Personnel
from .models import GradePayment
from .models import Mission, MissionPersonnel

from .models import Budget


class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = ['id', 'year', 'amount', 'added_on']
        read_only_fields = ['id', 'added_on']

class GradePaymentSerializer(serializers.ModelSerializer):
    grade_name = serializers.CharField(source="grade.name", read_only=True)

    class Meta:
        model = GradePayment
        fields = ['id', 'meal_payment_north', 'meal_payment_south', 'lodging_payment_north', 'lodging_payment_south', 'grade', 'grade_name', 'year']



class MissionSerializer(serializers.ModelSerializer):
    destination_name = serializers.CharField(source="destination_wilaya.name", read_only=True)
    nights_stayed = serializers.IntegerField(read_only=True)
    meals_covered = serializers.CharField(read_only=True)

    class Meta:
        model = Mission
        fields = '__all__'


class MissionPersonnelSerializer(serializers.ModelSerializer):
    mission = serializers.PrimaryKeyRelatedField(
        queryset=Mission.objects.all(), many=True, write_only=True
    )
    personnel = serializers.PrimaryKeyRelatedField(
        queryset=Personnel.objects.all(), many=True , write_only=True
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
class MissionAssignedPersonnelSerializer(serializers.ModelSerializer):
    personnel_detail = PersonnelSerializer(source='personnel', read_only=True)

    class Meta:
        model = MissionPersonnel
        fields = [
            "personnel_detail",
            "transport_payment",
            "meal_payment",
            "lodging_payment",
            "total_payment"
        ]
class MissionWithPersonnelSerializer(serializers.ModelSerializer):
    destination_name = serializers.CharField(source="destination_wilaya.name", read_only=True)
    nights_stayed = serializers.IntegerField(read_only=True)
    meals_covered = serializers.CharField(read_only=True)
    assigned_personnel = serializers.SerializerMethodField()

    class Meta:
        model = Mission
        fields = [
            "id",
            "destination_name",
            "nights_stayed",
            "meals_covered",
            "date_arrival",
            "date_departure",
            "transport_type",
            "time_departure",
            "time_arrival",
            "funding_type",
            "mission_nature",
            "year",
            "destination_wilaya",
            "assigned_personnel",
        ]

    def get_assigned_personnel(self, mission):
        mission_personnel = MissionPersonnel.objects.filter(mission=mission)
        return MissionAssignedPersonnelSerializer(mission_personnel, many=True).data

class MissionWithPersonnelCreateSerializer(serializers.ModelSerializer):
    assigned_personnel_ids = serializers.ListField(
        child=serializers.PrimaryKeyRelatedField(queryset=Personnel.objects.all()),
        write_only=True
    )

    destination_name = serializers.CharField(source="destination_wilaya.name", read_only=True)
    nights_stayed = serializers.IntegerField(read_only=True)
    meals_covered = serializers.CharField(read_only=True)
    assigned_personnel = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Mission
        fields = [
            "id",
            "destination_name",
            "nights_stayed",
            "meals_covered",
            "date_arrival",
            "date_departure",
            "transport_type",
            "time_departure",
            "time_arrival",
            "funding_type",
            "mission_nature",
            "year",
            "destination_wilaya",
            "assigned_personnel_ids",  # input list of personnel ids
            "assigned_personnel",      # output detailed data
        ]

    def create(self, validated_data):
        personnel_ids = validated_data.pop('assigned_personnel_ids', [])
        mission = Mission.objects.create(**validated_data)

        # Create MissionPersonnel objects for each personnel assigned
        for personnel in personnel_ids:
            MissionPersonnel.objects.create(mission=mission, personnel=personnel)

        return mission

    def get_assigned_personnel(self, mission):
        mission_personnel = MissionPersonnel.objects.filter(mission=mission)
        return MissionAssignedPersonnelSerializer(mission_personnel, many=True).data
#the one were testing now 
from rest_framework import serializers
from .models import Mission, MissionPersonnel
from personnel.serializers import PersonnelSerializer

class MissionPersonnelNestedSerializer(serializers.ModelSerializer):
    personnel = serializers.PrimaryKeyRelatedField(queryset=Personnel.objects.all())

    class Meta:
        model = MissionPersonnel
        fields = [
            "id",
            "personnel",
            "transport_payment",
            "meal_payment",
            "lodging_payment",
            "total_payment",
        ]
        read_only_fields = ["id"]

class MissionWithPersonnelCRUDSerializer(serializers.ModelSerializer):
    destination_name = serializers.CharField(source="destination_wilaya.name", read_only=True)
    assigned_personnel = MissionPersonnelNestedSerializer(many=True)

    class Meta:
        model = Mission
        fields = [
            "id",
            "destination_name",
            "date_arrival",
            "date_departure",
            "transport_type",
            "time_departure",
            "time_arrival",
            "funding_type",
            "mission_nature",
            "year",
            "destination_wilaya",
            "assigned_personnel",
        ]

    def create(self, validated_data):
        personnel_data = validated_data.pop('assigned_personnel')
        mission = Mission.objects.create(**validated_data)
        for p_data in personnel_data:
            MissionPersonnel.objects.create(mission=mission, **p_data)
        return mission

    def update(self, instance, validated_data):
        personnel_data = validated_data.pop('assigned_personnel')
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        existing_personnel = {mp.id: mp for mp in instance.missionpersonnel_set.all()}
        for p_data in personnel_data:
            mp_id = p_data.get('id')
            if mp_id and mp_id in existing_personnel:
                mp = existing_personnel.pop(mp_id)
                for attr, value in p_data.items():
                    if attr != 'id':
                        setattr(mp, attr, value)
                mp.save()
            else:
                MissionPersonnel.objects.create(mission=instance, **p_data)

        for mp in existing_personnel.values():
            mp.delete()

        return instance
