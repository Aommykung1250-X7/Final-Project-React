export function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function validEmail(email) {
  if (typeof email !== "string" || email.length > 254) return false;

  const atIndex = email.indexOf("@");
  if (atIndex <= 0 || atIndex !== email.lastIndexOf("@")) return false;

  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);
  if (localPart.length > 64 || domain.length > 253) return false;
  if (!/^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/.test(localPart)) return false;

  const labels = domain.split(".");
  if (labels.length < 2 || labels.some((label) => label.length > 63 || !/^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(label))) return false;

  const topLevelDomain = labels.at(-1);
  return /^[A-Za-z]{2,63}$/.test(topLevelDomain) || /^xn--[A-Za-z0-9-]{4,59}$/i.test(topLevelDomain);
}

const commonEmailDomainTypos = new Map([
  ["gmail.ocm", "gmail.com"], ["gmail.con", "gmail.com"], ["gmail.cmo", "gmail.com"],
  ["gmail.comm", "gmail.com"], ["gmai.com", "gmail.com"], ["gmial.com", "gmail.com"],
  ["gmali.com", "gmail.com"], ["gmal.com", "gmail.com"],
  ["hotmail.ocm", "hotmail.com"], ["hotmail.con", "hotmail.com"], ["hotmail.cmo", "hotmail.com"],
  ["hotmial.com", "hotmail.com"], ["hotmai.com", "hotmail.com"], ["hotmil.com", "hotmail.com"],
  ["outlook.ocm", "outlook.com"], ["outlook.con", "outlook.com"], ["outlook.cmo", "outlook.com"],
  ["outlok.com", "outlook.com"], ["outllok.com", "outlook.com"],
  ["yahoo.ocm", "yahoo.com"], ["yahoo.con", "yahoo.com"], ["yahoo.cmo", "yahoo.com"],
  ["yaho.com", "yahoo.com"], ["yahho.com", "yahoo.com"],
]);

export function registrationEmailError(email) {
  if (!validEmail(email)) return "กรุณากรอกอีเมลให้ถูกต้อง";

  const domain = email.slice(email.lastIndexOf("@") + 1).toLowerCase();
  const suggestedDomain = commonEmailDomainTypos.get(domain);
  return suggestedDomain
    ? `โดเมนอีเมลอาจพิมพ์ผิด ลองตรวจสอบว่าเป็น @${suggestedDomain} หรือไม่`
    : null;
}

export function validRegistrationEmail(email) {
  return registrationEmailError(email) === null;
}

export function boundedString(value, max) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= max;
}
