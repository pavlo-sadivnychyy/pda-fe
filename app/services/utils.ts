import type { ServiceFormValues } from "./types";

export const defaultServiceForm: ServiceFormValues = {
  name: "",
  description: "",
  price: "",
};

export const toCreatePayload = (form: ServiceFormValues) => ({
  name: form.name?.trim(),
  description: form.description?.trim() || null,
  price: form.price?.trim(),
});

export const toUpdatePayload = (form: ServiceFormValues) => ({
  name: form.name?.trim(),
  description: form.description?.trim() || null,
  price: form.price?.trim(),
});

export function formatMoneyUA(value: number) {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;

  // ✅ детерміновано і однаково на сервері/клієнті
  const fixed = safe.toFixed(2); // "1234.50"
  const [intPart, decPart] = fixed.split(".");
  const withSpaces = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " "); // "1 234"

  return `${withSpaces},${decPart} грн`;
}

export function formatDate(dt: string | null | undefined) {
  if (!dt) return "";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("uk-UA");
}
