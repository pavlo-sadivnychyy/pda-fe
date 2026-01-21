"use client";

import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Stack,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import HistoryIcon from "@mui/icons-material/History";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import BusinessIcon from "@mui/icons-material/Business";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useOrganizationContext } from "../invoices/hooks/useOrganizationContext";
import { useActivityLogs } from "./hooks/useActivityLogs";
import { ActivityCard } from "./components/ActivityCard";
import { ActivityGrid } from "./components/ActivityGrid";

function NoOrgState() {
  return (
    <Card
      sx={{
        width: "100%",
        maxWidth: 640,
        borderRadius: 4,
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
      }}
    >
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={2.2} alignItems="center" textAlign="center">
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 999,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(25,118,210,0.08)",
            }}
          >
            <BusinessIcon />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Спочатку створи організацію
          </Typography>

          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Історія подій прив’язана до організації. Створи її — і тоді тут
            з’являться всі події по інвойсам, актам та пропозиціям.
          </Typography>

          <Button
            component={Link}
            href="/organization"
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            sx={{ borderRadius: 999, px: 2.5 }}
          >
            Перейти до створення
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

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

  const canWork = Boolean(organizationId);

  const activity = useActivityLogs({
    organizationId: canWork ? organizationId : undefined,
    entityType: entityType === "ALL" ? undefined : entityType,
    eventType: eventType === "ALL" ? undefined : eventType,
    limit: 30,
  });

  const rows = useMemo(() => activity.items, [activity.items]);
  const loading = activity.isLoading || activity.isFetching;

  // ✅ EMPTY-STATE: центр під хедером
  if (!organizationId) {
    return (
      <Box sx={{ minHeight: "100dvh", bgcolor: "#f3f4f6", py: 4 }}>
        <Container
          maxWidth="lg"
          sx={{
            px: { xs: 2, sm: 3 },
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 2.5 }}>
            <Button
              onClick={() => router.push("/dashboard")}
              sx={{ color: "#0f172a", mb: 2 }}
              startIcon={<KeyboardReturnIcon fontSize="inherit" />}
            >
              на головну
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
                label="Всього: 0"
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

          {/* Center */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pb: { xs: 2, sm: 3 },
            }}
          >
            <NoOrgState />
          </Box>
        </Container>
      </Box>
    );
  }

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
            на головну
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
