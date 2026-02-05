"use client";

import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
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

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { Dayjs } from "dayjs";

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

// ✅ Date helpers (inclusive day range)
function startOfDayISO(d: Dayjs) {
  return d.startOf("day").toISOString();
}
function endOfDayISO(d: Dayjs) {
  return d.endOf("day").toISOString();
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

  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<Dayjs | null>(null);

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
    const fromISO = dateFrom ? startOfDayISO(dateFrom) : null;
    const toISO = dateTo ? endOfDayISO(dateTo) : null;

    const q = query.trim().toLowerCase();

    return gridRows.filter((r) => {
      const createdISO = r.__raw?.createdAt ?? "";

      if (fromISO && createdISO < fromISO) return false;
      if (toISO && createdISO > toISO) return false;

      if (!q) return true;

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
  }, [gridRows, query, dateFrom, dateTo]);

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

  const clearDates = () => {
    setDateFrom(null);
    setDateTo(null);
  };

  // ✅ unified control styles + hard “no overlap”
  const controlSx = {
    bgcolor: "#fff",
    "& .MuiOutlinedInput-root": { borderRadius: 2.5, height: 44 },
    width: "100%",
    minWidth: 0,
  } as const;

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
      {/* ✅ Controls */}
      <Box sx={{ px: 1.5, pt: 1.25, pb: 1 }}>
        {/* Search */}
        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Пошук по історії… (подія, документ, email, користувач)"
          fullWidth
          size="small"
          sx={{ ...controlSx, mb: 1 }}
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

        {/* ✅ Filters: responsive grid that NEVER overlaps */}
        <Box
          sx={{
            display: "grid",
            gap: 1,
            alignItems: "center",

            // ✅ breakpoints: from strict 1-col → 2-col → 3-col → 6-col
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
              lg: "repeat(6, minmax(0, 1fr))",
            },

            // ✅ if something still wants to be wide, allow it to drop to next row
            gridAutoFlow: "row",
          }}
        >
          <DatePicker
            label="Від"
            value={dateFrom}
            onChange={(v) => {
              setDateFrom(v);
              if (v && dateTo && dateTo.isBefore(v, "day")) setDateTo(v);
            }}
            slotProps={{
              textField: { size: "small", sx: controlSx, fullWidth: true },
            }}
          />

          <DatePicker
            label="До"
            value={dateTo}
            minDate={dateFrom ?? undefined}
            onChange={(v) => setDateTo(v)}
            slotProps={{
              textField: { size: "small", sx: controlSx, fullWidth: true },
            }}
          />

          <Button
            onClick={clearDates}
            variant="outlined"
            disabled={!dateFrom && !dateTo}
            sx={{
              height: 44,
              textTransform: "none",
              borderRadius: 999,
              fontWeight: 700,
              borderColor: "#e2e8f0",
              color: "#111827",
              "&:hover": { bgcolor: "#f3f4f6", borderColor: "#e2e8f0" },
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              width: "100%",
              minWidth: 0,
            }}
          >
            Очистити дату
          </Button>

          <TextField
            select
            size="small"
            value={queryEntityType ?? "ALL"}
            onChange={(e) => setQueryEntityType(e.target.value)}
            label="Документ"
            sx={controlSx}
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
            label="Подія"
            sx={controlSx}
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
              height: 44,
              textTransform: "none",
              borderRadius: 999,
              fontWeight: 700,
              borderColor: "#e2e8f0",
              color: "#111827",
              "&:hover": { bgcolor: "#f3f4f6", borderColor: "#e2e8f0" },
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              width: "100%",
              minWidth: 0,

              // ✅ on large screens keep it to the right vibe
              justifySelf: { lg: "end" },
            }}
          >
            {loadingMore
              ? "Завантажуємо..."
              : canLoadMore
                ? "Завантажити ще"
                : "Все завантажено"}
          </Button>
        </Box>
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
          noRowsLabel:
            query.trim() || dateFrom || dateTo
              ? "Нічого не знайдено за вашими фільтрами"
              : "Подій поки немає",
        }}
      />
    </Box>
  );
};
