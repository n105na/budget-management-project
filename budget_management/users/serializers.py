from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)  # Ensure password is included in validated_data

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role']
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        password = validated_data.pop("password")  # Remove password from validated_data
        user = User(**validated_data)  # Create user instance without password
        user.set_password(password)  # Hash the password
        user.save()
        return user
    def __str__(self):
        return self.username
