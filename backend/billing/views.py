from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminUserCustom
from .models import PricingRule, Invoice
from .serializers import PricingRuleSerializer, InvoiceSerializer
from .services import get_analytics_summary, get_revenue_trend


class PricingRuleListAPIView(generics.ListAPIView):
    queryset = PricingRule.objects.all()
    serializer_class = PricingRuleSerializer


class AdminPricingRuleListCreateAPIView(generics.ListCreateAPIView):
    queryset = PricingRule.objects.all()
    serializer_class = PricingRuleSerializer
    permission_classes = [IsAuthenticated, IsAdminUserCustom]


class AdminPricingRuleDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PricingRule.objects.all()
    serializer_class = PricingRuleSerializer
    permission_classes = [IsAuthenticated, IsAdminUserCustom]


class AdminInvoiceListAPIView(generics.ListAPIView):
    queryset = Invoice.objects.select_related("user", "ride", "ride__vehicle").all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated, IsAdminUserCustom]


class AdminBillingAnalyticsSummaryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response(
                {"error": "Only admins can access analytics."},
                status=403,
            )

        data = get_analytics_summary()
        return Response(data, status=200)


class AdminBillingRevenueTrendAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response(
                {"error": "Only admins can access analytics."},
                status=403,
            )

        try:
            days = int(request.query_params.get("days", 30))
        except ValueError:
            days = 30

        days = max(1, min(days, 365))

        data = get_revenue_trend(days=days)
        return Response(data, status=200)