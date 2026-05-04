from django.db import models


class Vehicle(models.Model):
    TYPE_CHOICES = [
        ("bike", "Bike"),
        ("scooter", "Scooter"),
    ]

    STATUS_CHOICES = [
        ("available", "Available"),
        ("reserved", "Reserved"),
        ("in_use", "In Use"),
        ("maintenance", "Maintenance"),
    ]

    code = models.CharField(max_length=30, unique=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="available")
    slot_number = models.PositiveIntegerField(unique=True)
    battery_level = models.PositiveIntegerField(blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["slot_number"]

    def __str__(self):
        return f"{self.code} - {self.type}"