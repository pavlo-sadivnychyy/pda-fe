"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/libs/axios";

export type DueSoonInvoice = {
  id: string;
  number: string;
  dueDate: string | null;
  currency: string;
  total: any; // Prisma Decimal / number / string — покажемо як є або форматнемо у UI
  status: string;

  client: null | {
    id: string;
    name: string;
    contactName?: string | null;
    email?: string | null;
  };

  reminders?: { id: string; sentAt: string }[];
};

type Response = { invoices: DueSoonInvoice[] };

export function useDueSoonInvoices(params: {
  organizationId: string | null;
  minDays?: number;
  maxDays?: number;
  includeDraft?: boolean;
  includeOverdue?: boolean;
}) {
  const {
    organizationId,
    minDays = 1,
    maxDays = 2,
    includeDraft = false,
    includeOverdue = false,
  } = params;

  const query = useQuery<Response>({
    queryKey: [
      "invoices",
      "due-soon",
      organizationId,
      minDays,
      maxDays,
      includeDraft,
      includeOverdue,
    ],
    enabled: !!organizationId,
    staleTime: 30_000,
    keepPreviousData: true,
    queryFn: async () => {
      const res = await api.get<Response>("/invoices/due-soon", {
        params: {
          organizationId,
          minDays,
          maxDays,
          includeDraft,
          includeOverdue,
        },
      });
      return res.data;
    },
  });

  const invoices = query.data?.invoices ?? [];

  return {
    ...query,
    invoices,
  };
}
