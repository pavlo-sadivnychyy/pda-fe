"use client";

import { useQuery } from "@tanstack/react-query";
import { OrganizationWithRelations } from "@/types/organization";
import {api} from "@/libs/axios";

export const useOrganization = (userId?: string) => {
    return useQuery<OrganizationWithRelations>({
        queryKey: ["allOrganizations", userId],
        enabled: !!userId,
        retry: false,
        queryFn: async () => {
            const res = await api.get(`/organizations?userId=${userId}`);
            return res.data as OrganizationWithRelations;
        },
    });
};
