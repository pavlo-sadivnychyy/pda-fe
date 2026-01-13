"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { OnboardingTour } from "./OnboardingTour";
import { onboardingTasks } from "./tasks";
import { resetOnboarding } from "./api";
import { useCurrentUser } from "@/hooksNew/useAppBootstrap";

export function OnboardingCard() {
  const router = useRouter();
  const { data: userData } = useCurrentUser();
  const onboardingCompleted = (userData as any)?.onboardingCompleted ?? false;

  const [signal, setSignal] = useState(0);

  // простий прогрес-заглушка
  const progress = useMemo(
    () => (onboardingCompleted ? 100 : 25),
    [onboardingCompleted],
  );

  return (
    <>
      <Card elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Онбординг
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mt: 0.5 }}
              >
                Пройди базові кроки — і асистент працюватиме максимально точно.
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mt: 1.5 }}
              >
                <Chip
                  label={
                    onboardingCompleted ? "Завершено" : `Прогрес ~${progress}%`
                  }
                  size="small"
                  sx={{
                    borderRadius: 999,
                    bgcolor: onboardingCompleted
                      ? "rgba(34,197,94,0.12)"
                      : "rgba(249,115,22,0.12)",
                  }}
                />
              </Stack>
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems="stretch"
            >
              <Button
                onClick={() => setSignal((s) => s + 1)}
                variant="contained"
                sx={{
                  textTransform: "none",
                  bgcolor: "#202124",
                  "&:hover": { bgcolor: "#111827" },
                  borderRadius: 999,
                  px: 3,
                }}
              >
                Запустити гайд
              </Button>

              <Button
                onClick={async () => {
                  // якщо на бекенді немає reset — просто прибери це і залиш тільки setSignal
                  try {
                    await resetOnboarding();
                  } catch (e) {
                    // ок, просто запустимо тур ще раз навіть без reset
                    console.warn(
                      "resetOnboarding failed (maybe endpoint not implemented):",
                      e,
                    );
                  } finally {
                    setSignal((s) => s + 1);
                  }
                }}
                variant="outlined"
                sx={{ textTransform: "none", borderRadius: 999 }}
              >
                Пройти ще раз
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1}>
            {onboardingTasks.map((t) => (
              <Stack
                key={t.id}
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ xs: "stretch", sm: "center" }}
                justifyContent="space-between"
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  bgcolor: "rgba(17,24,39,0.02)",
                  border: "1px solid rgba(17,24,39,0.06)",
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {t.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    {t.description}
                  </Typography>
                </Box>

                <Button
                  onClick={() => router.push(t.href)}
                  variant="text"
                  sx={{ textTransform: "none", justifyContent: "flex-start" }}
                >
                  Перейти →
                </Button>
              </Stack>
            ))}
          </Stack>
        </CardContent>

        <Box
          sx={{
            height: 6,
            bgcolor: "rgba(250, 204, 21, 0.25)",
            backgroundImage:
              "linear-gradient(135deg, rgba(249,115,22,0.35) 0%, rgba(234,179,8,0.35) 100%)",
          }}
        />
      </Card>

      {/* 👇 це дає manual запуск */}
      <OnboardingTour forceStartSignal={signal} />
    </>
  );
}
