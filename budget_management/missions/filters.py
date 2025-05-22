import django_filters
from .models import Mission
from datetime import datetime, timedelta
from django.db.models import Q

class MissionFilter(django_filters.FilterSet):
    month = django_filters.NumberFilter(method='filter_by_month')
    week = django_filters.NumberFilter(method='filter_by_week')
    quarter = django_filters.NumberFilter(method='filter_by_quarter')

    class Meta:
        model = Mission
        fields = ['destination_wilaya', 'transport_type']

    def filter_by_month(self, queryset, name, value):
        # Filter by month number (1-12) on date_departure
        return queryset.filter(date_departure__month=value)

    def filter_by_week(self, queryset, name, value):
        # Filter by week number of the year on date_departure
        # Week number 1-53 according to ISO calendar
        filtered_qs = []
        for mission in queryset:
            week_num = mission.date_departure.isocalendar()[1]
            if week_num == value:
                filtered_qs.append(mission.pk)
        return queryset.filter(pk__in=filtered_qs)

    def filter_by_quarter(self, queryset, name, value):
        # Quarter is 1, 2, 3 or 4
        if value not in [1,2,3,4]:
            return queryset.none()  # invalid quarter
        start_month = 3 * (value - 1) + 1
        end_month = start_month + 2
        return queryset.filter(date_departure__month__gte=start_month, date_departure__month__lte=end_month)
