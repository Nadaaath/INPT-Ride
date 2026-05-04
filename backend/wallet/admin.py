from django.contrib import admin
from .models import WalletTransaction


@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "type",
        "amount",
        "balance_after",
        "reference_type",
        "reference_id",
        "created_at",
    )
    list_filter = ("type", "created_at")
    search_fields = ("user__username",)