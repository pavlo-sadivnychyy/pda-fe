"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/libs/axios";

export type DueSoonInvoice = {
  id: string;
  number: string;
  dueDate: string | null;
  currency: string;
  total: any;
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
  notAvailiable: boolean;
}) {
  const {
    organizationId,
    minDays = 1,
    maxDays = 2,
    includeDraft = false,
    includeOverdue = false,
    notAvailiable,
  } = params;

  const enabled = Boolean(organizationId) && !notAvailiable;

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
    enabled,
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

  return {
    ...query,
    invoices: query.data?.invoices ?? [],
  };
}
