import dayjs from "dayjs";
import type { ActStatus } from "./types";

export const formatMoney = (value: string | number, currency: string) => {
  const num = Number(value);
  const rounded = Math.round(num * 100) / 100;
  return `${rounded.toLocaleString("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
};

export const formatPeriod = (from?: string | null, to?: string | null) => {
  const f = from ? dayjs(from).format("DD.MM.YYYY") : null;
  const t = to ? dayjs(to).format("DD.MM.YYYY") : null;
  if (f && t) return `${f} — ${t}`;
  if (f) return `з ${f}`;
  if (t) return `по ${t}`;
  return "—";
};

export const statusChipColor = (status: ActStatus) => {
  switch (status) {
    case "SIGNED":
      return { bg: "#ecfdf3", color: "#16a34a" };
    case "SENT":
      return { bg: "#eff6ff", color: "#2563eb" };
    case "CANCELLED":
      return { bg: "#fef2f2", color: "#b91c1c" };
    default:
      return { bg: "#f3f4f6", color: "#4b5563" };
  }
};

export const actStatusLabel: Record<ActStatus, string> = {
  DRAFT: "Чернетка",
  SENT: "Надіслано",
  SIGNED: "Підписано",
  CANCELLED: "Скасовано",
};

export const getApiBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
