"use client";

import * as React from "react";
import { useEffect, useMemo, useRef } from "react";
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
import { InfinitySpin } from "react-loader-spinner";

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

  /**
   * Зберігаємо останній transactionId, щоб:
   * - синхронізувати після success
   * - синхронізувати після close (ключовий фікс)
   */
  const checkoutRef = useRef<{ transactionId: string } | null>(null);

  /**
   * Щоб не ініціалізувати Paddle по 10 разів (React strict mode/dev тощо)
   */
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
      // ВАЖЛИВО: цей endpoint має на бекенді:
      // - подивитись реальний статус транзакції в Paddle
      // - якщо НЕ completed — скинути локальний "pending" (інакше буде вічний pending)
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

        // ✅ Правильна ініціалізація v2
        window.Paddle.Environment.set(env); // "sandbox" | "production"
        window.Paddle.Initialize({
          token: paddleToken,

          // ✅ Головне: ловимо події checkout
          eventCallback: async (event: PaddleEvent) => {
            const name = event?.name;

            // Успішна оплата
            if (name === "checkout.completed") {
              const txn =
                event?.data?.transaction_id ||
                event?.data?.transactionId ||
                checkoutRef.current?.transactionId;

              // Закриваємо модалку на всяк
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

              // прибираємо query (якщо було)
              setTimeout(() => {
                router.replace("/pricing", { scroll: false });
              }, 400);
            }

            // ❗️КЛЮЧОВИЙ ФІКС: користувач закрив чек-аут без оплати
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
                // якщо немає txn (рідко, але буває) — хоча б перезавантажимо юзера
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

        // зберігаємо txn, щоб потім sync-нути при close/success
        checkoutRef.current = { transactionId: data.transactionId };

        // ✅ В v2 немає стабільного "onClose" як єдиної правди.
        // Закриття ловимо через eventCallback (checkout.closed).
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

  const handleChoosePlan = (planId: PlanId) => {
    if (!userId) return;

    // якщо pending — зараз блокуємо
    // ПІСЛЯ ФІКСУ close->sync цей pending не буде вічним
    if (subscriptionStatus === "pending") return;

    if (planId === currentPlanFromApi) return;

    if (planId === "FREE") {
      setPlanMutation.mutate("FREE");
      return;
    }

    checkoutMutation.mutate(planId);
  };

  const isBusy =
    isLoading || checkoutMutation.isPending || setPlanMutation.isPending;

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
              label="Автоподовження вимкнено"
              sx={{
                bgcolor: "#f8fafc",
                border: "1px solid #e2e8f0",
                fontWeight: 700,
              }}
            />
          )}
        </Box>
      </Stack>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2.5}
        alignItems="stretch"
      >
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlanFromApi;
          const disabled =
            isCurrent ||
            !userId ||
            subscriptionStatus === "pending" ||
            checkoutMutation.isPending ||
            setPlanMutation.isPending;

          return (
            <Card
              key={plan.id}
              elevation={3}
              sx={{
                borderRadius: 3,
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardHeader
                avatar={<WorkspacePremiumIcon sx={{ color: "#111827" }} />}
                title={
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {plan.title}
                  </Typography>
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
                          <Typography variant="body2" sx={{ color: "#4b5563" }}>
                            {f}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>

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
                    variant="contained"
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
                      : checkoutMutation.isPending &&
                          checkoutMutation.variables === plan.id
                        ? "Відкриваємо оплату..."
                        : plan.ctaLabel}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

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
  );
}
