"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import type { ServiceFormValues, UserService } from "../types";
import { defaultServiceForm } from "../utils";

/* =======================
   Zod schema
======================= */

const priceRegex = /^\d+([.,]\d{1,2})?$/;

const serviceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Вкажіть назву послуги")
    .max(140, "Максимум 140 символів"),

  description: z
    .string()
    .trim()
    .max(2000, "Максимум 2000 символів")
    .optional()
    .or(z.literal("")),

  price: z
    .string()
    .trim()
    .min(1, "Ціна обовʼязкова")
    .refine(
      (v) => priceRegex.test(v),
      "Введіть коректну ціну (до 2 знаків після коми)",
    ),
});

type FormErrors = Partial<Record<keyof ServiceFormValues, string>>;

function zodErrorsToMap(err: z.ZodError): FormErrors {
  const map: FormErrors = {};
  for (const issue of err.issues) {
    const field = issue.path?.[0] as keyof ServiceFormValues | undefined;
    if (!field) continue;
    if (!map[field]) map[field] = issue.message;
  }
  return map;
}

/* =======================
   Hook
======================= */

export const useServiceForm = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<UserService | null>(
    null,
  );
  const [form, setForm] = useState<ServiceFormValues>(defaultServiceForm);

  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const openCreate = () => {
    setEditingService(null);
    setForm(defaultServiceForm);
    setErrors({});
    setSubmitAttempted(false);
    setDialogOpen(true);
  };

  const openEdit = (service: UserService) => {
    setEditingService(service);
    setForm({
      name: service.name || "",
      description: service.description || "",
      price: String(service.price ?? ""),
    });
    setErrors({});
    setSubmitAttempted(false);
    setDialogOpen(true);
  };

  const close = () => setDialogOpen(false);

  const setField = <K extends keyof ServiceFormValues>(
    field: K,
    value: ServiceFormValues[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (submitAttempted) {
      setErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const isEditing = Boolean(editingService);

  const canSubmit = useMemo(() => {
    return Boolean(form.name?.trim()) && Boolean(form.price?.trim());
  }, [form.name, form.price]);

  const validate = () => {
    const res = serviceSchema.safeParse(form);
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
    editingService,
    form,
    isEditing,

    errors,
    submitAttempted,

    canSubmit,
    openCreate,
    openEdit,
    close,
    setField,
    setForm,

    validate,
    handleSubmit,
  };
};
