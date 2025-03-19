from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GradePaymentViewSet, MissionViewSet, MissionPersonnelViewSet

router = DefaultRouter()
router.register(r'grade-payment', GradePaymentViewSet, basename='gradepayment')
router.register(r'mission', MissionViewSet)
router.register(r'mission-personnel', MissionPersonnelViewSet)


urlpatterns = [
    path('', include(router.urls)),
]
