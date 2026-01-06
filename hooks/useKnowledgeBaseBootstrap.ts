import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

export function useKnowledgeBaseBootstrap() {
    const { user, isLoaded } = useUser();

    const query = useQuery<BootstrapResult>({
        queryKey: ['kb-bootstrap', user?.id],
        enabled: isLoaded && !!user,
        queryFn: async () => {
            if (!user) {
                throw new Error('User is not available');
            }

            // 1) sync user
            const syncRes = await fetch(`${API_URL}/users/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    authProvider: 'clerk',
                    authUserId: user.id,
                    email: user.primaryEmailAddress?.emailAddress,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    avatarUrl: user.imageUrl,
                    locale: user.locale,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    jobTitle: user.publicMetadata?.jobTitle ?? null,
                }),
            });

            if (!syncRes.ok) {
                throw new Error(`Sync user failed: ${syncRes.status}`);
            }

            const syncData = await syncRes.json();
            const dbUser = syncData.user as KbApiUser;

            // 2) get organizations for user
            const orgListRes = await fetch(
                `${API_URL}/organizations?userId=${dbUser.id}`,
            );

            if (!orgListRes.ok) {
                throw new Error(`Get organizations failed: ${orgListRes.status}`);
            }

            const orgListData = await orgListRes.json();
            const items = orgListData.items as any[];

            let org: KbApiOrganization | null = null;

            if (items.length > 0) {
                const first = items[0].organization;
                org = {
                    id: first.id,
                    name: first.name,
                    slug: first.slug,
                    description: first.description ?? null,
                    industry: first.industry ?? null,
                    city: first.city ?? null,
                    country: first.country ?? null,
                };
            } else {
                // 3) create organization if none exists
                const defaultName =
                    user.organization?.name ||
                    (user.firstName ? `${user.firstName}'s Business` : 'My Business');

                const createOrgRes = await fetch(`${API_URL}/organizations`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: defaultName,
                        ownerId: dbUser.id,
                        description:
                            'Автоматично створений бізнес-профіль для нового користувача.',
                        industry: 'other',
                        country: 'Ukraine',
                        city: 'Lviv',
                        tagline: 'AI-асистент для мого бізнесу',
                        niche: 'малий бізнес / послуги',
                    }),
                });

                if (!createOrgRes.ok) {
                    throw new Error(
                        `Create organization failed: ${createOrgRes.status}`,
                    );
                }

                const createdData = await createOrgRes.json();
                const createdOrg = createdData.organization;

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

            if (!org) {
                throw new Error('Organization not resolved');
            }

            return {
                apiUser: dbUser,
                organization: org,
            };
        },
    });

    return {
        clerkUser: user,
        isUserLoaded: isLoaded,
        ...query,
    };
}
