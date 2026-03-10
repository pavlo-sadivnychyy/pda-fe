"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { HistoryAnalytics, MonthAnalytics } from "../planner.types";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
  Filler,
);

type Props = {
  analytics: MonthAnalytics;
  history: HistoryAnalytics;
};

const chartBoxSx = {
  position: "relative",
  height: 320,
  width: "100%",
};

const COLORS = {
  blue: "rgba(59,130,246,0.8)",
  blueSoft: "rgba(59,130,246,0.15)",

  green: "rgba(34,197,94,0.8)",
  greenSoft: "rgba(34,197,94,0.15)",

  purple: "rgba(139,92,246,0.8)",
  purpleSoft: "rgba(139,92,246,0.15)",

  slate: "rgba(148,163,184,0.5)",
  grid: "rgba(148,163,184,0.15)",
};

function EmptyChartState() {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "text.secondary",
        fontSize: 14,
      }}
    >
      Немає даних для відображення
    </Box>
  );
}

export function PlannerCharts({ analytics, history }: Props) {
  const donutValues = analytics.donut.map((x) => x.value);
  const hasDonutData = donutValues.some((value) => value > 0);

  const categoryPlanned = analytics.byCategory.map((x) => x.planned);
  const categoryActual = analytics.byCategory.map((x) => x.actual);
  const hasCategoryBarData =
    categoryPlanned.some((value) => value > 0) ||
    categoryActual.some((value) => value > 0);

  const cumulativePlanned = analytics.cumulativeByDay.map(
    (x) => x.cumulativePlanned,
  );
  const cumulativeActual = analytics.cumulativeByDay.map(
    (x) => x.cumulativeActual,
  );
  const hasCumulativeData =
    cumulativePlanned.some((value) => value > 0) ||
    cumulativeActual.some((value) => value > 0);

  const trendValues = history.trend.map((x) => x.totalActual);
  const hasTrendData = trendValues.some((value) => value > 0);

  const donutData = {
    labels: analytics.donut.map((x) => x.label),
    datasets: [
      {
        data: donutValues,
        backgroundColor: analytics.donut.map((x) => x.color || COLORS.slate),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const categoryBarData = {
    labels: analytics.byCategory.map((x) => x.name),
    datasets: [
      {
        label: "План",
        data: categoryPlanned,
        backgroundColor: COLORS.blueSoft,
        borderColor: COLORS.blue,
        borderWidth: 1,
        borderRadius: 10,
      },
      {
        label: "Факт",
        data: categoryActual,
        backgroundColor: COLORS.greenSoft,
        borderColor: COLORS.green,
        borderWidth: 1,
        borderRadius: 10,
      },
    ],
  };

  const cumulativeData = {
    labels: analytics.cumulativeByDay.map((x) => x.day),
    datasets: [
      {
        label: "Накопичений план",
        data: cumulativePlanned,
        borderColor: COLORS.blue,
        backgroundColor: COLORS.blueSoft,
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: "Накопичений факт",
        data: cumulativeActual,
        borderColor: COLORS.green,
        backgroundColor: COLORS.greenSoft,
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const trendData = {
    labels: history.trend.map((x) => x.monthKey),
    datasets: [
      {
        label: "Факт по місяцях",
        data: trendValues,
        borderColor: COLORS.purple,
        backgroundColor: COLORS.purpleSoft,
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: COLORS.grid,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            p: 3,
            height: "100%",
          }}
        >
          <Typography variant="h6" fontWeight={800} mb={2}>
            План vs факт по категоріях
          </Typography>

          <Box sx={chartBoxSx}>
            {hasCategoryBarData ? (
              <Bar data={categoryBarData} options={commonOptions} />
            ) : (
              <EmptyChartState />
            )}
          </Box>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            p: 3,
            height: "100%",
          }}
        >
          <Typography variant="h6" fontWeight={800} mb={2}>
            Структура витрат
          </Typography>

          <Box sx={chartBoxSx}>
            {hasDonutData ? (
              <Doughnut data={donutData} options={doughnutOptions} />
            ) : (
              <EmptyChartState />
            )}
          </Box>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            p: 3,
            height: "100%",
          }}
        >
          <Typography variant="h6" fontWeight={800} mb={2}>
            Накопичення витрат по днях
          </Typography>

          <Box sx={chartBoxSx}>
            {hasCumulativeData ? (
              <Line data={cumulativeData} options={commonOptions} />
            ) : (
              <EmptyChartState />
            )}
          </Box>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            p: 3,
            height: "100%",
          }}
        >
          <Typography variant="h6" fontWeight={800} mb={2}>
            Історія по місяцях
          </Typography>

          <Box sx={chartBoxSx}>
            {hasTrendData ? (
              <Line data={trendData} options={commonOptions} />
            ) : (
              <EmptyChartState />
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}
