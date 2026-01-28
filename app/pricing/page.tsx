"use client";

import * as React from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import CancelIcon from "@mui/icons-material/Cancel";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
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

function formatDateShort(iso?: string | Date | null) {
  if (!iso) return null;
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("uk-UA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

type PaddleCheckoutResponse = {
  transactionId: string;
  checkoutUrl: string;
};

type UserResponse = {
  user: {
    id: string;
    subscription?: {
      planId: PlanId;
      status?: string | null; // active | pending | canceled | past_due | ...
      cancelAtPeriodEnd?: boolean | null;
      currentPeriodEnd?: string | null;
      paddleStatus?: string | null;
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
  const cancelAtPeriodEnd = Boolean(userData?.subscription?.cancelAtPeriodEnd);
  const currentPeriodEnd = userData?.subscription?.currentPeriodEnd ?? null;

  const [snack, setSnack] = React.useState<{
    open: boolean;
    severity: "success" | "error" | "info" | "warning";
    message: string;
  }>({ open: false, severity: "info", message: "" });

  const [cancelOpen, setCancelOpen] = React.useState(false);

  // ✅ BASIC/PRO: Paddle checkout
  const checkoutMutation = useMutation({
    mutationFn: async (planId: PlanId) => {
      if (!userId) throw new Error("No userId");
      if (planId === "FREE") throw new Error("FREE does not require checkout");

      const { data } = await api.post<PaddleCheckoutResponse>(
        `/billing/paddle/checkout`,
        { planId },
      );
      return data;
    },
    onSuccess: (data) => {
      console.log("checkoutUrl:", data.checkoutUrl);
      window.location.href = data.checkoutUrl;
    },
    onError: (e: any) => {
      setSnack({
        open: true,
        severity: "error",
        message:
          e?.response?.data?.message ??
          e?.message ??
          "Не вдалося перейти до оплати",
      });
    },
  });

  // ✅ FREE: твій existing endpoint (без оплати)
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
      setSnack({ open: true, severity: "success", message: "План оновлено" });
    },
    onError: (e: any) => {
      setSnack({
        open: true,
        severity: "error",
        message:
          e?.response?.data?.message ?? e?.message ?? "Не вдалося оновити план",
      });
    },
  });

  // ✅ Cancel subscription (Paddle)
  const cancelMutation = useMutation({
    mutationFn: async (
      effectiveFrom: "next_billing_period" | "immediately",
    ) => {
      const { data } = await api.post(`/billing/paddle/cancel`, {
        effectiveFrom,
      });
      return data;
    },
    onSuccess: async (data: any) => {
      setCancelOpen(false);

      // оновимо bootstrap
      await qc.invalidateQueries({ queryKey: ["app-bootstrap"] });

      const effectiveFrom = data?.effectiveFrom as string | undefined;
      if (effectiveFrom === "immediately") {
        setSnack({
          open: true,
          severity: "success",
          message: "Підписку скасовано одразу. Доступ переведено на FREE.",
        });
      } else {
        setSnack({
          open: true,
          severity: "info",
          message: "Підписку буде скасовано в кінці поточного періоду.",
        });
      }
    },
    onError: (e: any) => {
      setSnack({
        open: true,
        severity: "error",
        message:
          e?.response?.data?.message ??
          e?.message ??
          "Не вдалося скасувати підписку",
      });
    },
  });

  const handleChoosePlan = (planId: PlanId) => {
    if (!userId) return;

    // якщо є pending checkout — блокуємо інші дії
    if (subscriptionStatus === "pending") return;

    if (planId === currentPlanFromApi) return;

    // FREE — одразу
    if (planId === "FREE") {
      setPlanMutation.mutate("FREE");
      return;
    }

    // BASIC/PRO — checkout
    checkoutMutation.mutate(planId);
  };

  const isBusy =
    isLoading ||
    checkoutMutation.isPending ||
    setPlanMutation.isPending ||
    cancelMutation.isPending;

  const canCancel =
    Boolean(userId) &&
    currentPlanFromApi !== "FREE" &&
    (subscriptionStatus === "active" ||
      subscriptionStatus === "past_due" ||
      subscriptionStatus === "trialing") &&
    !cancelAtPeriodEnd;

  const topChipLabel = (() => {
    if (subscriptionStatus === "pending") return "Оплата обробляється...";
    if (cancelAtPeriodEnd) {
      const end = formatDateShort(currentPeriodEnd);
      return end
        ? `Скасування заплановано: до ${end}`
        : "Скасування заплановано";
    }
    return `Поточний план: ${currentPlanFromApi}`;
  })();

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
    <Container maxWidth="lg" sx={{ padding: "32px 20px" }}>
      {/* Header */}
      <Button
        onClick={() => router.push("/dashboard")}
        sx={{ color: "black", marginBottom: "20px" }}
        startIcon={<KeyboardReturnIcon fontSize="inherit" />}
      >
        на головну
      </Button>

      <Stack spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Плани та підписка
        </Typography>

        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Обери план під свої потреби. Підписки — місячні з автосписанням.
          Скасувати можна будь-коли.
        </Typography>

        <Box
          sx={{
            mt: 0.5,
            display: "flex",
            gap: 1,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Chip
            label={topChipLabel}
            sx={{
              bgcolor: "#fefce8",
              border: "1px solid #facc15",
              fontWeight: 600,
            }}
          />

          {subscriptionStatus === "past_due" && (
            <Chip
              icon={<WarningAmberIcon />}
              label="Проблема з оплатою"
              sx={{
                bgcolor: "#fff1f2",
                border: "1px solid #fecdd3",
                fontWeight: 700,
              }}
            />
          )}

          {cancelAtPeriodEnd && (
            <Chip
              icon={<CancelIcon />}
              label="Автопродовження вимкнено"
              sx={{
                bgcolor: "#f8fafc",
                border: "1px solid #e2e8f0",
                fontWeight: 700,
              }}
            />
          )}
        </Box>

        {subscriptionStatus === "pending" ? (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Якщо ти вже оплатив — зачекай кілька секунд або онови сторінку.
          </Typography>
        ) : null}

        {/* Cancel / Manage */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ mt: 1 }}
          alignItems="center"
        >
          <Button
            variant="outlined"
            size="small"
            disabled={!canCancel}
            onClick={() => setCancelOpen(true)}
            sx={{
              textTransform: "none",
              borderRadius: 999,
              px: 2,
              whiteSpace: "nowrap",
            }}
          >
            Скасувати підписку
          </Button>

          {!canCancel && currentPlanFromApi !== "FREE" && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {cancelAtPeriodEnd
                ? "Скасування вже заплановано."
                : subscriptionStatus === "pending"
                  ? "Поки оплата обробляється — скасування недоступне."
                  : "Скасування доступне лише для активної підписки."}
            </Typography>
          )}
        </Stack>
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
            !userId ||
            subscriptionStatus === "pending" ||
            checkoutMutation.isPending ||
            setPlanMutation.isPending ||
            cancelMutation.isPending;

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

                    {isCurrent && cancelAtPeriodEnd && (
                      <Chip
                        label="Не продовжиться"
                        size="small"
                        sx={{
                          bgcolor: "#f8fafc",
                          border: "1px solid #e2e8f0",
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
                      {plan.features.map((f: string) => (
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
                          {plan.limits.map((l: string) => (
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

                {isCurrent &&
                currentPlanFromApi !== "FREE" &&
                currentPeriodEnd ? (
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", mt: 1 }}
                  >
                    Період до: {formatDateShort(currentPeriodEnd)}
                  </Typography>
                ) : null}
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

      {/* Cancel dialog */}
      <Dialog
        open={cancelOpen}
        onClose={() => (cancelMutation.isPending ? null : setCancelOpen(false))}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Скасувати підписку?</DialogTitle>

        <DialogContent>
          <Stack spacing={1.25} sx={{ mt: 1 }}>
            <Alert severity="info">
              За замовчуванням ми вимикаємо автопродовження — план буде активним
              до кінця оплаченого періоду.
            </Alert>

            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Поточний план: <b>{currentPlanFromApi}</b>
              {currentPeriodEnd ? (
                <>
                  {" "}
                  • до: <b>{formatDateShort(currentPeriodEnd)}</b>
                </>
              ) : null}
            </Typography>

            <Box
              sx={{
                bgcolor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 2,
                p: 1.5,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Варіанти
              </Typography>

              <Typography variant="body2" sx={{ color: "#475569" }}>
                1) <b>В кінці періоду</b> — рекомендовано. Доступ зберігається
                до кінця оплаченого місяця.
              </Typography>
              <Typography variant="body2" sx={{ color: "#475569", mt: 0.75 }}>
                2) <b>Одразу</b> — доступ одразу стане FREE.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setCancelOpen(false)}
            disabled={cancelMutation.isPending}
            sx={{ textTransform: "none" }}
          >
            Назад
          </Button>

          <Button
            variant="outlined"
            color="error"
            disabled={cancelMutation.isPending}
            onClick={() => cancelMutation.mutate("immediately")}
            sx={{ textTransform: "none", borderRadius: 999 }}
          >
            Скасувати одразу
          </Button>

          <Button
            variant="contained"
            disabled={cancelMutation.isPending}
            onClick={() => cancelMutation.mutate("next_billing_period")}
            sx={{ textTransform: "none", borderRadius: 999 }}
          >
            В кінці періоду
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
