from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PersonnelViewSet, GradeViewSet,WilayaViewSet

router = DefaultRouter()
router.register(r'personnel', PersonnelViewSet, basename='personnel')
router.register(r'grades', GradeViewSet, basename='grades')
router.register(r'wilaya', WilayaViewSet, basename='wilaya')

urlpatterns = [
    path('', include(router.urls)),
    
]
