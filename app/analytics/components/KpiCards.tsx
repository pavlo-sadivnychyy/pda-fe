import { Card, CardContent, Grid, Typography } from "@mui/material";

const formatMoney = (value: number, currency: string) => {
  const rounded = Math.round(value * 100) / 100;
  return `${rounded.toLocaleString("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
};

export const KpiCards = (props: {
  currency: string;
  paid: number;
  outstanding: number;
  overdue: number;
  totalAll: number;
}) => {
  const { currency, paid, outstanding, overdue, totalAll } = props;

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
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
              {formatMoney(paid, currency)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: "#6b7280" }}>
              Сума оплачених інвойсів
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
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
              {formatMoney(outstanding, currency)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: "#92400e" }}>
              Інвойси у статусі SENT / OVERDUE
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
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
              {formatMoney(overdue, currency)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: "#7f1d1d" }}>
              Сума інвойсів зі статусом OVERDUE
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
        <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid black" }}>
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
              {formatMoney(totalAll, currency)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: "black" }}>
              Сума всіх інвойсів
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
