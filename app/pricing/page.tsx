"use client";

import * as React from "react";
import { useEffect, useMemo, useRef } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import CancelIcon from "@mui/icons-material/Cancel";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DoNotDisturbOnIcon from "@mui/icons-material/DoNotDisturbOn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BoltIcon from "@mui/icons-material/Bolt";
import VerifiedIcon from "@mui/icons-material/Verified";
import SecurityIcon from "@mui/icons-material/Security";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Stack,
  Typography,
  Paper,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InfinitySpin } from "react-loader-spinner";
import { motion } from "framer-motion";

import { PLANS, type PlanId } from "./plans";
import { api } from "@/libs/axios";
import { useCurrentUser } from "@/hooksNew/useAppBootstrap";

type PaddleCheckoutResponse = {
  transactionId: string;
  successUrl?: string;
  cancelUrl?: string;
};

type PaddleEvent = {
  name: string;
  data?: any;
};

declare global {
  interface Window {
    Paddle?: any;
  }
}

/* ================== LANDING TOKENS ================== */
const ORANGE = "#febe58";
const DARK = "#111827";
const MUTED = "#64748b";
const BG = "#f3f4f6";
const BORDER = "#e5e7eb";

const glassShadow = "0 24px 60px rgba(15, 23, 42, 0.12)";
const softShadow = "0 24px 60px rgba(15, 23, 42, 0.08)";

const MotionPaper = motion(Paper);

const pillSx = {
  bgcolor: "#ffffff",
  border: `1px solid ${BORDER}`,
  color: DARK,
  fontWeight: 900,
};

const softCardSx = {
  borderRadius: 4,
  border: `1px solid ${BORDER}`,
  bgcolor: "#ffffff",
  boxShadow: softShadow,
};

function loadPaddleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.Paddle) return resolve();

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-paddle="v2"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Paddle failed")),
      );
      return;
    }

    const s = document.createElement("script");
    s.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    s.async = true;
    s.dataset.paddle = "v2";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Paddle.js"));
    document.head.appendChild(s);
  });
}

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

function planBadge(planId: PlanId) {
  if (planId === "BASIC")
    return { label: "Найкращий старт", kind: "best" as const };
  if (planId === "PRO") return { label: "Для обсягів", kind: "pro" as const };
  return { label: "Спробувати", kind: "free" as const };
}

function planAvatar(planId: PlanId) {
  if (planId === "BASIC")
    return <BoltIcon sx={{ color: DARK, fontSize: 18 }} />;
  if (planId === "PRO")
    return <WorkspacePremiumIcon sx={{ color: DARK, fontSize: 18 }} />;
  return <VerifiedIcon sx={{ color: DARK, fontSize: 18 }} />;
}

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

  // last transactionId
  const checkoutRef = useRef<{ transactionId: string } | null>(null);

  // init guard
  const paddleInitedRef = useRef(false);

  const env = useMemo(
    () => process.env.NEXT_PUBLIC_PADDLE_ENV ?? "sandbox",
    [],
  );

  const paddleToken = useMemo(
    () => process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
    [],
  );

  const syncTransaction = React.useCallback(
    async (transactionId: string) => {
      try {
        await api.post("/billing/paddle/sync-transaction", { transactionId });
      } catch (err) {
        console.warn("sync-transaction failed", err);
      } finally {
        await qc.invalidateQueries({ queryKey: ["app-bootstrap"] });
      }
    },
    [qc],
  );

  useEffect(() => {
    (async () => {
      try {
        await loadPaddleScript();
        if (!paddleToken)
          throw new Error("NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is missing");
        if (!window.Paddle) throw new Error("Paddle.js not loaded");

        if (paddleInitedRef.current) return;
        paddleInitedRef.current = true;

        window.Paddle.Environment.set(env);
        window.Paddle.Initialize({
          token: paddleToken,
          eventCallback: async (event: PaddleEvent) => {
            const name = event?.name;

            if (name === "checkout.completed") {
              const txn =
                event?.data?.transaction_id ||
                event?.data?.transactionId ||
                checkoutRef.current?.transactionId;

              try {
                window.Paddle?.Checkout?.close?.();
              } catch {}

              setSnack({
                open: true,
                severity: "success",
                message: "Оплату отримано. Оновлюємо підписку...",
              });

              if (txn) {
                checkoutRef.current = null;
                await syncTransaction(txn);
              } else {
                await qc.invalidateQueries({ queryKey: ["app-bootstrap"] });
              }

              setTimeout(() => {
                router.replace("/pricing", { scroll: false });
              }, 400);
            }

            if (name === "checkout.closed") {
              const txn =
                event?.data?.transaction_id ||
                event?.data?.transactionId ||
                checkoutRef.current?.transactionId;

              checkoutRef.current = null;

              setSnack({
                open: true,
                severity: "info",
                message: "Оплату скасовано.",
              });

              if (txn) {
                await syncTransaction(txn);
              } else {
                await qc.invalidateQueries({ queryKey: ["app-bootstrap"] });
              }

              setTimeout(() => {
                router.replace("/pricing", { scroll: false });
              }, 300);
            }
          },
        });
      } catch (e: any) {
        console.warn(e?.message ?? e);
        setSnack({
          open: true,
          severity: "warning",
          message:
            e?.message ??
            "Не вдалося ініціалізувати оплату. Перевір токен Paddle.",
        });
      }
    })();
  }, [env, paddleToken, qc, router, syncTransaction]);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("checkout") === "success") {
      qc.invalidateQueries({ queryKey: ["app-bootstrap"] });
      setSnack({
        open: true,
        severity: "success",
        message: "Оплату отримано. Оновлюємо підписку...",
      });
    }
    if (q.get("checkout") === "cancel") {
      setSnack({
        open: true,
        severity: "info",
        message: "Оплату скасовано.",
      });
    }
  }, [qc]);

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
    onSuccess: async (data) => {
      try {
        await loadPaddleScript();
        if (!paddleToken)
          throw new Error("NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is missing");
        if (!window.Paddle) throw new Error("Paddle.js not loaded");

        checkoutRef.current = { transactionId: data.transactionId };

        window.Paddle.Checkout.open({
          transactionId: data.transactionId,
        });
      } catch (e: any) {
        checkoutRef.current = null;
        setSnack({
          open: true,
          severity: "error",
          message:
            e?.message ??
            "Не вдалося відкрити форму оплати (Paddle.js / token).",
        });
      }
    },
    onError: (e: any) => {
      checkoutRef.current = null;
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

  const setPlanMutation = useMutation({
    mutationFn: async (planId: PlanId) => {
      if (!userId) throw new Error("No userId");
      const { data } = await api.patch(`/users/${userId}/plan`, { planId });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["app-bootstrap"] });
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

  // cancel subscription (autorenew off)
  const cancelSubMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/billing/paddle/cancel");
      return data as {
        ok: boolean;
        cancelAtPeriodEnd?: boolean;
        currentPeriodEnd?: string | null;
      };
    },
    onSuccess: async (data) => {
      await qc.invalidateQueries({ queryKey: ["app-bootstrap"] });

      const end = formatDateShort(data?.currentPeriodEnd ?? currentPeriodEnd);
      setSnack({
        open: true,
        severity: "success",
        message: end
          ? `Автоподовження вимкнено. Доступ активний до ${end}.`
          : "Автоподовження вимкнено.",
      });
    },
    onError: (e: any) => {
      setSnack({
        open: true,
        severity: "error",
        message:
          e?.response?.data?.message ??
          e?.message ??
          "Не вдалося скасувати автоподовження",
      });
    },
  });

  const handleChoosePlan = (planId: PlanId) => {
    if (!userId) return;

    if (subscriptionStatus === "pending") return;
    if (planId === currentPlanFromApi) return;

    if (planId === "FREE") {
      setPlanMutation.mutate("FREE");
      return;
    }

    checkoutMutation.mutate(planId);
  };

  const isBusy =
    isLoading ||
    checkoutMutation.isPending ||
    setPlanMutation.isPending ||
    cancelSubMutation.isPending;

  const canCancelAutorenew =
    Boolean(userId) &&
    currentPlanFromApi !== "FREE" &&
    subscriptionStatus !== "pending" &&
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
          bgcolor: BG,
        }}
      >
        <InfinitySpin width="200" color={DARK} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: BG, minHeight: "100vh", py: { xs: 3, md: 4 } }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 2.5 } }}>
        {/* TOP */}
        <Stack spacing={1.3} sx={{ mb: 2.5 }}>
          <Button
            onClick={() => router.push("/dashboard")}
            sx={{ color: "black", mb: 2, width: "fit-content" }}
            startIcon={<KeyboardReturnIcon fontSize="inherit" />}
          >
            на головну
          </Button>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            <Stack spacing={0.4}>
              <Typography variant="h5" sx={{ fontWeight: 950, color: DARK }}>
                Плани та підписка
              </Typography>
              <Typography sx={{ color: MUTED, lineHeight: 1.7 }}>
                Обери план під свої обсяги. Якщо потрібно — зможеш вимкнути
                автоподовження.
              </Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              justifyContent="flex-end"
            >
              <Chip
                label={topChipLabel}
                sx={{
                  bgcolor: "rgba(254,190,88,0.18)",
                  border: "1px solid rgba(254,190,88,0.35)",
                  fontWeight: 950,
                  color: DARK,
                }}
              />
              {subscriptionStatus === "past_due" && (
                <Chip
                  icon={<WarningAmberIcon />}
                  label="Проблема з оплатою"
                  sx={{
                    bgcolor: "#fff1f2",
                    border: "1px solid #fecdd3",
                    fontWeight: 950,
                  }}
                />
              )}
              {cancelAtPeriodEnd && (
                <Chip
                  icon={<CancelIcon />}
                  label="Автоподовження вимкнено"
                  sx={{
                    bgcolor: "#f8fafc",
                    border: `1px solid ${BORDER}`,
                    fontWeight: 950,
                  }}
                />
              )}

              <Button
                variant="outlined"
                color="inherit"
                disabled={!canCancelAutorenew || cancelSubMutation.isPending}
                onClick={() => cancelSubMutation.mutate()}
                startIcon={<DoNotDisturbOnIcon />}
                sx={{
                  textTransform: "none",
                  borderRadius: 999,
                  whiteSpace: "nowrap",
                  borderColor: BORDER,
                  bgcolor: "#fff",
                  fontWeight: 950,
                  "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" },
                }}
              >
                {cancelSubMutation.isPending
                  ? "Скасовуємо..."
                  : "Скасувати автоподовження"}
              </Button>
            </Stack>
          </Stack>
        </Stack>

        {/* ✅ CARDS — same vibe as landing feature cards */}
        <Grid container spacing={{ xs: 2.5, md: 3 }} justifyContent="center">
          {PLANS.map((plan, idx) => {
            const isCurrent = plan.id === currentPlanFromApi;

            const disabled =
              isCurrent ||
              !userId ||
              subscriptionStatus === "pending" ||
              checkoutMutation.isPending ||
              setPlanMutation.isPending ||
              cancelSubMutation.isPending;

            const isPayingThis =
              checkoutMutation.isPending &&
              checkoutMutation.variables === plan.id;

            const badge = planBadge(plan.id);

            return (
              <Grid item xs={12} md={4} key={plan.id}>
                <MotionPaper
                  elevation={0}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.45, delay: idx * 0.06 }}
                  whileHover={{ y: -4 }}
                  sx={{
                    ...softCardSx,
                    height: "100%",
                    p: { xs: 3, md: 4 },
                    position: "relative",
                    overflow: "hidden",
                    border:
                      plan.id === "BASIC"
                        ? "2px solid rgba(254,190,88,0.55)"
                        : `1px solid ${BORDER}`,
                  }}
                >
                  {/* subtle header glow like landing */}
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      background:
                        plan.id === "BASIC"
                          ? "radial-gradient(900px 320px at 50% 0%, rgba(243,107,22,0.18), transparent 60%)"
                          : "radial-gradient(900px 320px at 50% 0%, rgba(17,24,39,0.06), transparent 60%)",
                    }}
                  />

                  <Stack spacing={1.4} sx={{ position: "relative" }}>
                    {/* header row */}
                    <Stack
                      direction="row"
                      spacing={1.2}
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: 4,
                            border: `1px solid ${BORDER}`,
                            bgcolor: "#ffffff",
                            display: "grid",
                            placeItems: "center",
                          }}
                        >
                          {planAvatar(plan.id)}
                        </Box>

                        <Stack spacing={0.2}>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            flexWrap="wrap"
                          >
                            <Typography
                              sx={{
                                fontWeight: 950,
                                color: DARK,
                                fontSize: 18,
                              }}
                            >
                              {plan.title}
                            </Typography>

                            <Chip
                              size="small"
                              label={badge.label}
                              sx={{
                                ...pillSx,
                                fontWeight: 950,
                                ...(badge.kind === "best"
                                  ? {
                                      bgcolor: "rgba(254,190,88,0.18)",
                                      border: "1px solid rgba(254,190,88,0.35)",
                                    }
                                  : {}),
                              }}
                            />

                            {isCurrent ? (
                              <Chip
                                size="small"
                                label="Активний"
                                sx={{
                                  bgcolor: "rgba(34,197,94,0.12)",
                                  border: "1px solid rgba(34,197,94,0.28)",
                                  color: DARK,
                                  fontWeight: 950,
                                }}
                              />
                            ) : null}
                          </Stack>

                          <Typography sx={{ color: MUTED, lineHeight: 1.6 }}>
                            {plan.subtitle}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>

                    {/* price */}
                    <Stack direction="row" spacing={1} alignItems="baseline">
                      <Typography
                        sx={{
                          fontWeight: 950,
                          color: DARK,
                          letterSpacing: "-0.03em",
                          fontSize: { xs: 34, md: 38 },
                          lineHeight: 1,
                        }}
                      >
                        {formatPrice(plan.priceMonthly)} {plan.currency}
                      </Typography>
                      <Typography sx={{ color: MUTED, fontWeight: 700 }}>
                        / міс
                      </Typography>
                    </Stack>

                    {/* CTA */}
                    <Button
                      variant="contained"
                      onClick={() => handleChoosePlan(plan.id)}
                      disabled={disabled}
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        bgcolor: ORANGE,
                        color: DARK,
                        textTransform: "none",
                        fontWeight: 950,
                        borderRadius: 999,
                        px: 3,
                        py: 1.25,
                        boxShadow: "none",
                        "&:hover": {
                          bgcolor: plan.id === "BASIC" ? "#fdb17f" : "#000",
                          boxShadow: "none",
                        },
                        "&.Mui-disabled": {
                          backgroundColor: "#2e7d32",
                          color: "#fff",
                          opacity: 1,
                        },
                      }}
                    >
                      {isCurrent
                        ? "План активний"
                        : isPayingThis
                          ? "Відкриваємо оплату..."
                          : plan.ctaLabel}
                    </Button>

                    {/* features */}
                    <Divider />

                    <List dense sx={{ py: 0 }}>
                      {plan.features.map((f: string) => (
                        <ListItem key={f} disableGutters sx={{ py: 0.25 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircleIcon
                              sx={{ fontSize: 18, color: ORANGE }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography
                                variant="body2"
                                sx={{ color: MUTED, lineHeight: 1.6 }}
                              >
                                {f}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>

                    {/* limits (if exist) */}
                    {"limits" in plan && (plan as any).limits?.length ? (
                      <>
                        <Divider />
                        <Typography
                          sx={{ fontWeight: 950, color: DARK, fontSize: 13 }}
                        >
                          Не входить:
                        </Typography>
                        <List dense sx={{ py: 0 }}>
                          {(plan as any).limits.map((x: string) => (
                            <ListItem key={x} disableGutters sx={{ py: 0.2 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <Box
                                  sx={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: 999,
                                    bgcolor: "rgba(100,116,139,0.65)",
                                    ml: 1,
                                  }}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="body2"
                                    sx={{ color: MUTED, lineHeight: 1.6 }}
                                  >
                                    {x}
                                  </Typography>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    ) : null}

                    {/* tiny trust line like landing */}
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ pt: 0.5 }}
                    >
                      <SecurityIcon sx={{ fontSize: 18, color: MUTED }} />
                      <Typography
                        sx={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}
                      >
                        Документи приватні, доступ лише для твоєї організації
                      </Typography>
                    </Stack>
                  </Stack>
                </MotionPaper>
              </Grid>
            );
          })}
        </Grid>

        <Snackbar
          open={snack.open}
          autoHideDuration={3500}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
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
    </Box>
  );
}
