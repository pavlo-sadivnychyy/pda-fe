"use client";

import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import HistoryIcon from "@mui/icons-material/History";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import DescriptionIcon from "@mui/icons-material/Description";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { InfinitySpin } from "react-loader-spinner";

import type { ActivityLog } from "../hooks/useRecentActivity";

/* ======================================================
   ====== Переклад статусів документів ======
====================================================== */

const STATUS_LABELS: Record<string, string> = {
  // Invoice
  DRAFT: "Чернетка",
  SENT: "Відправлено",
  PAID: "Оплачено",
  OVERDUE: "Прострочено",
  CANCELLED: "Скасовано",

  // Act
  SIGNED: "Підписано",

  // Quote
  ACCEPTED: "Прийнято",
  REJECTED: "Відхилено",
  EXPIRED: "Протерміновано",
  CONVERTED: "Конвертовано",
};

function translateStatus(code?: string | null) {
  if (!code) return "—";
  return STATUS_LABELS[code] ?? code;
}

/** Парсить "SENT → PAID" -> "Відправлено → Оплачено" */
function uaStatusFromString(raw: string) {
  if (!raw) return raw;
  const parts = raw.split("→").map((p) => p.trim());
  if (parts.length === 2) {
    return `${translateStatus(parts[0])} → ${translateStatus(parts[1])}`;
  }
  return translateStatus(raw.trim());
}

/* ====================================================== */

function iconByEntity(type: ActivityLog["entityType"]) {
  switch (type) {
    case "INVOICE":
      return <ReceiptLongIcon sx={{ color: "#b45309" }} />;
    case "ACT":
      return <DescriptionIcon sx={{ color: "#0e7490" }} />;
    case "QUOTE":
      return <RequestQuoteIcon sx={{ color: "#047857" }} />;
    default:
      return <HistoryIcon sx={{ color: "#111827" }} />;
  }
}

function iconBgByEntity(type: ActivityLog["entityType"]) {
  switch (type) {
    case "INVOICE":
      return "#fef3c7";
    case "ACT":
      return "#ecfeff";
    case "QUOTE":
      return "#ecfdf5";
    default:
      return "#f3f4f6";
  }
}

function labelByEntity(type: ActivityLog["entityType"]) {
  switch (type) {
    case "INVOICE":
      return "Інвойс";
    case "ACT":
      return "Акт";
    case "QUOTE":
      return "Пропозиція";
    default:
      return "Документ";
  }
}

function eventTitle(e: ActivityLog) {
  switch (e.eventType) {
    case "CREATED":
      return "Створено";
    case "STATUS_CHANGED":
      return "Зміна статусу";
    case "SENT":
      return "Надіслано";
    case "REMINDER_SENT":
      return "Нагадування надіслано";
    case "CONVERTED_TO_INVOICE":
      return "Конвертовано в інвойс";
    default:
      return "Подія";
  }
}

function eventIcon(e: ActivityLog) {
  switch (e.eventType) {
    case "SENT":
    case "REMINDER_SENT":
      return <MailOutlineIcon sx={{ fontSize: 16 }} />;
    case "STATUS_CHANGED":
      return <AutorenewIcon sx={{ fontSize: 16 }} />;
    case "CONVERTED_TO_INVOICE":
      return <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />;
    default:
      return null;
  }
}

function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}.${mm} ${hh}:${min}`;
}

/* ====== Побудова нижнього опису ====== */

function buildDetails(e: ActivityLog) {
  const bits: string[] = [];

  if (e.eventType === "STATUS_CHANGED") {
    const raw =
      (e as any).status ?? `${e.fromStatus ?? ""} → ${e.toStatus ?? ""}`;
    bits.push(uaStatusFromString(raw));
  }

  if (
    (e.eventType === "SENT" || e.eventType === "REMINDER_SENT") &&
    e.toEmail
  ) {
    bits.push(`кому: ${e.toEmail}`);
  }

  return bits.join(" • ");
}

/* ====================================================== */

export function RecentActivityCard({
  items,
  loading,
  onOpenHistory,
  onOpenEntity,
  dragHandle,
}: {
  items: ActivityLog[];
  loading: boolean;
  onOpenHistory: () => void;
  onOpenEntity: (type: ActivityLog["entityType"], id: string) => void;
  dragHandle?: React.ReactNode;
}) {
  const empty = !loading && items?.length === 0;

  return (
    <Card elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
      <CardHeader
        avatar={
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 999,
              bgcolor: "#f3f4f6",
              display: "grid",
              placeItems: "center",
            }}
          >
            <HistoryIcon sx={{ color: "#111827" }} />
          </Box>
        }
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Історія документів
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Останні події по документах.
          </Typography>
        }
        action={
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Button
              onClick={onOpenHistory}
              endIcon={<ArrowForwardIosIcon sx={{ fontSize: 14 }} />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: "#111827",
                borderRadius: 999,
                px: 1.5,
                "&:hover": { bgcolor: "#f3f4f6" },
              }}
            >
              Перейти
            </Button>

            <Box sx={{ mr: 0.5 }}>{dragHandle}</Box>
          </Stack>
        }
        sx={{ pb: 0 }}
      />

      <CardContent sx={{ pt: 1.25 }}>
        <Stack spacing={1.25}>
          {loading ? (
            <Box
              sx={{
                py: 4,
                display: "grid",
                placeItems: "center",
              }}
            >
              <InfinitySpin width="160" color="#202124" />
              <Typography
                variant="body2"
                sx={{ mt: 1.5, color: "text.secondary" }}
              >
                Завантажуємо історію...
              </Typography>
            </Box>
          ) : empty ? (
            <Box
              sx={{
                py: 2,
                px: 1.25,
                borderRadius: 2,
                border: "1px solid #e2e8f0",
                bgcolor: "#fff",
              }}
            >
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Поки що немає подій.
              </Typography>
            </Box>
          ) : (
            items?.map((e, idx) => (
              <Box
                key={e.id}
                sx={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 2,
                  bgcolor: "#fff",
                  px: 1.25,
                  py: 1,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#f8fafc" },
                }}
                onClick={onOpenHistory}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: 999,
                      bgcolor: iconBgByEntity(e.entityType),
                      display: "grid",
                      placeItems: "center",
                      flex: "0 0 auto",
                    }}
                  >
                    {iconByEntity(e.entityType)}
                  </Box>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 800,
                          color: "#0f172a",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {labelByEntity(e.entityType)}
                      </Typography>

                      <Chip
                        size="small"
                        icon={eventIcon(e) ?? undefined}
                        label={eventTitle(e)}
                        sx={{
                          bgcolor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          fontWeight: 700,
                          height: 24,
                        }}
                      />

                      <Typography
                        variant="caption"
                        sx={{
                          color: "#64748b",
                          ml: "auto",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatTime(e.createdAt)}
                      </Typography>
                    </Stack>

                    {buildDetails(e) && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#64748b",
                          display: "block",
                          mt: 0.25,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {buildDetails(e)}
                      </Typography>
                    )}
                  </Box>
                </Stack>

                {idx !== items.length - 1 && (
                  <Divider sx={{ mt: 1, borderColor: "#f1f5f9" }} />
                )}
              </Box>
            ))
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
