from django.contrib import admin
from .models import Ride


@admin.register(Ride)
class RideAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "vehicle",
        "reservation",
        "actual_start_time",
        "actual_end_time",
        "used_hours",
        "status",
    )
    list_filter = ("status", "actual_start_time")
    search_fields = ("user__username", "vehicle__code")