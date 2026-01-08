"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/libs/axios";
import type { ActsListResponse, InvoicesListResponse } from "../types";

export const actsKeys = {
  acts: (orgId?: string) => ["acts", orgId] as const,
  invoicesForAct: (orgId?: string) => ["invoices", orgId, "for-act"] as const,
};

export const useActsQueries = (
  organizationId?: string,
  createDialogOpen?: boolean,
) => {
  const actsQuery = useQuery({
    queryKey: actsKeys.acts(organizationId),
    enabled: Boolean(organizationId),
    queryFn: async () => {
      const res = await api.get<ActsListResponse>("/acts", {
        params: { organizationId },
      });
      return res.data.items ?? [];
    },
    staleTime: 5_000,
  });

  const invoicesQuery = useQuery({
    queryKey: actsKeys.invoicesForAct(organizationId),
    enabled: Boolean(organizationId) && Boolean(createDialogOpen),
    queryFn: async () => {
      const res = await api.get<InvoicesListResponse>("/invoices", {
        params: { organizationId },
      });
      return res.data.invoices ?? [];
    },
    staleTime: 30_000,
  });

  return { actsQuery, invoicesQuery };
};
