"use client";

import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DownloadIcon from "@mui/icons-material/Download";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import { useCallback, useMemo, useState } from "react";

import * as XLSX from "xlsx";

import type { Quote, QuoteAction, QuoteStatus } from "../types";
import { mapToStatus, QuoteStatusChip } from "./QuoteStatusChip";
import { QuoteRowActions } from "./QuoteRowActions";
import dayjs from "dayjs";

type Row = {
  id: string;
  number: string;
  clientName: string;
  issueDate: string;
  validUntil: string;
  total: string;
  totalValue: number;
  currency: string;
  status: QuoteStatus;
  hasInvoice: boolean;
  invoiceId: string | null;

  // у тебе в rows фактично приходить quote з client усередині, тому не чіпаю
  client?: {
    contactName?: string | null;
    email?: string | null;
  } | null;
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeCsvCell(value: unknown) {
  const s = value == null ? "" : String(value);
  if (/[",\n\r;]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

function QuoteMobileCard({
  row,
  busy,
  onAction,
  onConvert,
  onDeleteRequest,
  hasClient,
  clientHasEmail,
}: {
  row: Row;
  busy: boolean;
  onAction: (id: string, action: QuoteAction) => void;
  onConvert: (id: string) => void;
  onDeleteRequest: (id: string, label?: string) => void;
  hasClient: boolean;
  clientHasEmail: boolean;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: "#e2e8f0",
        bgcolor: "#ffffff",
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1.2}>
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            gap={1}
          >
            <Box>
              <Typography
                sx={{ fontWeight: 900, color: "#0f172a", lineHeight: 1.2 }}
              >
                {row.number}
              </Typography>
              <Typography variant="body2" sx={{ color: "#475569", mt: 0.25 }}>
                {row?.client?.contactName || "--"}
              </Typography>
            </Box>

            <Box sx={{ flexShrink: 0 }}>
              <QuoteStatusChip status={row.status} />
            </Box>
          </Stack>

          <Divider sx={{ borderColor: "#eef2f7" }} />

          <Stack direction="row" gap={"5px"} flexWrap="wrap">
            <Chip
              size="small"
              label={`Дата: ${row.issueDate ? dayjs(row.issueDate).format("DD.MM.YYYY") : "--"}`}
              sx={{
                bgcolor: "#f8fafc",
                border: "1px solid #e2e8f0",
                fontWeight: 700,
              }}
            />
            <Chip
              size="small"
              label={`Дійсний до: ${row.validUntil ? dayjs(row.validUntil).format("DD.MM.YYYY") : "--"}`}
              sx={{
                bgcolor: "#f8fafc",
                border: "1px solid #e2e8f0",
                fontWeight: 700,
              }}
            />
            <Chip
              size="small"
              label={`Сума: ${row.total}`}
              sx={{
                bgcolor: "#0f172a",
                color: "white",
                fontWeight: 900,
              }}
            />
          </Stack>

          <Box sx={{ pt: 0.5 }}>
            <QuoteRowActions
              status={row.status}
              busy={busy}
              hasInvoice={row.hasInvoice}
              onAction={(a) => onAction(row.id, a)}
              onConvert={() => onConvert(row.id)}
              onDelete={() => onDeleteRequest(row.id, row.number)}
              hasClient={hasClient}
              clientHasEmail={clientHasEmail}
            />
          </Box>

          {row.invoiceId ? (
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <IconButton
                aria-label="open invoice"
                size="small"
                onClick={() =>
                  window.open(
                    `/api/pdf/invoices/${row.invoiceId}`,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
                sx={{
                  borderRadius: 2,
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

export const QuotesGrid = ({
  quotes,
  loading,
  onAction,
  onConvert,
  onDeleteRequest,
  actionBusyId,
  disbaleExport,
}: {
  quotes: Quote[];
  loading: boolean;
  onAction: (id: string, action: QuoteAction) => void;
  onConvert: (id: string) => void;
  onDeleteRequest: (id: string, label?: string) => void;
  actionBusyId: string | null;
  disbaleExport: boolean;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [query, setQuery] = useState("");

  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const exportMenuOpen = Boolean(exportAnchorEl);
  const openExportMenu = (e: React.MouseEvent<HTMLElement>) =>
    setExportAnchorEl(e.currentTarget);
  const closeExportMenu = () => setExportAnchorEl(null);

  const rows: Row[] = quotes as any;

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      const haystack = [
        r.number,
        r?.client?.contactName,
        r.issueDate ? dayjs(r.issueDate).format("DD.MM.YYYY") : "",
        r.validUntil ? dayjs(r.validUntil).format("DD.MM.YYYY") : "",
        r.total,
        mapToStatus(r.status).label,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [rows, query]);

  const getExportData = useCallback(() => {
    return filteredRows.map((r) => ({
      ID: r.id,
      Номер: r.number,
      Клієнт: r.client?.contactName || "--",
      Дата: r.issueDate ? dayjs(r.issueDate).format("DD.MM.YYYY") : "--",
      "Дійсний до": r.validUntil
        ? dayjs(r.validUntil).format("DD.MM.YYYY")
        : "--",
      Сума: r.total || 0,
      Валюта: r.currency,
      Статус: mapToStatus(r.status).label,
      "Конвертовано в інвойс": r.hasInvoice ? "Так" : "Ні",
      "Invoice ID": r.invoiceId ?? "",
    }));
  }, [filteredRows]);

  const exportCsv = useCallback(() => {
    const data = getExportData();
    if (!data.length) {
      closeExportMenu();
      return;
    }

    const headers = Object.keys(data[0]);
    const sep = ";";

    const lines = [
      headers.map(escapeCsvCell).join(sep),
      ...data.map((row) =>
        headers.map((h) => escapeCsvCell((row as any)[h])).join(sep),
      ),
    ];

    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const filename = `quotes_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadBlob(blob, filename);

    closeExportMenu();
  }, [getExportData]);

  const exportXlsx = useCallback(() => {
    const data = getExportData();
    if (!data.length) {
      closeExportMenu();
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Quotes");

    const filename = `quotes_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);

    closeExportMenu();
  }, [getExportData]);

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "number", headerName: "Номер", flex: 1, minWidth: 130 },
      {
        field: "clientName",
        headerName: "Клієнт",
        flex: 1.5,
        minWidth: 180,
        valueGetter: (_, row) => row?.client?.contactName ?? "--",
        renderCell: (params) => (
          <>{(params as any)?.row?.client?.contactName || "--"}</>
        ),
      },
      {
        field: "issueDate",
        headerName: "Дата",
        flex: 0.8,
        minWidth: 120,
        renderCell: (params) => (
          <>{dayjs((params as any)?.row?.issueDate).format("DD.MM.YYYY")}</>
        ),
      },
      {
        field: "validUntil",
        headerName: "Дійсний до",
        flex: 0.9,
        minWidth: 140,
        renderCell: (params) => (
          <>
            {(params as any)?.row?.validUntil
              ? dayjs((params as any)?.row?.validUntil).format("DD.MM.YYYY")
              : "--"}
          </>
        ),
      },
      { field: "total", headerName: "Сума", flex: 0.9, minWidth: 130 },
      {
        field: "status",
        headerName: "Статус",
        flex: 0.9,
        minWidth: 150,
        valueGetter: (_, row) => mapToStatus(row?.status).label,
        renderCell: (params: GridRenderCellParams<QuoteStatus>) => {
          return (
            <QuoteStatusChip
              status={(params as any)?.row?.status as QuoteStatus}
            />
          );
        },
      },
      {
        field: "actions",
        headerName: "Дії",
        sortable: false,
        filterable: false,
        flex: 1.2,
        minWidth: 320,
        renderCell: (params) => {
          const id = (params as any).row.id as string;
          const status = (params as any).row.status as QuoteStatus;
          const busy = actionBusyId === id;
          const hasInvoice = (params as any).row.hasInvoice as boolean;

          const hasClient = Boolean((params as any).row.client?.contactName);
          const clientHasEmail = Boolean((params as any).row.client?.email);

          const number = (params as any).row.number as string | undefined;

          return (
            <QuoteRowActions
              hasClient={hasClient}
              clientHasEmail={clientHasEmail}
              status={status}
              busy={busy}
              hasInvoice={hasInvoice}
              onAction={(a) => onAction(id, a)}
              onConvert={() => onConvert(id)}
              onDelete={() => onDeleteRequest(id, number)}
            />
          );
        },
      },
    ],
    [onAction, onConvert, onDeleteRequest, actionBusyId],
  );

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        "& .MuiDataGrid-root": { border: "none" },
        "& .MuiDataGrid-columnHeaders": {
          bgcolor: "#f9fafb",
          borderBottom: "1px solid #e2e8f0",
        },
        "& .MuiDataGrid-row:hover": { bgcolor: "rgba(15,23,42,0.02)" },
        "& .MuiDataGrid-cell": { borderBottom: "1px solid #f1f5f9" },
      }}
    >
      {/* Search + Export */}
      <Box
        sx={{
          px: 1.5,
          pt: 1.25,
          pb: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Пошук… (номер, клієнт, статус, сума, дата)"
            fullWidth
            size="small"
            sx={{
              bgcolor: "#fff",
              "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#64748b" }} fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: query ? (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="clear search"
                    size="small"
                    onClick={() => setQuery("")}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Box>

        {!isMobile && !disbaleExport && (
          <>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={openExportMenu}
              disabled={loading || filteredRows.length === 0}
              sx={{
                flexShrink: 0,
                flexGrow: 1,
                maxWidth: "150px",
                whiteSpace: "nowrap",
                color: "black",
                borderColor: "black",
              }}
            >
              Експорт
            </Button>

            <Menu
              anchorEl={exportAnchorEl}
              open={exportMenuOpen}
              onClose={closeExportMenu}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={exportCsv}>CSV</MenuItem>
              <MenuItem onClick={exportXlsx}>Excel (.xlsx)</MenuItem>
            </Menu>
          </>
        )}
      </Box>

      {/* MOBILE */}
      {isMobile ? (
        <Box sx={{ px: 1.5, pb: 1.5 }}>
          {filteredRows.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center", color: "#64748b" }}>
              <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
                {query.trim()
                  ? "Нічого не знайдено за вашим запитом"
                  : "Quote поки немає"}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Спробуйте змінити запит або створіть першу пропозицію.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {filteredRows.map((row) => (
                <QuoteMobileCard
                  key={row.id}
                  row={row}
                  busy={actionBusyId === row.id}
                  onAction={onAction}
                  onConvert={onConvert}
                  onDeleteRequest={onDeleteRequest}
                  hasClient={Boolean(row?.client?.contactName)}
                  clientHasEmail={Boolean(row?.client?.email)}
                />
              ))}
            </Stack>
          )}
        </Box>
      ) : (
        /* DESKTOP */
        <Box sx={{ flex: 1, height: { xs: "auto", md: "100%" } }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } },
            }}
            localeText={{
              noRowsLabel: query.trim()
                ? "Нічого не знайдено за вашим запитом"
                : "Quote поки немає",
            }}
            sx={{
              height: "100%",
              "& .MuiDataGrid-virtualScroller": {
                overflowY: "auto",
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};
