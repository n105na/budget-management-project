from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GradePaymentViewSet, 
    MissionViewSet, 
    MissionPersonnelViewSet, 
    dashboard_metrics, 
    BudgetViewSet, 
    GroupedMissionsView, 
    MissionWithPersonnelViewSet, # This is the main one for creating missions with personnel
    GeneratePersonnelReportView,
    GenerateMissionReportView
)

router = DefaultRouter()
router.register(r'grade-payment', GradePaymentViewSet, basename='gradepayment')
router.register(r'mission', MissionViewSet)  # Basic mission CRUD (without personnel assignment)
router.register(r'mission-personnel', MissionWithPersonnelViewSet, basename='personnel')  # Mission CRUD with personnel assignment
router.register(r'mission-with-personnel', MissionPersonnelViewSet,basename='mission-with-personnel')
router.register(r'budgets', BudgetViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', dashboard_metrics, name='dashboard_metrics'),
    path('personnel-report/<int:id>/', GeneratePersonnelReportView.as_view(), name='generate-personnel-report'),
    path('personnel-report/<int:id>/<int:year>/', GeneratePersonnelReportView.as_view(), name='generate-personnel-report-year'),
    path('mission-report/<int:mission_id>/', GenerateMissionReportView.as_view(), name='generate-mission-report'),

    # path('missions/', GroupedMissionsView.as_view(), name='missions'),
]

