"use client";

import { Box } from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import { useMemo } from "react";
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
        flex: 0.8,
        minWidth: 150,
        renderCell: (params: GridRenderCellParams<QuoteStatus>) => (
          <QuoteStatusChip status={params.value as QuoteStatus} />
        ),
      },
      {
        field: "actions",
        headerName: "",
        sortable: false,
        filterable: false,
        width: 360,
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
      <DataGrid
        autoHeight
        rows={rows}
        columns={columns}
        loading={loading}
        disableRowSelectionOnClick
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
        }}
        localeText={{ noRowsLabel: "Quote поки немає" }}
      />
    </Box>
  );
};
