"use client";

import { useQuery } from "@tanstack/react-query";

import { plannerQueryKeys } from "./queryKeys";
import { plannerService } from "@/app/planner/planner.service";

export function useExpensePlannerMonth(monthKey: string) {
  return useQuery({
    queryKey: plannerQueryKeys.month(monthKey),
    queryFn: () => plannerService.ensureMonth({ monthKey }),
    enabled: Boolean(monthKey),
  });
}
