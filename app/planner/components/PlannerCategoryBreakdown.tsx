"use client";

import { LinearProgress, Paper, Stack, Typography } from "@mui/material";
import { MonthAnalytics } from "../planner.types";
import { formatMoney } from "../helpers";

type Props = {
  analytics: MonthAnalytics;
  currency: string;
};

export function PlannerCategoryBreakdown({ analytics, currency }: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        p: 3,
      }}
    >
      <Typography variant="h6" fontWeight={800} mb={2.5}>
        Категорії та перевитрати
      </Typography>

      <Stack spacing={2}>
        {analytics.byCategory.map((item) => (
          <Stack key={item.categoryId} spacing={0.75}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body1" fontWeight={700}>
                {item.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatMoney(item.actual)} / {formatMoney(item.planned)}{" "}
                {currency}
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={Math.min(item.usagePercent || 0, 100)}
              sx={{ height: 10, borderRadius: 999 }}
            />

            <Typography
              variant="caption"
              color={item.delta > 0 ? "error.main" : "text.secondary"}
            >
              {item.delta > 0
                ? `Перевитрата: ${formatMoney(item.delta)} ${currency}`
                : "У межах бюджету"}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
