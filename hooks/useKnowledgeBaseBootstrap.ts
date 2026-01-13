import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

import { api } from "@/libs/axios"; // <-- твій axios instance з інтерсепторами

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
  organization: KbApiOrganization;
};

type SyncUserResponse = { user: KbApiUser };

type OrganizationsForUserResponse = {
  items: Array<{
    organization: any;
  }>;
};

type CreateOrgResponse = {
  organization: any;
};

export function useKnowledgeBaseBootstrap() {
  const { user, isLoaded } = useUser();

  const query = useQuery<BootstrapResult>({
    queryKey: ["kb-bootstrap", user?.id],
    enabled: isLoaded && !!user,
    queryFn: async () => {
      if (!user) throw new Error("User is not available");

      // 1) sync user
      const syncRes = await api.post<SyncUserResponse>("/users/sync", {
        authProvider: "clerk",
        authUserId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.imageUrl,
        locale: user.locale,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        jobTitle: (user.publicMetadata as any)?.jobTitle ?? null,
      });

      const dbUser = syncRes.data.user;

      // 2) get organizations for user
      const orgListRes = await api.get<OrganizationsForUserResponse>(
        "/organizations",
        {
          params: { userId: dbUser.id },
        },
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
      } else {
        // 3) create organization if none exists
        const defaultName =
          (user as any)?.organization?.name ||
          (user.firstName ? `${user.firstName}'s Business` : "My Business");

        const createOrgRes = await api.post<CreateOrgResponse>(
          "/organizations",
          {
            name: defaultName,
            ownerId: dbUser.id,
            description:
              "Автоматично створений бізнес-профіль для нового користувача.",
            industry: "other",
            country: "Ukraine",
            city: "Lviv",
            tagline: "AI-асистент для мого бізнесу",
            niche: "малий бізнес / послуги",
          },
        );

        const createdOrg = createOrgRes.data.organization;

        org = {
          id: createdOrg.id,
          name: createdOrg.name,
          slug: createdOrg.slug,
          description: createdOrg.description ?? null,
          industry: createdOrg.industry ?? null,
          city: createdOrg.city ?? null,
          country: createdOrg.country ?? null,
        };
      }

      if (!org) throw new Error("Organization not resolved");

      return { apiUser: dbUser, organization: org };
    },
  });

  return {
    clerkUser: user,
    isUserLoaded: isLoaded,
    ...query,
  };
}
