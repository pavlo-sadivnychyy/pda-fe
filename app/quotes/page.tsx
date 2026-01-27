"use client";

import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Snackbar,
  Stack,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import { useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";

import { api } from "@/libs/axios";

import { useClientsQueries } from "@/app/clients/hooks/useClientsQueries";

import type { Quote, QuoteAction } from "./types";

import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import { useRouter } from "next/navigation";
import { QuotesGrid } from "@/app/quotes/components/QuotesGrid";
import { QuotesCard } from "@/app/quotes/components/QuotesCard";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import TimelineIcon from "@mui/icons-material/Timeline";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import BoltIcon from "@mui/icons-material/Bolt";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { CreateQuoteDialog } from "@/app/quotes/components/CreateQuoteDialog";
import BusinessIcon from "@mui/icons-material/Business";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LockIcon from "@mui/icons-material/Lock";
import { InfinitySpin } from "react-loader-spinner";
import { useOrganizationContext } from "@/app/invoices/hooks/useOrganizationContext";

/* =======================
   Config: plan limits (постав свої)
======================= */

const PLAN_LIMITS: Record<string, number> = {
  BASIC: 20,
  PRO: 200,
  BUSINESS: 1000,
  // FREE не має доступу взагалі
};

const quotesKeys = {
  all: ["quotes"] as const,
  list: (organizationId?: string) =>
    [...quotesKeys.all, "list", organizationId] as const,
};

type QuotesListResponse = { quotes: Quote[] };

function useQuotesQuery(organizationId?: string, enabled: boolean) {
  return useQuery<Quote[]>({
    queryKey: quotesKeys.list(organizationId),
    enabled: Boolean(organizationId) && enabled,
    queryFn: async () => {
      const res = await api.get<QuotesListResponse>("/quotes", {
        params: { organizationId },
      });
      return res.data.quotes ?? [];
    },
  });
}

async function postQuoteAction(id: string, action: QuoteAction) {
  await api.post(`/quotes/${id}/${action}`);
}

async function convertQuoteToInvoice(id: string) {
  const res = await api.post(`/quotes/${id}/convert-to-invoice`);
  return res.data; // { invoice }
}

/* =======================
   UI blocks
======================= */

function FullscreenLoader({ text }: { text?: string }) {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: "#f3f4f6",
        display: "grid",
        placeItems: "center",
        px: 2,
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <InfinitySpin width="200" color="#202124" />
        <Typography variant="body2" sx={{ mt: 1.5, color: "text.secondary" }}>
          {text ?? "Завантажую…"}
        </Typography>
      </Box>
    </Box>
  );
}

function NoOrgState() {
  return (
    <Card
      sx={{
        width: "100%",
        maxWidth: 640,
        borderRadius: 4,
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
      }}
    >
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={2.2} alignItems="center" textAlign="center">
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 999,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(25,118,210,0.08)",
            }}
          >
            <BusinessIcon />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Спочатку створи організацію
          </Typography>

          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Комерційні пропозиції прив’язані до організації. Створи її — і тоді
            зможеш створювати quotes та конвертувати їх в інвойс.
          </Typography>

          <Button
            component={Link}
            href="/organization"
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            sx={{ borderRadius: 999, px: 2.5 }}
          >
            Перейти до створення
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function PaywallState({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <Card
      sx={{
        width: "100%",
        maxWidth: 680,
        borderRadius: 4,
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
      }}
    >
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={2.2} alignItems="center" textAlign="center">
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 999,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(245, 158, 11, 0.14)",
              color: "#111827",
            }}
          >
            <LockIcon />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            Комерційні пропозиції доступні лише на платних планах
          </Typography>

          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            На FREE плані цей розділ недоступний. Підвищіть план, щоб створювати
            комерційні пропозиції та конвертувати їх в інвойси.
          </Typography>

          <Button
            onClick={onUpgrade}
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            sx={{
              borderRadius: 999,
              fontWeight: 900,
              bgcolor: "#f59e0b",
              color: "white",
              boxShadow:
                "0 10px 22px rgba(245, 158, 11, 0.30), 0 0 0 4px rgba(245, 158, 11, 0.18)",
              "&:hover": { bgcolor: "#fbbf24" },
            }}
          >
            Підвищити план
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function PlanLimitBanner({
  current,
  limit,
  onUpgrade,
}: {
  current: number;
  limit: number;
  onUpgrade: () => void;
}) {
  return (
    <Box
      sx={{
        mb: 2.5,
        p: 2,
        borderRadius: 3,
        border: "1px solid #fecaca",
        bgcolor: "#fff1f2",
        display: "flex",
        justifyContent: "space-between",
        gap: 2,
        alignItems: { xs: "flex-start", sm: "center" },
      }}
    >
      <Stack spacing={0.3}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 999,
              display: "grid",
              placeItems: "center",
              bgcolor: "#111827",
              color: "white",
            }}
          >
            <LockIcon fontSize="small" />
          </Box>

          <Typography sx={{ fontWeight: 900, color: "#991b1b" }}>
            Ліміт quotes вичерпано
          </Typography>
        </Stack>

        <Typography variant="body2" sx={{ color: "#7f1d1d" }}>
          Використано {current} / {limit}. Щоб створювати більше — підвищіть
          план.
        </Typography>
      </Stack>

      <Button
        onClick={onUpgrade}
        variant="contained"
        endIcon={<ArrowForwardIcon />}
        sx={{
          borderRadius: 999,
          fontWeight: 900,
          bgcolor: "#f59e0b",
          color: "#111827",
          boxShadow:
            "0 10px 22px rgba(245, 158, 11, 0.30), 0 0 0 4px rgba(245, 158, 11, 0.18)",
          "&:hover": { bgcolor: "#fbbf24" },
        }}
      >
        Підвищити план
      </Button>
    </Box>
  );
}

/* =======================
   Page
======================= */

export default function QuotesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // ✅ один контекст як джерело правди
  const { currentUserId, organizationId, planId, isUserLoading, isOrgLoading } =
    useOrganizationContext();

  const canWork = true;

  const { clientsQuery } = useClientsQueries(organizationId);
  const clients = clientsQuery.data ?? [];

  const quotesQuery = useQuotesQuery(organizationId, planId !== "FREE");
  const quotes = quotesQuery.data ?? [];

  const [busyId, setBusyId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const closeSnackbar = () => setSnackbar((p) => ({ ...p, open: false }));

  // ✅ loader щоб не миготів noOrg/paywall
  const isBootstrapping =
    isUserLoading || isOrgLoading || typeof planId === "undefined";

  if (isBootstrapping) {
    return <FullscreenLoader text="Завантажую..." />;
  }

  // ✅ Paywall: quotes only if planId !== FREE
  if (planId === "FREE") {
    return (
      <Box sx={{ minHeight: "100dvh", bgcolor: "#f3f4f6", py: 4 }}>
        <Container
          maxWidth="xl"
          sx={{
            px: { xs: 2, sm: 3 },
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ mb: 2.5 }}>
            <Button
              onClick={() => router.push("/dashboard")}
              sx={{ color: "black", mb: 2 }}
              startIcon={<KeyboardReturnIcon fontSize="inherit" />}
            >
              на головну
            </Button>

            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "999px",
                  bgcolor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <RequestQuoteIcon sx={{ color: "#0f172a" }} />
              </Box>

              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "#0f172a" }}
              >
                Комерційні пропозиції
              </Typography>

              <Chip
                label="Недоступно на FREE"
                size="small"
                sx={{
                  bgcolor: "#fff7ed",
                  border: "1px solid #fed7aa",
                  color: "#7c2d12",
                  fontWeight: 800,
                }}
              />
            </Stack>
          </Box>

          <Box sx={{ flex: 1, display: "grid", placeItems: "center" }}>
            <PaywallState onUpgrade={() => router.push("/pricing")} />
          </Box>
        </Container>
      </Box>
    );
  }

  // ✅ No org (тільки після bootstrap)
  if (!organizationId) {
    return (
      <Box sx={{ minHeight: "100dvh", bgcolor: "#f3f4f6", py: 4 }}>
        <Container
          maxWidth="xl"
          sx={{
            px: { xs: 2, sm: 3 },
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ mb: 2.5 }}>
            <Button
              onClick={() => router.push("/dashboard")}
              sx={{ color: "black", mb: 2 }}
              startIcon={<KeyboardReturnIcon fontSize="inherit" />}
            >
              на головну
            </Button>

            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "999px",
                  bgcolor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <RequestQuoteIcon sx={{ color: "#0f172a" }} />
              </Box>

              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "#0f172a" }}
              >
                Комерційні пропозиції
              </Typography>

              <Chip
                label="Всього: 0"
                size="small"
                sx={{
                  bgcolor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  color: "#0f172a",
                  fontWeight: 700,
                }}
              />
            </Stack>

            <Typography variant="body2" sx={{ color: "#64748b", mt: 0.8 }}>
              Створюй пропозиції клієнтам і конвертуй в інвойс в один клік.
            </Typography>
          </Box>

          <Box sx={{ flex: 1, display: "grid", placeItems: "center" }}>
            <NoOrgState />
          </Box>
        </Container>
      </Box>
    );
  }

  const refreshQuotes = async () => {
    await queryClient.invalidateQueries({
      queryKey: quotesKeys.list(organizationId),
    });
  };

  const onAction = async (id: string, action: QuoteAction) => {
    if (!canWork) return;

    try {
      setBusyId(id);
      await postQuoteAction(id, action);
      await refreshQuotes();
      setSnackbar({ open: true, message: "Готово ✅", severity: "success" });
    } catch (e: any) {
      console.error(e);
      setSnackbar({
        open: true,
        message: e?.response?.data?.message || "Помилка",
        severity: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  const onConvert = async (id: string) => {
    if (!canWork) return;

    try {
      setBusyId(id);
      const data = await convertQuoteToInvoice(id);
      await refreshQuotes();

      const invoiceId = data?.invoice?.id;
      if (invoiceId) {
        window.open(
          `/api/pdf/invoices/${invoiceId}`,
          "_blank",
          "noopener,noreferrer",
        );
      }

      setSnackbar({
        open: true,
        message: "Quote конвертовано в Invoice ✅",
        severity: "success",
      });
    } catch (e: any) {
      console.error(e);
      setSnackbar({
        open: true,
        message: e?.response?.data?.message || "Не вдалося конвертувати",
        severity: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  const quotesCount = quotes.length;

  // ✅ limit
  const planLimit = PLAN_LIMITS[planId ?? ""] ?? Infinity;
  const isLimitReached = quotesCount >= planLimit;

  return (
    <Box
      sx={{
        height: "100dvh",
        overflow: "auto",
        bgcolor: "#f3f4f6",
        py: 4,
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          px: { xs: 2, sm: 3 },
          height: { xs: "auto", md: "100%" },
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 2.5 }}>
          <Button
            onClick={() => router.push("/dashboard")}
            sx={{ color: "black", mb: 2 }}
            startIcon={<KeyboardReturnIcon fontSize="inherit" />}
          >
            на головну
          </Button>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "999px",
                  bgcolor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <RequestQuoteIcon sx={{ color: "#0f172a" }} />
              </Box>

              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "#0f172a" }}
              >
                Комерційні пропозиції
              </Typography>
            </Stack>

            <Chip
              label={`Всього: ${quotesCount}`}
              size="small"
              sx={{
                bgcolor: "#ffffff",
                border: "1px solid #e2e8f0",
                color: "#0f172a",
                fontWeight: 700,
              }}
            />
          </Stack>

          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.8 }}>
            Створюй пропозиції клієнтам і конвертуй в інвойс в один клік.
          </Typography>
        </Box>

        {/* Limit banner */}
        {isLimitReached && planLimit !== Infinity && (
          <PlanLimitBanner
            current={quotesCount}
            limit={planLimit}
            onUpgrade={() => router.push("/billing")}
          />
        )}

        {/* Hint */}
        <Box sx={{ mt: 0, mb: 2.5 }}>
          <Alert
            icon={<ErrorOutlineIcon sx={{ fontSize: 20 }} />}
            severity="info"
            sx={{
              bgcolor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 3,
              "& .MuiAlert-message": { width: "100%" },
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: "#334155", lineHeight: 1.55 }}
            >
              Тут зручно тримати процес під контролем: змінюй статуси, бач
              етапи, а коли погоджено — конвертуй в інвойс без дублювання.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ mt: 1.25 }}
            >
              <Chip
                size="small"
                icon={<TimelineIcon />}
                label="Статуси = прозорий процес"
                sx={{
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontWeight: 600,
                }}
              />
              <Chip
                size="small"
                icon={<AutorenewIcon />}
                label="Без дублювання даних"
                sx={{
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontWeight: 600,
                }}
              />
              <Chip
                size="small"
                icon={<ReceiptLongIcon />}
                label="Конвертація в інвойс"
                sx={{
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontWeight: 600,
                }}
              />
              <Chip
                size="small"
                icon={<BoltIcon />}
                label="1 клік → документ"
                sx={{
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontWeight: 600,
                }}
              />
            </Stack>
          </Alert>
        </Box>

        {/* Main */}
        <Box>
          <Box
            sx={{
              maxWidth: 1700,
              mx: "auto",
            }}
          >
            <QuotesCard
              count={quotesCount}
              organizationId={organizationId}
              currentUserId={currentUserId || ""}
              setCreateOpen={() => {
                if (isLimitReached) {
                  setSnackbar({
                    open: true,
                    message: "Ліміт quotes вичерпано. Підвищіть план.",
                    severity: "error",
                  });
                  return;
                }
                setCreateOpen(true);
              }}
              isLimitReached={isLimitReached} // ✅ додай у QuotesCard так само як у Clients/Invoices
            >
              <QuotesGrid
                disbaleExport={planId !== "PRO"}
                quotes={quotes as any}
                clients={clients as any}
                loading={quotesQuery.isLoading || clientsQuery.isLoading}
                onAction={onAction}
                onConvert={onConvert}
                actionBusyId={busyId}
              />
            </QuotesCard>
          </Box>
        </Box>
      </Container>

      <CreateQuoteDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        organizationId={organizationId}
        createdById={currentUserId || ""}
        clients={clients as any}
        onCreated={async () => {
          setCreateOpen(false);
          await refreshQuotes();
          setSnackbar({
            open: true,
            message: "Комерційну пропозицію створено",
            severity: "success",
          });
        }}
        onError={(msg) =>
          setSnackbar({ open: true, message: msg, severity: "error" })
        }
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={closeSnackbar}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
