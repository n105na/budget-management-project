from django.urls import path
from .views import register_user, login_user,protected_view,delete_user,update_user
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path('register/', register_user, name='register_user'),
    path('login/', login_user, name='login_user'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('protected/', protected_view, name='protected'),
    path('update_user/<user_id>/', update_user, name='update_user'),
    path('delete_user/<user_id>/', delete_user, name='delete_user'), 
]

