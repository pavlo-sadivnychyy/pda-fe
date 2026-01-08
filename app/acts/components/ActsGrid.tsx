"use client";

import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useMemo } from "react";
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
  const columns: GridColDef[] = useMemo(
    () => [
      { field: "number", headerName: "№ акта", flex: 1, minWidth: 120 },
      {
        field: "client",
        headerName: "Клієнт",
        flex: 1.5,
        minWidth: 160,
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
    <DataGrid
      rows={acts}
      columns={columns}
      getRowId={(row) => row.id}
      disableRowSelectionOnClick
      sx={{
        border: "none",
        "& .MuiDataGrid-columnHeaders": { bgcolor: "#f9fafb" },
      }}
    />
  );
};
