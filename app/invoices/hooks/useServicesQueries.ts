"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/libs/axios";

export type UserService = {
  id: string;
  name: string;
  description?: string | null;
  price: string; // Decimal з бекенду зазвичай string
  createdAt?: string;
  updatedAt?: string;
};

export type ServicesListResponse = {
  services: UserService[];
};

export const servicesKeys = {
  all: ["services"] as const,
  list: () => [...servicesKeys.all, "list"] as const,
};

export const useServicesQueries = () => {
  const servicesQuery = useQuery<UserService[]>({
    queryKey: servicesKeys.list(),
    queryFn: async () => {
      const res = await api.get<ServicesListResponse>("/services");
      return res.data.services ?? [];
    },
  });

  return { servicesQuery };
};
