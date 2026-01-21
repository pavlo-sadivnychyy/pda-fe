"use client";

import * as React from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { PLANS, type PlanId } from "./plans";
import { api } from "@/libs/axios";
import { useCurrentUser } from "@/hooksNew/useAppBootstrap";
import { InfinitySpin } from "react-loader-spinner";

function formatPrice(price: number) {
  return price === 0 ? "0" : String(price);
}

// мінімальний тип відповіді з бекенду
type UserResponse = {
  user: {
    id: string;
    subscription?: {
      planId: PlanId;
    } | null;
  };
};

type Props = {
  // якщо ти прокидаєш його з сервера — ок як fallback
  currentPlanId?: PlanId;
};

export default function PricingPage({ currentPlanId = "FREE" }: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: userData, isLoading } = useCurrentUser();

  const userId = userData?.id ?? null;

  const currentPlanFromApi: PlanId =
    userData?.subscription?.planId ?? currentPlanId;

  const setPlanMutation = useMutation({
    mutationFn: async (planId: PlanId) => {
      if (!userId) throw new Error("No userId");
      const { data } = await api.patch<UserResponse>(`/users/${userId}/plan`, {
        planId,
      });
      return data;
    },
    onSuccess: (data) => {
      // ✅ одразу оновлюємо кеш, щоб UI миттєво перерендився
      qc.setQueryData(["app-bootstrap"], data);
      // ✅ і на всяк випадок підтягнемо ще раз
      qc.invalidateQueries({ queryKey: ["app-bootstrap"] });
    },
  });

  const handleChoosePlan = (planId: PlanId) => {
    if (!userId) return;
    if (planId === currentPlanFromApi) return;
    setPlanMutation.mutate(planId);
  };

  const isBusy = isLoading || setPlanMutation.isPending;

  if (isBusy) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "#f3f4f6",
        }}
      >
        <InfinitySpin width="200" color="#202124" />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ padding: "32px 0" }}>
      {/* Header */}
      <Button
        onClick={() => router.push("/dashboard")}
        sx={{ color: "black", marginBottom: "20px" }}
        startIcon={<KeyboardReturnIcon fontSize="inherit" />}
      >
        на головну
      </Button>

      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Плани та підписка
        </Typography>

        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Обери план під свої потреби. Почни з FREE і апгрейднись, коли захочеш
          аналітику, експорт і автоматизації.
        </Typography>

        <Box sx={{ mt: 0.5, display: "flex", gap: 1, alignItems: "center" }}>
          <Chip
            label={`Поточний план: ${currentPlanFromApi}`}
            sx={{
              bgcolor: "#fefce8",
              border: "1px solid #facc15",
              fontWeight: 600,
            }}
          />

          {setPlanMutation.isError && (
            <Typography variant="caption" sx={{ color: "#dc2626" }}>
              Не вдалося змінити план
            </Typography>
          )}
        </Box>
      </Stack>

      {/* Cards */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2.5}
        alignItems="stretch"
      >
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlanFromApi;
          const isPopular = Boolean(plan.highlight);
          const headerIconColor = isPopular ? "#f97316" : "#111827";

          const isThisPending =
            setPlanMutation.isPending && setPlanMutation.variables === plan.id;

          return (
            <Card
              key={plan.id}
              elevation={3}
              sx={{
                borderRadius: 3,
                flex: 1,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                opacity: isLoading ? 0.85 : 1,
              }}
            >
              <CardHeader
                avatar={
                  <WorkspacePremiumIcon sx={{ color: headerIconColor }} />
                }
                title={
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    flexWrap="wrap"
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {plan.title}
                    </Typography>

                    {isCurrent && (
                      <Chip
                        label="Поточний"
                        size="small"
                        sx={{
                          bgcolor: "#ecfdf5",
                          border: "1px solid #86efac",
                          fontWeight: 700,
                        }}
                      />
                    )}
                  </Stack>
                }
                subheader={
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {plan.subtitle}
                  </Typography>
                }
                sx={{ pb: 0 }}
              />

              <CardContent
                sx={{
                  pt: 1.5,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                {/* Main content */}
                <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Що входить
                    </Typography>

                    <List dense sx={{ py: 0 }}>
                      {plan.features.map((f) => (
                        <ListItem key={f} disableGutters sx={{ py: 0.25 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircleIcon
                              sx={{ fontSize: 18, color: "#16a34a" }}
                            />
                          </ListItemIcon>

                          <ListItemText
                            primary={
                              <Typography
                                variant="body2"
                                sx={{ color: "#4b5563" }}
                              >
                                {f}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  {plan.limits?.length ? (
                    <>
                      <Divider />

                      <Box
                        sx={{
                          bgcolor: "#fefce8",
                          borderRadius: 2,
                          p: 1.5,
                          border: "1px solid #facc15",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, mb: 0.5 }}
                        >
                          Обмеження
                        </Typography>

                        <List dense sx={{ py: 0 }}>
                          {plan.limits.map((l) => (
                            <ListItem key={l} disableGutters sx={{ py: 0.25 }}>
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="body2"
                                    sx={{ color: "#4b5563" }}
                                  >
                                    • {l}
                                  </Typography>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </>
                  ) : null}
                </Stack>

                {/* Bottom CTA */}
                <Divider sx={{ my: 1.5 }} />

                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Typography sx={{ fontWeight: 800, fontSize: 18 }}>
                    {formatPrice(plan.priceMonthly)} {plan.currency}
                    <Typography
                      component="span"
                      sx={{ color: "text.secondary", fontWeight: 500 }}
                    >
                      {" "}
                      / міс
                    </Typography>
                  </Typography>

                  <Button
                    size="small"
                    variant={isPopular ? "contained" : "outlined"}
                    onClick={() => handleChoosePlan(plan.id)}
                    disabled={isCurrent || isBusy || !userId}
                    sx={{
                      textTransform: "none",
                      borderRadius: 999,
                      fontSize: 12,
                      px: 2.5,
                      whiteSpace: "nowrap",
                      ...(isPopular
                        ? {
                            bgcolor: "#202124",
                            "&:hover": { bgcolor: "#111827" },
                          }
                        : {}),
                    }}
                  >
                    {isCurrent
                      ? "План активний"
                      : isThisPending
                        ? "Застосовую..."
                        : plan.ctaLabel}
                  </Button>
                </Stack>
              </CardContent>

              {/* Subtle accent for popular plan */}
              {isPopular && (
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 4,
                    bgcolor: "#facc15",
                  }}
                />
              )}
            </Card>
          );
        })}
      </Stack>
    </Container>
  );
}
