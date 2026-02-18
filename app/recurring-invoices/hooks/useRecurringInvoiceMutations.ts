"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/libs/axios";
import { recurringKeys } from "./useRecurringInvoicesQueries";

export const useRecurringInvoiceMutations = (organizationId?: string) => {
  const qc = useQueryClient();

  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: recurringKeys.all(organizationId) });
  };

  const createRecurring = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post("/recurring-invoices", payload);
      return data;
    },
    onSuccess: invalidate,
  });

  const updateRecurring = useMutation({
    mutationFn: async (vars: { id: string; data: any }) => {
      const { data } = await api.patch(
        `/recurring-invoices/${vars.id}`,
        vars.data,
      );
      return data;
    },
    onSuccess: invalidate,
  });

  const pauseRecurring = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/recurring-invoices/${id}/pause`, {});
      return data;
    },
    onSuccess: invalidate,
  });

  const resumeRecurring = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/recurring-invoices/${id}/resume`, {});
      return data;
    },
    onSuccess: invalidate,
  });

  const cancelRecurring = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/recurring-invoices/${id}`, {});
      return data;
    },
    onSuccess: invalidate,
  });

  return {
    createRecurring,
    updateRecurring,
    pauseRecurring,
    resumeRecurring,
    cancelRecurring,
  };
};
