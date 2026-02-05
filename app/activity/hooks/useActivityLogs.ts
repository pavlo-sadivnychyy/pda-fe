"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/libs/axios";

export type ActivityEntityType = "INVOICE" | "ACT" | "QUOTE";
export type ActivityEventType =
  | "CREATED"
  | "STATUS_CHANGED"
  | "SENT"
  | "REMINDER_SENT"
  | "CONVERTED_TO_INVOICE";

export type ActivityActor = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
};

export type ActivityLog = {
  id: string;
  organizationId: string;

  actorUserId: string;
  actor?: ActivityActor;

  entityType: ActivityEntityType;
  entityId: string;

  eventType: ActivityEventType;

  fromStatus: string | null;
  toStatus: string | null;

  toEmail: string | null;
  meta: any;

  createdAt: string;
};

export type ActivityListResponse = {
  items: ActivityLog[];
  nextCursor: string | null;
};

// ✅ робимо ключ стабільним: тільки примітиви
export const activityKeys = {
  list: (p: {
    organizationId?: string;
    limit?: number;
    entityType?: ActivityEntityType;
    eventType?: ActivityEventType;
    entityId?: string;
  }) =>
    [
      "activity",
      "list",
      p.organizationId ?? null,
      p.limit ?? 30,
      p.entityType ?? null,
      p.eventType ?? null,
      p.entityId ?? null,
    ] as const,
};

export function useActivityLogs(params: {
  organizationId?: string;
  limit?: number;
  entityType?: ActivityEntityType;
  eventType?: ActivityEventType;
  entityId?: string;
}) {
  const query = useInfiniteQuery<ActivityListResponse>({
    queryKey: activityKeys.list(params),
    enabled: Boolean(params.organizationId),
    initialPageParam: null as string | null,

    // ✅ не кешуємо між переходами
    staleTime: 0,
    gcTime: 0, // v5 (в v4: cacheTime: 0)

    // ✅ завжди тягнемо заново при заході/поверненні
    refetchOnMount: "always",
    refetchOnWindowFocus: true,

    queryFn: async ({ pageParam }) => {
      const res = await api.get<ActivityListResponse>("/activity", {
        params: {
          organizationId: params.organizationId,
          limit: params.limit ?? 30,
          cursor: pageParam ?? undefined,
          entityType: params.entityType,
          eventType: params.eventType,
          entityId: params.entityId,
        },
      });
      return res.data;
    },

    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const items =
    query.data?.pages.flatMap((p) => p.items ?? [])?.filter(Boolean) ?? [];

  return {
    items,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    canLoadMore: Boolean(query.hasNextPage),
    loadMore: () => query.fetchNextPage(),
    loadingMore: query.isFetchingNextPage,
  };
}
