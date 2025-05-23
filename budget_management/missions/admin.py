from django.contrib import admin
from .models import GradePayment, Mission, MissionPersonnel


@admin.register(GradePayment)
class GradePaymentAdmin(admin.ModelAdmin):
    list_display = ("grade", "meal_payment_north", "meal_payment_south", "lodging_payment_north", "lodging_payment_south","year")
    search_fields = ("grade__name",)
    list_filter = ("grade",)


@admin.register(Mission)
class MissionAdmin(admin.ModelAdmin):
    list_display = ("mission_nature", "destination_wilaya", "transport_type", "funding_type", "date_departure", "date_arrival","year")
    list_filter = ("transport_type", "funding_type", "mission_nature", "destination_wilaya")
    search_fields = ("mission_nature", "destination_wilaya__name")


@admin.register(MissionPersonnel)
class MissionPersonnelAdmin(admin.ModelAdmin):
    list_display = ("personnel", "mission", "transport_payment", "meal_payment", "lodging_payment", "total_payment","year")
    list_filter = ("mission__funding_type", "mission__destination_wilaya", "personnel__grade")
    search_fields = ("personnel__name", "mission__mission_nature", "mission__destination_wilaya__name")
