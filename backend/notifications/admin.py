from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("type", "recipient_user", "recipient_role", "title", "is_read", "created_at")
    list_filter = ("type", "is_read", "recipient_role")
    search_fields = ("title", "message", "recipient_user__username")