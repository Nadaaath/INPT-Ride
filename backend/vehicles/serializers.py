from rest_framework import serializers
from .models import Vehicle


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = [
            "id",
            "code",
            "type",
            "status",
            "slot_number",
            "battery_level",
            "image_url",
            "created_at",
            "updated_at",
        ]