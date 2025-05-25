from datetime import datetime, timedelta

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from users.permissions import RoleBasedPermission 

from .filters import MissionFilter
from .models import GradePayment, Mission, MissionPersonnel, Budget
from .serializers import (
    GradePaymentSerializer, 
    MissionSerializer, 
    MissionPersonnelSerializer, 
    BudgetSerializer, 
    MissionWithPersonnelSerializer, 
    MissionWithPersonnelCRUDSerializer
)
from decimal import Decimal
from .permissions import IsDashboardViewer
from rest_framework import generics


class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['year']
    ordering_fields = ['added_on', 'amount']
    permission_classes = [IsAuthenticated, RoleBasedPermission]

class GradePaymentViewSet(viewsets.ModelViewSet):
    queryset = GradePayment.objects.all()
    serializer_class = GradePaymentSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]
    

class MissionViewSet(viewsets.ModelViewSet):
    queryset = Mission.objects.all()
    serializer_class = MissionSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]

    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        'destination_name': ['exact'],
        'transport_type': ['exact'],
    }
    filterset_class = MissionFilter
    ordering_fields = ['destination_wilaya', 'transport_type']

    def get_queryset(self):
        queryset = super().get_queryset()
        filter_type = self.request.query_params.get('filter', None)
        now = datetime.now()

        if filter_type == 'this_week':
            start = now - timedelta(days=now.weekday())
            end = start + timedelta(days=6)
            queryset = queryset.filter(date_departure__range=(start.date(), end.date()))

        elif filter_type == 'this_month':
            start = now.replace(day=1)
            end = (start.replace(month=start.month + 1, day=1) if start.month < 12 else start.replace(year=start.year + 1, month=1, day=1)) - timedelta(days=1)
            queryset = queryset.filter(date_departure__range=(start.date(), end.date()))

        elif filter_type == 'this_quarter':
            quarter = (now.month - 1) // 3 + 1
            start_month = 3 * (quarter - 1) + 1
            start = now.replace(month=start_month, day=1)
            end = (start.replace(month=start_month + 3, day=1) if quarter < 4 else start.replace(year=now.year + 1, month=1, day=1)) - timedelta(days=1)
            queryset = queryset.filter(date_departure__range=(start.date(), end.date()))

        elif filter_type == 'this_year':
            start = now.replace(month=1, day=1)
            end = now.replace(month=12, day=31)
            queryset = queryset.filter(date_departure__range=(start.date(), end.date()))

        return queryset


class MissionPersonnelViewSet(viewsets.ModelViewSet):
    queryset = MissionPersonnel.objects.all().select_related("mission", "personnel")
    serializer_class = MissionPersonnelSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated,IsDashboardViewer])
def dashboard_metrics(request):
    now = datetime.now()
    filter_type = request.query_params.get("filter", "this_year")

    if filter_type == "this_week":
        start = now - timedelta(days=now.weekday())
        end = start + timedelta(days=6)
    elif filter_type == "this_month":
        start = now.replace(day=1)
        end = (start.replace(month=start.month + 1, day=1)
               if start.month < 12 else start.replace(year=now.year + 1, month=1, day=1)) - timedelta(days=1)
    elif filter_type == "this_quarter":
        quarter = (now.month - 1) // 3 + 1
        start_month = 3 * (quarter - 1) + 1
        start = now.replace(month=start_month, day=1)
        end = (start.replace(month=start_month + 3, day=1)
               if quarter < 4 else start.replace(year=now.year + 1, month=1, day=1)) - timedelta(days=1)
    else:  # "this_year"
        start = now.replace(month=1, day=1)
        end = now.replace(month=12, day=31)

    missions = Mission.objects.filter(date_departure__range=(start.date(), end.date()))
    mission_personnel = MissionPersonnel.objects.filter(
        mission__date_departure__range=(start.date(), end.date())
    ).select_related("personnel", "mission")

    total_missions = missions.count()
    total_participations = mission_personnel.count()
    unique_personnel = mission_personnel.values("personnel").distinct().count()

    total_spent = sum(Decimal(mp.total_payment or 0) for mp in mission_personnel)

    # Filter all budget entries for the year
    budgets = Budget.objects.filter(year=now.year)
    total_budget = sum(b.amount for b in budgets)

    if total_budget > 0:
        remaining_budget = total_budget - total_spent
        percent_used = (total_spent / total_budget) * 100
    else:
        remaining_budget = Decimal("0.00")
        percent_used = 0

    return Response({
        "filter": filter_type,
        "start": start.date(),
        "end": end.date(),
        "total_missions": total_missions,
        "total_participations": total_participations,
        "unique_personnel": unique_personnel,
        "total_spent": float(total_spent),
        "budget_amount": float(total_budget) if total_budget else 0,
        "remaining_budget": float(remaining_budget),
        "percent_used": round(percent_used, 2),
        "is_overspent": total_spent > total_budget if total_budget > 0 else None,
        "warning": "Budget exceeded!" if total_spent > total_budget else None
    })


class GroupedMissionsView(generics.ListAPIView):
    serializer_class = MissionWithPersonnelSerializer

    def get_queryset(self):
        return Mission.objects.all()


# MAIN VIEWSET FOR MISSION WITH PERSONNEL CRUD
class MissionWithPersonnelViewSet(viewsets.ModelViewSet):
    """
    ViewSet for creating, updating, and retrieving missions with personnel assignments.
    This allows creating a mission and assigning personnel in a single API call.
    """
    queryset = Mission.objects.all().select_related('destination_wilaya').prefetch_related('missionpersonnel_set__personnel')
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        'transport_type': ['exact'],
        'funding_type': ['exact'],
        'mission_nature': ['exact'],
        'year': ['exact'],
    }
    filterset_class = MissionFilter
    ordering_fields = ['date_departure', 'date_arrival', 'destination_wilaya']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return MissionWithPersonnelCRUDSerializer
        elif self.action in ['list', 'retrieve']:
            return MissionWithPersonnelSerializer
        return MissionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        filter_type = self.request.query_params.get('filter', None)
        now = datetime.now()

        if filter_type == 'this_week':
            start = now - timedelta(days=now.weekday())
            end = start + timedelta(days=6)
            queryset = queryset.filter(date_departure__range=(start.date(), end.date()))

        elif filter_type == 'this_month':
            start = now.replace(day=1)
            end = (start.replace(month=start.month + 1, day=1) if start.month < 12 else start.replace(year=start.year + 1, month=1, day=1)) - timedelta(days=1)
            queryset = queryset.filter(date_departure__range=(start.date(), end.date()))

        elif filter_type == 'this_quarter':
            quarter = (now.month - 1) // 3 + 1
            start_month = 3 * (quarter - 1) + 1
            start = now.replace(month=start_month, day=1)
            end = (start.replace(month=start_month + 3, day=1) if quarter < 4 else start.replace(year=now.year + 1, month=1, day=1)) - timedelta(days=1)
            queryset = queryset.filter(date_departure__range=(start.date(), end.date()))

        elif filter_type == 'this_year':
            start = now.replace(month=1, day=1)
            end = now.replace(month=12, day=31)
            queryset = queryset.filter(date_departure__range=(start.date(), end.date()))

        return queryset