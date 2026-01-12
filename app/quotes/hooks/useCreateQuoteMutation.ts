"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/libs/axios";

type CreateQuoteItemPayload = {
  name: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
};

export type CreateQuotePayload = {
  organizationId: string;
  createdById: string;
  clientId?: string | null;

  issueDate?: string; // "YYYY-MM-DD"
  validUntil?: string | null;

  currency?: string;
  notes?: string | null;

  items: CreateQuoteItemPayload[];
};

export function useCreateQuoteMutation() {
  return useMutation({
    mutationKey: ["createQuote"],
    mutationFn: async (payload: CreateQuotePayload) => {
      await api.post("/quotes", payload);
    },
  });
}
