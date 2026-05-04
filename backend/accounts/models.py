from django.conf import settings
from django.db import models


class AuthorizedStudent(models.Model):
    full_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    student_identifier = models.CharField(max_length=50, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["full_name"]

    def __str__(self):
        return f"{self.full_name} ({self.email})"


class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile"
    )
    wallet_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    warning_count = models.PositiveIntegerField(default=0)
    is_banned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Profile - {self.user.username}"