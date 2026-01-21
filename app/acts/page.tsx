"use client";

import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Typography,
  Snackbar,
  Card,
  CardContent,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import { useMemo, useState } from "react";

import { useOrganizationContext } from "../invoices/hooks/useOrganizationContext";
import { useActsQueries } from "./hooks/useActsQueries";
import { useActMutations } from "./hooks/useActMutations";
import { useActForm } from "./hooks/useActForm";

import { ActsCard } from "./components/ActsCard";
import { ActsGrid } from "./components/ActsGrid";
import { CreateActDialog } from "./components/CreateActDialog";
import { ConfirmDialog } from "@/app/invoices/components/ConfirmDialog";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import { useRouter } from "next/navigation";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadIcon from "@mui/icons-material/Download";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import BusinessIcon from "@mui/icons-material/Business";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

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
            Акти прив’язані до організації. Створи її — і тоді зможеш створювати
            акти на основі інвойсів, відкривати PDF та надсилати клієнту.
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

export default function ActsPage() {
  const { currentUserId, organizationId } = useOrganizationContext();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ✅ Snackbar state
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackText, setSnackText] = useState("Готово");
  const openSnack = (text: string) => {
    setSnackText(text);
    setSnackOpen(true);
  };

  const router = useRouter();

  // ✅ guard: якщо нема org — не грузимо дані
  const canWork = Boolean(organizationId);

  const { actsQuery, invoicesQuery } = useActsQueries(
    canWork ? organizationId : undefined,
    createDialogOpen,
  );

  const { createFromInvoice, deleteAct, sendAct } = useActMutations(
    canWork ? organizationId : undefined,
  );

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

    await createFromInvoice
      .mutateAsync({
        invoiceId: selectedInvoiceId,
        number: actNumber.trim(),
        createdById: currentUserId,
        title: actTitle.trim() ? actTitle.trim() : undefined,
        periodFrom: periodFrom || undefined,
        periodTo: periodTo || undefined,
        notes: notes || undefined,
      })
      .catch(() => {
        openSnack("Акт за цим інвойсом вже існує");
      });

    setCreateDialogOpen(false);
    openSnack("Акт створено");
  };

  const requestDelete = (id: string) => setDeleteId(id);

  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteAct.mutateAsync(deleteId);
    setDeleteId(null);
    openSnack("Акт видалено");
  };

  const deleteBusyId = useMemo(
    () => deleteAct.variables ?? null,
    [deleteAct.variables],
  );

  const acts = actsQuery.data ?? [];
  const isTableLoading = actsQuery.isLoading || actsQuery.isFetching;

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
              sx={{ color: "black", mb: 2 }}
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
                  <DescriptionIcon sx={{ color: "#0f172a" }} />
                </Box>

                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, color: "#0f172a" }}
                >
                  Акти
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
              Створюй акти виконаних робіт на основі інвойсів, переглядай PDF,
              надсилай клієнту та видаляй при потребі.
            </Typography>
          </Box>

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
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3f4f6", padding: "32px 0" }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* ✅ Уніфікований хедер */}
        <Box sx={{ mb: 2.5 }}>
          <Button
            onClick={() => router.push("/dashboard")}
            sx={{ color: "black", marginBottom: "20px" }}
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
                <DescriptionIcon sx={{ color: "#0f172a" }} />
              </Box>

              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "#0f172a" }}
              >
                Акти
              </Typography>
            </Stack>

            <Chip
              label={isTableLoading ? "Оновлюємо..." : `Всього: ${acts.length}`}
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
            Створюй акти виконаних робіт на основі інвойсів, переглядай PDF,
            надсилай клієнту та видаляй при потребі.
          </Typography>
        </Box>

        {/* ✅ Friendly hint block */}
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
              Після створення акту ти отримуєш{" "}
              <strong>PDF-версію документа</strong>, яку можна{" "}
              <strong>відкрити або завантажити</strong> — і{" "}
              <strong>надіслати клієнту на email</strong> в 1 клік.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ mt: 1.25 }}
            >
              <Chip
                size="small"
                icon={<PictureAsPdfIcon />}
                label="PDF завжди під рукою"
                sx={{
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontWeight: 600,
                }}
              />
              <Chip
                size="small"
                icon={<DownloadIcon />}
                label="Надсилання клієнту"
                sx={{
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontWeight: 600,
                }}
              />
              <Chip
                size="small"
                icon={<FolderOpenIcon />}
                label="Всі акти в одному місці"
                sx={{
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontWeight: 600,
                }}
              />
            </Stack>
          </Alert>
        </Box>

        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
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
                      color: "white",
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
                  onSend={async (id) => {
                    await sendAct.mutateAsync(id);
                    openSnack("Акт відправлено");
                  }}
                  sendBusyId={
                    sendAct.isPending
                      ? ((sendAct.variables as any) ?? null)
                      : null
                  }
                />
              )}
            </Box>
          </ActsCard>

          <CreateActDialog
            open={createDialogOpen}
            onClose={closeCreate}
            invoices={invoicesQuery.data ?? []}
            loadingInvoices={
              invoicesQuery.isLoading || invoicesQuery.isFetching
            }
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
      </Container>

      <Snackbar
        open={snackOpen}
        autoHideDuration={2500}
        onClose={() => setSnackOpen(false)}
        message={snackText}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      />
    </Box>
  );
}
