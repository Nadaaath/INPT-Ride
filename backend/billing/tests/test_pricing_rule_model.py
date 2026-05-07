from decimal import Decimal

from django.test import TestCase

from billing.models import PricingRule


class PricingRuleModelTest(TestCase):
    def test_create_bike_pricing_rule(self):
        pricing_rule = PricingRule.objects.create(
            vehicle_type="bike",
            base_fee=Decimal("2.00"),
            hourly_rate=Decimal("5.00"),
            late_return_multiplier=Decimal("1.30"),
            no_show_fee=Decimal("3.00"),
            active=True,
        )

        self.assertEqual(pricing_rule.vehicle_type, "bike")
        self.assertEqual(pricing_rule.base_fee, Decimal("2.00"))
        self.assertEqual(pricing_rule.hourly_rate, Decimal("5.00"))
        self.assertEqual(pricing_rule.late_return_multiplier, Decimal("1.30"))
        self.assertEqual(pricing_rule.no_show_fee, Decimal("3.00"))
        self.assertTrue(pricing_rule.active)

    def test_default_values_are_applied(self):
        pricing_rule = PricingRule.objects.create(
            vehicle_type="scooter",
            base_fee=Decimal("3.00"),
            hourly_rate=Decimal("8.00"),
        )

        self.assertEqual(Decimal(str(pricing_rule.late_return_multiplier)), Decimal("1.30"))
        self.assertEqual(pricing_rule.no_show_fee, Decimal("0.00"))
        self.assertTrue(pricing_rule.active)

    def test_pricing_rule_string_representation(self):
        pricing_rule = PricingRule.objects.create(
            vehicle_type="bike",
            base_fee=Decimal("2.00"),
            hourly_rate=Decimal("5.00"),
        )

        self.assertEqual(
            str(pricing_rule),
            "bike pricing - base 2.00, hourly 5.00",
        )

    def test_pricing_rules_are_ordered_by_vehicle_type_then_newest(self):
        scooter_rule = PricingRule.objects.create(
            vehicle_type="scooter",
            base_fee=Decimal("3.00"),
            hourly_rate=Decimal("8.00"),
        )

        bike_rule = PricingRule.objects.create(
            vehicle_type="bike",
            base_fee=Decimal("2.00"),
            hourly_rate=Decimal("5.00"),
        )

        rules = list(PricingRule.objects.all())

        self.assertEqual(rules[0], bike_rule)
        self.assertEqual(rules[1], scooter_rule)