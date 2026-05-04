from datetime import timedelta
from decimal import Decimal

from django.db.models import Avg, Count, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone

from billing.models import Invoice, PricingRule


def calculate_ride_cost(vehicle_type: str, used_hours: int) -> dict:
    pricing_rule = PricingRule.objects.filter(
        vehicle_type=vehicle_type,
        active=True
    ).order_by("-created_at").first()

    if not pricing_rule:
        raise ValueError(f"No active pricing rule found for vehicle type '{vehicle_type}'.")

    base_amount = pricing_rule.base_fee
    time_amount = pricing_rule.hourly_rate * Decimal(used_hours)
    total_amount = base_amount + time_amount

    return {
        "pricing_rule": pricing_rule,
        "base_amount": base_amount,
        "time_amount": time_amount,
        "total_amount": total_amount,
    }

def get_analytics_summary():
    now = timezone.now()

    day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = day_start - timedelta(days=day_start.weekday())
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    invoices = Invoice.objects.all()
    paid_invoices = invoices.filter(status="paid")

    total_revenue = paid_invoices.aggregate(
        total=Sum("total_amount")
    )["total"] or Decimal("0.00")

    revenue_today = paid_invoices.filter(
        created_at__gte=day_start
    ).aggregate(total=Sum("total_amount"))["total"] or Decimal("0.00")

    revenue_this_week = paid_invoices.filter(
        created_at__gte=week_start
    ).aggregate(total=Sum("total_amount"))["total"] or Decimal("0.00")

    revenue_this_month = paid_invoices.filter(
        created_at__gte=month_start
    ).aggregate(total=Sum("total_amount"))["total"] or Decimal("0.00")

    paid_invoices_count = paid_invoices.count()
    unpaid_invoices_count = invoices.filter(status="pending").count()

    paid_invoices_today = paid_invoices.filter(created_at__gte=day_start).count()
    paid_invoices_this_week = paid_invoices.filter(created_at__gte=week_start).count()
    paid_invoices_this_month = paid_invoices.filter(created_at__gte=month_start).count()

    late_penalties_total = invoices.aggregate(
        total=Sum("late_penalty_amount")
    )["total"] or Decimal("0.00")

    damage_penalties_total = invoices.aggregate(
        total=Sum("damage_fee")
    )["total"] or Decimal("0.00")

    completed_rides_count = paid_invoices.count()

    average_revenue_per_completed_ride = paid_invoices.aggregate(
        avg=Avg("total_amount")
    )["avg"] or Decimal("0.00")

    return {
        "total_revenue": total_revenue,
        "revenue_today": revenue_today,
        "revenue_this_week": revenue_this_week,
        "revenue_this_month": revenue_this_month,
        "paid_invoices_count": paid_invoices_count,
        "unpaid_invoices_count": unpaid_invoices_count,
        "paid_invoices_today": paid_invoices_today,
        "paid_invoices_this_week": paid_invoices_this_week,
        "paid_invoices_this_month": paid_invoices_this_month,
        "late_penalties_total": late_penalties_total,
        "damage_penalties_total": damage_penalties_total,
        "completed_rides_count": completed_rides_count,
        "average_revenue_per_completed_ride": average_revenue_per_completed_ride,
    }

def get_revenue_trend(days=30):
    now = timezone.now()
    start_date = now - timedelta(days=days - 1)

    qs = (
        Invoice.objects.filter(
            status="paid",
            created_at__date__gte=start_date.date(),
        )
        .annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(revenue=Sum("total_amount"), invoices_count=Count("id"))
        .order_by("day")
    )

    results = []
    current = start_date.date()
    raw_map = {item["day"]: item for item in qs}

    while current <= now.date():
        item = raw_map.get(current)
        results.append(
            {
                "day": current.isoformat(),
                "revenue": item["revenue"] if item else Decimal("0.00"),
                "invoices_count": item["invoices_count"] if item else 0,
            }
        )
        current += timedelta(days=1)

    return results