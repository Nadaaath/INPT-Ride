from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase

from reservations.models import Reservation
from vehicles.models import Vehicle


class ReservationModelTest(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            username="student1",
            email="student1@inptride.com",
        )

        self.vehicle = Vehicle.objects.create(
            code="BK-RES-001",
            type="bike",
            status="available",
            slot_number=10,
        )

        self.reserved_date = date.today() + timedelta(days=1)

    def test_valid_reservation_passes_model_clean(self):
        reservation = Reservation(
            user=self.user,
            vehicle=self.vehicle,
            reserved_date=self.reserved_date,
            start_hour=9,
            end_hour=11,
            duration_hours=2,
        )

        reservation.full_clean()

        self.assertEqual(reservation.status, "scheduled")

    def test_end_hour_must_be_greater_than_start_hour(self):
        reservation = Reservation(
            user=self.user,
            vehicle=self.vehicle,
            reserved_date=self.reserved_date,
            start_hour=11,
            end_hour=10,
            duration_hours=1,
        )

        with self.assertRaises(ValidationError):
            reservation.full_clean()

    def test_duration_must_match_end_hour_minus_start_hour(self):
        reservation = Reservation(
            user=self.user,
            vehicle=self.vehicle,
            reserved_date=self.reserved_date,
            start_hour=9,
            end_hour=12,
            duration_hours=2,
        )

        with self.assertRaises(ValidationError):
            reservation.full_clean()

    def test_duration_cannot_exceed_10_hours(self):
        reservation = Reservation(
            user=self.user,
            vehicle=self.vehicle,
            reserved_date=self.reserved_date,
            start_hour=7,
            end_hour=19,
            duration_hours=12,
        )

        with self.assertRaises(ValidationError):
            reservation.full_clean()

    def test_reservation_string_representation(self):
        reservation = Reservation.objects.create(
            user=self.user,
            vehicle=self.vehicle,
            reserved_date=self.reserved_date,
            start_hour=9,
            end_hour=11,
            duration_hours=2,
        )

        self.assertIn("student1", str(reservation))
        self.assertIn("BK-RES-001", str(reservation))
