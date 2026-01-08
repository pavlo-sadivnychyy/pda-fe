"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateInvoicePayload, InvoiceAction } from "../types";
import { invoicesKeys } from "./useInvoicesQueries";
import { api } from "@/libs/axios";

export const useInvoiceMutations = (organizationId?: string) => {
  const qc = useQueryClient();

  const createInvoiceMutation = useMutation({
    mutationFn: async (payload: CreateInvoicePayload) => {
      await api.post("/invoices", payload);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: invoicesKeys.all(organizationId),
      });
    },
  });

  const invoiceActionMutation = useMutation({
    mutationFn: async (vars: { id: string; action: InvoiceAction }) => {
      const { id, action } = vars;
      await api.post(
        `/invoices/${id}/${action}`,
        action === "mark-paid" ? {} : undefined,
      );
    },
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: invoicesKeys.all(organizationId),
      });
    },
  });

  // ✅ NEW: delete invoice
  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/invoices/${id}`);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: invoicesKeys.all(organizationId),
      });
    },
  });

  return {
    createInvoiceMutation,
    invoiceActionMutation,
    deleteInvoiceMutation,
  };
};
