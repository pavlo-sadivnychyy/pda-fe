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

function getClientEmail(inv: Invoice, clients: Client[]) {
  // підлаштуй під свою модель:
  // якщо inv вже містить client -> беремо звідти
  const direct = (inv as any)?.client?.email;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const clientId = (inv as any)?.clientId;
  if (!clientId) return null;

  const found = clients.find((c) => c.id === clientId);
  const email = (found as any)?.email;

  return typeof email === "string" && email.trim() ? email.trim() : null;
}

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

  // ✅ було actionBusyId, стало actionBusyKey: `${id}:${action}`
  actionBusyKey: string | null;

  onDelete: (id: string) => void;
  deleteBusyId: string | null;
}) => {
  const rows = useMemo(
    () =>
      invoices.map((inv) => {
        const clientEmail = getClientEmail(inv, clients);

        return {
          id: inv.id,
          number: inv.number,
          clientName: getClientDisplayName(inv, clients),
          clientEmail, // ✅ NEW
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
        width: 260,
        renderCell: (params) => (
          <InvoicePdfButton
            invoiceId={params.row.id as string}
            hasPdf={params.row.hasPdf as boolean}
            hasInternationalPdf={params.row.hasInternationalPdf as boolean}
          />
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
          const status = params.row.status as InvoiceStatus;

          const busy = Boolean(actionBusyKey?.startsWith(`${id}:`));

          const hasClientEmail = Boolean(
            (params.row.clientEmail as string | null)?.trim?.(),
          );

          return (
            <InvoiceRowActions
              status={status}
              busy={busy}
              hasClientEmail={hasClientEmail} // ✅ NEW
              onAction={(a) => onAction(id, a)}
            />
          );
        },
      },
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
    [onAction, actionBusyKey, onDelete, deleteBusyId],
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
