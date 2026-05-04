import api from "./axios";

export async function getVehicles() {
  const response = await api.get("/vehicles/");
  return response.data;
}

export async function getActiveRides() {
  const response = await api.get("/rides/");
  return response.data;
}

export async function createVehicle(payload) {
  const response = await api.post("/vehicles/", payload);
  return response.data;
}

export async function updateVehicle(vehicleId, payload) {
  const response = await api.put(`/vehicles/${vehicleId}/`, payload);
  return response.data;
}