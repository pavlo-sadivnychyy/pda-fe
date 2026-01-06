"use client";

import {useUser} from "@clerk/nextjs";
import {useQuery} from "@tanstack/react-query";
import {DbUser} from "@/types/user";
import {Organization, OrganizationMembership,} from "@/types/organization";
import {api} from "@/libs/axios";

export type AppBootstrapResponse = {
    apiUser: DbUser;
    organizations: OrganizationMembership[];
    activeOrganization: Organization | null;
};

export const useCurrentUser = () => {
    const { user, isLoaded } = useUser();

    return useQuery<AppBootstrapResponse>({
        queryKey: ["app-bootstrap", user?.id],

        enabled: isLoaded && !!user,

        queryFn: async () => {
            if (!user) {
                throw new Error("No Clerk user");
            }

            const timezone =
                typeof window !== "undefined"
                    ? Intl.DateTimeFormat().resolvedOptions().timeZone
                    : null;

            const payload = {
                authProvider: "clerk",
                authUserId: user.id,
                email: user.primaryEmailAddress?.emailAddress ?? "",
                firstName: user.firstName ?? null,
                lastName: user.lastName ?? null,
                avatarUrl: user.imageUrl ?? null,
                locale: user.primaryEmailAddress?.emailAddress
                    ? null
                    : null,
                timezone,
                jobTitle: null,
            };

            const res = await api.post("/users/sync", payload);
            return res.data.user as DbUser
        },
    });
};
