import type { ClientFormValues } from "./types";

export const defaultClientForm: ClientFormValues = {
  name: "",
  contactName: "",
  email: "",
  phone: "",
  taxNumber: "",
  address: "",
  notes: "",
};

export const formatDate = (value?: string | null) => {
  if (!value) return "—";
  try {
    return value.slice(0, 10);
  } catch {
    return value;
  }
};

export const toCreatePayload = ({
  organizationId,
  createdById,
  form,
}: {
  organizationId: string;
  createdById: string;
  form: ClientFormValues;
}) => ({
  organizationId,
  createdById,
  name: form.name.trim(),
  contactName: form.contactName.trim() || undefined,
  email: form.email.trim() || undefined,
  phone: form.phone.trim() || undefined,
  taxNumber: form.taxNumber.trim() || undefined,
  address: form.address.trim() || undefined,
  notes: form.notes.trim() || undefined,
});

export const toUpdatePayload = (form: ClientFormValues) => ({
  name: form.name.trim(),
  contactName: form.contactName.trim() || null,
  email: form.email.trim() || null,
  phone: form.phone.trim() || null,
  taxNumber: form.taxNumber.trim() || null,
  address: form.address.trim() || null,
  notes: form.notes.trim() || null,
});
