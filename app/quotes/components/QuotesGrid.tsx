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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
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

type Row = {
  id: string;
  number: string;
  clientName: string;
  issueDate: string;
  validUntil: string;
  total: string;
  status: QuoteStatus;
  hasInvoice: boolean;
  invoiceId: string | null;
};

function QuoteMobileCard({
  row,
  busy,
  onAction,
  onConvert,
}: {
  row: Row;
  busy: boolean;
  onAction: (id: string, action: QuoteAction) => void;
  onConvert: (id: string) => void;
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
                {row.clientName}
              </Typography>
            </Box>

            <Box sx={{ flexShrink: 0 }}>
              <QuoteStatusChip status={row.status} />
            </Box>
          </Stack>

          <Divider sx={{ borderColor: "#eef2f7" }} />

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              size="small"
              label={`Дата: ${row.issueDate}`}
              sx={{
                bgcolor: "#f8fafc",
                border: "1px solid #e2e8f0",
                fontWeight: 700,
              }}
            />
            <Chip
              size="small"
              label={`Дійсний до: ${row.validUntil}`}
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [query, setQuery] = useState("");

  const rows: Row[] = useMemo(
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
        minWidth: 300,
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
      {/* Search */}
      <Box sx={{ px: 1.5, pt: 1.25, pb: 1 }}>
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

      {/* ✅ MOBILE: cards + page scroll */}
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
                />
              ))}
            </Stack>
          )}
        </Box>
      ) : (
        /* ✅ DESKTOP: internal scroll table */
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
