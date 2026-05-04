import api from "./axios";

export async function getRides() {
  const response = await api.get("/rides/");
  return response.data;
}