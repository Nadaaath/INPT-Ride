import api from "./axios";

export async function getReservations() {
  const response = await api.get("/reservations/");
  return response.data;
}

export async function cancelReservation(reservationId) {
  const response = await api.post(`/reservations/${reservationId}/cancel/`);
  return response.data;
}