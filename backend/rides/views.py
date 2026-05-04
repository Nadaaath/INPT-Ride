import math
from decimal import Decimal

from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from billing.services import calculate_ride_cost
from notifications.models import Notification
from wallet.models import WalletTransaction
from .models import Ride
from .serializers import RideSerializer, StartRideSerializer, EndRideSerializer
from billing.models import Invoice

class RideListAPIView(generics.ListAPIView):
    serializer_class = RideSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Ride.objects.filter(user=self.request.user).order_by("-created_at")


class StartRideAPIView(generics.GenericAPIView):
    serializer_class = StartRideSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reservation = serializer.validated_data["reservation"]
        vehicle = reservation.vehicle

        ride = Ride.objects.create(
            user=request.user,
            vehicle=vehicle,
            reservation=reservation,
            actual_start_time=timezone.now(),
            status="ongoing",
        )

        reservation.status = "converted"
        reservation.save()

        vehicle.status = "in_use"
        vehicle.save()

        admin_users = type(request.user).objects.filter(is_staff=True)
        for admin_user in admin_users:
            Notification.objects.create(
                recipient_user=admin_user,
                type="ride_started",
                title="Ride started",
                message=(
                    f"User {request.user.username} started ride for vehicle "
                    f"{vehicle.code} using reservation #{reservation.id}."
                ),
            )

        Notification.objects.create(
            recipient_user=request.user,
            type="ride_started",
            title="Ride started successfully",
            message=(
                f"Your ride for vehicle {vehicle.code} has started successfully."
            ),
        )

        output_serializer = RideSerializer(ride)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class EndRideAPIView(generics.GenericAPIView):
    serializer_class = EndRideSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ride = serializer.validated_data["ride"]
        vehicle = ride.vehicle
        user = request.user
        profile = user.profile

        end_time = timezone.now()
        ride.actual_end_time = end_time

        duration_seconds = (ride.actual_end_time - ride.actual_start_time).total_seconds()
        used_hours = max(1, math.ceil(duration_seconds / 3600))
        ride.used_hours = used_hours
        ride.status = "completed"
        ride.save()

        pricing_result = calculate_ride_cost(vehicle.type, used_hours)
        total_amount = pricing_result["total_amount"]

        current_balance = Decimal(profile.wallet_balance)
        new_balance = current_balance - total_amount

        profile.wallet_balance = new_balance
        profile.save()

        invoice = Invoice.objects.create(
            user=user,
            ride=ride,
            pricing_rule=pricing_result["pricing_rule"],
            base_fee=pricing_result["base_amount"],
            time_amount=pricing_result["time_amount"],
            late_penalty_amount=Decimal("0.00"),
            damage_fee=Decimal("0.00"),
            total_amount=total_amount,
            status="paid",
            paid_at=timezone.now(),
        )

        WalletTransaction.objects.create(
            user=user,
            type="ride_payment",
            amount=total_amount,
            balance_after=new_balance,
            reference_type="ride",
            reference_id=ride.id,
        )

        vehicle.status = "available"
        vehicle.save()

        Notification.objects.create(
            recipient_user=user,
            type="ride_ended",
            title="Ride ended",
            message=(
                f"Your ride for vehicle {vehicle.code} has ended. "
                f"Used hours: {used_hours}. "
                f"Charged amount: {total_amount}. "
                f"New wallet balance: {new_balance}."
            ),
        )

        output_serializer = RideSerializer(ride)
        return Response(
            {
                "ride": output_serializer.data,
                "invoice": {
                    "id": invoice.id,
                    "status": invoice.status,
                    "base_fee": str(invoice.base_fee),
                    "time_amount": str(invoice.time_amount),
                    "late_penalty_amount": str(invoice.late_penalty_amount),
                    "damage_fee": str(invoice.damage_fee),
                    "total_amount": str(invoice.total_amount),
                    "paid_at": invoice.paid_at.isoformat() if invoice.paid_at else None,
                },
                "pricing": {
                    "base_amount": str(pricing_result["base_amount"]),
                    "time_amount": str(pricing_result["time_amount"]),
                    "total_amount": str(pricing_result["total_amount"]),
                    "used_hours": used_hours,
                },
                "wallet": {
                    "previous_balance": str(current_balance),
                    "new_balance": str(new_balance),
                }
            },
            status=status.HTTP_200_OK,
        )