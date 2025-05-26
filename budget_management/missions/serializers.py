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
        queryset=Mission.objects.all(), write_only=True
    )
    personnel = serializers.PrimaryKeyRelatedField(
        queryset=Personnel.objects.all(), write_only=True
    )

    mission_detail = MissionSerializer(source='mission', read_only=True)
    personnel_details = PersonnelSerializer(source='personnel', read_only=True)

    class Meta:
        model = MissionPersonnel
        fields = [
            "id",
            "mission",         # for write
            "personnel",       # for write
            "mission_detail",  # for read
            "personnel_details",# for read
            "transport_payment",
            "meal_payment",
            "lodging_payment",
            "total_payment",
        ]


class MissionAssignedPersonnelSerializer(serializers.ModelSerializer):
    personnel_details = PersonnelSerializer(source='personnel', read_only=True)

    class Meta:
        model = MissionPersonnel
        fields = [
            "id",
            "personnel_details",
            "transport_payment",
            "meal_payment",
            "lodging_payment",
            "total_payment"
        ]


class MissionWithPersonnelSerializer(serializers.ModelSerializer):
    destination_name = serializers.CharField(source="destination_wilaya.name", read_only=True)
    nights_stayed = serializers.IntegerField(read_only=True)
    meals_covered = serializers.CharField(read_only=True)
    personnel_details = serializers.SerializerMethodField()

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
            "personnel_details",
        ]

    def get_personnel_details(self, mission):
        mission_personnel = MissionPersonnel.objects.filter(mission=mission)
        return MissionAssignedPersonnelSerializer(mission_personnel, many=True).data



# MAIN SERIALIZER FOR CREATE/UPDATE WITH PERSONNEL
class MissionPersonnelNestedSerializer(serializers.ModelSerializer):
    personnel_details = PersonnelSerializer(source='personnel', read_only=True)

    class Meta:
        model = MissionPersonnel
        fields = [
            "id",
            "personnel",
            "personnel_details",
            "transport_payment",
            "meal_payment",
            "lodging_payment",
            "total_payment",
        ]
        read_only_fields = ["id", "transport_payment", "meal_payment", "lodging_payment", "total_payment"]


class MissionWithPersonnelCRUDSerializer(serializers.ModelSerializer):
    destination_name = serializers.CharField(source="destination_wilaya.name", read_only=True)
    nights_stayed = serializers.IntegerField(read_only=True)
    meals_covered = serializers.IntegerField(read_only=True)
    
    # FIXED: Change from personnel_detail to personnel_details to match frontend
    personnel_details = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    # Keep the read field separate with a different source
    personnel_data = MissionPersonnelNestedSerializer(many=True, read_only=True, source='missionpersonnel_set')
    
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
            "personnel_details",  # for write
            "personnel_data",     # for read
        ]

    def validate_personnel_details(self, value):
        """Validate that all personnel IDs exist"""
        if value:
            existing_ids = Personnel.objects.filter(id__in=value).values_list('id', flat=True)
            invalid_ids = set(value) - set(existing_ids)
            if invalid_ids:
                raise serializers.ValidationError(f"Personnel with IDs {list(invalid_ids)} do not exist.")
        return value

    def create(self, validated_data):
        # Extract personnel IDs and remove from validated data
        personnel_ids = validated_data.pop('personnel_details', [])
        
        # Create the mission
        mission = Mission.objects.create(**validated_data)
        
        # Create MissionPersonnel entries for each personnel ID
        mission_personnel_objects = []
        for personnel_id in personnel_ids:
            try:
                personnel = Personnel.objects.get(id=personnel_id)
                
                # Check if GradePayment exists for this personnel's grade
                from .models import GradePayment
                grade_payment_exists = GradePayment.objects.filter(
                    grade=personnel.grade
                ).exists()
                
                if not grade_payment_exists:
                    # Clean up the mission before raising error
                    mission.delete()
                    raise serializers.ValidationError(
                        f"No payment configuration found for grade '{personnel.grade.name}'. "
                        f"Please create a GradePayment entry for this grade first."
                    )
                
                mission_personnel_obj = MissionPersonnel.objects.create(
                    mission=mission, 
                    personnel=personnel
                )
                mission_personnel_objects.append(mission_personnel_obj)
                
            except Personnel.DoesNotExist:
                # Clean up if something goes wrong
                mission.delete()
                raise serializers.ValidationError(f"Personnel with ID {personnel_id} does not exist.")
        
        return mission

    def update(self, instance, validated_data):
        # Extract personnel IDs and remove from validated data
        personnel_ids = validated_data.pop('personnel_details', None)
        
        # Update mission fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # If personnel_ids is provided, update the assigned personnel
        if personnel_ids is not None:
            # Get current MissionPersonnel entries
            existing_personnel_ids = set(instance.missionpersonnel_set.values_list('personnel_id', flat=True))
            new_personnel_ids = set(personnel_ids)
            
            # Remove personnel no longer assigned
            for personnel_id in existing_personnel_ids - new_personnel_ids:
                instance.missionpersonnel_set.filter(personnel_id=personnel_id).delete()
            
            # Add new personnel
            for personnel_id in new_personnel_ids - existing_personnel_ids:
                try:
                    personnel = Personnel.objects.get(id=personnel_id)
                    
                    # Check if GradePayment exists for this personnel's grade
                    from .models import GradePayment
                    grade_payment_exists = GradePayment.objects.filter(
                        grade=personnel.grade
                    ).exists()
                    
                    if not grade_payment_exists:
                        raise serializers.ValidationError(
                            f"No payment configuration found for grade '{personnel.grade.name}'. "
                            f"Please create a GradePayment entry for this grade first."
                        )
                    
                    MissionPersonnel.objects.create(mission=instance, personnel=personnel)
                    
                except Personnel.DoesNotExist:
                    raise serializers.ValidationError(f"Personnel with ID {personnel_id} does not exist.")
        
        return instance
