from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class Reservation(models.Model):
    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("cancelled", "Cancelled"),
        ("converted", "Converted to Ride"),
        ("completed", "Completed"),
        ("no_show", "No Show"),
        ("partially_used", "Partially Used"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reservations"
    )
    vehicle = models.ForeignKey(
        "vehicles.Vehicle",
        on_delete=models.CASCADE,
        related_name="reservations"
    )
    reserved_date = models.DateField()
    start_hour = models.PositiveIntegerField()
    end_hour = models.PositiveIntegerField()
    duration_hours = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="scheduled")
    created_at = models.DateTimeField(auto_now_add=True)
    cancelled_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ["-reserved_date", "start_hour"]

    def clean(self):
        errors = {}

        if not (0 <= self.start_hour <= 23):
            errors["start_hour"] = "Start hour must be between 0 and 23."

        if not (1 <= self.end_hour <= 24):
            errors["end_hour"] = "End hour must be between 1 and 24."

        if self.end_hour <= self.start_hour:
            errors["end_hour"] = "End hour must be greater than start hour."

        expected_duration = self.end_hour - self.start_hour
        if self.duration_hours != expected_duration:
            errors["duration_hours"] = (
                f"Duration must be equal to end_hour - start_hour ({expected_duration})."
            )

        if not (1 <= self.duration_hours <= 10):
            errors["duration_hours"] = "Duration must be between 1 and 10 hours."

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f"{self.user} - {self.vehicle} - {self.reserved_date} {self.start_hour}:00"