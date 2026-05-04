from django.contrib import admin
from .models import AuthorizedStudent, UserProfile


@admin.register(AuthorizedStudent)
class AuthorizedStudentAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "student_identifier", "is_active", "created_at")
    search_fields = ("full_name", "email", "student_identifier")
    list_filter = ("is_active",)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "wallet_balance", "warning_count", "is_banned", "created_at")
    search_fields = ("user__username",)
    list_filter = ("is_banned",)