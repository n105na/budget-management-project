from django.contrib import admin
from .models import GradePayment

@admin.register(GradePayment)
class GradePaymentAdmin(admin.ModelAdmin):
    list_display = ('grade', 'meal_payment_north', 'meal_payment_south', 'lodging_payment_north', 'lodging_payment_south')
