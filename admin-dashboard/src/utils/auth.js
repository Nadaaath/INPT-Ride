export function saveAdminToken(token) {
  localStorage.setItem("admin_token", token);
}

export function getAdminToken() {
  return localStorage.getItem("admin_token");
}

export function clearAdminToken() {
  localStorage.removeItem("admin_token");
}

export function isAuthenticated() {
  return !!getAdminToken();
}