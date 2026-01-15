"use client";

import { Box, IconButton, InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import type { Client, Quote, QuoteAction, QuoteStatus } from "../types";
import { formatDate, formatMoney, getClientDisplayName } from "../utils";
import { QuoteStatusChip } from "./QuoteStatusChip";
import { QuoteRowActions } from "./QuoteRowActions";

export const QuotesGrid = ({
  quotes,
  clients,
  loading,
  onAction,
  onConvert,
  actionBusyId,
}: {
  quotes: Quote[];
  clients: Client[];
  loading: boolean;
  onAction: (id: string, action: QuoteAction) => void;
  onConvert: (id: string) => void;
  actionBusyId: string | null;
}) => {
  const [query, setQuery] = useState("");

  const rows = useMemo(
    () =>
      quotes.map((q) => ({
        id: q.id,
        number: q.number,
        clientName: getClientDisplayName(q, clients),
        issueDate: formatDate(q.issueDate),
        validUntil: formatDate(q.validUntil ?? null),
        total: `${formatMoney(q.total)} ${q.currency}`,
        status: q.status,
        hasInvoice: Boolean(q.convertedInvoiceId),
        invoiceId: q.convertedInvoiceId ?? null,
      })),
    [quotes, clients],
  );

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      const haystack = [
        r.number,
        r.clientName,
        r.issueDate,
        r.validUntil,
        r.total,
        String(r.status ?? ""),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [rows, query]);

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "number", headerName: "Номер", flex: 1, minWidth: 130 },
      { field: "clientName", headerName: "Клієнт", flex: 1.5, minWidth: 180 },
      { field: "issueDate", headerName: "Дата", flex: 0.8, minWidth: 120 },
      {
        field: "validUntil",
        headerName: "Дійсний до",
        flex: 0.9,
        minWidth: 140,
      },
      { field: "total", headerName: "Сума", flex: 0.9, minWidth: 130 },
      {
        field: "status",
        headerName: "Статус",
        flex: 0.9,
        minWidth: 150,
        renderCell: (params: GridRenderCellParams<QuoteStatus>) => (
          <QuoteStatusChip status={params.value as QuoteStatus} />
        ),
      },
      {
        field: "actions",
        headerName: "Дії",
        sortable: false,
        filterable: false,
        flex: 1.2,
        minWidth: 240,
        renderCell: (params) => {
          const id = params.row.id as string;
          const status = params.row.status as QuoteStatus;
          const busy = actionBusyId === id;
          const hasInvoice = params.row.hasInvoice as boolean;

          return (
            <QuoteRowActions
              status={status}
              busy={busy}
              hasInvoice={hasInvoice}
              onAction={(a) => onAction(id, a)}
              onConvert={() => onConvert(id)}
            />
          );
        },
      },
    ],
    [onAction, onConvert, actionBusyId],
  );

  return (
    <Box
      sx={{
        "& .MuiDataGrid-root": { border: "none" },
        "& .MuiDataGrid-columnHeaders": {
          bgcolor: "#f9fafb",
          borderBottom: "1px solid #e2e8f0",
        },
        "& .MuiDataGrid-row:hover": { bgcolor: "rgba(15,23,42,0.02)" },
        "& .MuiDataGrid-cell": { borderBottom: "1px solid #f1f5f9" },
      }}
    >
      <Box sx={{ px: 1.5, pt: 1.25, pb: 1 }}>
        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Пошук по пропозиціях… (номер, клієнт, статус, сума, дата)"
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

      <DataGrid
        autoHeight
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
      />
    </Box>
  );
};
