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
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import BusinessIcon from "@mui/icons-material/Business";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LockIcon from "@mui/icons-material/Lock";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { InfinitySpin } from "react-loader-spinner";

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

import type { InvoiceAction, CreateInvoicePayload, Invoice } from "./types";
import { useServicesQueries } from "@/app/invoices/hooks/useServicesQueries";
import { useServiceMutations } from "@/app/invoices/hooks/useServiceMutations";

// ✅ NEW recurring
import { RecurringInvoiceDialog } from "@/app/recurring-invoices/components/RecurringInvoiceDialog";
import { useRecurringInvoiceMutations } from "@/app/recurring-invoices/hooks/useRecurringInvoiceMutations";
import { useRecurringInvoicesQueries } from "@/app/recurring-invoices/hooks/useRecurringInvoicesQueries";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
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

function FullscreenLoader({ text }: { text?: string }) {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
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
            Інвойси прив’язані до організації. Створи її — і тоді зможеш
            створювати рахунки та керувати ними.
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
        mb: 2.5,
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
            Ліміт інвойсів вичерпано
          </Typography>
        </Stack>

        <Typography variant="body2" sx={{ color: "#7f1d1d" }}>
          Використано {current} / {limit}. Щоб створювати більше — підвищіть
          план.
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
          background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
          color: "#fff",
          boxShadow:
            "0 8px 22px rgba(249,115,22,0.35), inset 0 0 0 1px rgba(255,255,255,0.2)",
          position: "relative",
          overflow: "hidden",
          "&:hover": {
            background: "linear-gradient(135deg, #fbbf24 0%, #fb923c 100%)",
            boxShadow:
              "0 12px 28px rgba(249,115,22,0.45), inset 0 0 0 1px rgba(255,255,255,0.25)",
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(0px) scale(0.98)",
            boxShadow:
              "0 6px 16px rgba(249,115,22,0.35), inset 0 0 0 1px rgba(255,255,255,0.2)",
          },
          "@keyframes upgradePulse": {
            "0%": { boxShadow: "0 0 0 0 rgba(249,115,22,0.45)" },
            "70%": { boxShadow: "0 0 0 14px rgba(249,115,22,0)" },
            "100%": { boxShadow: "0 0 0 0 rgba(249,115,22,0)" },
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

export default function InvoicesPage() {
  const router = useRouter();
  const { organizationId, planId, isUserLoading, isOrgLoading } =
    useOrganizationContext();

  const canWork = Boolean(organizationId);
  const isPro = planId === "PRO";

  const { clientsQuery, invoicesQuery } = useInvoicesQueries(
    canWork ? organizationId : undefined,
  );

  const {
    createInvoiceMutation,
    invoiceActionMutation,
    deleteInvoiceMutation,
  } = useInvoiceMutations(canWork ? organizationId : undefined);

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
    errors,
    validateForm,
  } = useInvoiceForm();

  // ✅ services for select + checkbox "save"
  const { servicesQuery } = useServicesQueries();
  const { createService } = useServiceMutations();

  // ✅ recurring data for mapping template->profile
  const { recurringQuery } = useRecurringInvoicesQueries(
    canWork ? organizationId : undefined,
    { enabled: Boolean(canWork && isPro) },
  );
  const { createRecurring, updateRecurring } = useRecurringInvoiceMutations(
    canWork ? organizationId : undefined,
  );

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // ✅ recurring dialog state
  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);
  const [recurringTemplateInvoice, setRecurringTemplateInvoice] =
    useState<Invoice | null>(null);

  const recurringByTemplateId = useMemo(() => {
    const map = new Map<string, any>();
    for (const p of recurringQuery.data ?? []) {
      map.set(p.templateInvoiceId, p);
    }
    return map;
  }, [recurringQuery.data]);

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

  const actionBusyKey = useMemo(() => {
    const v = invoiceActionMutation.variables as any;
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

  const isBootstrapping =
    isUserLoading || isOrgLoading || typeof planId === "undefined";

  if (isBootstrapping) return <FullscreenLoader text="Завантажую..." />;

  if (!organizationId) {
    return (
      <Box sx={{ minHeight: "100dvh", bgcolor: "#f3f4f6", py: 4 }}>
        <Container
          maxWidth="xl"
          sx={{
            px: { xs: 2, sm: 3 },
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ mb: 2.5 }}>
            <Button
              onClick={() => router.push("/dashboard")}
              sx={{ color: "black", mb: 1 }}
              startIcon={<KeyboardReturnIcon fontSize="inherit" />}
            >
              на головну
            </Button>

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
              Створюй рахунки, надсилай UA/International на email, керуй
              статусами.
            </Typography>
          </Box>

          <Box sx={{ flex: 1, display: "grid", placeItems: "center" }}>
            <NoOrgState />
          </Box>
        </Container>
      </Box>
    );
  }

  const planLimit = PLAN_LIMITS[planId ?? ""] ?? Infinity;
  const isLimitReached = invoicesCount >= planLimit;

  const handleInvoiceAction = async (id: string, action: InvoiceAction) => {
    try {
      await invoiceActionMutation.mutateAsync({ id, action });
      showSnackbar("Дію виконано", "success");
    } catch (e) {
      console.error(e);
      showSnackbar("Помилка виконання дії з інвойсом", "error");
    }
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        showSnackbar("Будь ласка, виправте помилки у формі", "error");
        return;
      }

      if (isLimitReached) {
        showSnackbar("Ліміт інвойсів вичерпано. Підвищіть план.", "error");
        return;
      }

      if (!invoiceForm.items.length) {
        showSnackbar("Додайте хоча б одну позицію", "error");
        return;
      }

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

      // якщо юзер поставив чекбокс — створюємо сервіси
      const candidates = invoiceForm.items
        .filter((i) => i.addToMyServices)
        .map((i) => ({
          name: (i.name ?? "").trim(),
          description: (i.description ?? "").trim() || undefined,
          price: Number.parseFloat(i.unitPrice) || 0,
        }))
        .filter((x) => x.name && Number.isFinite(x.price));

      const uniq = new Map<string, (typeof candidates)[number]>();
      for (const s of candidates) {
        const key = `${s.name.toLowerCase()}::${s.price}`;
        if (!uniq.has(key)) uniq.set(key, s);
      }

      for (const s of uniq.values()) {
        try {
          await createService.mutateAsync(s);
        } catch (e) {
          console.error("Failed to create service", e);
        }
      }

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

  const openRecurringFromInvoice = (inv: Invoice) => {
    if (!isPro) {
      showSnackbar("Recurring інвойси доступні лише на PRO", "error");
      router.push("/pricing");
      return;
    }
    setRecurringTemplateInvoice(inv);
    setRecurringDialogOpen(true);
  };

  const handleSaveRecurring = async (payload: any) => {
    try {
      // якщо вже є профіль — update, інакше create
      const existing = payload?.id
        ? payload
        : recurringByTemplateId.get(payload.templateInvoiceId);

      if (existing?.id) {
        await updateRecurring.mutateAsync({
          id: existing.id,
          data: payload,
        });
      } else {
        await createRecurring.mutateAsync(payload);
      }

      showSnackbar("Recurring налаштування збережено", "success");
      setRecurringDialogOpen(false);
      setRecurringTemplateInvoice(null);
    } catch (e) {
      console.error(e);
      showSnackbar("Помилка збереження recurring", "error");
    }
  };

  return (
    <Box
      sx={{
        height: "100dvh",
        overflow: "auto",
        bgcolor: "#f3f4f6",
        py: 4,
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          px: { xs: 2, sm: 3 },
          height: { xs: "auto", md: "100%" },
          display: "flex",
          flexDirection: "column",
        }}
      >
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
            justifyContent="space-between"
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

            <Stack direction="row" spacing={1} alignItems="center">
              {isPro ? (
                <Button
                  onClick={() => router.push("/recurring-invoices")}
                  startIcon={<AutorenewIcon />}
                  endIcon={<TrendingFlatIcon />}
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 900,
                    bgcolor: "#111827",
                    color: "white",
                    px: 2.2,
                    "&:hover": { bgcolor: "#020617" },
                  }}
                >
                  Регулярні інвойси
                </Button>
              ) : (
                <Button
                  onClick={() => router.push("/pricing")}
                  startIcon={<LockIcon />}
                  variant="outlined"
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 900,
                    px: 2.2,
                    borderColor: "#111827",
                    color: "#111827",
                    bgcolor: "#fff",
                  }}
                >
                  Регулярні інвойси (PRO)
                </Button>
              )}
            </Stack>
          </Stack>

          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.8 }}>
            Створюй рахунки, надсилай UA/International на email, керуй статусами
            та видаляй інвойси.
          </Typography>
        </Box>

        {isLimitReached && planLimit !== Infinity && (
          <PlanLimitBanner
            current={invoicesCount}
            limit={planLimit}
            onUpgrade={() => router.push("/pricing")}
          />
        )}

        <Box sx={{ mt: 0, mb: 2.5 }}>
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
                <strong>Порада:</strong> Для повного інвойсу з реквізитами додай
                платіжні реквізити в профілі організації.
              </Typography>
            </Box>
          </Alert>
        </Box>

        <Box>
          <Box sx={{ maxWidth: 1500, mx: "auto", height: "auto" }}>
            <InvoicesCard
              invoicesCount={invoicesCount}
              onCreate={() => {
                if (isLimitReached) {
                  showSnackbar(
                    "Ліміт інвойсів вичерпано. Підвищіть план.",
                    "error",
                  );
                  return;
                }
                onCreateOpen();
              }}
              isLimitReached={isLimitReached}
            >
              <InvoicesGrid
                disbaleExport={planId !== "PRO"}
                invoices={invoicesQuery.data ?? []}
                clients={clientsQuery.data ?? []}
                loading={invoicesQuery.isFetching}
                onAction={handleInvoiceAction}
                actionBusyKey={actionBusyKey}
                onDelete={requestDelete}
                deleteBusyId={deleteBusyId}
                // ✅ recurring
                isPro={isPro}
                recurringByTemplateId={recurringByTemplateId}
                onMakeRecurring={openRecurringFromInvoice}
              />
            </InvoicesCard>
          </Box>
        </Box>
      </Container>

      <CreateInvoiceDialog
        open={createDialogOpen}
        onClose={onCreateClose}
        clients={clientsQuery.data ?? []}
        loadingClients={clientsQuery.isFetching}
        services={servicesQuery.data ?? []}
        servicesLoading={servicesQuery.isFetching}
        formStatus={formStatus}
        setFormStatus={setFormStatus}
        form={invoiceForm}
        errors={errors}
        setField={setField as any}
        setItemField={setItemField as any}
        addItem={addItem}
        removeItem={removeItem}
        totals={totals}
        onSubmit={handleSubmit}
        submitting={createInvoiceMutation.isPending}
      />

      <RecurringInvoiceDialog
        open={recurringDialogOpen}
        onClose={() => {
          setRecurringDialogOpen(false);
          setRecurringTemplateInvoice(null);
        }}
        isPro={isPro}
        templateInvoice={recurringTemplateInvoice}
        existingProfile={
          recurringTemplateInvoice
            ? (recurringByTemplateId.get(recurringTemplateInvoice.id) ?? null)
            : null
        }
        onSave={handleSaveRecurring}
        submitting={createRecurring.isPending || updateRecurring.isPending}
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
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
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
