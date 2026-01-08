import { Box, Typography } from "@mui/material";
import { useDonutChart } from "../hooks/useDonutChart";

const formatMoney = (value: number, currency: string) => {
  const rounded = Math.round(value * 100) / 100;
  return `${rounded.toLocaleString("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
};

export const DonutCard = (props: {
  currency: string;
  paid: number;
  outstanding: number;
  overdue: number;
}) => {
  const { currency, paid, outstanding, overdue } = props;

  const { canvasRef } = useDonutChart({
    currency,
    totals: { paid, outstanding, overdue },
  });

  return (
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
        <canvas ref={canvasRef} />
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
          Donut показує, яку частину загальної суми займають оплачені, очікувані
          та прострочені інвойси.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
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
              Отримано — <strong>{formatMoney(paid, currency)}</strong>
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
              Очікується — <strong>{formatMoney(outstanding, currency)}</strong>
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
              Прострочено — <strong>{formatMoney(overdue, currency)}</strong>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
