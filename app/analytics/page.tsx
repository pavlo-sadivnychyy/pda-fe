"use client";

import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
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
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f3f4f6",
        py: 4,
        px: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
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
      </Box>
    </Box>
  );
};

export default FinancialAnalyticsPage;
