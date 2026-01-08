import type { Client, Invoice, InvoiceStatus } from "./types";

export const formatDate = (value?: string | null) => {
  if (!value) return "—";
  try {
    return value.slice(0, 10);
  } catch {
    return value;
  }
};

export const formatMoney = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) return "0.00";
  const num = typeof value === "string" ? Number.parseFloat(value) : value;
  if (Number.isNaN(num)) return "0.00";
  return num.toFixed(2);
};

export const getClientDisplayName = (invoice: Invoice, clients: Client[]) => {
  if (invoice.client?.name) return invoice.client.name;
  const match = clients.find((c) => c.id === invoice.clientId);
  return match?.name || "—";
};

export const statusChipColor = (status: InvoiceStatus) => {
  switch (status) {
    case "PAID":
      return { color: "#16a34a", bg: "rgba(22,163,74,0.08)" };
    case "SENT":
      return { color: "#2563eb", bg: "rgba(37,99,235,0.08)" };
    case "OVERDUE":
      return { color: "#dc2626", bg: "rgba(220,38,38,0.08)" };
    case "CANCELLED":
      return { color: "#6b7280", bg: "rgba(107,114,128,0.08)" };
    case "DRAFT":
    default:
      return { color: "#64748b", bg: "rgba(100,116,139,0.08)" };
  }
};
