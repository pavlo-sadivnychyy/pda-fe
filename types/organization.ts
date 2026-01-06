import {DbUser} from "@/types/user";

export type Organization = {
    id: string;

    name: string;
    slug: string;

    description: string | null;
    industry: string | null;

    websiteUrl: string | null;
    country: string | null;
    city: string | null;

    timeZone: string | null;
    defaultLanguage: string | null;
    defaultCurrency: string | null;

    ownerId: string;

    tagline: string | null;
    niche: string | null;
    longDescription: string | null;

    createdAt: string;
    updatedAt: string;
};

export type OrganizationRole =
    | "owner"
    | "admin"
    | "member";

export type OrganizationMemberStatus =
    | "active"
    | "invited"
    | "removed";

export type OrganizationMembership = {
    id: string;
    userId: string;
    organizationId: string;

    role: OrganizationRole;
    status: OrganizationMemberStatus;

    invitedByUserId?: string | null;
    invitedAt?: string | null;
    joinedAt?: string | null;

    createdAt: string;
    updatedAt: string;

    user?: DbUser;
    organization: Organization;
};

export type OrganizationWithRelations = Organization & {
    members: OrganizationMembership[];
};