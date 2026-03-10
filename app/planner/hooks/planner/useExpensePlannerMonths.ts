"use client";

import { useQuery } from "@tanstack/react-query";
import { plannerQueryKeys } from "./queryKeys";
import { plannerService } from "@/app/planner/planner.service";

export function useExpensePlannerMonths(params?: {
  from?: string;
  to?: string;
}) {
  return useQuery({
    queryKey: plannerQueryKeys.months(params),
    queryFn: () => plannerService.listMonths(params),
  });
}
