export type DbUser = {
    id: string;

    authProvider: string;
    authUserId: string;

    email: string;
    firstName: string | null;
    lastName: string | null;
    fullName: string | null;

    avatarUrl: string | null;
    locale: string | null;
    timezone: string | null;
    jobTitle: string | null;

    lastLoginAt: string | null;

    createdAt: string;
    updatedAt: string;
};
