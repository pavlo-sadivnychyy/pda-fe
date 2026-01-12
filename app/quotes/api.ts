"use client";

import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Quote, QuoteStatus, QuoteAction } from "./types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  withCredentials: true,
});

export function useQuotes(organizationId?: string, status?: QuoteStatus) {
  return useQuery({
    queryKey: ["quotes", organizationId, status],
    enabled: Boolean(organizationId),
    queryFn: async () => {
      const { data } = await api.get(`/quotes`, {
        params: { organizationId, status },
      });
      return (data?.quotes ?? []) as Quote[];
    },
  });
}

export function useQuoteAction() {
  return useMutation({
    mutationKey: ["quoteAction"],
    mutationFn: async (params: { id: string; action: QuoteAction }) => {
      const { id, action } = params;
      const { data } = await api.post(`/quotes/${id}/${action}`);
      return data;
    },
  });
}

export function useConvertQuoteToInvoice() {
  return useMutation({
    mutationKey: ["convertQuoteToInvoice"],
    mutationFn: async (params: { id: string }) => {
      const { data } = await api.post(
        `/quotes/${params.id}/convert-to-invoice`,
      );
      return data; // { invoice }
    },
  });
}
