"use client";

import { Box } from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridRowParams,
} from "@mui/x-data-grid";
import { useMemo } from "react";
import type { Client } from "../types";
import { formatDate } from "../utils";
import { ClientDeleteButton } from "./ClientDeleteButton";

export const ClientsGrid = ({
  clients,
  loading,
  onEdit,
  onDelete,
  deleteBusyId,
}: {
  clients: Client[];
  loading: boolean;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  deleteBusyId: string | null;
}) => {
  const rows = useMemo(
    () =>
      clients.map((c) => ({
        id: c.id,
        name: c.name,
        contactName: c.contactName || "",
        email: c.email || "",
        phone: c.phone || "",
        taxNumber: c.taxNumber || "",
        createdAt: formatDate(c.createdAt ?? null),
      })),
    [clients],
  );

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "name", headerName: "Назва клієнта", flex: 1.4, minWidth: 200 },
      {
        field: "contactName",
        headerName: "Контактна особа",
        flex: 1,
        minWidth: 180,
      },
      { field: "email", headerName: "Email", flex: 1, minWidth: 180 },
      { field: "phone", headerName: "Телефон", flex: 0.9, minWidth: 140 },
      {
        field: "taxNumber",
        headerName: "Податковий номер",
        flex: 0.9,
        minWidth: 160,
      },
      { field: "createdAt", headerName: "Створено", flex: 0.7, minWidth: 110 },

      // ✅ delete column at the end
      {
        field: "delete",
        headerName: "",
        sortable: false,
        filterable: false,
        width: 72,
        align: "right",
        headerAlign: "right",
        renderCell: (params) => {
          const id = params.row.id as string;
          const busy = deleteBusyId === id;
          return (
            <ClientDeleteButton disabled={busy} onClick={() => onDelete(id)} />
          );
        },
      },
    ],
    [onDelete, deleteBusyId],
  );

  const handleRowDoubleClick = (params: GridRowParams) => {
    const client = clients.find((c) => c.id === params.id);
    if (client) onEdit(client);
  };

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
        onRowDoubleClick={handleRowDoubleClick}
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
        }}
        localeText={{ noRowsLabel: "Клієнтів поки немає" }}
      />
    </Box>
  );
};
