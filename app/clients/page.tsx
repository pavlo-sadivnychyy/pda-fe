"use client";

import axios from "axios";
import { Alert, Box, Snackbar } from "@mui/material";
import { useMemo, useState } from "react";

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
    // Nest може віддавати message як string або array
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

  const { clientsQuery } = useClientsQueries(organizationId);
  const { createClient, updateClient, deleteClient } =
    useClientMutations(organizationId);

  const clients = clientsQuery.data ?? [];
  const loading = clientsQuery.isLoading || clientsQuery.isFetching;

  // delete confirm state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // row-level busy id
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
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f3f4f6",
        py: 4,
        px: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
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
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Видалити клієнта?"
        description="Цю дію неможливо відмінити. Якщо клієнт привʼязаний до актів/інвойсів — бекенд не дозволить видалення."
        confirmText="Видалити"
        loading={deleteClient.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={snackbar.close}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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
