export function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function validEmail(email) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function boundedString(value, max) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= max;
}
