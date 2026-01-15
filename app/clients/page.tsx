"use client";

import axios from "axios";
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
import GroupIcon from "@mui/icons-material/Group";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

const getErrorMessage = (e: unknown) => {
  if (axios.isAxiosError(e)) {
    const data: any = e.response?.data;
    const msg =
      (Array.isArray(data?.message)
        ? data.message.join(", ")
        : data?.message) ||
      data?.error ||
      e.message;
    return msg || "Помилка";
  }
  return "Помилка";
};

export default function ClientsPage() {
  const { currentUserId, organizationId } = useOrganizationContext();
  const snackbar = useSnackbar();
  const formState = useClientForm();
  const router = useRouter();

  const { clientsQuery } = useClientsQueries(organizationId);
  const { createClient, updateClient, deleteClient } =
    useClientMutations(organizationId);

  const clients = clientsQuery.data ?? [];
  const loading = clientsQuery.isLoading || clientsQuery.isFetching;

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleteBusyId = useMemo(() => {
    if (!deleteClient.isPending) return null;
    return (deleteClient.variables as string | undefined) ?? null;
  }, [deleteClient.isPending, deleteClient.variables]);

  const submit = async () => {
    try {
      if (!organizationId || !currentUserId) {
        snackbar.show("Немає organizationId або currentUserId", "error");
        return;
      }

      if (!formState.canSubmit) {
        snackbar.show("Вкажи назву клієнта", "error");
        return;
      }

      if (formState.editingClient) {
        await updateClient.mutateAsync({
          id: formState.editingClient.id,
          payload: toUpdatePayload(formState.form),
        });
        snackbar.show("Клієнта оновлено", "success");
      } else {
        await createClient.mutateAsync(
          toCreatePayload({
            organizationId,
            createdById: currentUserId,
            form: formState.form,
          }),
        );
        snackbar.show("Клієнта створено", "success");
      }

      formState.close();
    } catch (e) {
      console.error(e);
      snackbar.show(
        getErrorMessage(e) || "Помилка збереження клієнта",
        "error",
      );
    }
  };

  const requestDelete = (id: string) => setDeleteId(id);

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteClient.mutateAsync(deleteId);
      snackbar.show("Клієнта видалено", "success");
      setDeleteId(null);
    } catch (e) {
      console.error(e);
      snackbar.show(getErrorMessage(e), "error");
    }
  };

  const submitting = createClient.isPending || updateClient.isPending;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3f4f6", py: 4 }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
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
                <GroupIcon sx={{ color: "#0f172a" }} />
              </Box>

              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "#0f172a" }}
              >
                Клієнти
              </Typography>
            </Stack>

            <Chip
              label={`Всього: ${clients.length}`}
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
            Контакти, компанії та реквізити в одному місці.
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

        {/* ===== Main Content ===== */}
        <Box sx={{ maxWidth: 1700, mx: "auto" }}>
          <ClientsCard count={clients.length} onCreate={formState.openCreate}>
            <ClientsGrid
              clients={clients}
              loading={loading}
              onEdit={formState.openEdit}
              onDelete={requestDelete}
              deleteBusyId={deleteBusyId}
            />
          </ClientsCard>
        </Box>
      </Container>

      {/* ===== Dialogs ===== */}
      <ClientDialog
        open={formState.dialogOpen}
        onClose={formState.close}
        isEditing={formState.isEditing}
        form={formState.form}
        setField={formState.setField}
        onSubmit={submit}
        submitting={submitting}
        canSubmit={
          Boolean(organizationId) &&
          Boolean(currentUserId) &&
          formState.canSubmit
        }
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
        description="Цю дію неможливо відмінити. Якщо клієнт привʼязаний до актів або інвойсів — система не дозволить видалення."
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
