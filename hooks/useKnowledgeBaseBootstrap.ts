import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/libs/axios";
import { useCurrentUser } from "@/hooksNew/useAppBootstrap";

export type KbApiUser = {
  id: string;
  email: string;
  fullName: string | null;
};

export type KbApiOrganization = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  industry: string | null;
  city: string | null;
  country: string | null;
};

type BootstrapResult = {
  apiUser: KbApiUser;
  organization: KbApiOrganization | null; // ✅ allow null when user has no org
};

type OrganizationsForUserResponse = {
  items: Array<{
    organization: any;
  }>;
};

export function useKnowledgeBaseBootstrap() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();

  const {
    data: userData,
    isLoading: isUserDataLoading,
    error: userDataError,
  } = useCurrentUser();

  const query = useQuery<BootstrapResult>({
    queryKey: ["kb-bootstrap", clerkUser?.id, (userData as any)?.id],
    enabled: isClerkLoaded && !!clerkUser && !!(userData as any)?.id,
    queryFn: async () => {
      const apiUser = userData as KbApiUser;

      // ✅ get organizations for user
      const orgListRes = await api.get<OrganizationsForUserResponse>(
        "/organizations",
        { params: { userId: apiUser.id } },
      );

      const items = orgListRes.data.items ?? [];
      let org: KbApiOrganization | null = null;

      if (items.length > 0) {
        const first = items[0]?.organization;
        if (first) {
          org = {
            id: first.id,
            name: first.name,
            slug: first.slug,
            description: first.description ?? null,
            industry: first.industry ?? null,
            city: first.city ?? null,
            country: first.country ?? null,
          };
        }
      }

      // ✅ NO auto-create, NO throwing
      return { apiUser, organization: org };
    },
    retry: 1,
    staleTime: 30_000,
  });

  return {
    clerkUser,
    isUserLoaded: isClerkLoaded,

    userData,
    isUserDataLoading,
    userDataError,

    ...query,
  };
}
