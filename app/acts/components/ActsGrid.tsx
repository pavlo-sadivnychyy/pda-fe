"use client";

import { Box, IconButton, InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import type { Act } from "../types";
import { formatMoney, formatPeriod } from "../utils";
import { ActStatusChip } from "./ActStatusChip";
import { ActRowActions } from "./ActRowActions";

export const ActsGrid = ({
  acts,
  onDelete,
  deleteBusyId,
  onSend,
  sendBusyId,
}: {
  acts: Act[];
  onDelete: (id: string) => void;
  deleteBusyId: string | null;
  onSend: (id: string) => Promise<void> | void;
  sendBusyId: string | null;
}) => {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    return acts.map((a) => {
      const clientName = (a as any)?.client?.name ?? "—";
      const clientEmail = (a as any)?.client?.email ?? null;
      const invoiceNumber = (a as any)?.relatedInvoice?.number
        ? `№ ${(a as any).relatedInvoice.number}`
        : "—";
      const period = formatPeriod((a as any)?.periodFrom, (a as any)?.periodTo);
      const total = formatMoney((a as any)?.total, (a as any)?.currency);
      const status = String((a as any)?.status ?? "");

      return {
        ...a,
        clientName,
        clientEmail,
        invoiceNumber,
        period,
        totalFormatted: total,
        statusText: status,
      };
    });
  }, [acts]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r: any) => {
      const haystack = [
        r.number ?? "",
        r.clientName ?? "",
        r.clientEmail ?? "",
        r.invoiceNumber ?? "",
        r.period ?? "",
        r.totalFormatted ?? "",
        r.statusText ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [rows, query]);

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "number", headerName: "№ акта", flex: 1, minWidth: 120 },
      {
        field: "client",
        headerName: "Клієнт",
        flex: 1.6,
        minWidth: 180,
        valueGetter: (_, row: any) => row?.client?.name ?? "—",
        renderCell: (params) => params.row?.client?.name ?? "—",
      },
      {
        field: "relatedInvoice",
        headerName: "Інвойс",
        flex: 1,
        minWidth: 140,
        valueGetter: (_, row: any) =>
          row?.relatedInvoice?.number ? `№ ${row.relatedInvoice.number}` : "—",
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
        valueGetter: (_, row: any) =>
          formatPeriod(row?.periodFrom, row?.periodTo),
        renderCell: (params) =>
          formatPeriod(params.row?.periodFrom, params.row?.periodTo),
        sortable: false,
      },
      {
        field: "total",
        headerName: "Сума",
        flex: 1,
        minWidth: 140,
        valueGetter: (_, row: any) => formatMoney(row?.total, row?.currency),
        renderCell: (params) =>
          formatMoney(params.row?.total, params.row?.currency),
      },
      {
        field: "status",
        headerName: "Статус",
        flex: 0.9,
        minWidth: 130,
        renderCell: (params) => <ActStatusChip status={params.value} />,
      },
      {
        field: "actions",
        headerName: "Дії",
        sortable: false,
        filterable: false,
        flex: 1.3,
        minWidth: 220,
        renderCell: (params) => {
          const id = params.row.id as string;
          const busyDelete = deleteBusyId === id;
          const busySend = sendBusyId === id;

          return (
            <ActRowActions
              act={params.row}
              onOpenPdf={() => {
                window.open(
                  `/api/pdf/acts/${id}`,
                  "_blank",
                  "noopener,noreferrer",
                );
              }}
              onSend={() => onSend(id)}
              onDelete={() => onDelete(id)}
              busyDelete={busyDelete}
              busySend={busySend}
            />
          );
        },
      },
    ],
    [onDelete, deleteBusyId, onSend, sendBusyId],
  );

  return (
    <Box>
      <Box sx={{ px: 1.5, pt: 1.25, pb: 1 }}>
        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Пошук по актах… (номер, клієнт, інвойс, період, сума, статус)"
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
        rows={filteredRows}
        columns={columns}
        getRowId={(row) => row.id}
        disableRowSelectionOnClick
        localeText={{
          noRowsLabel: query.trim()
            ? "Нічого не знайдено за вашим запитом"
            : "Актів поки немає",
        }}
        sx={{
          border: "none",
          "& .MuiDataGrid-columnHeaders": { bgcolor: "#f9fafb" },
        }}
      />
    </Box>
  );
};
