"use client";

import {
  Box,
  InputAdornment,
  TextField,
  IconButton,
  Typography,
  Stack,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import {
  DataGrid,
  type GridColDef,
  type GridRowParams,
} from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import type { UserService } from "../types";
import { formatDate, formatMoneyUA } from "../utils";
import { ClientDeleteButton } from "@/app/clients/components/ClientDeleteButton";
import { ClientEditButton } from "@/app/clients/components/ClientEditButton";

/* =======================
   Shared Search
======================= */

function SearchBar({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (v: string) => void;
}) {
  return (
    <TextField
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Пошук: назва, опис…"
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
  );
}

/* =======================
   Mobile (cards)
======================= */

function MobileServicesGrid({
  services,
  loading,
  onEdit,
  onDelete,
  deleteBusyId,
}: {
  services: UserService[];
  loading: boolean;
  onEdit: (s: UserService) => void;
  onDelete: (id: string) => void;
  deleteBusyId: string | null;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return services;

    return services.filter((s) => {
      const hay = [s.name, s.description ?? "", String(s.price ?? "")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [services, query]);

  return (
    <Box>
      <Box sx={{ pb: 1.2 }}>
        <SearchBar query={query} setQuery={setQuery} />
      </Box>

      {loading ? (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", px: 0.2, py: 1 }}
        >
          Завантажую…
        </Typography>
      ) : filtered.length === 0 ? (
        <Box
          sx={{
            p: 1.6,
            borderRadius: 3,
            bgcolor: "#fff",
            border: "1px dashed #e2e8f0",
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {query.trim()
              ? "Нічого не знайдено за вашим запитом"
              : "Послуг поки немає"}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.2}>
          {filtered.map((s) => {
            const busy = deleteBusyId === s.id;
            const priceNum = Number(s.price ?? 0);

            return (
              <Box
                key={s.id}
                sx={{
                  bgcolor: "#fff",
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 8px 18px rgba(15,23,42,0.06)",
                  p: 1.4,
                }}
              >
                <Stack
                  direction="row"
                  alignItems="flex-start"
                  justifyContent="space-between"
                  gap={1}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        color: "#0f172a",
                        lineHeight: 1.25,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={s.name}
                    >
                      {s.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ color: "#334155", fontWeight: 800, mt: 0.5 }}
                    >
                      {formatMoneyUA(Number.isFinite(priceNum) ? priceNum : 0)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", gap: 0.6, flexShrink: 0 }}>
                    <ClientEditButton onClick={() => onEdit(s)} />
                    <ClientDeleteButton
                      disabled={busy}
                      onClick={() => onDelete(s.id)}
                    />
                  </Box>
                </Stack>

                {s.description ? (
                  <>
                    <Divider sx={{ my: 1.1 }} />
                    <Typography
                      variant="body2"
                      sx={{ color: "#475569", lineHeight: 1.45 }}
                    >
                      {s.description}
                    </Typography>
                  </>
                ) : null}

                {s.createdAt || s.updatedAt ? (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 1.1,
                      color: "#94a3b8",
                      fontWeight: 700,
                    }}
                  >
                    {s.updatedAt
                      ? `Оновлено: ${formatDate(s.updatedAt)}`
                      : `Створено: ${formatDate(s.createdAt ?? "")}`}
                  </Typography>
                ) : null}
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}

/* =======================
   Desktop (table)
======================= */

function DesktopServicesGrid({
  services,
  loading,
  onEdit,
  onDelete,
  deleteBusyId,
}: {
  services: UserService[];
  loading: boolean;
  onEdit: (s: UserService) => void;
  onDelete: (id: string) => void;
  deleteBusyId: string | null;
}) {
  const [query, setQuery] = useState("");

  const rows = useMemo(
    () =>
      services.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description || "",
        price: s.price,
        createdAt: formatDate(s.createdAt ?? null),
        updatedAt: formatDate(s.updatedAt ?? null),
      })),
    [services],
  );

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      const haystack = [r.name, r.description, String(r.price ?? "")]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, query]);

  const handleRowDoubleClick = (params: GridRowParams) => {
    const s = services.find((x) => x.id === params.id);
    if (s) onEdit(s);
  };

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "name", headerName: "Послуга", flex: 1.2, minWidth: 220 },
      {
        field: "price",
        headerName: "Ціна",
        flex: 0.6,
        minWidth: 140,
        renderCell: (params) => {
          const n = Number(params.value ?? 0);
          return (
            <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
              {formatMoneyUA(Number.isFinite(n) ? n : 0)}
            </Typography>
          );
        },
      },
      {
        field: "description",
        headerName: "Опис",
        flex: 1.6,
        minWidth: 280,
        sortable: false,
      },
      { field: "updatedAt", headerName: "Оновлено", flex: 0.6, minWidth: 120 },
      {
        field: "actions",
        headerName: "",
        sortable: false,
        filterable: false,
        width: 110,
        align: "center",
        headerAlign: "right",
        renderCell: (params) => {
          const id = params.row.id as string;
          const busy = deleteBusyId === id;
          const s = services.find((x) => x.id === id);
          return (
            <Box display={"flex"} gap={"6px"}>
              <ClientEditButton onClick={() => s && onEdit(s)} />
              <ClientDeleteButton
                disabled={busy}
                onClick={() => onDelete(id)}
              />
            </Box>
          );
        },
      },
    ],
    [services, onDelete, deleteBusyId, onEdit],
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
      <Box
        sx={{
          px: 1.5,
          pt: 1.25,
          pb: 1,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <SearchBar query={query} setQuery={setQuery} />
        </Box>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataGrid
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
              : "Послуг поки немає",
          }}
          sx={{
            height: "100%",
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #f1f5f9",
              alignItems: "center",
              py: "10px",
              whiteSpace: "normal",
              lineHeight: 1.2,
            },
          }}
        />
      </Box>
    </Box>
  );
}

/* =======================
   Exported switcher
======================= */

export const ServicesGrid = ({
  services,
  loading,
  onEdit,
  onDelete,
  deleteBusyId,
}: {
  services: UserService[];
  loading: boolean;
  onEdit: (s: UserService) => void;
  onDelete: (id: string) => void;
  deleteBusyId: string | null;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return isMobile ? (
    <MobileServicesGrid
      services={services}
      loading={loading}
      onEdit={onEdit}
      onDelete={onDelete}
      deleteBusyId={deleteBusyId}
    />
  ) : (
    <DesktopServicesGrid
      services={services}
      loading={loading}
      onEdit={onEdit}
      onDelete={onDelete}
      deleteBusyId={deleteBusyId}
    />
  );
};
