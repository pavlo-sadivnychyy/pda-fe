import type { ClientFormValues, ClientCrmStatus } from "./types";

export const CRM_STATUS_LABELS: Record<ClientCrmStatus, string> = {
  LEAD: "Лід",
  IN_PROGRESS: "В роботі",
  ACTIVE: "Активний",
  INACTIVE: "Неактивний",
};

export const CRM_STATUS_COLOR: Record<
  ClientCrmStatus,
  "default" | "info" | "success" | "warning"
> = {
  LEAD: "default",
  IN_PROGRESS: "info",
  ACTIVE: "success",
  INACTIVE: "warning",
};

export const defaultClientForm: ClientFormValues = {
  name: "",
  contactName: "",
  email: "",
  phone: "",
  taxNumber: "",
  address: "",
  notes: "",

  // ✅ NEW defaults
  crmStatus: "LEAD",
  tags: [],
};

export function formatDate(iso?: string | null) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("uk-UA");
  } catch {
    return "";
  }
}

// нормалізація тегів як на бекенді: trim, unique, limit
export function normalizeTags(tags: string[]) {
  const cleaned = (tags ?? [])
    .map((t) => (t ?? "").trim())
    .filter(Boolean)
    .map((t) => (t.length > 30 ? t.slice(0, 30) : t));

  return Array.from(new Set(cleaned)).slice(0, 20);
}

export function toCreatePayload({
  organizationId,
  createdById,
  form,
}: {
  organizationId: string;
  createdById: string;
  form: ClientFormValues;
}) {
  return {
    organizationId,
    createdById, // бекенд ігнорує, але хай буде для сумісності
    name: form.name.trim(),
    contactName: form.contactName.trim() || undefined,
    email: form.email.trim() || undefined,
    phone: form.phone.trim() || undefined,
    taxNumber: form.taxNumber.trim() || undefined,
    address: form.address.trim() || undefined,
    notes: form.notes.trim() || undefined,

    // ✅ NEW
    crmStatus: form.crmStatus,
    tags: normalizeTags(form.tags),
  };
}

export function toUpdatePayload(form: ClientFormValues) {
  return {
    name: form.name.trim() || undefined,
    contactName: form.contactName.trim() || undefined,
    email: form.email.trim() || undefined,
    phone: form.phone.trim() || undefined,
    taxNumber: form.taxNumber.trim() || undefined,
    address: form.address.trim() || undefined,
    notes: form.notes.trim() || undefined,

    // ✅ NEW
    crmStatus: form.crmStatus,
    tags: normalizeTags(form.tags),
  };
}
