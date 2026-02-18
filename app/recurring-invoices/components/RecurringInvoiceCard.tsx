"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import ScheduleIcon from "@mui/icons-material/Schedule";
import EmailIcon from "@mui/icons-material/Email";

function fmtDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Активний",
  PAUSED: "Пауза",
  CANCELLED: "Скасований",
};

const INTERVAL_UNIT_LABELS: Record<string, string> = {
  DAY: "день",
  WEEK: "тиждень",
  MONTH: "місяць",
  YEAR: "рік",
};

export function RecurringInvoiceCard({
  profile,
  onEdit,
  onPause,
  onResume,
  onCancel,
  loading,
}: {
  profile: any;
  onEdit: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const status = String(profile.status ?? "ACTIVE");
  const isActive = status === "ACTIVE";
  const isPaused = status === "PAUSED";

  const intervalUnitLabel =
    INTERVAL_UNIT_LABELS[String(profile.intervalUnit ?? "MONTH")] ?? "місяць";
  const intervalCount = Number(profile.intervalCount ?? 1);

  const intervalHuman =
    intervalCount === 1
      ? `кожен ${intervalUnitLabel}`
      : `кожні ${intervalCount} ${intervalUnitLabel}${intervalCount >= 5 ? "ів" : "и"}`;

  const nextRun = fmtDate(profile.nextRunAt);
  const startAt = fmtDate(profile.startAt);

  const variant =
    profile.variant === "international" ? "Міжнародний" : "Український";
  const dueDays = Number(profile.dueDays ?? 7);

  // ✅ саме те, що ти хотів
  const templateNumber = profile?.templateInvoice?.number ?? "—";
  const clientName = profile?.client?.name ?? "Без клієнта";
  const clientEmail = profile?.client?.email ?? "";

  return (
    <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0" }}>
      <CardContent>
        <Stack spacing={1.2}>
          <Stack direction="row" justifyContent="space-between" gap={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(15,23,42,0.06)",
                }}
              >
                <AutorenewIcon />
              </Box>

              <Box>
                <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
                  Шаблон інвойсу № {templateNumber}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  {clientName}
                  {clientEmail ? ` • ${clientEmail}` : ""} • {variant}
                </Typography>
              </Box>
            </Stack>

            <Chip
              label={STATUS_LABELS[status] ?? status}
              sx={{
                fontWeight: 900,
                bgcolor: isActive
                  ? "rgba(22,163,74,0.10)"
                  : isPaused
                    ? "rgba(234,179,8,0.14)"
                    : "rgba(107,114,128,0.12)",
                color: isActive ? "#166534" : isPaused ? "#92400e" : "#374151",
              }}
            />
          </Stack>

          <Divider />

          <Stack spacing={0.6}>
            <Stack direction="row" spacing={1} alignItems="center">
              <ScheduleIcon sx={{ fontSize: 18, color: "#64748b" }} />
              <Typography variant="body2" sx={{ color: "#0f172a" }}>
                Розклад: <b>{intervalHuman}</b>
              </Typography>
            </Stack>

            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Початок: <b>{startAt}</b> • Наступний інвойс: <b>{nextRun}</b>
            </Typography>

            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Оплата:{" "}
              <b>{dueDays === 0 ? "одразу" : `протягом ${dueDays} дн.`}</b>
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <EmailIcon sx={{ fontSize: 18, color: "#64748b" }} />
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Авто-надсилання:{" "}
                <b>{profile.autoSendEmail ? "увімкнено" : "вимкнено"}</b>
              </Typography>
            </Stack>
          </Stack>

          <Divider />

          {status !== "CANCELLED" && (
            <Stack direction="row" gap={1} flexWrap="wrap">
              <Button
                onClick={onEdit}
                startIcon={<EditIcon />}
                variant="contained"
                disabled={loading}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 900,
                  color: "white",
                  bgcolor: "#111827",
                  "&:hover": { bgcolor: "#020617" },
                }}
              >
                Редагувати
              </Button>

              {isActive ? (
                <Button
                  onClick={onPause}
                  startIcon={<PauseCircleIcon />}
                  variant="outlined"
                  disabled={loading}
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 900,
                  }}
                >
                  Пауза
                </Button>
              ) : (
                <Button
                  onClick={onResume}
                  startIcon={<PlayCircleIcon />}
                  variant="outlined"
                  disabled={loading}
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 900,
                  }}
                >
                  Відновити
                </Button>
              )}

              <Button
                onClick={onCancel}
                startIcon={<DeleteOutlineIcon />}
                color="error"
                variant="outlined"
                disabled={loading}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 900,
                }}
              >
                Скасувати
              </Button>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
