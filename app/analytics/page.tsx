"use client";

import React from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import InsightsIcon from "@mui/icons-material/Insights";

import { AnalyticsHeader } from "@/app/analytics/components/AnalyticsHeader";
import { KpiCards } from "@/app/analytics/components/KpiCards";
import { DonutCard } from "@/app/analytics/components/DonutCard";
import { useFinancialAnalytics } from "@/app/analytics/hooks/useFinancialAnalytics";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import { useRouter } from "next/navigation";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import TimelineIcon from "@mui/icons-material/Timeline";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import BusinessIcon from "@mui/icons-material/Business";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { useOrganizationContext } from "@/app/invoices/hooks/useOrganizationContext";
import LockIcon from "@mui/icons-material/Lock";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import { FullscreenLoader } from "@/app/clients/page";

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
            Фінансова аналітика прив’язана до організації та її інвойсів. Створи
            організацію — і тут з’являться KPI та графіки по оплатах.
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
            Аналітика не доступна на вашому плані
          </Typography>

          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Підвищіть план, щоб аналітику ваших доходів за місяць.
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

const FinancialAnalyticsPage: React.FC = () => {
  const router = useRouter();
  const { organizationId, planId, isUserLoading, isOrgLoading } =
    useOrganizationContext();

  // ✅ якщо нема org — показуємо empty state

  const isBootstrapping =
    isUserLoading || isOrgLoading || typeof planId === "undefined";

  if (isBootstrapping) {
    return <FullscreenLoader text="Завантажую..." />;
  }

  if (planId !== "PRO") {
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
                Аналітика
              </Typography>

              <Chip
                label="Доступно на PRO"
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

  if (!organizationId) {
    return (
      <Box sx={{ minHeight: "100dvh", bgcolor: "#f3f4f6", py: 4 }}>
        <Container
          maxWidth="lg"
          sx={{
            px: { xs: 2, sm: 3 },
            minHeight: "100dvh",
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
                  <InsightsIcon sx={{ color: "#0f172a" }} />
                </Box>

                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, color: "#0f172a" }}
                >
                  Фінансова аналітика
                </Typography>
              </Stack>

              <Chip
                label="Період"
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
              Огляд фінансового стану: отримані кошти, заборгованість,
              прострочені платежі та загальна картина по інвойсах.
            </Typography>
          </Box>

          {/* Center */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pb: { xs: 2, sm: 3 },
            }}
          >
            <NoOrgState />
          </Box>
        </Container>
      </Box>
    );
  }

  // ✅ тепер можна безпечно вантажити аналітику
  const {
    data,
    currency,
    totals,
    totalAll,
    periodLabel,
    showSpinner,
    errorText,
  } = useFinancialAnalytics(organizationId);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3f4f6", padding: "32px 0" }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* ✅ Уніфікований сторінковий хедер */}
        <Box sx={{ mb: 2.5 }}>
          <Button
            onClick={() => router.push("/dashboard")}
            sx={{ color: "black", marginBottom: "20px" }}
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
                <InsightsIcon sx={{ color: "#0f172a" }} />
              </Box>

              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "#0f172a" }}
              >
                Фінансова аналітика
              </Typography>
            </Stack>

            <Chip
              label={periodLabel}
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
            Огляд фінансового стану: отримані кошти, заборгованість, прострочені
            платежі та загальна картина по інвойсах.
          </Typography>

          {/* ✅ Friendly hint block */}
          <Box sx={{ mt: 2 }}>
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
                Ця сторінка допомагає{" "}
                <strong>бачити фінансову картину за обраний період</strong>:
                скільки вже отримано, скільки ще <strong>очікується</strong>, і
                що потребує уваги (наприклад, прострочені платежі). Візуалізація
                — це не “про графіки”, а про рішення:{" "}
                <strong>кому варто нагадати про оплату</strong>, які інвойси
                закрити першими та де може <strong>просідати кеш-флоу</strong>.
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{ mt: 1.25 }}
              >
                <Chip
                  size="small"
                  icon={<PaymentsIcon />}
                  label="Отримано / очікується"
                  sx={{
                    bgcolor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    fontWeight: 600,
                  }}
                />
                <Chip
                  size="small"
                  icon={<ReportProblemIcon />}
                  label="Що потребує уваги"
                  sx={{
                    bgcolor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    fontWeight: 600,
                  }}
                />
                <Chip
                  size="small"
                  icon={<TimelineIcon />}
                  label="Рішення по кеш-флоу"
                  sx={{
                    bgcolor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    fontWeight: 600,
                  }}
                />
              </Stack>
            </Alert>
          </Box>
        </Box>

        {/* ✅ Основна картка контенту */}
        <Box
          sx={{
            borderRadius: 5,
            bgcolor: "#ffffff",
            boxShadow: "0px 18px 45px rgba(15,23,42,0.11)",
            p: { xs: 3, md: 4 },
          }}
        >
          <AnalyticsHeader periodLabel={periodLabel} />

          {showSpinner && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          )}

          {!showSpinner && errorText && (
            <Box sx={{ py: 4 }}>
              <Typography color="error" align="center">
                {errorText}
              </Typography>
            </Box>
          )}

          {!showSpinner && !errorText && data && (
            <>
              <KpiCards
                currency={currency}
                paid={totals.paid}
                outstanding={totals.outstanding}
                overdue={totals.overdue}
                totalAll={totalAll}
              />

              <DonutCard
                currency={currency}
                paid={totals.paid}
                outstanding={totals.outstanding}
                overdue={totals.overdue}
              />
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default FinancialAnalyticsPage;
