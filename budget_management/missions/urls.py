from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GradePaymentViewSet, MissionViewSet, MissionPersonnelViewSet,dashboard_metrics, BudgetViewSet

router = DefaultRouter()
router.register(r'grade-payment', GradePaymentViewSet, basename='gradepayment')
router.register(r'mission', MissionViewSet)
router.register(r'mission-personnel', MissionPersonnelViewSet)
router.register(r'budgets', BudgetViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', dashboard_metrics, name='dashboard_metrics'),  

]
