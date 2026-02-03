"use client";

import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useMemo, useState } from "react";

import type {
  ActivityEntityType,
  ActivityEventType,
  ActivityLog,
} from "../hooks/useActivityLogs";
import { uaStatusFromString } from "@/app/activity/utils/activityLabels";

function formatWhen(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function entityLabel(t: ActivityEntityType) {
  if (t === "INVOICE") return "Інвойс";
  if (t === "ACT") return "Акт";
  if (t === "QUOTE") return "Пропозиція";
  return t;
}

function eventLabel(e: ActivityEventType) {
  switch (e) {
    case "CREATED":
      return "Створено";
    case "STATUS_CHANGED":
      return "Зміна статусу";
    case "SENT":
      return "Надіслано";
    case "REMINDER_SENT":
      return "Нагадування";
    case "CONVERTED_TO_INVOICE":
      return "Конвертовано в інвойс";
    default:
      return e;
  }
}

function actorLabel(actor?: ActivityLog["actor"]) {
  if (!actor) return "—";
  const name = [actor.firstName, actor.lastName].filter(Boolean).join(" ");
  return name || actor.email || "—";
}

export const ActivityGrid = ({
  rows,
  loading,
  queryEntityType,
  setQueryEntityType,
  queryEventType,
  setQueryEventType,
  canLoadMore,
  loadMore,
  loadingMore,
}: {
  rows: ActivityLog[];
  loading: boolean;

  queryEntityType: "ALL" | ActivityEntityType;
  setQueryEntityType: (v: any) => void;

  queryEventType:
    | "ALL"
    | "CREATED"
    | "STATUS_CHANGED"
    | "SENT"
    | "REMINDER_SENT"
    | "CONVERTED_TO_INVOICE";
  setQueryEventType: (v: any) => void;

  canLoadMore: boolean;
  loadMore: () => void;
  loadingMore: boolean;
}) => {
  const [query, setQuery] = useState("");

  const gridRows = useMemo(() => {
    return rows.map((r) => {
      const statusText =
        r.fromStatus || r.toStatus
          ? `${r.fromStatus ?? "—"} → ${r.toStatus ?? "—"}`
          : "—";

      const toEmailText = r.toEmail || "—";

      const number =
        (r.meta &&
          (r.meta.number || r.meta.invoiceNumber || r.meta.docNumber)) ||
        "";

      return {
        id: r.id,
        createdAt: formatWhen(r.createdAt),
        entityType: entityLabel(r.entityType),
        eventType: eventLabel(r.eventType),
        status: statusText,
        toEmail: toEmailText,
        actor: actorLabel(r.actor),
        entityId: r.entityId?.slice(0, 8) ?? "—",
        number: number ? String(number) : "",
        __raw: r,
      };
    });
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return gridRows;

    return gridRows.filter((r) => {
      const haystack = [
        r.createdAt,
        r.entityType,
        r.eventType,
        r.status,
        r.toEmail,
        r.actor,
        r.entityId,
        r.number,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [gridRows, query]);

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "createdAt", headerName: "Час", flex: 0.8, minWidth: 160 },
      { field: "entityType", headerName: "Документ", flex: 0.8, minWidth: 140 },
      { field: "eventType", headerName: "Подія", flex: 1, minWidth: 170 },
      {
        field: "status",
        headerName: "Зміна статусу",
        flex: 1,
        minWidth: 220,
        renderCell: (params) => uaStatusFromString(params.value),
      },
      { field: "toEmail", headerName: "Кому", flex: 1, minWidth: 220 },
      { field: "actor", headerName: "Хто", flex: 1, minWidth: 180 },
    ],
    [],
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
      {/* ✅ Search + filters */}
      <Box sx={{ px: 1.5, pt: 1.25, pb: 1 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", sm: "center" }}
          sx={{
            // важливо для flex-елементів з overflow/ellipsis
            minWidth: 0,
          }}
        >
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Пошук по історії… (подія, дата, документ, статус, email, користувач)"
            fullWidth
            size="small"
            sx={{
              bgcolor: "#fff",
              "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
              minWidth: 0,
              flex: 1,
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

          <TextField
            select
            size="small"
            value={queryEntityType ?? "ALL"}
            onChange={(e) => setQueryEntityType(e.target.value)}
            sx={{
              minWidth: { xs: "100%", sm: 190 },
              flexShrink: 0,
            }}
            label="Документ"
          >
            <MenuItem value="ALL">Всі</MenuItem>
            <MenuItem value="INVOICE">Інвойси</MenuItem>
            <MenuItem value="ACT">Акти</MenuItem>
            <MenuItem value="QUOTE">Пропозиції</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            value={queryEventType ?? "ALL"}
            onChange={(e) => setQueryEventType(e.target.value)}
            sx={{
              minWidth: { xs: "100%", sm: 220 },
              flexShrink: 0,
            }}
            label="Подія"
          >
            <MenuItem value="ALL">Всі</MenuItem>
            <MenuItem value="CREATED">Створено</MenuItem>
            <MenuItem value="STATUS_CHANGED">Зміна статусу</MenuItem>
            <MenuItem value="SENT">Надіслано</MenuItem>
            <MenuItem value="REMINDER_SENT">Нагадування</MenuItem>
            <MenuItem value="CONVERTED_TO_INVOICE">Конвертовано</MenuItem>
          </TextField>

          <Button
            variant="outlined"
            disabled={!canLoadMore || loadingMore}
            onClick={loadMore}
            endIcon={<ExpandMoreIcon />}
            sx={{
              textTransform: "none",
              borderRadius: 999,
              fontWeight: 700,
              borderColor: "#e2e8f0",
              color: "#111827",
              "&:hover": { bgcolor: "#f3f4f6", borderColor: "#e2e8f0" },

              // ✅ фікс “вилазить за межі”
              width: { xs: "100%", sm: "auto" },
              maxWidth: { xs: "100%", sm: 220 },
              minWidth: 0,
              flexShrink: 0,

              // ✅ еліпсис замість “вилазить”
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {loadingMore
              ? "Завантажуємо..."
              : canLoadMore
                ? "Завантажити ще"
                : "Все завантажено"}
          </Button>
        </Stack>
      </Box>

      <DataGrid
        autoHeight
        rows={filteredRows}
        columns={columns}
        loading={loading}
        disableRowSelectionOnClick
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
        }}
        localeText={{
          noRowsLabel: query.trim()
            ? "Нічого не знайдено за вашим запитом"
            : "Подій поки немає",
        }}
      />
    </Box>
  );
};
