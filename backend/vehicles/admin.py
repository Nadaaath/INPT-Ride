from django.contrib import admin
from .models import Vehicle


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ("code", "type", "status", "slot_number", "battery_level", "created_at")
    search_fields = ("code",)
    list_filter = ("type", "status")