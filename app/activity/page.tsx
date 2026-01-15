"use client";

import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import HistoryIcon from "@mui/icons-material/History";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useOrganizationContext } from "../invoices/hooks/useOrganizationContext";
import { useActivityLogs } from "./hooks/useActivityLogs";
import { ActivityCard } from "./components/ActivityCard";
import { ActivityGrid } from "./components/ActivityGrid";

export default function ActivityPage() {
  const router = useRouter();
  const { organizationId } = useOrganizationContext();

  const [entityType, setEntityType] = useState<
    "ALL" | "INVOICE" | "ACT" | "QUOTE"
  >("ALL");

  const [eventType, setEventType] = useState<
    | "ALL"
    | "CREATED"
    | "STATUS_CHANGED"
    | "SENT"
    | "REMINDER_SENT"
    | "CONVERTED_TO_INVOICE"
  >("ALL");

  const activity = useActivityLogs({
    organizationId: organizationId ?? undefined,
    entityType: entityType === "ALL" ? undefined : entityType,
    eventType: eventType === "ALL" ? undefined : eventType,
    limit: 30,
  });

  const rows = useMemo(() => activity.items, [activity.items]);
  const loading = activity.isLoading || activity.isFetching;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3f4f6", py: 4 }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* ===== Header ===== */}
        <Box sx={{ mb: 2.5 }}>
          <Button
            onClick={() => router.push("/dashboard")}
            sx={{ color: "#0f172a", mb: 2 }}
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
                <HistoryIcon sx={{ color: "#0f172a" }} />
              </Box>

              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "#0f172a" }}
              >
                Історія
              </Typography>
            </Stack>

            <Chip
              label={loading ? "Оновлюємо..." : `Всього: ${rows.length}`}
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
            Усі події по документах в одному місці: створення, зміни статусів,
            надсилання, нагадування та конвертації.
          </Typography>
        </Box>

        {/* ===== Friendly Info Block ===== */}
        <Box sx={{ mt: 2, mb: 3 }}>
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
              <strong>Порада:</strong> використовуй фільтри “Документ” та
              “Подія” щоб швидко знайти потрібний момент: кому і коли надсилали,
              який статус змінили та що саме було конвертовано в інвойс.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ mt: 1.25 }}
            >
              <Chip
                size="small"
                icon={<MarkEmailReadIcon />}
                label="Надсилання та нагадування"
                sx={{
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontWeight: 600,
                }}
              />
              <Chip
                size="small"
                icon={<CheckCircleOutlineIcon />}
                label="Статуси під контролем"
                sx={{
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontWeight: 600,
                }}
              />
              <Chip
                size="small"
                icon={<AutoAwesomeIcon />}
                label="Швидкий пошук подій"
                sx={{
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontWeight: 600,
                }}
              />
            </Stack>
          </Alert>
        </Box>

        {/* ===== Main Content ===== */}
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
          <ActivityCard count={rows.length}>
            <ActivityGrid
              rows={rows}
              loading={loading}
              queryEntityType={entityType}
              setQueryEntityType={setEntityType}
              queryEventType={eventType}
              setQueryEventType={setEventType}
              canLoadMore={activity.canLoadMore}
              loadMore={activity.loadMore}
              loadingMore={activity.loadingMore}
            />
          </ActivityCard>
        </Box>
      </Container>
    </Box>
  );
}
