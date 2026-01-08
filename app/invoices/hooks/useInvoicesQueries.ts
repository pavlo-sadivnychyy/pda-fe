"use client";

import { useQuery } from "@tanstack/react-query";
import type { Client, Invoice } from "../types";
import { api } from "@/libs/axios";

type ClientsResponse = { clients: Client[] };
type InvoicesResponse = { invoices: Invoice[] };

export const invoicesKeys = {
  all: (organizationId?: string) => ["invoices", organizationId] as const,
  clients: (organizationId?: string) => ["clients", organizationId] as const,
};

export const useInvoicesQueries = (organizationId?: string) => {
  const clientsQuery = useQuery({
    queryKey: invoicesKeys.clients(organizationId),
    enabled: Boolean(organizationId),
    queryFn: async () => {
      const { data } = await api.get<ClientsResponse>("/clients", {
        params: { organizationId },
      });
      return data.clients ?? [];
    },
    staleTime: 30_000,
  });

  const invoicesQuery = useQuery({
    queryKey: invoicesKeys.all(organizationId),
    enabled: Boolean(organizationId),
    queryFn: async () => {
      const { data } = await api.get<InvoicesResponse>("/invoices", {
        params: { organizationId },
      });
      return data.invoices ?? [];
    },
    staleTime: 5_000,
  });

  return { clientsQuery, invoicesQuery };
};
