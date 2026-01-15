"use client";

import React from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Typography,
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

const FinancialAnalyticsPage: React.FC = () => {
  const {
    data,
    currency,
    totals,
    totalAll,
    periodLabel,
    showSpinner,
    errorText,
  } = useFinancialAnalytics();
  const router = useRouter();

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
            Повернутись назад
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

          {/* ✅ Friendly hint block (додано) */}
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
          {/* внутрішній header (періоди / фільтри) */}
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
