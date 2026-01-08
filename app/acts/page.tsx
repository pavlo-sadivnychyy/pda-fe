"use client";

import {
  Box,
  CircularProgress,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import { useMemo, useState } from "react";

import { useOrganizationContext } from "../invoices/hooks/useOrganizationContext";
import { useActsQueries } from "./hooks/useActsQueries";
import { useActMutations } from "./hooks/useActMutations";
import { useActForm } from "./hooks/useActForm";

import { ActsCard } from "./components/ActsCard";
import { ActsGrid } from "./components/ActsGrid";
import { CreateActDialog } from "./components/CreateActDialog";
import { ConfirmDialog } from "@/app/invoices/components/ConfirmDialog";

export default function ActsPage() {
  const { currentUserId, organizationId } = useOrganizationContext();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // ✅ NEW
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { actsQuery, invoicesQuery } = useActsQueries(
    organizationId,
    createDialogOpen,
  );
  const { createFromInvoice, deleteAct } = useActMutations(organizationId);

  const form = useActForm();

  const openCreate = () => {
    form.reset();
    setCreateDialogOpen(true);
  };

  const closeCreate = () => setCreateDialogOpen(false);

  const submit = async () => {
    if (!currentUserId) return;

    const {
      selectedInvoiceId,
      actNumber,
      actTitle,
      periodFrom,
      periodTo,
      notes,
    } = form.fields;

    await createFromInvoice.mutateAsync({
      invoiceId: selectedInvoiceId,
      number: actNumber.trim(),
      createdById: currentUserId,
      title: actTitle.trim() ? actTitle.trim() : undefined,
      periodFrom: periodFrom || undefined,
      periodTo: periodTo || undefined,
      notes: notes || undefined,
    });

    setCreateDialogOpen(false);
  };

  // ✅ NEW: delete handlers
  const requestDelete = (id: string) => setDeleteId(id);

  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteAct.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const deleteBusyId = useMemo(
    () => deleteAct.variables ?? null,
    [deleteAct.variables],
  );

  const acts = actsQuery.data ?? [];
  const isTableLoading = actsQuery.isLoading || actsQuery.isFetching;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f3f4f6",
        py: 4,
        px: { xs: 2, md: 4 },
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 1200 }}>
        <ActsCard
          organizationId={organizationId}
          count={acts.length}
          onCreate={openCreate}
        >
          <Box sx={{ height: 520, width: "100%" }}>
            {isTableLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <Stack spacing={1} alignItems="center">
                  <CircularProgress />
                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    Завантажуємо акти...
                  </Typography>
                </Stack>
              </Box>
            ) : acts.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  textAlign: "center",
                  color: "#6b7280",
                  gap: 1.5,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  Акти ще не створювалися
                </Typography>
                <Typography variant="body2">
                  Створи перший акт на основі вже виставленого інвойсу.
                </Typography>
                <Button
                  variant="contained"
                  disabled={!organizationId}
                  onClick={openCreate}
                  sx={{
                    mt: 1,
                    textTransform: "none",
                    borderRadius: 999,
                    bgcolor: "#111827",
                    "&:hover": { bgcolor: "#020617" },
                  }}
                >
                  Створити акт
                </Button>
              </Box>
            ) : (
              <ActsGrid
                acts={acts}
                onDelete={requestDelete}
                deleteBusyId={deleteAct.isPending ? deleteBusyId : null}
              />
            )}
          </Box>
        </ActsCard>

        <CreateActDialog
          open={createDialogOpen}
          onClose={closeCreate}
          invoices={invoicesQuery.data ?? []}
          loadingInvoices={invoicesQuery.isLoading || invoicesQuery.isFetching}
          fields={form.fields}
          setTitle={form.setters.setActTitle}
          setNumber={form.setters.setActNumber}
          setPeriodFrom={form.setters.setPeriodFrom}
          setPeriodTo={form.setters.setPeriodTo}
          setNotes={form.setters.setNotes}
          onSelectInvoice={(id) =>
            form.selectInvoice(id, invoicesQuery.data ?? [])
          }
          onSubmit={submit}
          submitting={createFromInvoice.isPending}
          canSubmit={Boolean(currentUserId) && form.isValid}
        />

        <ConfirmDialog
          open={Boolean(deleteId)}
          title="Видалити акт?"
          description="Цю дію неможливо відмінити."
          confirmText="Видалити"
          confirmColor="error"
          loading={deleteAct.isPending}
          onClose={() => setDeleteId(null)}
          onConfirm={confirmDelete}
        />
      </Box>
    </Box>
  );
}
