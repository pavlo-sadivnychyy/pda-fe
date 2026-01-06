"use client";

import { useQuery } from "@tanstack/react-query";
import { OrganizationWithRelations } from "@/types/organization";
import { api } from "@/libs/axios";

export const useOrganization = (organizationId?: string) => {
  return useQuery<OrganizationWithRelations>({
    queryKey: ["organization", organizationId],
    enabled: !!organizationId, // не стріляємо запитом, поки немає id

    queryFn: async () => {
      const res = await api.get(`/organizations/${organizationId}`);
      return res.data as OrganizationWithRelations;
    },
  });
};
