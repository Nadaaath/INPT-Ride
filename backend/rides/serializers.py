from decimal import Decimal

from rest_framework import serializers
from accounts.models import UserProfile
from billing.models import PricingRule
from reservations.models import Reservation
from .models import Ride


class RideSerializer(serializers.ModelSerializer):
    vehicle_code = serializers.CharField(source="vehicle.code", read_only=True)
    vehicle_type = serializers.CharField(source="vehicle.type", read_only=True)
    vehicle_slot_number = serializers.IntegerField(source="vehicle.slot_number", read_only=True)

    reservation_date = serializers.DateField(source="reservation.reserved_date", read_only=True)
    reservation_start_hour = serializers.IntegerField(source="reservation.start_hour", read_only=True)
    reservation_end_hour = serializers.IntegerField(source="reservation.end_hour", read_only=True)

    class Meta:
        model = Ride
        fields = [
            "id",
            "user",
            "vehicle",
            "vehicle_code",
            "vehicle_type",
            "vehicle_slot_number",
            "reservation",
            "reservation_date",
            "reservation_start_hour",
            "reservation_end_hour",
            "actual_start_time",
            "actual_end_time",
            "used_hours",
            "distance_km",
            "status",
            "created_at",
        ]


class StartRideSerializer(serializers.Serializer):
    reservation_id = serializers.IntegerField()

    def validate(self, attrs):
        request = self.context["request"]
        user = request.user
        reservation_id = attrs.get("reservation_id")

        if not user or not user.is_authenticated:
            raise serializers.ValidationError("Authentication is required.")

        try:
            profile = user.profile
        except UserProfile.DoesNotExist:
            raise serializers.ValidationError("User profile does not exist.")

        if profile.is_banned:
            raise serializers.ValidationError("Banned users cannot start rides.")

        try:
            reservation = Reservation.objects.select_related("vehicle", "user").get(
                id=reservation_id,
                user=user
            )
        except Reservation.DoesNotExist:
            raise serializers.ValidationError("Reservation not found for this user.")

        if reservation.status != "scheduled":
            raise serializers.ValidationError("Only scheduled reservations can start a ride.")

        if reservation.vehicle.status == "in_use":
            raise serializers.ValidationError("Vehicle is already in use.")

        pricing_rule = PricingRule.objects.filter(
            vehicle_type=reservation.vehicle.type,
            active=True
        ).order_by("-created_at").first()

        if not pricing_rule:
            raise serializers.ValidationError(
                f"No active pricing rule found for vehicle type '{reservation.vehicle.type}'."
            )

        if Decimal(profile.wallet_balance) < Decimal(pricing_rule.base_fee):
            raise serializers.ValidationError(
                "Insufficient wallet balance to start ride. Minimum base fee is required."
            )

        attrs["reservation"] = reservation
        return attrs


class EndRideSerializer(serializers.Serializer):
    ride_id = serializers.IntegerField()

    def validate(self, attrs):
        request = self.context["request"]
        user = request.user
        ride_id = attrs.get("ride_id")

        if not user or not user.is_authenticated:
            raise serializers.ValidationError("Authentication is required.")

        try:
            ride = Ride.objects.select_related("vehicle", "reservation", "user").get(
                id=ride_id,
                user=user,
                status="ongoing"
            )
        except Ride.DoesNotExist:
            raise serializers.ValidationError("Ongoing ride not found for this user.")

        attrs["ride"] = ride
        return attrs