"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/libs/axios";
import type { ClientsListResponse, Client } from "../types";

export const clientsKeys = {
  all: ["clients"] as const,
  list: (organizationId?: string) =>
    [...clientsKeys.all, "list", organizationId] as const,
};

export const useClientsQueries = (organizationId?: string) => {
  const clientsQuery = useQuery<Client[]>({
    queryKey: clientsKeys.list(organizationId),
    enabled: !!organizationId,
    queryFn: async () => {
      const res = await api.get<ClientsListResponse>("/clients", {
        params: { organizationId },
      });
      return res.data.clients ?? [];
    },
  });

  return { clientsQuery };
};
