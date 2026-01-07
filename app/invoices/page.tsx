"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
  Chip,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

import { useCurrentUser } from "@/hooksNew/useAppBootstrap";
import { useOrganization } from "@/hooksNew/useAllUserOrganizations";

// 👇 Підлаштуй під свій бекенд / env
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Client = {
  id: string;
  organizationId: string;
  createdById: string;
  name: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  taxNumber?: string | null;
  address?: string | null;
  notes?: string | null;
};

type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";

type InvoiceItemForm = {
  name: string;
  description: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
};

type Invoice = {
  id: string;
  organizationId: string;
  createdById: string;
  clientId?: string | null;
  number: string;
  issueDate: string;
  dueDate?: string | null;
  currency: string;
  subtotal: string | number;
  taxAmount?: string | number | null;
  total: string | number;
  status: InvoiceStatus;
  notes?: string | null;
  pdfDocumentId?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: Client | null;
  items: {
    id: string;
    name: string;
    description?: string | null;
    quantity: number;
    unitPrice: number;
    taxRate?: number | null;
    lineTotal: number;
  }[];
};

const defaultItem: InvoiceItemForm = {
  name: "",
  description: "",
  quantity: "1",
  unitPrice: "0",
  taxRate: "0",
};

const statuses = {
  SENT: "Відправлено",
  PAID: "Оплачено",
  CANCELLED: "Скасовано",
};

const InvoicesPage: React.FC = () => {
  const { data: userData } = useCurrentUser();
  const currentUserId = (userData as any)?.id ?? null;

  const { data: orgData } = useOrganization(currentUserId || undefined);
  const organizationId = orgData?.items[0]?.organizationId;

  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [formStatus, setFormStatus] = useState<InvoiceStatus>("DRAFT");

  const [invoiceForm, setInvoiceForm] = useState<{
    clientId: string;
    issueDate: string;
    dueDate: string;
    currency: string;
    notes: string;
    items: InvoiceItemForm[];
  }>({
    clientId: "",
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
    currency: "UAH",
    notes: "",
    items: [defaultItem],
  });

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  const fetchClients = async () => {
    try {
      if (!organizationId) return;
      setLoadingClients(true);
      const url = `${API_BASE_URL}/clients?organizationId=${encodeURIComponent(
        organizationId,
      )}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch clients");
      const data = await res.json();
      setClients(data.clients || []);
    } catch (e) {
      console.error(e);
      showSnackbar("Помилка завантаження клієнтів", "error");
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      if (!organizationId) return;
      setLoading(true);
      const url = `${API_BASE_URL}/invoices?organizationId=${encodeURIComponent(
        organizationId,
      )}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch invoices");
      const data = await res.json();
      setInvoices(data.invoices || []);
    } catch (e) {
      console.error(e);
      showSnackbar("Помилка завантаження інвойсів", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchInvoices();
  }, [organizationId]);

  const handleOpenCreateDialog = () => {
    setInvoiceForm({
      clientId: "",
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: "",
      currency: "UAH",
      notes: "",
      items: [defaultItem],
    });
    setFormStatus("DRAFT");
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => setCreateDialogOpen(false);

  const handleFormChange = (field: keyof typeof invoiceForm, value: string) => {
    setInvoiceForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItemForm,
    value: string,
  ) => {
    setInvoiceForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const handleAddItem = () => {
    setInvoiceForm((prev) => ({
      ...prev,
      items: [...prev.items, { ...defaultItem }],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setInvoiceForm((prev) => {
      if (prev.items.length === 1) return prev;
      const items = prev.items.filter((_, i) => i !== index);
      return { ...prev, items };
    });
  };

  const computedTotals = useMemo(() => {
    let subtotal = 0;
    let taxAmount = 0;

    for (const item of invoiceForm.items) {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const taxRate = parseFloat(item.taxRate) || 0;

      const base = quantity * unitPrice;
      const lineTax = base * (taxRate / 100);
      subtotal += base;
      taxAmount += lineTax;
    }

    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  }, [invoiceForm.items]);

  const handleInvoiceAction = async (
    id: string,
    action: "send" | "mark-paid" | "cancel",
  ) => {
    try {
      setActionLoadingId(id);

      const url = `${API_BASE_URL}/invoices/${id}/${action}`;
      let body: any = undefined;

      if (action === "mark-paid") {
        body = JSON.stringify({});
      }

      const res = await fetch(url, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body,
      });

      if (!res.ok) {
        console.error(await res.text());
        throw new Error(`Failed to ${action} invoice`);
      }

      if (action === "send") {
        showSnackbar("Інвойс відправлено (позначено як SENT)", "success");
      } else if (action === "mark-paid") {
        showSnackbar("Інвойс позначено як оплачений", "success");
      } else if (action === "cancel") {
        showSnackbar("Інвойс скасовано", "success");
      }

      await fetchInvoices();
    } catch (e) {
      console.error(e);
      showSnackbar("Помилка оновлення статусу інвойсу", "error");
    } finally {
      setActionLoadingId(null);
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

      const payload = {
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
          quantity: parseFloat(item.quantity) || 0,
          unitPrice: parseFloat(item.unitPrice) || 0,
          taxRate: item.taxRate ? parseFloat(item.taxRate) : undefined,
        })),
      };

      const res = await fetch(`${API_BASE_URL}/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error(await res.text());
        throw new Error("Failed to create invoice");
      }

      showSnackbar("Інвойс створено", "success");
      setCreateDialogOpen(false);
      await fetchInvoices();
    } catch (e) {
      console.error(e);
      showSnackbar("Помилка створення інвойсу", "error");
    }
  };

  const getClientDisplayName = (invoice: Invoice) => {
    if (invoice.client?.name) return invoice.client.name;
    const match = clients.find((c) => c.id === invoice.clientId);
    return match?.name || "—";
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    try {
      return value.slice(0, 10);
    } catch {
      return value;
    }
  };

  const formatMoney = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) return "0.00";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "0.00";
    return num.toFixed(2);
  };

  const statusChipColor = (status: InvoiceStatus) => {
    switch (status) {
      case "PAID":
        return { color: "#16a34a", bg: "rgba(22,163,74,0.08)" };
      case "SENT":
        return { color: "#2563eb", bg: "rgba(37,99,235,0.08)" };
      case "OVERDUE":
        return { color: "#dc2626", bg: "rgba(220,38,38,0.08)" };
      case "CANCELLED":
        return { color: "#6b7280", bg: "rgba(107,114,128,0.08)" };
      case "DRAFT":
      default:
        return { color: "#64748b", bg: "rgba(100,116,139,0.08)" };
    }
  };

  const rows = invoices.map((inv) => ({
    id: inv.id,
    number: inv.number,
    clientName: getClientDisplayName(inv),
    issueDate: formatDate(inv.issueDate),
    dueDate: formatDate(inv.dueDate ?? null),
    total: `${formatMoney(inv.total)} ${inv.currency}`,
    rawTotal: inv.total,
    status: inv.status,
    hasPdf: Boolean(inv.pdfDocumentId),
  }));

  const columns: GridColDef[] = [
    {
      field: "number",
      headerName: "Номер",
      flex: 1,
      minWidth: 130,
    },
    {
      field: "clientName",
      headerName: "Клієнт",
      flex: 1.5,
      minWidth: 180,
    },
    {
      field: "issueDate",
      headerName: "Дата",
      flex: 0.8,
      minWidth: 120,
    },
    {
      field: "dueDate",
      headerName: "Термін оплати",
      flex: 0.9,
      minWidth: 140,
    },
    {
      field: "total",
      headerName: "Сума",
      flex: 0.9,
      minWidth: 130,
    },
    {
      field: "status",
      headerName: "Статус",
      flex: 0.8,
      minWidth: 130,
      renderCell: (params: GridRenderCellParams<InvoiceStatus>) => {
        const { color, bg } = statusChipColor(params.value as InvoiceStatus);
        return (
          <Stack
            direction="row"
            spacing={1}
            height={"100%"}
            alignItems={"center"}
          >
            <Chip
              size="small"
              label={statuses[params.value]}
              sx={{
                fontSize: 12,
                fontWeight: 500,
                color,
                backgroundColor: bg,
                borderRadius: "999px",
              }}
            />
          </Stack>
        );
      },
    },
    {
      field: "pdf",
      headerName: "PDF",
      sortable: false,
      filterable: false,
      width: 160,
      renderCell: (params) => {
        const id = params.row.id as string;
        const hasPdf = params.row.hasPdf as boolean;

        const handleOpenPdf = () => {
          window.open(
            `${API_BASE_URL}/invoices/${id}/pdf`,
            "_blank",
            "noopener,noreferrer",
          );
        };

        const isPrimary = !hasPdf;

        return (
          <Stack
            direction="row"
            spacing={1}
            height={"100%"}
            alignItems={"center"}
          >
            <Button
              size="small"
              onClick={handleOpenPdf}
              variant={isPrimary ? "contained" : "outlined"}
              sx={{
                textTransform: "none",
                fontSize: 12,
                borderRadius: 999,
                px: 2,
                py: 0.5,
                minWidth: 0,
                bgcolor: isPrimary ? "#111827" : "transparent",
                color: isPrimary ? "#f9fafb" : "#111827",
                borderColor: "#111827",
                "&:hover": {
                  bgcolor: isPrimary ? "#020617" : "rgba(15,23,42,0.04)",
                  borderColor: "#020617",
                },
              }}
            >
              {hasPdf ? "Відкрити PDF" : "Згенерувати PDF"}
            </Button>
          </Stack>
        );
      },
    },
    {
      field: "actions",
      headerName: "",
      sortable: false,
      filterable: false,
      width: 300,
      renderCell: (params) => {
        const rowStatus = params.row.status as InvoiceStatus;
        const id = params.row.id as string;
        const busy = actionLoadingId === id;

        const canSend = rowStatus === "DRAFT" || rowStatus === "OVERDUE";
        const canMarkPaid = rowStatus === "SENT" || rowStatus === "OVERDUE";
        const canCancel = rowStatus === "DRAFT" || rowStatus === "SENT";

        return (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              justifyContent: "flex-end",
              alignItems: "center",
              height: "100%",
              width: "100%",
            }}
          >
            <Button
              size="small"
              variant="outlined"
              disabled={!canSend || busy}
              onClick={() => handleInvoiceAction(id, "send")}
              sx={{
                textTransform: "none",
                fontSize: 12,
                borderRadius: 999,
                px: 1.8,
                py: 0.4,
                borderColor: "#111827",
                color: "#111827",
                "&:hover": {
                  borderColor: "#020617",
                  bgcolor: "rgba(15,23,42,0.04)",
                },
                "&.Mui-disabled": {
                  borderColor: "#e5e7eb",
                  color: "#9ca3af",
                },
              }}
            >
              Відправлено
            </Button>

            <Button
              size="small"
              variant="outlined"
              disabled={!canMarkPaid || busy}
              onClick={() => handleInvoiceAction(id, "mark-paid")}
              sx={{
                textTransform: "none",
                fontSize: 12,
                borderRadius: 999,
                px: 1.8,
                py: 0.4,
                borderColor: "#16a34a",
                color: "#166534",
                "&:hover": {
                  borderColor: "#15803d",
                  bgcolor: "rgba(22,163,74,0.06)",
                },
                "&.Mui-disabled": {
                  borderColor: "#e5e7eb",
                  color: "#9ca3af",
                },
              }}
            >
              Оплачено
            </Button>

            <Button
              size="small"
              variant="outlined"
              disabled={!canCancel || busy}
              onClick={() => handleInvoiceAction(id, "cancel")}
              sx={{
                textTransform: "none",
                fontSize: 12,
                borderRadius: 999,
                px: 1.8,
                py: 0.4,
                borderColor: "#dc2626",
                color: "#b91c1c",
                "&:hover": {
                  borderColor: "#b91c1c",
                  bgcolor: "rgba(220,38,38,0.06)",
                },
                "&.Mui-disabled": {
                  borderColor: "#fee2e2",
                  color: "#fecaca",
                },
              }}
            >
              Скасувати
            </Button>
          </Box>
        );
      },
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f3f4f6",
        py: 4,
        px: { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          maxWidth: 1500,
          mx: "auto",
        }}
      >
        {/* Чіп секції */}

        {/* Основна картка */}
        <Box
          sx={{
            borderRadius: 5,
            bgcolor: "background.paper",
            boxShadow: "0px 18px 45px rgba(15,23,42,0.11)",
            p: { xs: 3, md: 4 },
          }}
        >
          {/* Header картки */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              gap: 2,
              mb: 3,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 0.5, color: "#020617" }}
              >
                Інвойси вашого бізнесу
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#6b7280", maxWidth: 560 }}
              >
                Виставляйте рахунки клієнтам, слідкуйте за оплатами та тримайте
                фінансовий облік в одному місці.
              </Typography>
            </Box>

            <Box
              sx={{
                minWidth: 220,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 0.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "#6b7280", textTransform: "uppercase" }}
              >
                Усього інвойсів
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: "#020617" }}
              >
                {invoices.length}
              </Typography>
              <Box
                sx={{
                  width: "100%",
                  mt: 0.5,
                }}
              >
                <LinearProgress
                  variant="determinate"
                  value={100}
                  sx={{
                    height: 6,
                    borderRadius: 999,
                    bgcolor: "#e5e7eb",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "#020617",
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Легкий розділювач */}
          <Box
            sx={{
              borderBottom: "1px solid rgba(148,163,184,0.4)",
              mb: 2.5,
            }}
          />

          {/* DataGrid */}
          <Box
            sx={{
              "& .MuiDataGrid-root": {
                border: "none",
              },
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: "#f9fafb",
                borderBottom: "1px solid #e2e8f0",
              },
              "& .MuiDataGrid-row:hover": {
                bgcolor: "rgba(15,23,42,0.02)",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid #f1f5f9",
              },
            }}
          >
            <DataGrid
              autoHeight
              rows={rows}
              columns={columns}
              loading={loading}
              disableRowSelectionOnClick
              pageSizeOptions={[5, 10, 25]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10, page: 0 },
                },
              }}
              localeText={{
                noRowsLabel: "Інвойсів поки немає",
              }}
            />
          </Box>

          {/* Низ картки з кнопкою */}
          <Box
            sx={{
              mt: 3,
              pt: 2,
              borderTop: "1px solid rgba(148,163,184,0.2)",
            }}
          >
            <Button
              fullWidth
              onClick={handleOpenCreateDialog}
              startIcon={<AddIcon />}
              sx={{
                borderRadius: 999,
                py: 1.4,
                fontWeight: 500,
                bgcolor: "#020617",
                color: "#f9fafb",
                textTransform: "none",
                "&:hover": {
                  bgcolor: "#020617",
                },
              }}
            >
              Створити інвойс
            </Button>

            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: 1.5,
                textAlign: "center",
                color: "#9ca3af",
              }}
            >
              Інформація про інвойси зберігається у вашому акаунті
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Діалог створення інвойсу у стилі "knowledge base" */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 0,
          },
        }}
      >
        <DialogContent
          sx={{
            padding: "24px",
          }}
        >
          {/* Чіп зверху */}
          <Box
            sx={{
              display: "inline-flex",
              px: 1.5,
              py: 0.5,
              borderRadius: 999,
              bgcolor: "#f3f4f6",
              mb: 2,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                letterSpacing: 0.8,
                fontWeight: 600,
                color: "#6b7280",
              }}
            >
              INVOICES
            </Typography>
          </Box>

          {/* Заголовок + опис */}
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, mb: 0.5, color: "#020617" }}
          >
            Створити інвойс
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#6b7280", mb: 3, maxWidth: 620 }}
          >
            Обери клієнта, заповни реквізити рахунку, додай позиції та суми —
            система автоматично підрахує загальну суму до оплати.
          </Typography>

          {/* Верхній блок полів: клієнт, статус, дати, валюта, нотатки */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2.5,
              mb: 3,
            }}
          >
            {/* Клієнт */}
            <FormControl fullWidth>
              <InputLabel shrink id="client-select-label">
                Клієнт
              </InputLabel>
              <Select
                labelId="client-select-label"
                label="Клієнт"
                value={invoiceForm.clientId}
                onChange={(e) => handleFormChange("clientId", e.target.value)}
                disabled={loadingClients}
                displayEmpty
              >
                <MenuItem value="">
                  <em>Без клієнта</em>
                </MenuItem>
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.name}
                    {client.contactName ? ` — ${client.contactName}` : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Статус */}
            <FormControl fullWidth>
              <InputLabel shrink id="status-select-label">
                Статус
              </InputLabel>
              <Select
                labelId="status-select-label"
                label="Статус"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as InvoiceStatus)}
              >
                <MenuItem value="DRAFT">Чернетка</MenuItem>
                <MenuItem value="SENT">Надіслано</MenuItem>
                <MenuItem value="PAID">Оплачено</MenuItem>
                <MenuItem value="OVERDUE">Прострочено</MenuItem>
                <MenuItem value="CANCELLED">Скасовано</MenuItem>
              </Select>
            </FormControl>

            {/* Issue Date */}
            <TextField
              label="Дата виставлення"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={invoiceForm.issueDate}
              onChange={(e) => handleFormChange("issueDate", e.target.value)}
            />

            {/* Due Date */}
            <TextField
              label="Кінцевий термін оплати"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={invoiceForm.dueDate}
              onChange={(e) => handleFormChange("dueDate", e.target.value)}
            />

            {/* Currency */}
            <TextField
              label="Валюта"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={invoiceForm.currency}
              onChange={(e) => handleFormChange("currency", e.target.value)}
            />

            {/* Notes */}
            <TextField
              label="Нотатки (опціонально)"
              fullWidth
              multiline
              minRows={2}
              InputLabelProps={{ shrink: true }}
              value={invoiceForm.notes}
              onChange={(e) => handleFormChange("notes", e.target.value)}
            />
          </Box>

          {/* Позиції інвойсу */}
          <Typography
            variant="subtitle1"
            sx={{ mb: 1, fontWeight: 600, color: "#020617" }}
          >
            Позиції інвойсу
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {invoiceForm.items.map((item, index) => (
              <Box
                key={index}
                sx={{
                  borderRadius: 2,
                  border: "1px solid rgba(148, 163, 184, 0.4)",
                  p: 2,
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "2fr 1fr 1fr 1fr auto",
                  },
                  gap: 1.5,
                  alignItems: "flex-start",
                  bgcolor: "#f9fafb",
                }}
              >
                <TextField
                  label="Назва"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={item.name}
                  onChange={(e) =>
                    handleItemChange(index, "name", e.target.value)
                  }
                />
                <TextField
                  label="Кількість"
                  type="number"
                  fullWidth
                  inputProps={{ min: 0, step: "0.01" }}
                  InputLabelProps={{ shrink: true }}
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                />
                <TextField
                  label="Ціна за одиницю"
                  type="number"
                  fullWidth
                  inputProps={{ min: 0, step: "0.01" }}
                  InputLabelProps={{ shrink: true }}
                  value={item.unitPrice}
                  onChange={(e) =>
                    handleItemChange(index, "unitPrice", e.target.value)
                  }
                />
                <TextField
                  label="ПДВ, %"
                  type="number"
                  fullWidth
                  inputProps={{ min: 0, step: "0.01" }}
                  InputLabelProps={{ shrink: true }}
                  value={item.taxRate}
                  onChange={(e) =>
                    handleItemChange(index, "taxRate", e.target.value)
                  }
                />
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 1,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveItem(index)}
                    disabled={invoiceForm.items.length === 1}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    Лінійна сума:{" "}
                    {formatMoney(
                      (parseFloat(item.quantity) || 0) *
                        (parseFloat(item.unitPrice) || 0),
                    )}{" "}
                    {invoiceForm.currency}
                  </Typography>
                </Box>

                <TextField
                  label="Опис"
                  fullWidth
                  multiline
                  minRows={2}
                  InputLabelProps={{ shrink: true }}
                  sx={{ gridColumn: { xs: "1 / -1", md: "1 / -1" } }}
                  value={item.description}
                  onChange={(e) =>
                    handleItemChange(index, "description", e.target.value)
                  }
                />
              </Box>
            ))}

            <Box>
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                size="small"
                onClick={handleAddItem}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                }}
              >
                Додати позицію
              </Button>
            </Box>
          </Box>

          {/* Підсумки */}
          <Box
            sx={{
              mt: 3,
              display: "flex",
              justifyContent: "space-between",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "flex-start", md: "center" },
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{ color: "#9ca3af", textTransform: "uppercase" }}
              >
                Підсумок
              </Typography>
              <Typography variant="body2" sx={{ color: "#6b7280" }}>
                Система автоматично рахує суму без ПДВ, податок та суму до
                оплати.
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 0.5,
              }}
            >
              <Typography variant="body2">
                Сума без ПДВ: {formatMoney(computedTotals.subtotal)}{" "}
                {invoiceForm.currency}
              </Typography>
              <Typography variant="body2">
                ПДВ: {formatMoney(computedTotals.taxAmount)}{" "}
                {invoiceForm.currency}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                До оплати: {formatMoney(computedTotals.total)}{" "}
                {invoiceForm.currency}
              </Typography>
            </Box>
          </Box>

          {/* Кнопки знизу, як у формі актів/клієнтів */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 4,
              gap: 2,
            }}
          >
            <Button
              onClick={handleCloseCreateDialog}
              sx={{ textTransform: "none", color: "#6b7280" }}
            >
              Скасувати
            </Button>

            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                textTransform: "none",
                borderRadius: 999,
                px: 3,
                bgcolor: "#111827",
                "&:hover": {
                  bgcolor: "#020617",
                },
              }}
            >
              Зберегти інвойс
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InvoicesPage;
