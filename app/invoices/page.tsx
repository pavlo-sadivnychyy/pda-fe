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
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useOrganizationContext } from "./hooks/useOrganizationContext";
import { useInvoicesQueries } from "./hooks/useInvoicesQueries";
import { useInvoiceMutations } from "./hooks/useInvoiceMutations";
import { useInvoiceForm } from "./hooks/useInvoiceForm";

import { InvoicesCard } from "./components/InvoicesCard";
import { InvoicesGrid } from "./components/InvoicesGrid";
import { CreateInvoiceDialog } from "./components/CreateInvoiceDialog";
import { ConfirmDialog } from "./components/ConfirmDialog";

import type { InvoiceAction, CreateInvoicePayload } from "./types";

export default function InvoicesPage() {
  const { organizationId } = useOrganizationContext();

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

  const router = useRouter();

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

  // ✅ actionBusyKey: `${id}:${action}`
  const actionBusyKey = useMemo(() => {
    const v = invoiceActionMutation.variables;
    if (!invoiceActionMutation.isPending || !v?.id || !v?.action) return null;
    return `${v.id}:${v.action}`;
  }, [invoiceActionMutation.isPending, invoiceActionMutation.variables]);

  const deleteBusyId = useMemo(
    () =>
      deleteInvoiceMutation.isPending
        ? (deleteInvoiceMutation.variables ?? null)
        : null,
    [deleteInvoiceMutation.isPending, deleteInvoiceMutation.variables],
  );

  const invoicesCount = invoicesQuery.data?.length ?? 0;

  const handleInvoiceAction = async (id: string, action: InvoiceAction) => {
    try {
      await invoiceActionMutation.mutateAsync({ id, action });

      if (action === "send-ua")
        showSnackbar("UA інвойс надіслано (SENT)", "success");
      if (action === "send-international")
        showSnackbar("International інвойс надіслано (SENT)", "success");
      if (action === "mark-paid")
        showSnackbar("Інвойс позначено як оплачений", "success");
      if (action === "cancel") showSnackbar("Інвойс скасовано", "success");
    } catch (e) {
      console.error(e);
      showSnackbar("Помилка виконання дії з інвойсом", "error");
    }
  };

  const handleSubmit = async () => {
    try {
      if (!organizationId) {
        showSnackbar("Немає organizationId", "error");
        return;
      }
      if (!invoiceForm.items.length) {
        showSnackbar("Додайте хоча б одну позицію", "error");
        return;
      }

      // ✅ createdById не треба (бек бере з Clerk)
      const payload: CreateInvoicePayload = {
        organizationId,
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
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3f4f6", padding: "32px 0" }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* ✅ Уніфікований хедер як на інших сторінках */}
        <Box sx={{ mb: 2.5 }}>
          <Button
            onClick={() => router.push("/dashboard")}
            sx={{ color: "black", marginBottom: "20px" }}
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
            Створюй рахунки, надсилай UA/International на email, керуй статусами
            та видаляй інвойси.
          </Typography>
        </Box>

        {/* ✅ Friendly tip (додано) */}
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
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.8 }}>
              <AccountBalanceIcon
                sx={{ fontSize: 18, mt: "2px", color: "#64748b" }}
              />
              <Typography
                variant="body2"
                sx={{ color: "#334155", lineHeight: 1.55 }}
              >
                <strong>Порада:</strong> Для формування повного інвойсу з
                реквізитами додай платіжні реквізити в профілі організації.
              </Typography>
            </Box>
          </Alert>
        </Box>

        <Box sx={{ maxWidth: 1500, mx: "auto" }}>
          <InvoicesCard invoicesCount={invoicesCount} onCreate={onCreateOpen}>
            <InvoicesGrid
              invoices={invoicesQuery.data ?? []}
              clients={clientsQuery.data ?? []}
              loading={invoicesQuery.isFetching}
              onAction={handleInvoiceAction}
              actionBusyKey={actionBusyKey}
              onDelete={requestDelete}
              deleteBusyId={deleteBusyId}
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
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
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
