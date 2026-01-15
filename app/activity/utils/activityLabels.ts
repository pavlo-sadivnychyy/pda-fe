// src/utils/activityLabels.ts

export type ActivityEntityType = "INVOICE" | "ACT" | "QUOTE" | string;

export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED"
  | string;

export type ActStatus = "DRAFT" | "SENT" | "SIGNED" | "CANCELLED" | string;

export type QuoteStatus =
  | "DRAFT"
  | "SENT"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "CONVERTED"
  | string;

export function uaStatusLabel(
  entityType: ActivityEntityType,
  status?: string | null,
) {
  if (!status) return "—";

  // invoices
  if (entityType === "INVOICE") {
    const map: Record<string, string> = {
      DRAFT: "Чернетка",
      SENT: "Відправлено",
      PAID: "Оплачено",
      OVERDUE: "Прострочено",
      CANCELLED: "Скасовано",
    };
    return map[status] ?? status;
  }

  // acts
  if (entityType === "ACT") {
    const map: Record<string, string> = {
      DRAFT: "Чернетка",
      SENT: "Відправлено",
      SIGNED: "Підписано",
      CANCELLED: "Скасовано",
    };
    return map[status] ?? status;
  }

  // quotes
  if (entityType === "QUOTE") {
    const map: Record<string, string> = {
      DRAFT: "Чернетка",
      SENT: "Надіслано",
      ACCEPTED: "Прийнято",
      REJECTED: "Відхилено",
      EXPIRED: "Протерміновано",
      CONVERTED: "Конвертовано",
    };
    return map[status] ?? status;
  }

  // fallback
  return status;
}

export function uaEntityLabel(entityType?: string | null) {
  if (!entityType) return "Документ";
  const map: Record<string, string> = {
    INVOICE: "Інвойс",
    ACT: "Акт",
    QUOTE: "Комерційна пропозиція",
  };
  return map[entityType] ?? entityType;
}

const STATUS_UA: Record<string, string> = {
  // invoice / common
  DRAFT: "Чернетка",
  SENT: "Відправлено",
  PAID: "Оплачено",
  OVERDUE: "Прострочено",
  CANCELLED: "Скасовано",

  // acts
  SIGNED: "Підписано",

  // quotes
  ACCEPTED: "Прийнято",
  REJECTED: "Відхилено",
  EXPIRED: "Протерміновано",
  CONVERTED: "Конвертовано",
};

export function uaStatusFromString(input?: string | null): string {
  if (!input) return "—";

  const s = String(input).trim();
  if (!s) return "—";

  // нормалізуємо різні стрілки/розділювачі
  // підтримка: "A → B", "A->B", "A => B", "A →B", "A→ B"
  const normalized = s.replace(/\s*(->|=>|→)\s*/g, " → ");

  if (normalized.includes(" → ")) {
    const [rawFrom, rawTo] = normalized.split(" → ").map((x) => x.trim());

    const from = STATUS_UA[rawFrom] ?? rawFrom;
    const to = STATUS_UA[rawTo] ?? rawTo;

    return `${from} → ${to}`;
  }

  // якщо без стрілки — просто один статус
  return STATUS_UA[normalized] ?? normalized;
}
