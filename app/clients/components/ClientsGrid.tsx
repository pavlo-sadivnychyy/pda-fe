"use client";

import { Box, InputAdornment, TextField, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import {
  DataGrid,
  type GridColDef,
  type GridRowParams,
} from "@mui/x-data-grid";
import { useMemo, useState } from "react";
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
  const [query, setQuery] = useState("");

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

  // ✅ пошук по всіх колонках
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      // зливаємо всі поля рядка (крім id) в один текст і шукаємо входження
      const haystack = [
        r.name,
        r.contactName,
        r.email,
        r.phone,
        r.taxNumber,
        r.createdAt,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [rows, query]);

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
      {/* ✅ Search bar */}
      <Box sx={{ px: 1.5, pt: 1.25, pb: 1 }}>
        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Пошук по клієнтах… (імʼя, email, телефон, податковий номер)"
          fullWidth
          size="small"
          sx={{
            bgcolor: "#fff",
            "& .MuiOutlinedInput-root": {
              borderRadius: 2.5,
            },
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
        onRowDoubleClick={handleRowDoubleClick}
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
        }}
        localeText={{
          noRowsLabel: query.trim()
            ? "Нічого не знайдено за вашим запитом"
            : "Клієнтів поки немає",
        }}
      />
    </Box>
  );
};
