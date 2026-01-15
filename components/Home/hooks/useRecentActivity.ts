"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/libs/axios";

export type ActivityEntityType = "INVOICE" | "ACT" | "QUOTE";
export type ActivityEventType =
  | "CREATED"
  | "STATUS_CHANGED"
  | "SENT"
  | "REMINDER_SENT"
  | "CONVERTED_TO_INVOICE";

export type ActivityLog = {
  id: string;
  organizationId: string;

  entityType: ActivityEntityType;
  entityId: string;

  eventType: ActivityEventType;

  fromStatus?: string | null;
  toStatus?: string | null;

  toEmail?: string | null;

  createdAt: string;

  // optional meta (якщо ти з бекенду віддаєш JSON)
  meta?: any;
};

type RecentActivityResponse = {
  items: ActivityLog[];
};

export const activityKeys = {
  recent: (orgId?: string, limit = 3) =>
    ["activity", "recent", orgId, limit] as const,
};

export function useRecentActivity(organizationId: string | null, limit = 3) {
  const query = useQuery<RecentActivityResponse>({
    queryKey: activityKeys.recent(organizationId ?? undefined, limit),
    enabled: Boolean(organizationId),
    staleTime: 10_000,
    queryFn: async () => {
      const res = await api.get<RecentActivityResponse>("/activity/recent", {
        params: { organizationId, limit },
      });
      return res.data;
    },
  });

  return {
    ...query,
    items: query.data?.items ?? [],
  };
}
