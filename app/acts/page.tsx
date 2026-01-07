"use client";

import { useState, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  MenuItem,
  TextField,
  Typography,
  Chip,
  Stack,
  CircularProgress,
  DialogContent,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

import { useCurrentUser } from "@/hooksNew/useAppBootstrap";
import { useOrganization } from "@/hooksNew/useAllUserOrganizations";
import { api } from "@/libs/axios";

type ActStatus = "DRAFT" | "SENT" | "SIGNED" | "CANCELLED";

type Client = {
  id: string;
  name: string;
  contactName?: string | null;
};

type Invoice = {
  id: string;
  number: string;
  issueDate: string;
  client?: Client | null;
  total: string;
  currency: string;
};

type Act = {
  id: string;
  organizationId: string;
  clientId: string;
  createdById: string;
  number: string;
  title?: string | null;
  periodFrom?: string | null;
  periodTo?: string | null;
  total: string;
  currency: string;
  status: ActStatus;
  notes?: string | null;
  relatedInvoiceId?: string | null;
  client?: Client | null;
  relatedInvoice?: Invoice | null;
  createdAt: string;
};

type ActsListResponse = {
  items: Act[];
};

type InvoicesListResponse = {
  items: Invoice[];
};

type CreateActFromInvoicePayload = {
  invoiceId: string;
  number: string;
  title?: string;
  periodFrom?: string;
  periodTo?: string;
  notes?: string;
  createdById: string;
};

const formatMoney = (value: string | number, currency: string) => {
  const num = Number(value);
  const rounded = Math.round(num * 100) / 100;
  return `${rounded.toLocaleString("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
};

const statusChipColor = (status: ActStatus) => {
  switch (status) {
    case "SIGNED":
      return {
        bg: "#ecfdf3",
        color: "#16a34a",
      };
    case "SENT":
      return {
        bg: "#eff6ff",
        color: "#2563eb",
      };
    case "CANCELLED":
      return {
        bg: "#fef2f2",
        color: "#b91c1c",
      };
    default:
      return {
        bg: "#f3f4f6",
        color: "#4b5563",
      };
  }
};

const getApiBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const ActsPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: userData } = useCurrentUser();
  const currentUserId = (userData as any)?.id ?? null;

  const { data: orgData } = useOrganization(currentUserId || undefined);
  const ORGANIZATION_ID =
    (orgData as any)?.items?.[0]?.organizationId ??
    (orgData as any)?.items?.[0]?.organization?.id ??
    undefined;

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");
  const [actTitle, setActTitle] = useState<string>("");
  const [actNumber, setActNumber] = useState<string>("");
  const [periodFrom, setPeriodFrom] = useState<string>("");
  const [periodTo, setPeriodTo] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // ===== Fetch acts =====
  const {
    data: actsResponse,
    isLoading: isActsLoading,
    isFetching: isActsFetching,
  } = useQuery<ActsListResponse>({
    queryKey: ["acts", ORGANIZATION_ID],
    enabled: !!ORGANIZATION_ID,
    queryFn: async () => {
      const res = await api.get<ActsListResponse>("/acts", {
        params: { organizationId: ORGANIZATION_ID },
      });
      return res.data;
    },
  });

  const acts = actsResponse?.items ?? [];

  // ===== Fetch invoices (для створення акта) =====
  const {
    data: invoicesResponse,
    isLoading: isInvoicesLoading,
    isFetching: isInvoicesFetching,
  } = useQuery<InvoicesListResponse>({
    queryKey: ["invoices", ORGANIZATION_ID, "for-act"],
    enabled: !!ORGANIZATION_ID && createDialogOpen,
    queryFn: async () => {
      const res = await api.get<InvoicesListResponse>("/invoices", {
        params: { organizationId: ORGANIZATION_ID },
      });
      return res.data;
    },
  });

  const invoices = invoicesResponse?.invoices ?? [];

  const handleOpenCreateDialog = () => {
    setSelectedInvoiceId("");
    setActTitle("");
    setActNumber("");
    setPeriodFrom("");
    setPeriodTo("");
    setNotes("");
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  // Автопідстановка номера акта при виборі інвойса
  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    const invoice = invoices.find((i) => i.id === invoiceId);
    if (invoice && !actNumber) {
      setActNumber(`ACT-${invoice.number}`);
    }
    if (invoice && !actTitle) {
      setActTitle(`Акт за інвойсом №${invoice.number}`);
    }
  };

  // ===== Create act mutation =====
  const createActMutation = useMutation({
    mutationFn: async () => {
      if (!currentUserId) {
        throw new Error("Немає currentUserId");
      }
      if (!selectedInvoiceId) {
        throw new Error("Оберіть інвойс");
      }
      if (!actNumber.trim()) {
        throw new Error("Вкажіть номер акта");
      }

      const payload: CreateActFromInvoicePayload = {
        invoiceId: selectedInvoiceId,
        number: actNumber.trim(),
        createdById: currentUserId,
      };

      if (actTitle.trim()) payload.title = actTitle.trim();
      if (periodFrom) payload.periodFrom = periodFrom;
      if (periodTo) payload.periodTo = periodTo;
      if (notes) payload.notes = notes;

      const res = await api.post<{ act: Act }>("/acts/from-invoice", payload);
      return res.data.act;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["acts", ORGANIZATION_ID],
      });
      setCreateDialogOpen(false);
    },
  });

  const isCreatingAct = createActMutation.isLoading;

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "number",
        headerName: "№ акта",
        flex: 1,
        minWidth: 120,
      },
      {
        field: "client",
        headerName: "Клієнт",
        flex: 1.5,
        minWidth: 160,
        valueGetter: (params) => params.row?.client?.contactName ?? "—",
        renderCell: (params) => params.row?.client?.contactName,
      },
      {
        field: "relatedInvoice",
        headerName: "Інвойс",
        flex: 1,
        minWidth: 140,
        valueGetter: (params) =>
          params.row?.relatedInvoice?.number
            ? `№ ${params.row.relatedInvoice.number}`
            : "—",
        renderCell: (params) =>
          params.row?.relatedInvoice?.number
            ? `№ ${params.row.relatedInvoice.number}`
            : "—",
      },
      {
        field: "period",
        headerName: "Період",
        flex: 1.2,
        minWidth: 160,
        valueGetter: (params) => {
          const from = params?.row?.periodFrom
            ? dayjs(params.row?.periodFrom).format("DD.MM.YYYY")
            : null;
          const to = params?.row?.periodTo
            ? dayjs(params?.row?.periodTo).format("DD.MM.YYYY")
            : null;

          if (from && to) return `${from} — ${to}`;
          if (from) return `з ${from}`;
          if (to) return `по ${to}`;
          return "—";
        },
        renderCell: (params) => {
          const from = params?.row?.periodFrom
            ? dayjs(params.row?.periodFrom).format("DD.MM.YYYY")
            : null;
          const to = params?.row?.periodTo
            ? dayjs(params?.row?.periodTo).format("DD.MM.YYYY")
            : null;

          if (from && to) return `${from} — ${to}`;
          if (from) return `з ${from}`;
          if (to) return `по ${to}`;
          return "—";
        },
      },
      {
        field: "total",
        headerName: "Сума",
        flex: 1,
        minWidth: 140,
        valueGetter: (params) =>
          formatMoney(params.row?.total, params.row?.currency),
        renderCell: (params) =>
          formatMoney(params.row?.total, params.row?.currency),
      },
      {
        field: "status",
        headerName: "Статус",
        flex: 0.8,
        minWidth: 120,
        renderCell: (params) => {
          const status: ActStatus = params.value;
          const { bg, color } = statusChipColor(status);

          const labelMap: Record<ActStatus, string> = {
            DRAFT: "Чернетка",
            SENT: "Надіслано",
            SIGNED: "Підписано",
            CANCELLED: "Скасовано",
          };

          return (
            <Stack
              direction="row"
              spacing={1}
              height={"100%"}
              alignItems={"center"}
            >
              <Chip
                label={labelMap[status] ?? status}
                size="small"
                sx={{
                  bgcolor: bg,
                  color,
                  fontWeight: 500,
                }}
              />
            </Stack>
          );
        },
      },
      {
        field: "actions",
        headerName: "",
        sortable: false,
        flex: 1,
        minWidth: 160,
        renderCell: (params) => {
          const actId = params.row.id as string;

          const handleDownload = () => {
            const baseUrl = getApiBaseUrl();
            const url = `${baseUrl}/acts/${actId}/pdf`;
            window.open(url, "_blank");
          };

          return (
            <Stack
              direction="row"
              spacing={1}
              height={"100%"}
              alignItems={"center"}
            >
              <Button
                size="small"
                variant="outlined"
                sx={{
                  textTransform: "none",
                  fontSize: 12,
                  borderRadius: 999,
                  px: 2,
                  py: 0.5,
                  minWidth: 0,
                  bgcolor: "#111827",
                  color: "#f9fafb",
                  borderColor: "#111827",
                  "&:hover": {
                    bgcolor: "#020617",
                    borderColor: "#020617",
                  },
                }}
                onClick={handleDownload}
              >
                Переглянути PDF
              </Button>
            </Stack>
          );
        },
      },
    ],
    [router],
  );

  const isTableLoading = isActsLoading || isActsFetching;

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
        {/* Чіп секції */}

        <Card
          elevation={4}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <CardHeader
            title={
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#020617" }}
                  >
                    Акти наданих послуг
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#6b7280", maxWidth: 520 }}
                  >
                    Тут зберігаються акти, які ти формуєш на основі інвойсів.
                    Звідси можна скачати PDF або перейти до повʼязаного рахунку.
                  </Typography>
                </Box>

                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={1}
                  alignItems={{ xs: "stretch", md: "center" }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#6b7280",
                      textAlign: { xs: "left", md: "right" },
                    }}
                  >
                    {!ORGANIZATION_ID
                      ? "Спочатку створіть або виберіть організацію."
                      : `Знайдено актів: ${acts.length}`}
                  </Typography>

                  <Button
                    variant="contained"
                    disabled={!ORGANIZATION_ID}
                    onClick={handleOpenCreateDialog}
                    sx={{
                      textTransform: "none",
                      borderRadius: 999,
                      bgcolor: "#111827",
                      "&:hover": {
                        bgcolor: "#020617",
                      },
                    }}
                  >
                    Створити акт
                  </Button>
                </Stack>
              </Box>
            }
          />
          <CardContent sx={{ pt: 0 }}>
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
                    disabled={!ORGANIZATION_ID}
                    onClick={handleOpenCreateDialog}
                    sx={{
                      mt: 1,
                      textTransform: "none",
                      borderRadius: 999,
                      bgcolor: "#111827",
                      "&:hover": {
                        bgcolor: "#020617",
                      },
                    }}
                  >
                    Створити акт
                  </Button>
                </Box>
              ) : (
                <DataGrid
                  rows={acts}
                  columns={columns}
                  getRowId={(row) => row.id}
                  disableRowSelectionOnClick
                  sx={{
                    border: "none",
                    "& .MuiDataGrid-columnHeaders": {
                      bgcolor: "#f9fafb",
                    },
                  }}
                />
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Діалог створення акта у стилі форми з фото */}
        <Dialog
          open={createDialogOpen}
          onClose={handleCloseCreateDialog}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 4,
              padding: 0,
            },
          }}
        >
          <DialogContent
            sx={{
              padding: "24px",
            }}
          >
            {/* Верхній чіп, як "KNOWLEDGE BASE" */}
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
                АКТИ
              </Typography>
            </Box>

            {/* Заголовок та опис */}
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, mb: 0.5, color: "#020617" }}
            >
              Створити акт наданих послуг
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#6b7280", mb: 3, maxWidth: 520 }}
            >
              Обери інвойс, додай назву, номер, період та нотатки — асистент
              використає ці дані для формування документа та PDF.
            </Typography>

            <Stack spacing={2.5}>
              {/* Назва акта (аналог "Назва документа") */}
              <TextField
                label="Назва акта"
                placeholder="Наприклад: Акт за січень для клієнта ABC"
                value={actTitle}
                onChange={(e) => setActTitle(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: !!actTitle }}
              />

              {/* Інвойс */}
              <TextField
                select
                label="Інвойс"
                value={selectedInvoiceId}
                onChange={(e) => handleSelectInvoice(e.target.value)}
                fullWidth
                disabled={isInvoicesLoading || isInvoicesFetching}
                helperText="Оберіть рахунок, на основі якого буде створено акт"
                InputLabelProps={{ shrink: true }}
              >
                {isInvoicesLoading || isInvoicesFetching ? (
                  <MenuItem value="">
                    <em>Завантаження інвойсів...</em>
                  </MenuItem>
                ) : invoices.length === 0 ? (
                  <MenuItem value="">
                    <em>Немає інвойсів для вибору</em>
                  </MenuItem>
                ) : (
                  invoices.map((inv) => (
                    <MenuItem key={inv.id} value={inv.id}>
                      № {inv.number} — {inv.client?.name ?? "Без клієнта"} (
                      {dayjs(inv.issueDate).format("DD.MM.YYYY")})
                    </MenuItem>
                  ))
                )}
              </TextField>

              {/* Номер акта */}
              <TextField
                label="Номер акта"
                value={actNumber}
                onChange={(e) => setActNumber(e.target.value)}
                fullWidth
                placeholder="Наприклад: ACT-001"
                helperText="Можеш залишити автозаповнений номер або змінити на свій формат"
                InputLabelProps={{ shrink: true }}
              />

              {/* Період з / по */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Період з"
                  type="date"
                  value={periodFrom}
                  onChange={(e) => setPeriodFrom(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Період по"
                  type="date"
                  value={periodTo}
                  onChange={(e) => setPeriodTo(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              {/* Нотатки (як опис) */}
              <TextField
                label="Нотатки (опціонально)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                minRows={3}
                placeholder="Додай додаткові деталі, які будуть корисні в документі"
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            {/* Кнопки внизу, як на формі з фото */}
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
                onClick={() => createActMutation.mutate()}
                disabled={
                  isCreatingAct ||
                  !selectedInvoiceId ||
                  !actNumber.trim() ||
                  !currentUserId
                }
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
                {isCreatingAct ? "Створюємо..." : "Створити акт"}
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ActsPage;
