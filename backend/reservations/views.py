from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Reservation
from .serializers import ReservationSerializer
from django.db import transaction

from .lock_utils import acquire_reservation_lock, release_reservation_lock
from .models import Reservation

class ReservationListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Reservation.objects.filter(user=self.request.user).order_by("-created_at")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        vehicle = serializer.validated_data["vehicle"]
        reserved_date = serializer.validated_data["reserved_date"]
        start_hour = serializer.validated_data["start_hour"]
        end_hour = serializer.validated_data["end_hour"]

        acquired, lock_key, lock_value = acquire_reservation_lock(
            vehicle_id=vehicle.id,
            reserved_date=reserved_date,
            start_hour=start_hour,
            end_hour=end_hour,
        )

        if not acquired:
            return Response(
                {
                    "error": "This vehicle slot is currently being reserved by another user. Please try again."
                },
                status=status.HTTP_409_CONFLICT,
            )

        try:
            with transaction.atomic():
                overlapping_exists = Reservation.objects.filter(
                    vehicle=vehicle,
                    reserved_date=reserved_date,
                    status__in=["scheduled", "converted"],
                    start_hour__lt=end_hour,
                    end_hour__gt=start_hour,
                ).exists()

                if overlapping_exists:
                    return Response(
                        {"error": "This vehicle is already reserved for the selected time slot."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                reservation = serializer.save(user=request.user)

            output_serializer = self.get_serializer(reservation)
            headers = self.get_success_headers(output_serializer.data)
            return Response(
                output_serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers,
            )
        finally:
            release_reservation_lock(lock_key, lock_value)

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Reservation
from .serializers import ReservationSerializer


class ReservationListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Reservation.objects.filter(user=self.request.user).order_by(
            "-reserved_date",
            "start_hour",
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReservationDetailAPIView(generics.RetrieveAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Reservation.objects.filter(user=self.request.user)

class ReservationCancelAPIView(generics.UpdateAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Reservation.objects.filter(user=self.request.user)

    def patch(self, request, *args, **kwargs):
        reservation = self.get_object()

        if reservation.status != "scheduled":
            return Response(
                {"error": "Only scheduled reservations can be cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reservation.status = "cancelled"
        reservation.cancelled_at = timezone.now()
        reservation.save()

        serializer = self.get_serializer(reservation)
        return Response(serializer.data, status=status.HTTP_200_OK)
class AdminCancelReservationAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not request.user.is_staff:
            return Response(
                {"error": "Only admins can cancel reservations."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            reservation = Reservation.objects.select_related("vehicle", "user").get(pk=pk)
        except Reservation.DoesNotExist:
            return Response(
                {"error": "Reservation not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if reservation.status != "scheduled":
            return Response(
                {
                    "error": "Only scheduled reservations can be cancelled."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        reservation.status = "cancelled"
        reservation.cancelled_at = timezone.now()
        reservation.save()

        vehicle = reservation.vehicle
        if vehicle.status == "reserved":
            vehicle.status = "available"
            vehicle.save()

        return Response(
            {
                "message": "Reservation cancelled successfully.",
                "reservation_id": reservation.id,
                "new_status": reservation.status,
            },
            status=status.HTTP_200_OK,
        )