from django.conf import settings
from django.db import models


class PricingRule(models.Model):
    VEHICLE_TYPE_CHOICES = [
        ("bike", "Bike"),
        ("scooter", "Scooter"),
    ]

    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPE_CHOICES)
    base_fee = models.DecimalField(max_digits=10, decimal_places=2)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2)
    late_return_multiplier = models.DecimalField(max_digits=5, decimal_places=2, default=1.30)
    no_show_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["vehicle_type", "-created_at"]

    def __str__(self):
        return f"{self.vehicle_type} pricing - base {self.base_fee}, hourly {self.hourly_rate}"


class Invoice(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("cancelled", "Cancelled"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="invoices",
    )
    ride = models.OneToOneField(
        "rides.Ride",
        on_delete=models.CASCADE,
        related_name="invoice",
    )
    pricing_rule = models.ForeignKey(
        "billing.PricingRule",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invoices",
    )

    base_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    time_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    late_penalty_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    damage_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Invoice #{self.id} - Ride #{self.ride_id} - {self.total_amount}"