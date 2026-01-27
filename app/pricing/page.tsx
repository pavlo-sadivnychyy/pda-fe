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

function formatPrice(price: number | string) {
  const n = typeof price === "string" ? Number(price) : price;
  if (!Number.isFinite(n)) return String(price);
  return n === 0 ? "0" : String(n);
}

type MonoCheckoutResponse = {
  subscriptionId: string;
  pageUrl: string;
};

type UserResponse = {
  user: {
    id: string;
    subscription?: {
      planId: PlanId;
      status?: string | null;
      planIdPending?: PlanId | null;
    } | null;
  };
};

type Props = {
  currentPlanId?: PlanId;
};

export default function PricingPage({ currentPlanId = "FREE" }: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: userData, isLoading } = useCurrentUser();

  const userId = userData?.id ?? null;

  const currentPlanFromApi: PlanId =
    userData?.subscription?.planId ?? currentPlanId;

  const subscriptionStatus = userData?.subscription?.status ?? null;
  const planIdPending = userData?.subscription?.planIdPending ?? null;

  // ✅ BASIC/PRO: тільки через оплату Monobank
  const checkoutMutation = useMutation({
    mutationFn: async (planId: PlanId) => {
      if (!userId) throw new Error("No userId");
      if (planId === "FREE") throw new Error("FREE does not require checkout");

      const { data } = await api.post<MonoCheckoutResponse>(
        `/billing/monobank/checkout`,
        { planId },
      );
      return data;
    },
    onSuccess: (data) => {
      window.location.href = data.pageUrl;
    },
  });

  // ✅ FREE: залишаємо твій існуючий endpoint (без оплати)
  const setPlanMutation = useMutation({
    mutationFn: async (planId: PlanId) => {
      if (!userId) throw new Error("No userId");
      const { data } = await api.patch<UserResponse>(`/users/${userId}/plan`, {
        planId,
      });
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["app-bootstrap"], data);
      qc.invalidateQueries({ queryKey: ["app-bootstrap"] });
    },
  });

  const handleChoosePlan = (planId: PlanId) => {
    if (!userId) return;

    // якщо підписка в процесі — не даємо робити іншу
    if (subscriptionStatus === "pending" && planIdPending) return;

    if (planId === currentPlanFromApi && !planIdPending) return;

    // FREE — одразу
    if (planId === "FREE") {
      setPlanMutation.mutate("FREE");
      return;
    }

    // BASIC/PRO — checkout
    checkoutMutation.mutate(planId);
  };

  const isBusy =
    isLoading || checkoutMutation.isPending || setPlanMutation.isPending;

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

  const topChipLabel =
    planIdPending && subscriptionStatus === "pending"
      ? `Оплата обробляється: ${planIdPending}`
      : `Поточний план: ${currentPlanFromApi}`;

  return (
    <Container maxWidth="lg" sx={{ padding: "32px 20px" }}>
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
            label={topChipLabel}
            sx={{
              bgcolor: "#fefce8",
              border: "1px solid #facc15",
              fontWeight: 600,
            }}
          />

          {(checkoutMutation.isError || setPlanMutation.isError) && (
            <Typography variant="caption" sx={{ color: "#dc2626" }}>
              Не вдалося виконати дію
            </Typography>
          )}
        </Box>

        {planIdPending && subscriptionStatus === "pending" ? (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Якщо ти вже оплатив — зачекай кілька секунд або онови сторінку.
          </Typography>
        ) : null}
      </Stack>

      {/* Cards */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2.5}
        alignItems="stretch"
      >
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlanFromApi;
          const isPopular = Boolean((plan as any).highlight);
          const headerIconColor = isPopular ? "#f97316" : "#111827";

          const isThisPending =
            checkoutMutation.isPending &&
            checkoutMutation.variables === plan.id;

          const disabled =
            isCurrent ||
            isBusy ||
            !userId ||
            (subscriptionStatus === "pending" && Boolean(planIdPending));

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

                    {isCurrent && !planIdPending && (
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

                    {planIdPending === plan.id &&
                      subscriptionStatus === "pending" && (
                        <Chip
                          label="Оплата..."
                          size="small"
                          sx={{
                            bgcolor: "#fff7ed",
                            border: "1px solid #fdba74",
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
                    variant={"contained"}
                    onClick={() => handleChoosePlan(plan.id)}
                    disabled={disabled}
                    sx={{
                      textTransform: "none",
                      borderRadius: 999,
                      fontSize: 12,
                      px: 2.5,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isCurrent
                      ? "План активний"
                      : isThisPending
                        ? "Переходимо до оплати..."
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
