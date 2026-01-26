"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/libs/axios";
import { servicesKeys, type UserService } from "./useServicesQueries";

export const useServiceMutations = () => {
  const qc = useQueryClient();

  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: servicesKeys.list() });
  };

  const createService = useMutation({
    mutationFn: async (payload: {
      name: string;
      description?: string;
      price: number;
    }) => {
      const res = await api.post<{ service: UserService }>("/services", {
        ...payload,
        price: payload.price.toString(),
      });
      return res.data.service;
    },
    onSuccess: invalidate,
  });

  return { createService };
};
