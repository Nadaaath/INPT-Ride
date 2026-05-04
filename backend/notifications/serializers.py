from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "recipient_user",
            "recipient_role",
            "type",
            "title",
            "message",
            "is_read",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "recipient_user",
            "recipient_role",
            "type",
            "title",
            "message",
            "created_at",
        ]