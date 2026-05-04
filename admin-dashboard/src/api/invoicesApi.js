import api from "./axios";

export async function getInvoices() {
  const response = await api.get("/billing/admin/invoices/");
  return response.data;
}