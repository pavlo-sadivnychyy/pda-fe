"use client";

import {
  Box,
  Chip,
  InputAdornment,
  TextField,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import {
  DataGrid,
  type GridColDef,
  type GridRowParams,
} from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import type { Client } from "../types";
import { CRM_STATUS_COLOR, CRM_STATUS_LABELS, formatDate } from "../utils";
import { ClientDeleteButton } from "./ClientDeleteButton";
import { ClientEditButton } from "@/app/clients/components/ClientEditButton";

// ✅ CRM-style tag palette (soft bg + readable text)
const TAG_STYLES: Record<
  string,
  { bg: string; border: string; color: string }
> = {
  Новий: { bg: "#f8fafc", border: "#e2e8f0", color: "#0f172a" },

  Постійний: { bg: "#f0fdf4", border: "#bbf7d0", color: "#14532d" },

  VIP: { bg: "#fff7ed", border: "#fed7aa", color: "#7c2d12" },

  "Проблемний з оплатами": {
    bg: "#fef2f2",
    border: "#fecaca",
    color: "#7f1d1d",
  },

  Проблемний: { bg: "#fff1f2", border: "#fecdd3", color: "#881337" },

  "Разова співпраця": { bg: "#f1f5f9", border: "#cbd5e1", color: "#334155" },

  Партнер: { bg: "#eef2ff", border: "#c7d2fe", color: "#312e81" },

  "Холодний лід": { bg: "#ecfeff", border: "#a5f3fc", color: "#155e75" },
};

// Якщо в майбутньому прилетять інші теги — гарний нейтральний стиль
const FALLBACK_TAG_STYLE = {
  bg: "#f8fafc",
  border: "#e2e8f0",
  color: "#334155",
};

function TagChip({ label }: { label: string }) {
  const style = TAG_STYLES[label] ?? FALLBACK_TAG_STYLE;

  return (
    <Chip
      size="small"
      label={label}
      sx={{
        bgcolor: style.bg,
        border: `1px solid ${style.border}`,
        color: style.color,
        fontWeight: 800,
        height: 24,
        "& .MuiChip-label": { px: 1 },
      }}
    />
  );
}

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

        crmStatus: c.crmStatus || "LEAD",
        tags: Array.isArray(c.tags) ? c.tags : [],
      })),
    [clients],
  );

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      const haystack = [
        r.name,
        r.contactName,
        r.email,
        r.phone,
        r.taxNumber,
        r.createdAt,
        CRM_STATUS_LABELS[r.crmStatus as any] ?? r.crmStatus,
        ...(r.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [rows, query]);

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "name", headerName: "Назва клієнта", flex: 1.4, minWidth: 220 },

      {
        field: "crmStatus",
        headerName: "Статус",
        flex: 0.7,
        minWidth: 140,
        sortable: true,
        renderCell: (params) => {
          const s = params.value;
          return (
            <Chip
              size="small"
              label={CRM_STATUS_LABELS[s] ?? s}
              color={CRM_STATUS_COLOR[s] ?? "default"}
              variant="outlined"
              sx={{ fontWeight: 800, height: 24 }}
            />
          );
        },
      },

      {
        field: "tags",
        headerName: "Теги",
        flex: 1.2,
        minWidth: 260,
        sortable: false,
        renderCell: (params) => {
          const tags = (params.value as string[]) ?? [];
          if (!tags.length) return null;

          return (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap", // ✅ перенос на новий рядок
                alignItems: "center", // ✅ вертикальне центрування
                gap: 0.6, // ✅ нормальний відступ між тегами
                py: 0.6, // ✅ щоб не липло до ліній
                width: "100%",
                overflow: "hidden",
              }}
            >
              {tags.map((t) => (
                <TagChip key={t} label={t} />
              ))}
            </Box>
          );
        },
      },

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

      {
        field: "delete",
        headerName: "",
        sortable: false,
        filterable: false,
        width: 100,
        align: "center",
        headerAlign: "right",
        renderCell: (params) => {
          const id = params.row.id as string;
          const busy = deleteBusyId === id;
          return (
            <Box display={"flex"} gap={"5px"}>
              <ClientEditButton
                onClick={() => handleRowDoubleClick(params.row)}
              />
              <ClientDeleteButton
                disabled={busy}
                onClick={() => onDelete(id)}
              />
            </Box>
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
      <Box sx={{ px: 1.5, pt: 1.25, pb: 1 }}>
        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Пошук: імʼя, email, телефон, статус, теги…"
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
                <IconButton size="small" onClick={() => setQuery("")}>
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
        getRowHeight={() => "auto"}
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
        sx={{
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid #f1f5f9",
            alignItems: "center", // ✅ центрування контенту
            py: "10px",
            whiteSpace: "normal", // ✅ дозволяє перенос
            lineHeight: 1.2,
          },
        }}
      />
    </Box>
  );
};
