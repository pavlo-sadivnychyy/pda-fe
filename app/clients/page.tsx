"use client";

import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Snackbar,
  Stack,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import BusinessIcon from "@mui/icons-material/Business";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LockIcon from "@mui/icons-material/Lock";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { InfinitySpin } from "react-loader-spinner";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import { useOrganizationContext } from "./hooks/useOrganizationContext";
import { useClientsQueries } from "./hooks/useClientsQueries";
import { useClientMutations } from "./hooks/useClientMutations";
import { useClientForm } from "./hooks/useClientForm";

import { ClientsCard } from "./components/ClientsCard";
import { ClientsGrid } from "./components/ClientsGrid";
import { ClientDialog } from "./components/ClientDialog";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { useSnackbar } from "./components/useSnackbar";

import { toCreatePayload, toUpdatePayload } from "./utils";

/* =======================
   Config: plan limits
======================= */

const PLAN_LIMITS: Record<string, number> = {
  FREE: 3,
  BASIC: 20,
};

/* =======================
   UI blocks
======================= */

export function FullscreenLoader({ text }: { text?: string }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f3f4f6",
        display: "grid",
        placeItems: "center",
        px: 2,
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <InfinitySpin width="200" color="#202124" />
        <Typography variant="body2" sx={{ mt: 1.5, color: "text.secondary" }}>
          {text ?? "Завантажую…"}
        </Typography>
      </Box>
    </Box>
  );
}

function NoOrgState() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: { xs: "calc(100dvh - 220px)", sm: "calc(100dvh - 200px)" },
      }}
    >
      <Card sx={{ maxWidth: 640, borderRadius: 4 }}>
        <CardContent>
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
              Клієнти належать організації. Створи організацію — і тоді зможеш
              додавати клієнтів.
            </Typography>

            <Button
              component={Link}
              href="/organization"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{ borderRadius: 999 }}
            >
              Перейти
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

function PlanLimitBanner({
  current,
  limit,
  onUpgrade,
}: {
  current: number;
  limit: number;
  onUpgrade: () => void;
}) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid #fecaca",
        bgcolor: "#fff1f2",
        display: "flex",
        justifyContent: "space-between",
        gap: 2,
        alignItems: { xs: "flex-start", sm: "center" },
      }}
    >
      <Stack spacing={0.3}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 999,
              display: "grid",
              placeItems: "center",
              bgcolor: "#111827",
              color: "white",
            }}
          >
            <LockIcon fontSize="small" />
          </Box>

          <Typography sx={{ fontWeight: 900, color: "#991b1b" }}>
            Ліміт клієнтів вичерпано
          </Typography>
        </Stack>

        <Typography variant="body2" sx={{ color: "#7f1d1d" }}>
          Використано {current} / {limit} клієнтів. Щоб додати більше —
          підвищіть план.
        </Typography>
      </Stack>

      <Button
        onClick={onUpgrade}
        variant="contained"
        sx={{
          borderRadius: 999,
          px: 2.6,
          py: 1.1,
          fontWeight: 900,
          letterSpacing: "0.02em",
          textTransform: "none",

          // gradient background
          background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",

          color: "#fff",

          boxShadow:
            "0 8px 22px rgba(249,115,22,0.35), inset 0 0 0 1px rgba(255,255,255,0.2)",

          position: "relative",
          overflow: "hidden",

          // hover = lift + brighter
          "&:hover": {
            background: "linear-gradient(135deg, #fbbf24 0%, #fb923c 100%)",
            boxShadow:
              "0 12px 28px rgba(249,115,22,0.45), inset 0 0 0 1px rgba(255,255,255,0.25)",
            transform: "translateY(-1px)",
          },

          // click
          "&:active": {
            transform: "translateY(0px) scale(0.98)",
            boxShadow:
              "0 6px 16px rgba(249,115,22,0.35), inset 0 0 0 1px rgba(255,255,255,0.2)",
          },

          // pulse ring
          "@keyframes upgradePulse": {
            "0%": {
              boxShadow: "0 0 0 0 rgba(249,115,22,0.45)",
            },
            "70%": {
              boxShadow: "0 0 0 14px rgba(249,115,22,0)",
            },
            "100%": {
              boxShadow: "0 0 0 0 rgba(249,115,22,0)",
            },
          },

          animation: "upgradePulse 2.6s ease-out infinite",
        }}
      >
        Підвищити план
      </Button>
    </Box>
  );
}

/* =======================
   Page
======================= */

export default function ClientsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // ✅ mobile shows cards & page scroll

  // --- Hooks always ---
  const { currentUserId, organizationId, planId } = useOrganizationContext();
  const snackbar = useSnackbar();
  const formState = useClientForm();
  const router = useRouter();

  const canWork = Boolean(organizationId) && Boolean(currentUserId);

  const { clientsQuery } = useClientsQueries(
    canWork ? organizationId : undefined,
  );
  const { createClient, updateClient, deleteClient } = useClientMutations(
    canWork ? organizationId : undefined,
  );

  const clients = clientsQuery.data ?? [];
  const loading = clientsQuery.isLoading || clientsQuery.isFetching;

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleteBusyId = useMemo(() => {
    if (!deleteClient.isPending) return null;
    return (deleteClient.variables as string | undefined) ?? null;
  }, [deleteClient.isPending, deleteClient.variables]);

  // --- Bootstrapping loader ---
  const isBootstrapping =
    typeof currentUserId === "undefined" ||
    typeof organizationId === "undefined" ||
    typeof planId === "undefined";

  if (isBootstrapping) {
    return <FullscreenLoader text="Завантажую..." />;
  }

  // --- No organization ---
  if (!organizationId) {
    return <NoOrgState />;
  }

  // --- Plan limit logic ---
  const planLimit = PLAN_LIMITS[planId ?? ""] ?? Infinity;
  const isLimitReached = clients.length >= planLimit;

  // --- Submit ---
  const submit = () =>
    formState.handleSubmit(async () => {
      if (isLimitReached && !formState.editingClient) {
        snackbar.show("Ліміт клієнтів вичерпано", "warning");
        return;
      }

      if (formState.editingClient) {
        await updateClient.mutateAsync({
          id: formState.editingClient.id,
          payload: toUpdatePayload(formState.form),
        });
        snackbar.show("Клієнта оновлено", "success");
        formState.close();
        return;
      }

      await createClient.mutateAsync(
        toCreatePayload({
          organizationId,
          createdById: currentUserId!,
          form: formState.form,
        }),
      );

      snackbar.show("Клієнта створено", "success");
      formState.close();
    });

  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteClient.mutateAsync(deleteId);
    snackbar.show("Клієнта видалено", "success");
    setDeleteId(null);
  };

  const submitting = createClient.isPending || updateClient.isPending;

  return (
    <Box
      sx={{
        height: "auto",
        minHeight: "100dvh",
        bgcolor: "#f3f4f6",
        overflow: isMobile ? "visible" : "hidden",
        display: "flex",
        flexDirection: "column",
        py: isMobile ? 3 : 0,
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          height: isMobile ? "auto" : "100%",
          py: isMobile ? 0 : 3,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 2, flexShrink: 0 }}>
          <Button
            onClick={() => router.push("/dashboard")}
            startIcon={<KeyboardReturnIcon />}
            sx={{ mb: 1, color: "#0f172a" }}
          >
            на головну
          </Button>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <GroupIcon />
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Клієнти
              </Typography>
            </Stack>

            <Chip
              label={`Всього: ${clients.length}`}
              size="small"
              sx={{
                bgcolor: "#ffffff",
                border: "1px solid #e2e8f0",
                fontWeight: 800,
              }}
            />
          </Stack>
        </Box>

        {/* Plan limit banner */}
        {isLimitReached && planLimit !== Infinity ? (
          <Box sx={{ mb: 2, flexShrink: 0 }}>
            <PlanLimitBanner
              current={clients.length}
              limit={planLimit}
              onUpgrade={() => router.push("/pricing")}
            />
          </Box>
        ) : null}

        {/* Info */}
        <Box sx={{ mb: 2, flexShrink: 0 }}>
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
              <strong>Порада:</strong> додавай email клієнта при створенні —
              тоді зможеш надсилати інвойси та акти в один клік без копіювання
              та месенджерів. Якщо email відсутній — можна додати його пізніше.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ mt: 1.25 }}
            >
              <Chip
                size="small"
                icon={<MarkEmailReadIcon />}
                label="Швидка відправка документів"
                sx={{
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontWeight: 600,
                }}
              />
              <Chip
                size="small"
                icon={<CheckCircleOutlineIcon />}
                label="Менше ручної рутини"
                sx={{
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontWeight: 600,
                }}
              />
              <Chip
                size="small"
                icon={<AutoAwesomeIcon />}
                label="Все в одному місці"
                sx={{
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontWeight: 600,
                }}
              />
            </Stack>
          </Alert>
        </Box>

        {/* Main */}
        <Box sx={{ flex: isMobile ? "unset" : 1, minHeight: 0 }}>
          <ClientsCard
            count={clients.length}
            isLimitReached={isLimitReached}
            onCreate={() => {
              if (isLimitReached) {
                snackbar.show(
                  "Підвищіть план щоб додати більше клієнтів",
                  "warning",
                );
                return;
              }
              formState.openCreate();
            }}
          >
            <ClientsGrid
              disbaleExport={planId !== "PRO"}
              clients={clients}
              loading={loading}
              onEdit={formState.openEdit}
              onDelete={setDeleteId}
              deleteBusyId={deleteBusyId}
            />
          </ClientsCard>
        </Box>
      </Container>

      {/* Dialogs */}
      <ClientDialog
        open={formState.dialogOpen}
        onClose={formState.close}
        isEditing={formState.isEditing}
        form={formState.form}
        setField={formState.setField}
        onSubmit={submit}
        submitting={submitting}
        canSubmit={formState.canSubmit}
        errors={formState.errors}
        submitAttempted={formState.submitAttempted}
        tagOptions={[
          "Новий",
          "Постійний",
          "VIP",
          "Проблемний з оплатами",
          "Проблемний",
          "Разова співпраця",
          "Партнер",
          "Холодний лід",
        ]}
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Видалити клієнта?"
        description="Цю дію неможливо відмінити."
        confirmText="Видалити"
        loading={deleteClient.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={snackbar.close}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={snackbar.close}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
