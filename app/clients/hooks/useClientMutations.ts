"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/libs/axios";
import { clientsKeys } from "./useClientsQueries";
import type { Client } from "../types";

export const useClientMutations = (organizationId?: string) => {
  const qc = useQueryClient();

  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: clientsKeys.list(organizationId) });
  };

  const createClient = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post<{ client: Client }>("/clients", payload);
      return res.data.client;
    },
    onSuccess: invalidate,
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await api.patch<{ client: Client }>(
        `/clients/${id}`,
        payload,
      );
      return res.data.client;
    },
    onSuccess: invalidate,
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/clients/${id}`);
      return id;
    },
    onSuccess: invalidate,
  });

  return { createClient, updateClient, deleteClient };
};
