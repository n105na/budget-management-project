from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Display these fields in the user list in the admin
    list_display = ("username", "email", "first_name", "last_name", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_superuser", "is_active")

    # Add 'role' to the user edit form in admin
    fieldsets = UserAdmin.fieldsets + (
        ("Custom Role", {"fields": ("role",)}),
    )

    # Add 'role' to the user creation form in admin
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Custom Role", {"fields": ("role",)}),
    )

    search_fields = ("username", "email", "first_name", "last_name")
    ordering = ("username",)
