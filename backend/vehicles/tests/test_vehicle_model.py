from django.test import TestCase
from vehicles.models import Vehicle


class VehicleModelTest(TestCase):
    def test_create_bike_vehicle(self):
        vehicle = Vehicle.objects.create(
            code="BK-TEST-001",
            type="bike",
            status="available",
            slot_number=1,
        )

        self.assertEqual(vehicle.code, "BK-TEST-001")
        self.assertEqual(vehicle.type, "bike")
        self.assertEqual(vehicle.status, "available")
        self.assertEqual(vehicle.slot_number, 1)
        self.assertIsNone(vehicle.battery_level)
        self.assertEqual(str(vehicle), "BK-TEST-001 - bike")

    def test_create_scooter_vehicle_with_battery(self):
        vehicle = Vehicle.objects.create(
            code="SC-TEST-001",
            type="scooter",
            status="available",
            slot_number=2,
            battery_level=85,
        )

        self.assertEqual(vehicle.code, "SC-TEST-001")
        self.assertEqual(vehicle.type, "scooter")
        self.assertEqual(vehicle.status, "available")
        self.assertEqual(vehicle.slot_number, 2)
        self.assertEqual(vehicle.battery_level, 85)
        self.assertEqual(str(vehicle), "SC-TEST-001 - scooter")

    def test_vehicle_ordering_by_slot_number(self):
        Vehicle.objects.create(
            code="BK-TEST-002",
            type="bike",
            status="available",
            slot_number=5,
        )

        Vehicle.objects.create(
            code="BK-TEST-003",
            type="bike",
            status="available",
            slot_number=3,
        )

        vehicles = list(Vehicle.objects.all())

        self.assertEqual(vehicles[0].slot_number, 3)
        self.assertEqual(vehicles[1].slot_number, 5)