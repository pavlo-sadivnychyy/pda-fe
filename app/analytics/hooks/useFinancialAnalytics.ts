import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useCurrentUser } from "@/hooksNew/useAppBootstrap";
import { useOrganization } from "@/hooksNew/useAllUserOrganizations";
import { api } from "@/libs/axios";

export type AnalyticsMonthlyPoint = {
  month: string;
  issuedTotal: number;
  paidTotal: number;
};

export type AnalyticsData = {
  from: string;
  to: string;
  currency: string;
  totals: {
    paid: number;
    outstanding: number;
    overdue: number;
  };
  monthly: AnalyticsMonthlyPoint[];
};

type AnalyticsResponse = {
  analytics: AnalyticsData;
};

export const useFinancialAnalytics = () => {
  const { data: userData } = useCurrentUser();
  const currentUserId = (userData as any)?.id ?? null;

  const { data: orgData, isLoading: orgLoading } = useOrganization(
    currentUserId || undefined,
  );

  const organizationId =
    (orgData as any)?.items?.[0]?.organizationId ??
    (orgData as any)?.items?.[0]?.organization?.id ??
    undefined;

  const query = useQuery<AnalyticsData>({
    queryKey: ["invoices", "analytics", organizationId],
    enabled: !!organizationId,
    queryFn: async () => {
      const res = await api.get<AnalyticsResponse>("/invoices/analytics", {
        params: { organizationId },
      });
      return res.data.analytics;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const data = query.data ?? null;

  const currency = useMemo(() => data?.currency ?? "UAH", [data?.currency]);

  const totals = useMemo(() => {
    return {
      paid: data?.totals?.paid ?? 0,
      outstanding: data?.totals?.outstanding ?? 0,
      overdue: data?.totals?.overdue ?? 0,
    };
  }, [data]);

  const totalAll = useMemo(
    () => totals.paid + totals.outstanding + totals.overdue,
    [totals],
  );

  const periodLabel = useMemo(() => {
    if (!data) return null;
    const from = data.from?.slice(0, 10) ?? "";
    const to = data.to?.slice(0, 10) ?? "";
    if (!from && !to) return null;
    return `${from} — ${to}`;
  }, [data]);

  const showSpinner =
    (orgLoading && !organizationId) || (query.isLoading && !query.data);

  const errorText = query.isError ? "Не вдалося завантажити аналітику" : null;

  return {
    organizationId,
    data,
    currency,
    totals,
    totalAll,
    periodLabel,
    showSpinner,
    errorText,
    query,
  };
};
