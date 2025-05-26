from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from .serializers import UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from rest_framework import viewsets
from rest_framework_simplejwt.tokens import RefreshToken, TokenError



User = get_user_model()
class CustomRefreshToken(RefreshToken):
    @classmethod
    def for_user(cls, user):
        token = super().for_user(user)
        token["username"] = user.username
        token["role"] = user.role  # Assumes role is a field in your custom User model
        return token


class UserViewSet(viewsets.ReadOnlyModelViewSet):  # ReadOnly to prevent public edit/delete
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        'username': ['icontains'],
        'email': ['icontains'],
        'role': ['exact'],
        'is_active': ['exact'],
        'is_superuser': ['exact'],
    }
    ordering_fields = ['username', 'email', 'role', 'date_joined']

# the custom token i made 
class CustomRefreshToken(RefreshToken):
    @classmethod
    def for_user(cls, user):
        token = super().for_user(user)
        token["username"] = user.username
        token["role"] = user.role  
        return token
    
    
# Admin-only user registration
@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Only admins can register users
def register_user(request):
    if not request.user.is_superuser:  # Ensure only admins can register users
        return Response({"error": "Only admins can register users"}, status=status.HTTP_403_FORBIDDEN)

    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Admin-only update user
@api_view(['PUT','GET'])
@permission_classes([IsAuthenticated])  # Only admins can modify users
def update_user(request, user_id):
    if not request.user.is_superuser:
        return Response({"error": "Only admins can modify users"}, status=status.HTTP_403_FORBIDDEN)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Admin-only delete user
@api_view(['DELETE','GET'])
@permission_classes([IsAuthenticated])  # Only admins can delete users
def delete_user(request, user_id):
    if not request.user.is_superuser:
        return Response({"error": "Only admins can delete users"}, status=status.HTTP_403_FORBIDDEN)

    try:
        user = User.objects.get(id=user_id)
        user.delete()
        return Response({"message": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

# Login view
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = User.objects.filter(username=username).first()

    if user and user.check_password(password):
        refresh = CustomRefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),

        })
    return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

# Example protected view
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({"message": "You have access!"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    refresh_token = request.data.get("refresh")

    if not refresh_token:
        return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)

    except TokenError:
        return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    current_password = request.data.get("current_password")
    new_password = request.data.get("new_password")
    confirm_password = request.data.get("confirm_password")

    if not user.check_password(current_password):
        return Response({"error": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)
    
    if new_password != confirm_password:
        return Response({"error": "New passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)
    
    if current_password == new_password:
        return Response({"error": "New password must be different from the old one."}, status=status.HTTP_400_BAD_REQUEST)
    
    user.set_password(new_password)
    user.save()
    
    return Response({"message": "Password changed successfully."}, status=status.HTTP_200_OK)
