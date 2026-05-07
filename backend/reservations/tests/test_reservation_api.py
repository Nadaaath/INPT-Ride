from datetime import date, timedelta
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate

from reservations.models import Reservation
from reservations.views import ReservationListCreateAPIView
from vehicles.models import Vehicle


class ReservationListCreateAPITest(TestCase):
    def setUp(self):
        User = get_user_model()

        self.user = User.objects.create_user(
            username="student_api",
            email="student_api@inptride.com",
        )

        self.vehicle = Vehicle.objects.create(
            code="BK-API-001",
            type="bike",
            status="available",
            slot_number=50,
        )

        self.reserved_date = date.today() + timedelta(days=1)
        self.factory = APIRequestFactory()
        self.view = ReservationListCreateAPIView.as_view()

    def make_post_request(self, data):
        request = self.factory.post(
            "/api/reservations/",
            data,
            format="json",
        )
        force_authenticate(request, user=self.user)
        return self.view(request)

    @patch("reservations.views.release_reservation_lock")
    @patch("reservations.views.acquire_reservation_lock")
    def test_create_reservation_uses_redis_lock(
        self,
        mock_acquire_lock,
        mock_release_lock,
    ):
        mock_acquire_lock.return_value = (
            True,
            "reservation_lock:test",
            "lock-value",
        )

        response = self.make_post_request(
            {
                "vehicle": self.vehicle.id,
                "reserved_date": self.reserved_date.isoformat(),
                "start_hour": 9,
                "end_hour": 11,
                "duration_hours": 2,
            }
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Reservation.objects.count(), 1)

        mock_acquire_lock.assert_called_once()
        mock_release_lock.assert_called_once_with(
            "reservation_lock:test",
            "lock-value",
        )

    @patch("reservations.views.release_reservation_lock")
    @patch("reservations.views.acquire_reservation_lock")
    def test_create_reservation_returns_conflict_when_lock_not_acquired(
        self,
        mock_acquire_lock,
        mock_release_lock,
    ):
        mock_acquire_lock.return_value = (
            False,
            "reservation_lock:test",
            "lock-value",
        )

        response = self.make_post_request(
            {
                "vehicle": self.vehicle.id,
                "reserved_date": self.reserved_date.isoformat(),
                "start_hour": 9,
                "end_hour": 11,
                "duration_hours": 2,
            }
        )

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(Reservation.objects.count(), 0)

        mock_acquire_lock.assert_called_once()
        mock_release_lock.assert_not_called()

    @patch("reservations.views.release_reservation_lock")
    @patch("reservations.views.acquire_reservation_lock")
    def test_create_reservation_rejects_existing_overlap_before_lock(
        self,
        mock_acquire_lock,
        mock_release_lock,
    ):
        Reservation.objects.create(
            user=self.user,
            vehicle=self.vehicle,
            reserved_date=self.reserved_date,
            start_hour=9,
            end_hour=11,
            duration_hours=2,
            status="scheduled",
        )

        response = self.make_post_request(
            {
                "vehicle": self.vehicle.id,
                "reserved_date": self.reserved_date.isoformat(),
                "start_hour": 10,
                "end_hour": 12,
                "duration_hours": 2,
            }
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Reservation.objects.count(), 1)

        mock_acquire_lock.assert_not_called()
        mock_release_lock.assert_not_called()
