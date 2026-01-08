"use client";

import { useCurrentUser } from "@/hooksNew/useAppBootstrap";
import { useOrganization } from "@/hooksNew/useAllUserOrganizations";

export const useOrganizationContext = () => {
  const { data: userData } = useCurrentUser();
  const currentUserId = (userData as any)?.id ?? null;

  const { data: orgData } = useOrganization(currentUserId || undefined);

  const organizationId =
    (orgData as any)?.items?.[0]?.organizationId ??
    (orgData as any)?.items?.[0]?.organization?.id ??
    undefined;

  return { currentUserId, organizationId };
};
