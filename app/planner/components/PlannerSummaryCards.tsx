"use client";

import { Grid, Paper, Stack, Typography } from "@mui/material";
import { MonthAnalytics } from "../planner.types";
import { formatMoney } from "../helpers";

type Props = {
  analytics: MonthAnalytics;
  currency: string;
};

export function PlannerSummaryCards({ analytics, currency }: Props) {
  const cards = [
    {
      label: "Заплановано",
      value: `${formatMoney(analytics.summary.totalPlanned)} ${currency}`,
      color: "#2563EB",
      bg: "rgba(37, 99, 235, 0.06)",
    },
    {
      label: "Витрачено",
      value: `${formatMoney(analytics.summary.totalActual)} ${currency}`,
      color: "#DC2626",
      bg: "rgba(220, 38, 38, 0.06)",
    },
    {
      label: "Залишок",
      value: `${formatMoney(analytics.summary.balanceActual)} ${currency}`,
      color: "#16A34A",
      bg: "rgba(22, 163, 74, 0.06)",
    },
    {
      label: "Використання бюджету",
      value: `${formatMoney(analytics.summary.budgetUsagePercent)}%`,
      color: "#CA8A04",
      bg: "rgba(202, 138, 4, 0.06)",
    },
    {
      label: "Дохід факт",
      value: `${formatMoney(analytics.summary.incomeActual)} ${currency}`,
      color: "#059669",
      bg: "rgba(5, 150, 105, 0.06)",
    },
    {
      label: "Рекомендовано / день",
      value: `${formatMoney(analytics.summary.recommendedDailyLimit)} ${currency}`,
      color: "#7C3AED",
      bg: "rgba(124, 58, 237, 0.06)",
    },
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((item) => (
        <Grid key={item.label} size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 4 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              border: `1px solid ${item.color}20`,
              backgroundColor: item.bg,
              p: 2.5,
              height: "100%",
            }}
          >
            <Stack spacing={1}>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  letterSpacing: 0.5,
                }}
              >
                {item.label}
              </Typography>

              <Typography
                variant="h6"
                fontWeight={800}
                sx={{
                  color: item.color,
                }}
              >
                {item.value}
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
