from django.urls import path
from .views import (
    PricingRuleListAPIView,
    AdminPricingRuleListCreateAPIView,
    AdminPricingRuleDetailAPIView,
    AdminInvoiceListAPIView,
    AdminBillingAnalyticsSummaryAPIView,
    AdminBillingRevenueTrendAPIView,
)

urlpatterns = [
    path("", PricingRuleListAPIView.as_view(), name="pricing-rule-list"),
    path("admin/", AdminPricingRuleListCreateAPIView.as_view(), name="admin-pricing-rule-list-create"),
    path("admin/<int:pk>/", AdminPricingRuleDetailAPIView.as_view(), name="admin-pricing-rule-detail"),
    path("admin/invoices/", AdminInvoiceListAPIView.as_view(), name="admin-invoice-list"),
    path("admin/analytics/summary/", AdminBillingAnalyticsSummaryAPIView.as_view(), name="admin-billing-analytics-summary"),
    path("admin/analytics/revenue-trend/", AdminBillingRevenueTrendAPIView.as_view(), name="admin-billing-revenue-trend"),
]