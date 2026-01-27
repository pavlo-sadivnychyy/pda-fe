"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/libs/axios";
import type { ServicesListResponse, UserService } from "../types";

export const servicesKeys = {
  all: ["services"] as const,
  list: () => [...servicesKeys.all, "list"] as const,
};

export const useServicesQueries = (currentUserId?: string) => {
  const servicesQuery = useQuery<UserService[]>({
    queryKey: [...servicesKeys.list(), currentUserId],
    enabled: !!currentUserId, // ✅ лише коли юзер відомий
    queryFn: async () => {
      const res = await api.get<ServicesListResponse>("/services");
      return res.data.services ?? [];
    },
    retry: false,
  });

  return { servicesQuery };
};
