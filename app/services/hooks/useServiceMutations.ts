"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/libs/axios";
import { servicesKeys } from "./useServicesQueries";
import type { UserService } from "../types";

export const useServiceMutations = () => {
  const qc = useQueryClient();

  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: servicesKeys.list() });
  };

  const createService = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post<{ service: UserService }>(
        "/services",
        payload,
      );
      return res.data.service;
    },
    onSuccess: invalidate,
  });

  const updateService = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await api.patch<{ service: UserService }>(
        `/services/${id}`,
        payload,
      );
      return res.data.service;
    },
    onSuccess: invalidate,
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/services/${id}`);
      return id;
    },
    onSuccess: invalidate,
  });

  return { createService, updateService, deleteService };
};
