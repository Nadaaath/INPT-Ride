import api from "./axios";

export async function getVehicles() {
  const response = await api.get("/vehicles/");
  return response.data;
}

export async function createVehicle(payload) {
  const response = await api.post("/vehicles/admin/", payload);
  return response.data;
}

export async function updateVehicle(vehicleId, payload) {
  const response = await api.put(`/vehicles/admin/${vehicleId}/`, payload);
  return response.data;
}