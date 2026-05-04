from django.conf import settings
from django.db import models


class Notification(models.Model):
    TYPE_CHOICES = [
        ("ride_started", "Ride Started"),
        ("ride_ended", "Ride Ended"),
        ("wallet_top_up", "Wallet Top Up"),
        ("general", "General"),
    ]

    recipient_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
        blank=True,
        null=True,
    )
    recipient_role = models.CharField(max_length=30, blank=True, null=True)
    type = models.CharField(max_length=30, choices=TYPE_CHOICES, default="general")
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        target = self.recipient_user.username if self.recipient_user else self.recipient_role
        return f"{self.type} -> {target}"