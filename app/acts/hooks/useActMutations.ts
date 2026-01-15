"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/libs/axios";
import type { Act, CreateActFromInvoicePayload } from "../types";
import { actsKeys } from "./useActsQueries";

export const useActMutations = (organizationId?: string) => {
  const qc = useQueryClient();

  const createFromInvoice = useMutation({
    mutationFn: async (payload: CreateActFromInvoicePayload) => {
      const res = await api.post<{ act: Act }>("/acts/from-invoice", payload);
      return res.data.act;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: actsKeys.acts(organizationId) });
    },
  });

  const deleteAct = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/acts/${id}`);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: actsKeys.acts(organizationId) });
    },
  });

  // ✅ NEW: send act by email
  const sendAct = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post<{ act: Act }>(`/acts/${id}/send`);
      return res.data.act;
    },
    onSuccess: async () => {
      // щоб статус SENT одразу оновився
      await qc.invalidateQueries({ queryKey: actsKeys.acts(organizationId) });
    },
  });

  return { createFromInvoice, deleteAct, sendAct };
};
