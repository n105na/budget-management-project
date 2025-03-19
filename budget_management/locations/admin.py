from django.contrib import admin
from .models import WilayaDistance

class WilayaDistanceAdmin(admin.ModelAdmin):
    list_display = ("wilaya_from", "wilaya_to", "distance_km")  # Columns to show
    search_fields = ("wilaya_from__name", "wilaya_to__name")  # Enable search
    list_filter = ("wilaya_from", "wilaya_to")  # Filters on the side

admin.site.register(WilayaDistance, WilayaDistanceAdmin)
