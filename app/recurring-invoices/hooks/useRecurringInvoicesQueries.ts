"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/libs/axios";

export const recurringKeys = {
  all: (organizationId?: string) =>
    ["recurring-invoices", organizationId] as const,
  runs: (profileId: string) =>
    ["recurring-invoices", "runs", profileId] as const,
};

type ListResponse = { profiles: any[] } | { recurring: any[] } | any;

export const useRecurringInvoicesQueries = (
  organizationId?: string,
  opts?: { enabled?: boolean },
) => {
  const recurringQuery = useQuery<any[]>({
    queryKey: recurringKeys.all(organizationId),
    enabled: opts?.enabled ?? Boolean(organizationId),
    queryFn: async () => {
      const { data } = await api.get<ListResponse>("/recurring-invoices", {
        params: { organizationId },
      });

      // підтримка різних форматів відповіді
      const arr =
        data?.profiles ??
        data?.recurring ??
        data?.items ??
        (Array.isArray(data) ? data : []);

      return arr ?? [];
    },
    staleTime: 10_000,
  });

  return { recurringQuery };
};
