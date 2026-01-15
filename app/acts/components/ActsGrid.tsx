"use client";

import { Box, IconButton, InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import type { Act } from "../types";
import { formatMoney, formatPeriod } from "../utils";
import { ActStatusChip } from "./ActStatusChip";
import { ActPdfButton } from "./ActPdfButton";
import { ActDeleteButton } from "./ActDeleteButton";

export const ActsGrid = ({
  acts,
  onDelete,
  deleteBusyId,
}: {
  acts: Act[];
  onDelete: (id: string) => void;
  deleteBusyId: string | null;
}) => {
  const [query, setQuery] = useState("");

  // ✅ нормалізуємо дані в rows, щоб пошук був по всіх полях
  const rows = useMemo(() => {
    return acts.map((a) => {
      const clientName = (a as any)?.client?.name ?? "—";
      const invoiceNumber = (a as any)?.relatedInvoice?.number
        ? `№ ${(a as any).relatedInvoice.number}`
        : "—";
      const period = formatPeriod((a as any)?.periodFrom, (a as any)?.periodTo);
      const total = formatMoney((a as any)?.total, (a as any)?.currency);
      const status = String((a as any)?.status ?? "");

      return {
        ...a,
        clientName,
        invoiceNumber,
        period,
        totalFormatted: total,
        statusText: status,
      };
    });
  }, [acts]);

  // ✅ пошук по всіх колонках (по підготовлених полях)
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      const haystack = [
        r.number ?? "",
        r.clientName ?? "",
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
        flex: 1.5,
        minWidth: 160,
        // лишаємо твою логіку відображення
        valueGetter: (_, row) => row?.client?.name ?? "—",
        renderCell: (params) => params.row?.client?.name ?? "—",
      },
      {
        field: "relatedInvoice",
        headerName: "Інвойс",
        flex: 1,
        minWidth: 140,
        valueGetter: (_, row) =>
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
        valueGetter: (_, row) => formatPeriod(row?.periodFrom, row?.periodTo),
        renderCell: (params) =>
          formatPeriod(params.row?.periodFrom, params.row?.periodTo),
        sortable: false,
      },
      {
        field: "total",
        headerName: "Сума",
        flex: 1,
        minWidth: 140,
        valueGetter: (_, row) => formatMoney(row?.total, row?.currency),
        renderCell: (params) =>
          formatMoney(params.row?.total, params.row?.currency),
      },
      {
        field: "status",
        headerName: "Статус",
        flex: 0.8,
        minWidth: 120,
        renderCell: (params) => <ActStatusChip status={params.value} />,
      },
      {
        field: "actions",
        headerName: "",
        sortable: false,
        flex: 1,
        minWidth: 180,
        renderCell: (params) => (
          <ActPdfButton actId={params.row.id as string} />
        ),
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
            <ActDeleteButton disabled={busy} onClick={() => onDelete(id)} />
          );
        },
      },
    ],
    [onDelete, deleteBusyId],
  );

  return (
    <Box>
      {/* ✅ Search bar */}
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
