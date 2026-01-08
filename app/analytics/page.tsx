"use client";

import React from "react";
import {
  Box,
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

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3f4f6", py: { xs: 3, md: 8 } }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* ✅ Уніфікований сторінковий хедер */}
        <Box sx={{ mb: 2.5 }}>
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
