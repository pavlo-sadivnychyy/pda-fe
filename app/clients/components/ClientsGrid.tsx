"use client";

import {
  Box,
  Chip,
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
import type { Client } from "../types";
import { CRM_STATUS_COLOR, CRM_STATUS_LABELS, formatDate } from "../utils";
import { ClientDeleteButton } from "./ClientDeleteButton";
import { ClientEditButton } from "@/app/clients/components/ClientEditButton";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

/* =======================
   Tag styles
======================= */

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

function StatusChip({ status }: { status: string }) {
  return (
    <Chip
      size="small"
      label={CRM_STATUS_LABELS[status as any] ?? status}
      color={CRM_STATUS_COLOR[status as any] ?? "default"}
      variant="outlined"
      sx={{ fontWeight: 800, height: 24 }}
    />
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.4 }}>
      <Box component="span" sx={{ color: "#64748b", fontWeight: 700 }}>
        {label}:
      </Box>{" "}
      {value}
    </Typography>
  );
}

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
  );
}

/* =======================
   Mobile component (cards)
======================= */

function MobileClientsGrid({
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
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;

    return clients.filter((c) => {
      const hay = [
        c.name,
        c.contactName,
        c.email,
        c.phone,
        c.taxNumber,
        c.createdAt ? formatDate(c.createdAt) : "",
        CRM_STATUS_LABELS[(c.crmStatus as any) ?? "LEAD"] ?? c.crmStatus ?? "",
        ...(Array.isArray(c.tags) ? c.tags : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [clients, query]);

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
              : "Клієнтів поки немає"}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.2}>
          {filtered.map((c) => {
            const status = (c.crmStatus || "LEAD") as string;
            const tags = Array.isArray(c.tags) ? c.tags : [];
            const busy = deleteBusyId === c.id;

            return (
              <Box
                key={c.id}
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
                      title={c.name}
                    >
                      {c.name}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mt: 0.6, flexWrap: "wrap" }}
                    >
                      <StatusChip status={status} />

                      {tags.slice(0, 2).map((t) => (
                        <TagChip key={t} label={t} />
                      ))}

                      {tags.length > 2 ? (
                        <Chip
                          size="small"
                          label={`+${tags.length - 2}`}
                          sx={{
                            height: 24,
                            fontWeight: 900,
                            bgcolor: "#f1f5f9",
                            border: "1px solid #e2e8f0",
                            color: "#334155",
                          }}
                        />
                      ) : null}
                    </Stack>
                  </Box>

                  <Box sx={{ display: "flex", gap: 0.6, flexShrink: 0 }}>
                    <ClientEditButton onClick={() => onEdit(c)} />
                    <ClientDeleteButton
                      disabled={busy}
                      onClick={() => onDelete(c.id)}
                    />
                  </Box>
                </Stack>

                <Divider sx={{ my: 1.1 }} />

                <Stack spacing={0.4}>
                  <InfoRow label="Контакт" value={c.contactName || ""} />
                  <InfoRow label="Email" value={c.email || ""} />
                  <InfoRow label="Телефон" value={c.phone || ""} />
                  <InfoRow label="Податк. №" value={c.taxNumber || ""} />
                  <InfoRow
                    label="Створено"
                    value={c.createdAt ? formatDate(c.createdAt) : ""}
                  />
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}

/* =======================
   Desktop component (table)
======================= */

function DesktopClientsGrid({
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
}) {
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

  const handleRowDoubleClick = (params: GridRowParams) => {
    const client = clients.find((c) => c.id === params.id);
    if (client) onEdit(client);
  };

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "name", headerName: "Назва клієнта", flex: 1.4, minWidth: 220 },
      {
        field: "crmStatus",
        headerName: "Статус",
        flex: 0.7,
        minWidth: 140,
        sortable: true,
        renderCell: (params) => <StatusChip status={String(params.value)} />,
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
                flexWrap: "wrap",
                alignItems: "center",
                gap: 0.6,
                py: 0.6,
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
        width: 110,
        align: "center",
        headerAlign: "right",
        renderCell: (params) => {
          const id = params.row.id as string;
          const busy = deleteBusyId === id;
          return (
            <Box display={"flex"} gap={"6px"}>
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
    [onDelete, deleteBusyId, clients],
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
      <Box sx={{ px: 1.5, pt: 1.25, pb: 1, flexShrink: 0 }}>
        <SearchBar query={query} setQuery={setQuery} />
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
              : "Клієнтів поки немає",
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // ✅ no conditional hooks anymore
  return isMobile ? (
    <MobileClientsGrid
      clients={clients}
      loading={loading}
      onEdit={onEdit}
      onDelete={onDelete}
      deleteBusyId={deleteBusyId}
    />
  ) : (
    <DesktopClientsGrid
      clients={clients}
      loading={loading}
      onEdit={onEdit}
      onDelete={onDelete}
      deleteBusyId={deleteBusyId}
    />
  );
};
