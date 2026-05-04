from rest_framework import serializers
from .models import PricingRule, Invoice


class PricingRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PricingRule
        fields = [
            "id",
            "vehicle_type",
            "base_fee",
            "hourly_rate",
            "late_return_multiplier",
            "no_show_fee",
            "active",
            "created_at",
        ]
        read_only_fields = ["created_at"]

class InvoiceSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    ride_id = serializers.IntegerField(source="ride.id", read_only=True)
    vehicle_code = serializers.CharField(source="ride.vehicle.code", read_only=True)
    vehicle_type = serializers.CharField(source="ride.vehicle.type", read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id",
            "user",
            "username",
            "ride",
            "ride_id",
            "vehicle_code",
            "vehicle_type",
            "base_fee",
            "time_amount",
            "late_penalty_amount",
            "damage_fee",
            "total_amount",
            "status",
            "created_at",
            "paid_at",
        ]