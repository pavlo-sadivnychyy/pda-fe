"use client";

import { Box } from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import { useMemo } from "react";
import type { Client, Invoice, InvoiceStatus, InvoiceAction } from "../types";
import { formatDate, formatMoney, getClientDisplayName } from "../utils";
import { InvoiceStatusChip } from "./InvoiceStatusChip";
import { InvoicePdfButton } from "./InvoicePdfButton";
import { InvoiceRowActions } from "./InvoiceRowActions";
import { InvoiceDeleteButton } from "./InvoiceDeleteButton";

export const InvoicesGrid = ({
  invoices,
  clients,
  loading,
  onAction,
  actionBusyId,
  onDelete,
  deleteBusyId,
}: {
  invoices: Invoice[];
  clients: Client[];
  loading: boolean;
  onAction: (id: string, action: InvoiceAction) => void;
  actionBusyId: string | null;

  onDelete: (id: string) => void;
  deleteBusyId: string | null;
}) => {
  const rows = useMemo(
    () =>
      invoices.map((inv) => ({
        id: inv.id,
        number: inv.number,
        clientName: getClientDisplayName(inv, clients),
        issueDate: formatDate(inv.issueDate),
        dueDate: formatDate(inv.dueDate ?? null),
        total: `${formatMoney(inv.total)} ${inv.currency}`,
        status: inv.status,
        hasPdf: Boolean(inv.pdfDocumentId),
      })),
    [invoices, clients],
  );

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "number", headerName: "Номер", flex: 1, minWidth: 130 },
      { field: "clientName", headerName: "Клієнт", flex: 1.5, minWidth: 180 },
      { field: "issueDate", headerName: "Дата", flex: 0.8, minWidth: 120 },
      {
        field: "dueDate",
        headerName: "Термін оплати",
        flex: 0.9,
        minWidth: 140,
      },
      { field: "total", headerName: "Сума", flex: 0.9, minWidth: 130 },
      {
        field: "status",
        headerName: "Статус",
        flex: 0.8,
        minWidth: 130,
        renderCell: (params: GridRenderCellParams<InvoiceStatus>) => (
          <InvoiceStatusChip status={params.value as InvoiceStatus} />
        ),
      },
      {
        field: "pdf",
        headerName: "PDF",
        sortable: false,
        filterable: false,
        width: 160,
        renderCell: (params) => (
          <InvoicePdfButton
            invoiceId={params.row.id as string}
            hasPdf={params.row.hasPdf as boolean}
          />
        ),
      },
      {
        field: "actions",
        headerName: "",
        sortable: false,
        filterable: false,
        width: 300,
        renderCell: (params) => {
          const id = params.row.id as string;
          const status = params.row.status as InvoiceStatus;
          const busy = actionBusyId === id;

          return (
            <InvoiceRowActions
              status={status}
              busy={busy}
              onAction={(a) => onAction(id, a)}
            />
          );
        },
      },

      // ✅ NEW колонка видалення В КІНЦІ
      {
        field: "delete",
        headerName: "",
        sortable: false,
        filterable: false,
        width: 70,
        align: "right",
        headerAlign: "right",
        renderCell: (params) => {
          const id = params.row.id as string;
          const busy = deleteBusyId === id;

          return (
            <InvoiceDeleteButton disabled={busy} onClick={() => onDelete(id)} />
          );
        },
      },
    ],
    [onAction, actionBusyId, onDelete, deleteBusyId],
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
        localeText={{ noRowsLabel: "Інвойсів поки немає" }}
      />
    </Box>
  );
};
