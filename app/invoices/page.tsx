"use client";

import {
  Alert,
  Box,
  Chip,
  Container,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { useMemo, useState } from "react";

import { useOrganizationContext } from "./hooks/useOrganizationContext";
import { useInvoicesQueries } from "./hooks/useInvoicesQueries";
import { useInvoiceMutations } from "./hooks/useInvoiceMutations";
import { useInvoiceForm } from "./hooks/useInvoiceForm";

import { InvoicesCard } from "./components/InvoicesCard";
import { InvoicesGrid } from "./components/InvoicesGrid";
import { CreateInvoiceDialog } from "./components/CreateInvoiceDialog";
import { ConfirmDialog } from "./components/ConfirmDialog";

import type { InvoiceAction } from "./types";
import type { CreateInvoicePayload } from "./types";

export default function InvoicesPage() {
  const { currentUserId, organizationId } = useOrganizationContext();

  const { clientsQuery, invoicesQuery } = useInvoicesQueries(organizationId);
  const {
    createInvoiceMutation,
    invoiceActionMutation,
    deleteInvoiceMutation,
  } = useInvoiceMutations(organizationId);

  const {
    invoiceForm,
    formStatus,
    setFormStatus,
    setField,
    setItemField,
    addItem,
    removeItem,
    totals,
    reset,
  } = useInvoiceForm();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const onCreateOpen = () => {
    reset();
    setCreateDialogOpen(true);
  };

  const onCreateClose = () => setCreateDialogOpen(false);

  const actionBusyId = useMemo(
    () => invoiceActionMutation.variables?.id ?? null,
    [invoiceActionMutation.variables],
  );
  const deleteBusyId = useMemo(
    () => deleteInvoiceMutation.variables ?? null,
    [deleteInvoiceMutation.variables],
  );

  const invoicesCount = invoicesQuery.data?.length ?? 0;

  const handleInvoiceAction = async (id: string, action: InvoiceAction) => {
    try {
      await invoiceActionMutation.mutateAsync({ id, action });

      if (action === "send")
        showSnackbar("Інвойс відправлено (позначено як SENT)", "success");
      if (action === "mark-paid")
        showSnackbar("Інвойс позначено як оплачений", "success");
      if (action === "cancel") showSnackbar("Інвойс скасовано", "success");
    } catch (e) {
      console.error(e);
      showSnackbar("Помилка оновлення статусу інвойсу", "error");
    }
  };

  const handleSubmit = async () => {
    try {
      if (!organizationId || !currentUserId) {
        showSnackbar("Немає organizationId або currentUserId", "error");
        return;
      }
      if (!invoiceForm.items.length) {
        showSnackbar("Додайте хоча б одну позицію", "error");
        return;
      }

      const payload: CreateInvoicePayload = {
        organizationId,
        createdById: currentUserId,
        clientId: invoiceForm.clientId || undefined,
        issueDate: invoiceForm.issueDate
          ? `${invoiceForm.issueDate}T00:00:00.000Z`
          : undefined,
        dueDate: invoiceForm.dueDate
          ? `${invoiceForm.dueDate}T00:00:00.000Z`
          : undefined,
        currency: invoiceForm.currency,
        notes: invoiceForm.notes || undefined,
        status: formStatus,
        items: invoiceForm.items.map((item) => ({
          name: item.name,
          description: item.description || undefined,
          quantity: Number.parseFloat(item.quantity) || 0,
          unitPrice: Number.parseFloat(item.unitPrice) || 0,
          taxRate: item.taxRate ? Number.parseFloat(item.taxRate) : undefined,
        })),
      };

      await createInvoiceMutation.mutateAsync(payload);

      showSnackbar("Інвойс створено", "success");
      setCreateDialogOpen(false);
    } catch (e) {
      console.error(e);
      showSnackbar("Помилка створення інвойсу", "error");
    }
  };

  const requestDelete = (id: string) => setDeleteId(id);

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteInvoiceMutation.mutateAsync(deleteId);
      showSnackbar("Інвойс видалено", "success");
      setDeleteId(null);
    } catch (e) {
      console.error(e);
      showSnackbar("Помилка видалення інвойсу", "error");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3f4f6", py: { xs: 3, md: 8 } }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* ✅ Уніфікований хедер як на інших сторінках */}
        <Box sx={{ mb: 2.5 }}>
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
                <ReceiptLongIcon sx={{ color: "#0f172a" }} />
              </Box>

              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "#0f172a" }}
              >
                Інвойси
              </Typography>
            </Stack>

            <Chip
              label={`Всього: ${invoicesCount}`}
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
            Створюй рахунки, керуй статусами (відправлено/оплачено/скасовано) та
            видаляй інвойси при потребі.
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 1500, mx: "auto" }}>
          <InvoicesCard invoicesCount={invoicesCount} onCreate={onCreateOpen}>
            <InvoicesGrid
              invoices={invoicesQuery.data ?? []}
              clients={clientsQuery.data ?? []}
              loading={invoicesQuery.isFetching}
              onAction={handleInvoiceAction}
              actionBusyId={
                invoiceActionMutation.isPending ? actionBusyId : null
              }
              onDelete={requestDelete}
              deleteBusyId={
                deleteInvoiceMutation.isPending ? deleteBusyId : null
              }
            />
          </InvoicesCard>
        </Box>
      </Container>

      <CreateInvoiceDialog
        open={createDialogOpen}
        onClose={onCreateClose}
        clients={clientsQuery.data ?? []}
        loadingClients={clientsQuery.isFetching}
        formStatus={formStatus}
        setFormStatus={setFormStatus}
        form={invoiceForm}
        setField={setField as any}
        setItemField={setItemField as any}
        addItem={addItem}
        removeItem={removeItem}
        totals={totals}
        onSubmit={handleSubmit}
        submitting={createInvoiceMutation.isPending}
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Видалити інвойс?"
        description="Цю дію неможливо відмінити. Інвойс і його позиції будуть видалені."
        confirmText="Видалити"
        confirmColor="error"
        loading={deleteInvoiceMutation.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
