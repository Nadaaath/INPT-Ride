from django.contrib import admin
from .models import PricingRule


@admin.register(PricingRule)
class PricingRuleAdmin(admin.ModelAdmin):
    list_display = (
        "vehicle_type",
        "base_fee",
        "hourly_rate",
        "late_return_multiplier",
        "no_show_fee",
        "active",
        "created_at",
    )
    list_filter = ("vehicle_type", "active")