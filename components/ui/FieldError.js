// Red validation message shown under a form field (used by the auth and tutor profile forms).
export default function FieldError({ id, message }) {
  return message ? <p id={id} className="mt-1 text-sm text-red-700">{message}</p> : null;
}
