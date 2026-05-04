from rest_framework import serializers

from .models import Reservation


class ReservationSerializer(serializers.ModelSerializer):
    vehicle_code = serializers.CharField(source="vehicle.code", read_only=True)
    vehicle_type = serializers.CharField(source="vehicle.type", read_only=True)
    vehicle_slot_number = serializers.IntegerField(source="vehicle.slot_number", read_only=True)

    class Meta:
        model = Reservation
        fields = [
            "id",
            "user",
            "vehicle",
            "vehicle_code",
            "vehicle_type",
            "vehicle_slot_number",
            "reserved_date",
            "start_hour",
            "end_hour",
            "duration_hours",
            "status",
            "created_at",
            "cancelled_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "vehicle_code",
            "vehicle_type",
            "vehicle_slot_number",
            "status",
            "created_at",
            "cancelled_at",
        ]

    def validate(self, attrs):
        request = self.context["request"]
        user = request.user

        if hasattr(user, "profile"):
            if user.profile.is_banned:
                raise serializers.ValidationError("Banned users cannot create reservations.")

        vehicle = attrs["vehicle"]
        reserved_date = attrs["reserved_date"]
        start_hour = attrs["start_hour"]
        end_hour = attrs["end_hour"]
        duration_hours = attrs["duration_hours"]

        if vehicle.status == "in_use":
            raise serializers.ValidationError("Vehicle is currently in use.")

        if start_hour < 7 or start_hour > 23:
            raise serializers.ValidationError("Start hour must be between 7 and 23.")

        if end_hour < 8 or end_hour > 24:
            raise serializers.ValidationError("End hour must be between 8 and 24.")

        if end_hour <= start_hour:
            raise serializers.ValidationError("End hour must be greater than start hour.")

        if duration_hours != (end_hour - start_hour):
            raise serializers.ValidationError("Duration hours must match end_hour - start_hour.")

        if duration_hours < 1 or duration_hours > 10:
            raise serializers.ValidationError("Reservation duration must be between 1 and 10 hours.")

        overlapping_reservations = Reservation.objects.filter(
            vehicle=vehicle,
            reserved_date=reserved_date,
            status__in=["scheduled", "converted", "partially_used"],
            start_hour__lt=end_hour,
            end_hour__gt=start_hour,
        )

        if self.instance:
            overlapping_reservations = overlapping_reservations.exclude(id=self.instance.id)

        if overlapping_reservations.exists():
            raise serializers.ValidationError(
                "This vehicle is already reserved for the selected time slot."
            )

        return attrs