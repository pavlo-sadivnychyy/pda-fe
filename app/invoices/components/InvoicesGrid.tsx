"use client";

import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Stack,
  Card,
  CardContent,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import { useMemo, useState } from "react";

import type { Client, Invoice, InvoiceStatus, InvoiceAction } from "../types";
import { formatDate, formatMoney, getClientDisplayName } from "../utils";

import { InvoiceStatusChip } from "./InvoiceStatusChip";
import { InvoicePdfButton } from "./InvoicePdfButton";
import { InvoiceRowActions } from "./InvoiceRowActions";
import { InvoiceDeleteButton } from "./InvoiceDeleteButton";

/* ---------------- helpers ---------------- */

function getClientEmail(inv: Invoice, clients: Client[]) {
  const direct = (inv as any)?.client?.email;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const clientId = (inv as any)?.clientId;
  if (!clientId) return null;

  const found = clients.find((c) => c.id === clientId);
  const email = (found as any)?.email;
  return typeof email === "string" && email.trim() ? email.trim() : null;
}

/* ---------------- mobile card ---------------- */

function InvoiceMobileCard({
  row,
  onAction,
  onDelete,
  actionBusyKey,
  deleteBusyId,
}: {
  row: any;
  onAction: (id: string, action: InvoiceAction) => void;
  onDelete: (id: string) => void;
  actionBusyKey: string | null;
  deleteBusyId: string | null;
}) {
  const id = row.id as string;
  const busyAction = Boolean(actionBusyKey?.startsWith(`${id}:`));
  const busyDelete = deleteBusyId === id;

  return (
    <Card sx={{ borderRadius: 3, mb: 2 }}>
      <CardContent sx={{ pb: 1.5 }}>
        <Stack spacing={1.2}>
          <Stack direction="row" justifyContent="space-between">
            <Typography sx={{ fontWeight: 800 }}>№ {row.number}</Typography>
            <InvoiceStatusChip status={row.status as InvoiceStatus} />
          </Stack>

          <Typography sx={{ color: "#475569" }}>{row.clientName}</Typography>

          {row.clientEmail && (
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              {row.clientEmail}
            </Typography>
          )}

          <Divider />

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2">Дата:</Typography>
            <Typography variant="body2">{row.issueDate}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2">Оплатити до:</Typography>
            <Typography variant="body2">{row.dueDate}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2">Сума:</Typography>
            <Typography sx={{ fontWeight: 700 }}>{row.total}</Typography>
          </Stack>

          <Divider />

          <InvoicePdfButton
            invoiceId={id}
            hasPdf={row.hasPdf}
            hasInternationalPdf={row.hasInternationalPdf}
          />

          <InvoiceRowActions
            status={row.status}
            busy={busyAction}
            hasClientEmail={Boolean(row.clientEmail)}
            onAction={(a) => onAction(id, a)}
          />

          <Box textAlign="right">
            <InvoiceDeleteButton
              disabled={busyDelete}
              onClick={() => onDelete(id)}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

/* ---------------- main ---------------- */

export const InvoicesGrid = ({
  invoices,
  clients,
  loading,
  onAction,
  actionBusyKey,
  onDelete,
  deleteBusyId,
}: {
  invoices: Invoice[];
  clients: Client[];
  loading: boolean;
  onAction: (id: string, action: InvoiceAction) => void;
  actionBusyKey: string | null;
  onDelete: (id: string) => void;
  deleteBusyId: string | null;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [query, setQuery] = useState("");

  const rows = useMemo(
    () =>
      invoices.map((inv) => {
        const clientEmail = getClientEmail(inv, clients);

        return {
          id: inv.id,
          number: inv.number,
          clientName: getClientDisplayName(inv, clients),
          clientEmail,
          issueDate: formatDate(inv.issueDate),
          dueDate: formatDate(inv.dueDate ?? null),
          total: `${formatMoney(inv.total)} ${inv.currency}`,
          status: inv.status,
          hasPdf: Boolean(inv.pdfDocumentId),
          hasInternationalPdf: Boolean(inv.pdfInternationalDocumentId),
        };
      }),
    [invoices, clients],
  );

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [
        r.number,
        r.clientName,
        r.clientEmail ?? "",
        r.issueDate,
        r.dueDate,
        r.total,
        r.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [rows, query]);

  /* ---------- Mobile ---------- */
  if (isMobile) {
    return (
      <Box>
        {/* search */}
        <Box sx={{ px: 1, pb: 1 }}>
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Пошук…"
            fullWidth
            size="small"
            sx={{
              bgcolor: "#fff",
              "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: query ? (
                <InputAdornment position="end">
                  <IconButton onClick={() => setQuery("")}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Box>

        {filteredRows.map((row) => (
          <InvoiceMobileCard
            key={row.id}
            row={row}
            onAction={onAction}
            onDelete={onDelete}
            actionBusyKey={actionBusyKey}
            deleteBusyId={deleteBusyId}
          />
        ))}

        {loading && (
          <Typography sx={{ textAlign: "center", mt: 2 }}>
            Завантаження...
          </Typography>
        )}
      </Box>
    );
  }

  /* ---------- Desktop ---------- */

  const columns: GridColDef[] = [
    { field: "number", headerName: "Номер", flex: 1, minWidth: 120 },
    { field: "clientName", headerName: "Клієнт", flex: 1.5, minWidth: 180 },
    { field: "issueDate", headerName: "Дата", minWidth: 120 },
    { field: "dueDate", headerName: "Термін", minWidth: 120 },
    { field: "total", headerName: "Сума", minWidth: 120 },
    {
      field: "status",
      headerName: "Статус",
      minWidth: 130,
      renderCell: (p: GridRenderCellParams<InvoiceStatus>) => (
        <InvoiceStatusChip status={p.value as InvoiceStatus} />
      ),
    },
    {
      field: "pdf",
      headerName: "PDF",
      sortable: false,
      width: 220,
      renderCell: (p) => (
        <InvoicePdfButton
          invoiceId={p.row.id}
          hasPdf={p.row.hasPdf}
          hasInternationalPdf={p.row.hasInternationalPdf}
        />
      ),
    },
    {
      field: "actions",
      headerName: "",
      sortable: false,
      width: 300,
      renderCell: (p) => {
        const id = p.row.id as string;
        const busy = Boolean(actionBusyKey?.startsWith(`${id}:`));
        return (
          <InvoiceRowActions
            status={p.row.status}
            busy={busy}
            hasClientEmail={Boolean(p.row.clientEmail)}
            onAction={(a) => onAction(id, a)}
          />
        );
      },
    },
    {
      field: "delete",
      headerName: "",
      sortable: false,
      width: 70,
      renderCell: (p) => (
        <InvoiceDeleteButton
          disabled={deleteBusyId === p.row.id}
          onClick={() => onDelete(p.row.id)}
        />
      ),
    },
  ];

  return (
    <Box
      sx={{
        "& .MuiDataGrid-root": { border: "none" },
      }}
    >
      {/* search */}
      <Box sx={{ px: 1.5, pt: 1, pb: 1 }}>
        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Пошук по інвойсах…"
          fullWidth
          size="small"
          sx={{
            bgcolor: "#fff",
            "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: query ? (
              <InputAdornment position="end">
                <IconButton onClick={() => setQuery("")}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
      </Box>

      <DataGrid
        rows={filteredRows}
        columns={columns}
        loading={loading}
        disableRowSelectionOnClick
        pageSizeOptions={[10]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
        }}
        localeText={{
          noRowsLabel: query.trim()
            ? "Нічого не знайдено"
            : "Інвойсів поки немає",
        }}
      />
    </Box>
  );
};
