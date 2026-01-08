"use client";

import { useMemo } from "react";
import { useCurrentUser } from "@/hooksNew/useAppBootstrap";
import { useOrganization } from "@/hooksNew/useAllUserOrganizations";

export const useOrganizationContext = () => {
  const { data: userData } = useCurrentUser();
  const currentUserId = (userData as any)?.id ?? null;

  const { data: orgData } = useOrganization(currentUserId || undefined);

  const organizationId = useMemo(() => {
    return orgData?.items?.[0]?.organizationId as string | undefined;
  }, [orgData]);

  return { currentUserId: currentUserId as string | null, organizationId };
};
