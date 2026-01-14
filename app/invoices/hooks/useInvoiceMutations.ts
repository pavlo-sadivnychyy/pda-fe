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

      if (action === "send-ua") {
        // ✅ ВАЖЛИВО: body = undefined (не null)
        await api.post(`/invoices/${id}/send`, undefined, {
          params: { variant: "ua" },
        });
        return;
      }

      if (action === "send-international") {
        await api.post(`/invoices/${id}/send`, undefined, {
          params: { variant: "international" },
        });
        return;
      }

      if (action === "mark-paid") {
        await api.post(`/invoices/${id}/mark-paid`, {}); // тут треба body
        return;
      }

      if (action === "cancel") {
        await api.post(`/invoices/${id}/cancel`, {}); // body можна {}, щоб не було сюрпризів
        return;
      }

      throw new Error(`Unknown invoice action: ${action}`);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: invoicesKeys.all(organizationId),
      });
    },
  });

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
