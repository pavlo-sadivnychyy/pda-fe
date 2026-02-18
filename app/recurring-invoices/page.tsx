"use client";

import {
  Box,
  Button,
  Chip,
  Container,
  Stack,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
} from "@mui/material";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import LockIcon from "@mui/icons-material/Lock";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useOrganizationContext } from "@/app/invoices/hooks/useOrganizationContext";
import { useRecurringInvoicesQueries } from "./hooks/useRecurringInvoicesQueries";
import { useRecurringInvoiceMutations } from "./hooks/useRecurringInvoiceMutations";
import { RecurringInvoiceDialog } from "./components/RecurringInvoiceDialog";
import { RecurringInvoiceCard } from "./components/RecurringInvoiceCard";

type TabKey = "ACTIVE_PAUSED" | "CANCELLED";

export default function RecurringInvoicesPage() {
  const router = useRouter();
  const { organizationId, planId, isOrgLoading, isUserLoading } =
    useOrganizationContext();

  const isPro = planId === "PRO";
  const canWork = Boolean(organizationId);

  const { recurringQuery } = useRecurringInvoicesQueries(
    canWork ? organizationId : undefined,
    { enabled: Boolean(canWork && isPro) },
  );

  const { pauseRecurring, resumeRecurring, cancelRecurring } =
    useRecurringInvoiceMutations(canWork ? organizationId : undefined);

  const [editOpen, setEditOpen] = useState(false);
  const [editProfile, setEditProfile] = useState<any | null>(null);

  const [tab, setTab] = useState<TabKey>("ACTIVE_PAUSED");

  const isBootstrapping =
    isUserLoading || isOrgLoading || typeof planId === "undefined";

  if (isBootstrapping) {
    return (
      <Box sx={{ minHeight: "100dvh", bgcolor: "#f3f4f6", py: 6 }}>
        <Container maxWidth="md">
          <Typography>Завантаження...</Typography>
        </Container>
      </Box>
    );
  }

  if (!organizationId) {
    return (
      <Box sx={{ minHeight: "100dvh", bgcolor: "#f3f4f6", py: 6 }}>
        <Container maxWidth="md">
          <Button
            onClick={() => router.push("/dashboard")}
            sx={{ color: "black", mb: 2 }}
            startIcon={<KeyboardReturnIcon fontSize="inherit" />}
          >
            На головну
          </Button>

          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>
                Спочатку створіть організацію
              </Typography>
              <Typography sx={{ color: "text.secondary" }}>
                Регулярні інвойси прив’язані до організації.
              </Typography>

              <Button
                sx={{
                  mt: 2,
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 900,
                }}
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={() => router.push("/organization")}
              >
                Перейти до організації
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  if (!isPro) {
    return (
      <Box sx={{ minHeight: "100dvh", bgcolor: "#f3f4f6", py: 6 }}>
        <Container maxWidth="md">
          <Button
            onClick={() => router.push("/invoices")}
            sx={{ color: "black", mb: 2 }}
            startIcon={<KeyboardReturnIcon fontSize="inherit" />}
          >
            Назад до інвойсів
          </Button>

          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Stack spacing={1.2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <LockIcon />
                  <Typography sx={{ fontWeight: 900 }}>
                    Регулярні інвойси доступні лише у PRO
                  </Typography>
                </Stack>

                <Typography sx={{ color: "text.secondary" }}>
                  Підключіть PRO, щоб інвойси створювалися автоматично за
                  розкладом.
                </Typography>

                <Button
                  onClick={() => router.push("/pricing")}
                  variant="contained"
                  sx={{
                    borderRadius: 999,
                    bgcolor: "#111827",
                    "&:hover": { bgcolor: "#020617" },
                    textTransform: "none",
                    fontWeight: 900,
                    alignSelf: "flex-start",
                  }}
                >
                  Перейти до тарифів
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  const items = recurringQuery.data ?? [];

  const stats = useMemo(() => {
    let active = 0;
    let paused = 0;
    let cancelled = 0;

    for (const p of items) {
      if (p.status === "ACTIVE") active++;
      if (p.status === "PAUSED") paused++;
      if (p.status === "CANCELLED") cancelled++;
    }

    return {
      total: items.length,
      active,
      paused,
      cancelled,
      activePaused: active + paused,
    };
  }, [items]);

  const visibleItems = useMemo(() => {
    if (tab === "CANCELLED") {
      return items.filter((p: any) => p.status === "CANCELLED");
    }
    return items.filter(
      (p: any) => p.status === "ACTIVE" || p.status === "PAUSED",
    );
  }, [items, tab]);

  const showEmptyState = !recurringQuery.isLoading && visibleItems.length === 0;

  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "#f3f4f6", py: 4 }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Button
          onClick={() => router.push("/invoices")}
          sx={{ color: "black", mb: 2 }}
          startIcon={<KeyboardReturnIcon fontSize="inherit" />}
        >
          Назад до інвойсів
        </Button>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1}
          sx={{ mb: 2.5 }}
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
              <AutorenewIcon sx={{ color: "#0f172a" }} />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>
              Регулярні інвойси
            </Typography>

            <Chip label={`Всього: ${stats.total}`} size="small" />
            <Chip label={`Активні: ${stats.active}`} size="small" />
            <Chip label={`На паузі: ${stats.paused}`} size="small" />
          </Stack>
        </Stack>

        {/* Tabs */}
        <Box
          sx={{
            mb: 2,
            borderBottom: "1px solid #e2e8f0",
            bgcolor: "#fff",
            borderRadius: 3,
            px: 1.5,
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            aria-label="Фільтр регулярних інвойсів"
            sx={{
              minHeight: 44,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 900,
                minHeight: 44,
              },
            }}
          >
            <Tab
              value="ACTIVE_PAUSED"
              label={`Активні та на паузі (${stats.activePaused})`}
            />
            <Tab value="CANCELLED" label={`Скасовані (${stats.cancelled})`} />
          </Tabs>
        </Box>

        {/* List */}
        {showEmptyState ? (
          <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0" }}>
            <CardContent>
              <Typography sx={{ fontWeight: 900, mb: 0.5 }}>
                {tab === "CANCELLED"
                  ? "Немає скасованих регулярних інвойсів"
                  : "Немає активних або призупинених регулярних інвойсів"}
              </Typography>
              <Typography sx={{ color: "text.secondary" }}>
                {tab === "CANCELLED"
                  ? "Коли ви скасуєте профіль, він з’явиться тут."
                  : "Створіть регулярний інвойс або відновіть профіль із паузи."}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
              },
            }}
          >
            {visibleItems.map((p: any) => (
              <RecurringInvoiceCard
                key={p.id}
                profile={p}
                onEdit={() => {
                  setEditProfile(p);
                  setEditOpen(true);
                }}
                onPause={() => pauseRecurring.mutateAsync(p.id)}
                onResume={() => resumeRecurring.mutateAsync(p.id)}
                onCancel={() => cancelRecurring.mutateAsync(p.id)}
                loading={
                  pauseRecurring.isPending ||
                  resumeRecurring.isPending ||
                  cancelRecurring.isPending
                }
              />
            ))}
          </Box>
        )}

        <RecurringInvoiceDialog
          open={editOpen}
          onClose={() => {
            setEditOpen(false);
            setEditProfile(null);
          }}
          isPro={isPro}
          templateInvoice={null}
          existingProfile={editProfile}
          onSave={() => {}}
          submitting={false}
          mode="edit"
          onUpdated={async () => {
            // ✅ Після успішного edit — підтягнути актуальні дані для всіх карточок
            await recurringQuery.refetch();
          }}
        />
      </Container>
    </Box>
  );
}
