"use client";

import { useMemo, useState } from "react";
import type { Client, ClientFormValues } from "../types";
import { defaultClientForm } from "../utils";

export const useClientForm = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientFormValues>(defaultClientForm);

  const openCreate = () => {
    setEditingClient(null);
    setForm(defaultClientForm);
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
    });
    setDialogOpen(true);
  };

  const close = () => setDialogOpen(false);

  const setField = (field: keyof ClientFormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isEditing = Boolean(editingClient);

  const canSubmit = useMemo(() => {
    return Boolean(form.name.trim());
  }, [form.name]);

  return {
    dialogOpen,
    editingClient,
    form,
    isEditing,
    canSubmit,
    openCreate,
    openEdit,
    close,
    setField,
    setForm,
  };
};
