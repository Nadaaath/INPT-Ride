import api from "./axios";

export async function loginAdmin({ email, password }) {
  const response = await api.post("/accounts/login/", {
    email,
    password,
  });

  return response.data;
}