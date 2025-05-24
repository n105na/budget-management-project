from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GradePaymentViewSet, 
    MissionViewSet, 
    MissionPersonnelViewSet, 
    dashboard_metrics, 
    BudgetViewSet, 
    GroupedMissionsView, 
    MissionWithPersonnelViewSet  # This is the main one for creating missions with personnel
)

router = DefaultRouter()
router.register(r'grade-payment', GradePaymentViewSet, basename='gradepayment')
router.register(r'mission', MissionViewSet)  # Basic mission CRUD (without personnel assignment)
router.register(r'mission-with-personnel', MissionWithPersonnelViewSet, basename='personnel')  # Mission CRUD with personnel assignment
router.register(r'mission-personnel', MissionPersonnelViewSet,basename='mission-with-personnel')
router.register(r'budgets', BudgetViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', dashboard_metrics, name='dashboard_metrics'),
    # path('missions/', GroupedMissionsView.as_view(), name='missions'),
]