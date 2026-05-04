import api from "./axios";

export async function getBillingAnalyticsSummary() {
  const response = await api.get("/billing/admin/analytics/summary/");
  return response.data;
}

export async function getBillingRevenueTrend(days = 30) {
  const response = await api.get(`/billing/admin/analytics/revenue-trend/?days=${days}`);
  return response.data;
}