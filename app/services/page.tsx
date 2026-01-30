"use client";

import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ChecklistIcon from "@mui/icons-material/Checklist";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PaidIcon from "@mui/icons-material/Paid";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { InfinitySpin } from "react-loader-spinner";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import { useSnackbar } from "@/app/clients/components/useSnackbar";

import { ServicesCard } from "./components/ServicesCard";
import { ServicesGrid } from "./components/ServicesGrid";
import { ServiceDialog } from "./components/ServiceDialog";
import { ConfirmDialog } from "@/app/clients/components/ConfirmDialog";

import { useServicesQueries } from "./hooks/useServicesQueries";
import { useServiceMutations } from "./hooks/useServiceMutations";
import { useServiceForm } from "./hooks/useServiceForm";

import { toCreatePayload, toUpdatePayload } from "./utils";
import { useOrganizationContext } from "../invoices/hooks/useOrganizationContext";

/* =======================
   Shared loader
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

/* =======================
   Page
======================= */

export default function ServicesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { currentUserId } = useOrganizationContext();
  const snackbar = useSnackbar();
  const formState = useServiceForm();
  const router = useRouter();

  const canWork = Boolean(currentUserId);

  const { servicesQuery } = useServicesQueries(
    canWork ? currentUserId : undefined,
  );
  const { createService, updateService, deleteService } = useServiceMutations();

  const services = servicesQuery.data ?? [];
  const loading = servicesQuery.isLoading || servicesQuery.isFetching;

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleteBusyId = useMemo(() => {
    if (!deleteService.isPending) return null;
    return (deleteService.variables as string | undefined) ?? null;
  }, [deleteService.isPending, deleteService.variables]);

  const isBootstrapping = typeof currentUserId === "undefined";
  if (isBootstrapping) return <FullscreenLoader text="Завантажую..." />;

  const submit = () =>
    formState.handleSubmit(async () => {
      if (formState.editingService) {
        await updateService.mutateAsync({
          id: formState.editingService.id,
          payload: toUpdatePayload(formState.form),
        });
        snackbar.show("Оновлено", "success");
        formState.close();
        return;
      }

      await createService.mutateAsync(toCreatePayload(formState.form));
      snackbar.show("Створено", "success");
      formState.close();
    });

  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteService.mutateAsync(deleteId);
    snackbar.show("Видалено", "success");
    setDeleteId(null);
  };

  const submitting = createService.isPending || updateService.isPending;

  const totalPriceSum = useMemo(() => {
    // просто приємний “wow” в хедері: сума дефолтних цін
    const sum = services.reduce((acc, s) => acc + Number(s.price ?? 0), 0);
    return Number.isFinite(sum) ? sum : 0;
  }, [services]);

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
              <ChecklistIcon />
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Мої товари/послуги
              </Typography>
            </Stack>

            <Chip
              label={`Всього: ${services.length}`}
              size="small"
              sx={{
                bgcolor: "#ffffff",
                border: "1px solid #e2e8f0",
                fontWeight: 800,
              }}
            />
          </Stack>
        </Box>

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
              <strong>Порада:</strong> створи список типових послуг/товарів —
              тоді при створенні інвойсу/КП ти зможеш вибрати послугу/товар з
              селекта і швидко підставити назву та ціну (ціну завжди можна
              змінити вручну).
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ mt: 1.25 }}
            >
              <Chip
                size="small"
                icon={<PaidIcon />}
                label="Автопідстановка ціни"
                sx={{
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontWeight: 600,
                }}
              />
              <Chip
                size="small"
                icon={<EditNoteIcon />}
                label="Редагуй як хочеш"
                sx={{
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontWeight: 600,
                }}
              />
              <Chip
                size="small"
                icon={<AutoAwesomeIcon />}
                label="Менше рутини"
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
          <ServicesCard onCreate={() => formState.openCreate()}>
            <ServicesGrid
              services={services}
              loading={loading}
              onEdit={formState.openEdit}
              onDelete={setDeleteId}
              deleteBusyId={deleteBusyId}
            />
          </ServicesCard>
        </Box>
      </Container>

      {/* Dialogs */}
      <ServiceDialog
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
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Видалити?"
        description="Цю дію неможливо відмінити."
        confirmText="Видалити"
        loading={deleteService.isPending}
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
