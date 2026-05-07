from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase

from reservations.models import Reservation
from reservations.serializers import ReservationSerializer
from vehicles.models import Vehicle


class DummyRequest:
    def __init__(self, user):
        self.user = user


class ReservationSerializerTest(TestCase):
    def setUp(self):
        User = get_user_model()

        self.user = User.objects.create_user(
            username="student1",
            email="student1@inptride.com",
        )

        self.vehicle = Vehicle.objects.create(
            code="BK-SER-001",
            type="bike",
            status="available",
            slot_number=20,
        )

        self.reserved_date = date.today() + timedelta(days=1)

    def build_serializer(self, data):
        return ReservationSerializer(
            data=data,
            context={"request": DummyRequest(self.user)},
        )

    def test_serializer_accepts_valid_reservation(self):
        serializer = self.build_serializer(
            {
                "vehicle": self.vehicle.id,
                "reserved_date": self.reserved_date.isoformat(),
                "start_hour": 9,
                "end_hour": 11,
                "duration_hours": 2,
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_serializer_rejects_vehicle_currently_in_use(self):
        self.vehicle.status = "in_use"
        self.vehicle.save()

        serializer = self.build_serializer(
            {
                "vehicle": self.vehicle.id,
                "reserved_date": self.reserved_date.isoformat(),
                "start_hour": 9,
                "end_hour": 11,
                "duration_hours": 2,
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("Vehicle is currently in use.", str(serializer.errors))

    def test_serializer_rejects_invalid_start_hour(self):
        serializer = self.build_serializer(
            {
                "vehicle": self.vehicle.id,
                "reserved_date": self.reserved_date.isoformat(),
                "start_hour": 6,
                "end_hour": 8,
                "duration_hours": 2,
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("Start hour must be between 7 and 23.", str(serializer.errors))

    def test_serializer_rejects_duration_above_10_hours(self):
        serializer = self.build_serializer(
            {
                "vehicle": self.vehicle.id,
                "reserved_date": self.reserved_date.isoformat(),
                "start_hour": 7,
                "end_hour": 18,
                "duration_hours": 11,
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("Reservation duration must be between 1 and 10 hours.", str(serializer.errors))

    def test_serializer_rejects_overlapping_reservation(self):
        Reservation.objects.create(
            user=self.user,
            vehicle=self.vehicle,
            reserved_date=self.reserved_date,
            start_hour=9,
            end_hour=11,
            duration_hours=2,
            status="scheduled",
        )

        serializer = self.build_serializer(
            {
                "vehicle": self.vehicle.id,
                "reserved_date": self.reserved_date.isoformat(),
                "start_hour": 10,
                "end_hour": 12,
                "duration_hours": 2,
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn(
            "This vehicle is already reserved for the selected time slot.",
            str(serializer.errors),
        )

    def test_serializer_allows_non_overlapping_reservation(self):
        Reservation.objects.create(
            user=self.user,
            vehicle=self.vehicle,
            reserved_date=self.reserved_date,
            start_hour=9,
            end_hour=11,
            duration_hours=2,
            status="scheduled",
        )

        serializer = self.build_serializer(
            {
                "vehicle": self.vehicle.id,
                "reserved_date": self.reserved_date.isoformat(),
                "start_hour": 11,
                "end_hour": 13,
                "duration_hours": 2,
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
