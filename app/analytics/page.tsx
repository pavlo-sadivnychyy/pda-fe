"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import Chart from "chart.js/auto";

import { useCurrentUser } from "@/hooksNew/useAppBootstrap";
import { useOrganization } from "@/hooksNew/useAllUserOrganizations";
import { api } from "@/libs/axios";

type AnalyticsMonthlyPoint = {
  month: string;
  issuedTotal: number;
  paidTotal: number;
};

type AnalyticsData = {
  from: string;
  to: string;
  currency: string;
  totals: {
    paid: number;
    outstanding: number;
    overdue: number;
  };
  monthly: AnalyticsMonthlyPoint[];
};

type AnalyticsResponse = {
  analytics: AnalyticsData;
};

const formatMoney = (value: number, currency: string) => {
  const rounded = Math.round(value * 100) / 100;
  return `${rounded.toLocaleString("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
};

const FinancialAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const donutRef = useRef<Chart | null>(null);
  const donutCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const { data: userData } = useCurrentUser();
  const currentUserId = (userData as any)?.id ?? null;

  const { data: orgData, isLoading: orgLoading } = useOrganization(
    currentUserId || undefined,
  );
  const ORGANIZATION_ID = orgData?.items?.[0]?.organizationId;

  // ---- LOAD ANALYTICS ----
  useEffect(() => {
    if (!ORGANIZATION_ID) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get<AnalyticsResponse>("/invoices/analytics", {
          params: { organizationId: ORGANIZATION_ID },
        });

        setData(res.data.analytics);
      } catch (e) {
        console.error(e);
        setError("Не вдалося завантажити аналітику");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [ORGANIZATION_ID]);

  // ---- DONUT CHART ----
  useEffect(() => {
    if (!data) return;
    if (!donutCanvasRef.current) return;

    if (donutRef.current) {
      donutRef.current.destroy();
    }

    const ctx = donutCanvasRef.current.getContext("2d");
    if (!ctx) return;

    donutRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Отримано", "Очікується", "Прострочено"],
        datasets: [
          {
            data: [
              data.totals.paid,
              data.totals.outstanding,
              data.totals.overdue,
            ],
            // чорний/темний донат з контрастними сегментами
            backgroundColor: ["#16a34a", "#facc15", "#b91c1c"],
            borderColor: "#ffffff",
            borderWidth: 4,
          },
        ],
      },
      options: {
        cutout: "70%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#4b5563",
              font: { size: 12 },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed;
                const currency = data.currency ?? "UAH";
                return formatMoney(value, currency);
              },
            },
          },
        },
      },
    });

    return () => {
      donutRef.current?.destroy();
    };
  }, [data]);

  const currency = data?.currency ?? "UAH";
  const isStillLoadingOrg = orgLoading && !ORGANIZATION_ID;
  const showSpinner = (loading && !data) || isStillLoadingOrg;

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
        {/* Чіп секції */}

        {/* Основна картка */}
        <Box
          sx={{
            borderRadius: 5,
            bgcolor: "#ffffff",
            boxShadow: "0px 18px 45px rgba(15,23,42,0.11)",
            p: { xs: 3, md: 4 },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              gap: 2,
              mb: 3,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 0.5, color: "#020617" }}
              >
                Фінансовий огляд
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#6b7280", maxWidth: 560 }}
              >
                Скільки грошей вже зайшло, скільки ще чекаєш та як зараз
                розподілений дохід.
              </Typography>
            </Box>

            {data && (
              <Box
                sx={{
                  minWidth: 220,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: { xs: "flex-start", md: "flex-end" },
                  gap: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "#6b7280", textTransform: "uppercase" }}
                >
                  Період
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 500, color: "#020617" }}
                >
                  {data.from.slice(0, 10)} — {data.to.slice(0, 10)}
                </Typography>
              </Box>
            )}
          </Box>

          {/* СТАТУС / ЛОАДЕР / ПОМИЛКА */}
          {showSpinner && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 8,
              }}
            >
              <CircularProgress />
            </Box>
          )}

          {!showSpinner && error && (
            <Box sx={{ py: 4 }}>
              <Typography color="error" align="center">
                {error}
              </Typography>
            </Box>
          )}

          {!showSpinner && !error && data && (
            <>
              {/* KPI Cards */}
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: "1px solid #e5e7eb",
                      bgcolor: "#f9fafb",
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#6b7280",
                          textTransform: "uppercase",
                          letterSpacing: 0.6,
                        }}
                      >
                        Отримано
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ mt: 1, fontWeight: 600, color: "#16a34a" }}
                      >
                        {formatMoney(data.totals.paid, currency)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mt: 0.5, color: "#6b7280" }}
                      >
                        Сума оплачених інвойсів
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: "1px solid #fef3c7",
                      bgcolor: "#fffbeb",
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#d97706",
                          textTransform: "uppercase",
                          letterSpacing: 0.6,
                        }}
                      >
                        Очікується
                      </Typography>

                      <Typography
                        variant="h6"
                        sx={{ mt: 1, fontWeight: 600, color: "#92400e" }}
                      >
                        {formatMoney(data.totals.outstanding, currency)}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ mt: 0.5, color: "#92400e" }}
                      >
                        Інвойси у статусі SENT / OVERDUE
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: "1px solid #fee2e2",
                      bgcolor: "#fef2f2",
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#b91c1c",
                          textTransform: "uppercase",
                          letterSpacing: 0.6,
                        }}
                      >
                        Прострочено
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ mt: 1, fontWeight: 600, color: "#b91c1c" }}
                      >
                        {formatMoney(data.totals.overdue, currency)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mt: 0.5, color: "#7f1d1d" }}
                      >
                        Сума інвойсів зі статусом OVERDUE
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: "1px solid black",
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "black",
                          textTransform: "uppercase",
                          letterSpacing: 0.6,
                        }}
                      >
                        Всього
                      </Typography>

                      <Typography
                        variant="h6"
                        sx={{ mt: 1, fontWeight: 600, color: "black" }}
                      >
                        {formatMoney(
                          data.totals.paid +
                            data.totals.outstanding +
                            data.totals.overdue,
                          currency,
                        )}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ mt: 0.5, color: "black" }}
                      >
                        Сума всіх інвойсів
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* DONUT ONLY */}
              <Box
                sx={{
                  borderRadius: 3,
                  border: "1px solid #e5e7eb",
                  p: 3,
                  bgcolor: "#ffffff",
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: { xs: "100%", md: 280 },
                    height: { xs: 260, md: 280 },
                  }}
                >
                  <canvas ref={donutCanvasRef} />
                  {/* текст у центрі донату */}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1.5, fontWeight: 600, color: "#020617" }}
                  >
                    Розподіл грошей за статусами
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#6b7280", mb: 1.5, maxWidth: 420 }}
                  >
                    Donut показує, яку частину загальної суми займають оплачені,
                    очікувані та прострочені інвойси.
                  </Typography>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "999px",
                          bgcolor: "#0f172a",
                        }}
                      />
                      <Typography variant="body2" sx={{ color: "#020617" }}>
                        Отримано —{" "}
                        <strong>
                          {formatMoney(data.totals.paid, currency)}
                        </strong>
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "999px",
                          bgcolor: "#9ca3af",
                        }}
                      />
                      <Typography variant="body2" sx={{ color: "#020617" }}>
                        Очікується —{" "}
                        <strong>
                          {formatMoney(data.totals.outstanding, currency)}
                        </strong>
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "999px",
                          bgcolor: "#111827",
                        }}
                      />
                      <Typography variant="body2" sx={{ color: "#020617" }}>
                        Прострочено —{" "}
                        <strong>
                          {formatMoney(data.totals.overdue, currency)}
                        </strong>
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default FinancialAnalyticsPage;
