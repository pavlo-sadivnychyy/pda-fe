"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/libs/axios";
import type { Act, CreateActFromInvoicePayload } from "../types";
import { actsKeys } from "./useActsQueries";

export const useActMutations = (
  organizationId?: string,
  onErrorSnack?: (text: string) => void,
  onSuccessSnack?: (text: string) => void,
) => {
  const qc = useQueryClient();

  const createFromInvoice = useMutation({
    mutationFn: async (payload: CreateActFromInvoicePayload) => {
      const res = await api.post<{ act: Act }>("/acts/from-invoice", payload);
      return res.data.act;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: actsKeys.acts(organizationId) });
      onSuccessSnack?.("Акт створено");
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        const msg =
          error?.response?.data?.message?.replace(" в цій організації", ".") ??
          "Акт за цим інвойсом вже існує";

        onErrorSnack?.(msg);
        return;
      }

      onErrorSnack?.("Помилка створення акту");
    },
  });

  const deleteAct = useMutation({
    mutationFn: async (id: string) => api.delete(`/acts/${id}`),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: actsKeys.acts(organizationId) });
      onSuccessSnack?.("Акт видалено");
    },
  });

  const sendAct = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post<{ act: Act }>(`/acts/${id}/send`);
      return res.data.act;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: actsKeys.acts(organizationId) });
      onSuccessSnack?.("Акт відправлено");
    },
    onError: () => {
      onErrorSnack?.("Не вдалося відправити акт");
    },
  });

  return { createFromInvoice, deleteAct, sendAct };
};
