import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AiPlan } from "../types";
import { api } from "@/libs/axios";

function normalizePlan(date: string, raw: any | null): AiPlan | null {
  if (!raw) return null;

  return {
    date,
    summary: raw.summary ?? "AI-план на сьогодні готовий.",
    suggestions: raw.suggestions ?? [],
    timeline: raw.timeline ?? [],
  };
}

export function useAiPlan(currentUserId: string | null, date: string) {
  const queryClient = useQueryClient();

  const planQuery = useQuery<AiPlan | null>({
    queryKey: ["aiPlan", currentUserId, date],
    enabled: !!currentUserId,
    staleTime: 60_000,
    keepPreviousData: true,
    queryFn: async () => {
      const res = await api.get<{ plan: any | null }>("/todo/tasks/ai-plan", {
        params: { userId: currentUserId, date },
      });
      return normalizePlan(date, res.data.plan);
    },
  });

  const generateMutation = useMutation<AiPlan, Error, void>({
    mutationFn: async () => {
      const res = await api.post<{ plan: any }>("/todo/tasks/ai-plan", {
        userId: currentUserId,
        date,
      });
      const normalized = normalizePlan(date, res.data.plan) ?? {
        date,
        summary: "AI-план на сьогодні готовий.",
        suggestions: [],
        timeline: [],
      };
      return normalized;
    },
    onSuccess: (normalized) => {
      queryClient.setQueryData<AiPlan | null>(
        ["aiPlan", currentUserId, date],
        normalized,
      );
    },
  });

  const errorText = useMemo(() => {
    if (!generateMutation.isError) return null;
    return "Не вдалось згенерувати план. Спробуй пізніше.";
  }, [generateMutation.isError]);

  return {
    plan: planQuery.data ?? null,
    isLoading: planQuery.isLoading,
    isFetching: planQuery.isFetching,
    generate: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
    errorText,
  };
}
