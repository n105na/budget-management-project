from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WilayaDistanceViewSet

router = DefaultRouter()
router.register(r'distance', WilayaDistanceViewSet, basename='wilayadistance')

urlpatterns = [
    path('', include(router.urls)),
]
