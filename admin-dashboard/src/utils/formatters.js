export function formatVehicleType(type) {
  if (!type) return "-";
  return String(type).toUpperCase();
}

export function formatStatus(status) {
  if (!status) return "-";
  return String(status).replaceAll("_", " ");
}


export function formatBoolean(value) {
  return value ? "Yes" : "No";
}

export function formatMoney(value) {
  const amount = Number(value ?? 0);
  return `${amount.toFixed(2)} MAD`;
}

export function formatDate(value) {
  if (!value) return "-";

  try {
    const date = new Date(value);
    return date.toLocaleDateString();
  } catch {
    return value;
  }
}

export function formatDateTime(value) {
  if (!value) return "-";

  try {
    const date = new Date(value);
    return date.toLocaleString();
  } catch {
    return value;
  }
}

export function formatTimeHour(hour) {
  if (hour === null || hour === undefined) return "-";
  if (Number(hour) === 24) return "24:00";
  return `${String(hour).padStart(2, "0")}:00`;
}
