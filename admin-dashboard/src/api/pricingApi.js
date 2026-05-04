import api from "./axios";

export async function getPricingEntries() {
  const response = await api.get("/billing/admin/");
  return response.data;
}

export async function updatePricingEntry(pricingId, payload) {
  const response = await api.put(`/billing/admin/${pricingId}/`, payload);
  return response.data;
}