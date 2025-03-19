from django.contrib import admin
from .models import Personnel, Grade, Wilaya

class PersonnelAdmin(admin.ModelAdmin):
    list_display = ('name', 'profession', 'grade', 'account_number', 'is_ccp_account', 'address','wilaya__name')
    search_fields = ('name', 'profession', 'grade__name')
    list_filter = ('grade', 'profession', 'is_ccp_account')
    ordering = ('name',)
    fields = ('name', 'profession', 'grade', 'account_number', 'is_ccp_account', 'address','wilaya__name')

admin.site.register(Personnel, PersonnelAdmin)
admin.site.register(Grade)
admin.site.register(Wilaya)
