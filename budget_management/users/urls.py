from django.urls import path, include
from .views import register_user, login_user,protected_view,delete_user,update_user, logout_user, change_password
from rest_framework_simplejwt.views import TokenRefreshView
from .views import UserViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')


urlpatterns = [
    path('register/', register_user, name='register_user'),
    path('login/', login_user, name='login_user'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('protected/', protected_view, name='protected'),
    path('update_user/<user_id>/', update_user, name='update_user'),
    path('delete_user/<user_id>/', delete_user, name='delete_user'), 
    path('change-password/',change_password, name='change-password'),
    path('logout/',logout_user, name='logout'),
    
    path('', include(router.urls)),
]

