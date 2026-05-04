from django.contrib import admin
from .models import Reservation


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "vehicle",
        "reserved_date",
        "start_hour",
        "end_hour",
        "duration_hours",
        "status",
        "created_at",
    )
    list_filter = ("status", "reserved_date")
    search_fields = ("user__username", "vehicle__code")