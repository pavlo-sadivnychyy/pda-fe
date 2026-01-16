"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Typography,
} from "@mui/material";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import * as React from "react";

export type PlanId = "FREE" | "BASIC" | "PRO";

type Props = {
  currentPlan?: PlanId | null;
  hintText?: string | null;
  dragHandle?: React.ReactNode; // ✅ NEW
};

export function PlanCard({
  currentPlan = null,
  hintText = null,
  dragHandle,
  onClick,
}: Props) {
  const planLabel = currentPlan ?? "…";

  return (
    <Card data-onb="card-plan" elevation={3} sx={{ borderRadius: 3 }}>
      <CardHeader
        avatar={<WorkspacePremiumIcon sx={{ color: "#f97316" }} />}
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Плани та підписка
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Апгрейд дає аналітику, експорт та автоматичні нагадування.
          </Typography>
        }
        action={
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Button
              onClick={onClick}
              endIcon={<ArrowForwardIosIcon sx={{ fontSize: 14 }} />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: "#111827",
                borderRadius: 999,
                px: 1.5,
                "&:hover": { bgcolor: "#f3f4f6" },
                whiteSpace: "nowrap",
              }}
            >
              Перейти
            </Button>

            <Box sx={{ mr: 0.5 }}>{dragHandle}</Box>
          </Stack>
        }
        sx={{ pb: 0 }}
      />

      <CardContent sx={{ pt: 1.5 }}>
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Поточний план: <b>{planLabel}</b>
              {currentPlan === "FREE"
                ? " — спробуй, а потім апгрейднись."
                : null}
            </Typography>
          </Stack>

          {hintText && (
            <Typography variant="body2" sx={{ color: "#b45309", mt: 0.5 }}>
              {hintText}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
