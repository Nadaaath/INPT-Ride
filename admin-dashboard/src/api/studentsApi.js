import api from "./axios";

export async function getAuthorizedStudents() {
  const response = await api.get("/accounts/authorized-students/");
  return response.data;
}

export async function createAuthorizedStudent(payload) {
  const response = await api.post("/accounts/authorized-students/", payload);
  return response.data;
}

export async function updateAuthorizedStudent(studentId, payload) {
  const response = await api.put(
    `/accounts/authorized-students/${studentId}/`,
    payload
  );
  return response.data;
}