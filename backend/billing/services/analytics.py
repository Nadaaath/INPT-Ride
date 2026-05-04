from datetime import timedelta
from decimal import Decimal

from django.db.models import Avg, Count, Q, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone

from billing.models import Invoice
from rides.models import Ride


def get_analytics_summary():
    now = timezone.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    invoices = Invoice.objects.all()
    completed_rides = Ride.objects.filter(status="completed")

    total_revenue = invoices.filter(
        status__in=["paid", "completed"]
    ).aggregate(total=Sum("total_amount"))["total"] or Decimal("0.00")

    revenue_this_month = invoices.filter(
        status__in=["paid", "completed"],
        created_at__gte=month_start,
    ).aggregate(total=Sum("total_amount"))["total"] or Decimal("0.00")

    paid_invoices_count = invoices.filter(status="paid").count()
    unpaid_invoices_count = invoices.filter(status__in=["pending", "unpaid"]).count()

    late_penalties_total = invoices.aggregate(
        total=Sum("late_penalty_amount")
    )["total"] or Decimal("0.00")

    damage_penalties_total = invoices.aggregate(
        total=Sum("damage_fee")
    )["total"] or Decimal("0.00")

    completed_rides_count = completed_rides.count()

    average_revenue_per_completed_ride = invoices.filter(
        status__in=["paid", "completed"]
    ).aggregate(avg=Avg("total_amount"))["avg"] or Decimal("0.00")

    return {
        "total_revenue": total_revenue,
        "revenue_this_month": revenue_this_month,
        "paid_invoices_count": paid_invoices_count,
        "unpaid_invoices_count": unpaid_invoices_count,
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
            status__in=["paid", "completed"],
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