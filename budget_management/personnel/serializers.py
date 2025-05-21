from rest_framework import serializers
from .models import Personnel, Grade, Wilaya

class WilayaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wilaya
        fields = '__all__'

class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = '__all__'

class PersonnelSerializer(serializers.ModelSerializer):
    grade = GradeSerializer(read_only=True)  # show full grade info
    grade_id = serializers.PrimaryKeyRelatedField(
        queryset=Grade.objects.all(), write_only=True, source='grade'
    )

    wilaya = WilayaSerializer(read_only=True)  # show full wilaya info
    wilaya_id = serializers.PrimaryKeyRelatedField(
        queryset=Wilaya.objects.all(), write_only=True, source='wilaya'
    )

    class Meta:
        model = Personnel
        fields = [
            "id", "name", "profession",
            "grade", "grade_id",       # show + allow choosing
            "account_number", "is_ccp_account", "address",
            "wilaya", "wilaya_id"      # show + allow choosing
        ]

    def validate(self, data):
        profession = data.get("profession")
        grade = data.get("grade")
        if grade and profession and grade.profession != profession:
            raise serializers.ValidationError(
                {"grade": "Selected grade does not match the personnel's profession."}
            )
        return data
