"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import type { Client, ClientFormValues } from "../types";
import { defaultClientForm } from "../utils";

/* =======================
   Zod schema
======================= */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const digitsOnly = (s: string) => (s || "").replace(/\D/g, "");

const clientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Вкажіть назву клієнта")
    .max(120, "Максимум 120 символів"),

  contactName: z
    .string()
    .trim()
    .max(80, "Максимум 80 символів")
    .optional()
    .or(z.literal("")),

  email: z
    .string()
    .trim()
    .min(1, "Email обовʼязковий")
    .refine((v) => EMAIL_REGEX.test(v), "Введіть коректний email"),

  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .superRefine((val, ctx) => {
      const v = (val ?? "").trim();
      if (!v) return;

      if (v.includes("+") && !v.startsWith("+")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Знак + має бути на початку",
        });
        return;
      }

      const d = digitsOnly(v);
      if (d.length < 10 || d.length > 15) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Введіть коректний номер телефону",
        });
      }
    }),

  taxNumber: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .superRefine((val, ctx) => {
      const v = (val ?? "").trim();
      if (!v) return;
      const d = digitsOnly(v);

      // UA: ЄДРПОУ 8, РНОКПП 10
      if (!(d.length === 8 || d.length === 10)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Податковий номер має містити 8 або 10 цифр",
        });
      }
    }),

  address: z
    .string()
    .trim()
    .max(180, "Максимум 180 символів")
    .optional()
    .or(z.literal("")),

  notes: z
    .string()
    .trim()
    .max(500, "Максимум 500 символів")
    .optional()
    .or(z.literal("")),

  crmStatus: z.any(),
  tags: z.array(z.string()).max(20, "Максимум 20 тегів"),
});

type FormErrors = Partial<Record<keyof ClientFormValues, string>>;

function zodErrorsToMap(err: z.ZodError): FormErrors {
  const map: FormErrors = {};
  for (const issue of err.issues) {
    const field = issue.path?.[0] as keyof ClientFormValues | undefined;
    if (!field) continue;
    if (!map[field]) map[field] = issue.message;
  }
  return map;
}

/* =======================
   Hook
======================= */

export const useClientForm = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientFormValues>(defaultClientForm);

  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const openCreate = () => {
    setEditingClient(null);
    setForm(defaultClientForm);
    setErrors({});
    setSubmitAttempted(false);
    setDialogOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setForm({
      name: client.name || "",
      contactName: client.contactName || "",
      email: client.email || "",
      phone: client.phone || "",
      taxNumber: client.taxNumber || "",
      address: client.address || "",
      notes: client.notes || "",
      crmStatus: client.crmStatus ?? "LEAD",
      tags: Array.isArray(client.tags) ? client.tags : [],
    });
    setErrors({});
    setSubmitAttempted(false);
    setDialogOpen(true);
  };

  const close = () => setDialogOpen(false);

  const setField = <K extends keyof ClientFormValues>(
    field: K,
    value: ClientFormValues[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    // якщо вже був submit — очищаємо помилку по полю під час вводу
    if (submitAttempted) {
      setErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const isEditing = Boolean(editingClient);

  // кнопка може бути enabled тільки якщо мінімально є required поля
  const canSubmit = useMemo(() => {
    return Boolean(form.name?.trim()) && Boolean(form.email?.trim());
  }, [form.name, form.email]);

  const validate = () => {
    const res = clientSchema.safeParse(form);
    if (res.success) {
      setErrors({});
      return { ok: true as const, data: res.data };
    }
    const map = zodErrorsToMap(res.error);
    setErrors(map);
    return { ok: false as const, errors: map };
  };

  const handleSubmit = async (onValid: () => Promise<void> | void) => {
    setSubmitAttempted(true);
    const v = validate();
    if (!v.ok) return;
    await onValid();
  };

  return {
    dialogOpen,
    editingClient,
    form,
    isEditing,

    // UI state
    errors,
    submitAttempted,

    // actions
    canSubmit,
    openCreate,
    openEdit,
    close,
    setField,
    setForm,

    // submit helpers
    validate,
    handleSubmit,
  };
};
