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
    grade = serializers.PrimaryKeyRelatedField(queryset=Grade.objects.all())

    class Meta:
        model = Personnel
        fields = '__all__'


    def validate(self, data):
        """Ensure that the selected grade matches the personnel's profession."""
        profession = data.get("profession")
        grade = data.get("grade")

        if grade and profession and grade.profession != profession:
            raise serializers.ValidationError(
                {"grade": "Selected grade does not match the personnel's profession."}
            )

        return data