export const plannerQueryKeys = {
  root: ["expense-planner"] as const,
  month: (monthKey: string) => ["expense-planner", "month", monthKey] as const,
  months: (params?: { from?: string; to?: string }) =>
    [
      "expense-planner",
      "months",
      params?.from ?? null,
      params?.to ?? null,
    ] as const,
};
