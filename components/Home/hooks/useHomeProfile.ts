import { useMemo } from "react";
import { useOrganization } from "@/hooksNew/useAllUserOrganizations";
import type {
  FormValues,
  Organization,
  OrganizationsForUserResponse,
} from "../types";
import { calculateProfileCompletion, mapOrgToForm } from "../utils";

export function useHomeProfile(currentUserId: string | null) {
  const { data: orgData, isLoading: isOrgLoading } = useOrganization(
    currentUserId || undefined,
  );

  return useMemo(() => {
    let organization: Organization | null = null;
    let form: FormValues | null = null;

    if (orgData) {
      const typed = orgData as OrganizationsForUserResponse;
      organization = typed.items?.[0]?.organization ?? null;
      if (organization) form = mapOrgToForm(organization);
    }

    const profileCompletion = calculateProfileCompletion(form);

    const hasNiche = !!form?.businessNiche?.trim();
    const hasServices = !!form?.servicesDescription?.trim();
    const hasAudience = !!form?.targetAudience?.trim();
    const hasBrandStyle = !!form?.brandStyle?.trim();

    const buttonLabel = (() => {
      if (!organization) return "Створити профіль бізнесу";
      if (profileCompletion < 100) return "Доповнити профіль";
      return "Переглянути профіль";
    })();

    return {
      organization,
      form,
      profileCompletion,
      hasNiche,
      hasServices,
      hasAudience,
      hasBrandStyle,
      buttonLabel,
      isOrgLoading,
    };
  }, [orgData, isOrgLoading]);
}
