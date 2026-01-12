import type { Client, Quote } from "./types";

export function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toISOString().slice(0, 10);
}

export function formatMoney(v: any) {
  if (v == null) return "0.00";
  if (typeof v === "number") return v.toFixed(2);
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n.toFixed(2) : v;
  }
  return String(v);
}

export function getClientDisplayName(quote: Quote, clients: Client[]) {
  if (!quote.clientId) return "—";
  const c = clients.find((x) => x.id === quote.clientId);
  return c?.name ?? "—";
}
