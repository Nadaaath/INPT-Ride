import api from "./axios";

export async function getProfiles() {
  const response = await api.get("/accounts/profiles/");
  return response.data;
}

export async function updateProfile(profileId, payload) {
  const response = await api.put(`/accounts/profiles/${profileId}/`, payload);
  return response.data;
}