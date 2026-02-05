"use client";

import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Stack,
  Card,
  CardContent,
  Divider,
  useMediaQuery,
  useTheme,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import DownloadIcon from "@mui/icons-material/Download";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import { useCallback, useMemo, useState } from "react";

import * as XLSX from "xlsx";

import type { Client, Invoice, InvoiceStatus, InvoiceAction } from "../types";
import { formatMoney, getClientDisplayName } from "../utils";

import { InvoiceStatusChip } from "./InvoiceStatusChip";
import { InvoicePdfButton } from "./InvoicePdfButton";
import { InvoiceRowActions } from "./InvoiceRowActions";
import { InvoiceDeleteButton } from "./InvoiceDeleteButton";

/* ---------------- helpers ---------------- */

function getClientEmail(inv: Invoice, clients: Client[]) {
  const direct = (inv as any)?.client?.email;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const clientId = (inv as any)?.clientId;
  if (!clientId) return null;

  const found = clients.find((c) => c.id === clientId);
  const email = (found as any)?.email;
  return typeof email === "string" && email.trim() ? email.trim() : null;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeCsvCell(value: unknown) {
  const s = value == null ? "" : String(value);
  // UA/EU Excel часто чекає ';' як розділювач, але лапки все одно потрібні
  if (/[",\n\r;]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

function toIsoDateOnly(value: string | Date | null | undefined): string | "" {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  // YYYY-MM-DD
  return d.toISOString().slice(0, 10);
}

function formatDateUA(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  // dd.mm.yyyy (український формат)
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

// простий “словник” для пошуку по статусу (і англ, і укр)
const STATUS_LABELS_UA: Partial<Record<string, string>> = {
  DRAFT: "чернетка",
  SENT: "надіслано",
  ISSUED: "виставлено",
  UNPAID: "не оплачено",
  PAID: "оплачено",
  OVERDUE: "прострочено",
  CANCELED: "скасовано",
  CANCELLED: "скасовано",
  VOID: "анульовано",
};

function normalizeText(s: string) {
  return s.toLowerCase().trim();
}

/**
 * Витягує “датні токени” з рядка пошуку:
 * - 05.02.2026 / 5.2.2026 / 05/02/2026 / 2026-02-05
 * Повертає набір нормалізованих ключів:
 * - dd.mm.yyyy
 * - yyyy-mm-dd
 */
function extractDateTokens(query: string): {
  ddmmyyyy: string[];
  yyyymmdd: string[];
} {
  const q = query.trim();
  if (!q) return { ddmmyyyy: [], yyyymmdd: [] };

  const ddmmyyyy: string[] = [];
  const yyyymmdd: string[] = [];

  // 2026-02-05
  const isoMatches = q.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/g) ?? [];
  for (const m of isoMatches) {
    const [y, mo, d] = m.split("-").map((x) => x.padStart(2, "0"));
    yyyymmdd.push(`${y}-${mo}-${d}`);
    ddmmyyyy.push(`${d}.${mo}.${y}`);
  }

  // 05.02.2026 / 5.2.2026 / 05/02/2026 / 5-2-2026
  const euMatches = q.match(/\b(\d{1,2})[./-](\d{1,2})[./-](20\d{2})\b/g) ?? [];
  for (const m of euMatches) {
    const parts = m.split(/[./-]/);
    const d = parts[0].padStart(2, "0");
    const mo = parts[1].padStart(2, "0");
    const y = parts[2];
    ddmmyyyy.push(`${d}.${mo}.${y}`);
    yyyymmdd.push(`${y}-${mo}-${d}`);
  }

  return {
    ddmmyyyy: Array.from(new Set(ddmmyyyy)),
    yyyymmdd: Array.from(new Set(yyyymmdd)),
  };
}

/* ---------------- mobile card ---------------- */

function InvoiceMobileCard({
  row,
  onAction,
  onDelete,
  actionBusyKey,
  deleteBusyId,
}: {
  row: any;
  onAction: (id: string, action: InvoiceAction) => void;
  onDelete: (id: string) => void;
  actionBusyKey: string | null;
  deleteBusyId: string | null;
}) {
  const id = row.id as string;
  const busyAction = Boolean(actionBusyKey?.startsWith(`${id}:`));
  const busyDelete = deleteBusyId === id;

  return (
    <Card sx={{ borderRadius: 3, mb: 2 }}>
      <CardContent sx={{ pb: 1.5 }}>
        <Stack spacing={1.2}>
          <Stack direction="row" justifyContent="space-between">
            <Typography sx={{ fontWeight: 800 }}>№ {row.number}</Typography>
            <InvoiceStatusChip status={row.status as InvoiceStatus} />
          </Stack>

          <Typography sx={{ color: "#475569" }}>{row.clientName}</Typography>

          {row.clientEmail && (
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              {row.clientEmail}
            </Typography>
          )}

          <Divider />

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2">Дата:</Typography>
            <Typography variant="body2">{row.issueDate}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2">Оплатити до:</Typography>
            <Typography variant="body2">{row.dueDate}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2">Сума:</Typography>
            <Typography sx={{ fontWeight: 700 }}>{row.total}</Typography>
          </Stack>

          <Divider />

          <InvoicePdfButton
            invoiceId={id}
            hasPdf={row.hasPdf}
            hasInternationalPdf={row.hasInternationalPdf}
          />

          <InvoiceRowActions
            status={row.status}
            busy={busyAction}
            hasClientEmail={Boolean(row.clientEmail)}
            onAction={(a) => onAction(id, a)}
          />

          <Box textAlign="right">
            <InvoiceDeleteButton
              disabled={busyDelete}
              onClick={() => onDelete(id)}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

/* ---------------- main ---------------- */

export const InvoicesGrid = ({
  invoices,
  clients,
  loading,
  onAction,
  actionBusyKey,
  onDelete,
  deleteBusyId,
  disbaleExport,
}: {
  invoices: Invoice[];
  clients: Client[];
  loading: boolean;
  onAction: (id: string, action: InvoiceAction) => void;
  actionBusyKey: string | null;
  onDelete: (id: string) => void;
  deleteBusyId: string | null;
  disbaleExport: boolean;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [query, setQuery] = useState("");

  // export menu (desktop only used, but safe regardless)
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const exportMenuOpen = Boolean(exportAnchorEl);
  const openExportMenu = (e: React.MouseEvent<HTMLElement>) =>
    setExportAnchorEl(e.currentTarget);
  const closeExportMenu = () => setExportAnchorEl(null);

  const rows = useMemo(
    () =>
      invoices.map((inv) => {
        const clientEmail = getClientEmail(inv, clients);

        const issueISO = toIsoDateOnly(inv.issueDate);
        const dueISO = toIsoDateOnly(inv.dueDate ?? null);

        const issueUA = formatDateUA(inv.issueDate);
        const dueUA = formatDateUA(inv.dueDate ?? null);

        const statusRaw = String(inv.status ?? "");
        const statusUa = STATUS_LABELS_UA[statusRaw] ?? "";

        return {
          id: inv.id,
          number: inv.number,
          clientName: getClientDisplayName(inv, clients),
          clientEmail,

          // UI (UA формат)
          issueDate: issueUA,
          dueDate: dueUA,

          // для пошуку (стабільні “ключі”)
          issueDateISO: issueISO, // YYYY-MM-DD
          dueDateISO: dueISO, // YYYY-MM-DD

          totalValue: inv.total, // для експорту числом
          currency: inv.currency,
          total: `${formatMoney(inv.total)} ${inv.currency}`, // для UI

          status: inv.status,
          statusUa, // для пошуку по статусу

          hasPdf: Boolean(inv.pdfDocumentId),
          hasInternationalPdf: Boolean(inv.pdfInternationalDocumentId),
        };
      }),
    [invoices, clients],
  );

  const filteredRows = useMemo(() => {
    const q = normalizeText(query);
    if (!q) return rows;

    const { ddmmyyyy, yyyymmdd } = extractDateTokens(query);

    return rows.filter((r) => {
      const hay = normalizeText(
        [
          r.number,
          r.clientName,
          r.clientEmail ?? "",
          r.issueDate, // dd.mm.yyyy (UA)
          r.dueDate, // dd.mm.yyyy (UA)
          r.issueDateISO, // yyyy-mm-dd
          r.dueDateISO, // yyyy-mm-dd
          r.total,
          String(r.status ?? ""),
          r.statusUa, // "оплачено", "чернетка"...
        ]
          .join(" ")
          .replace(/\s+/g, " "),
      );

      // базовий full-text
      const textMatch = hay.includes(q);

      // якщо користувач ввів дату — матчимо строго по ключам дат теж (щоб “05.02.2026” точно знаходилось)
      const dateMatch =
        ddmmyyyy.some((t) => r.issueDate === t || r.dueDate === t) ||
        yyyymmdd.some((t) => r.issueDateISO === t || r.dueDateISO === t);

      return textMatch || dateMatch;
    });
  }, [rows, query]);

  // ---- Export data (desktop)
  const getExportData = useCallback(() => {
    return filteredRows.map((r) => ({
      ID: r.id,
      Номер: r.number,
      Клієнт: r.clientName,
      "Email клієнта": r.clientEmail ?? "",
      Дата: r.issueDate,
      "Оплатити до": r.dueDate,
      Сума: r.totalValue, // числом, щоб Excel міг рахувати
      Валюта: r.currency,
      Статус: String(r.status ?? ""),
      PDF: r.hasPdf ? "Так" : "Ні",
      "PDF (International)": r.hasInternationalPdf ? "Так" : "Ні",
    }));
  }, [filteredRows]);

  const exportCsv = useCallback(() => {
    const data = getExportData();
    if (!data.length) {
      closeExportMenu();
      return;
    }

    const headers = Object.keys(data[0]);
    const sep = ";";

    const lines = [
      headers.map(escapeCsvCell).join(sep),
      ...data.map((row) =>
        headers.map((h) => escapeCsvCell((row as any)[h])).join(sep),
      ),
    ];

    // BOM for Excel UTF-8 UA chars
    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const filename = `invoices_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadBlob(blob, filename);

    closeExportMenu();
  }, [getExportData]);

  const exportXlsx = useCallback(() => {
    const data = getExportData();
    if (!data.length) {
      closeExportMenu();
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoices");

    const filename = `invoices_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);

    closeExportMenu();
  }, [getExportData]);

  /* ---------- Mobile ---------- */
  if (isMobile) {
    return (
      <Box>
        {/* search */}
        <Box sx={{ px: 1, pb: 1 }}>
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Пошук… (номер, клієнт, дата, статус)"
            fullWidth
            size="small"
            sx={{
              bgcolor: "#fff",
              "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: query ? (
                <InputAdornment position="end">
                  <IconButton onClick={() => setQuery("")}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Box>

        {filteredRows.map((row) => (
          <InvoiceMobileCard
            key={row.id}
            row={row}
            onAction={onAction}
            onDelete={onDelete}
            actionBusyKey={actionBusyKey}
            deleteBusyId={deleteBusyId}
          />
        ))}

        {loading && (
          <Typography sx={{ textAlign: "center", mt: 2 }}>
            Завантаження...
          </Typography>
        )}
      </Box>
    );
  }

  /* ---------- Desktop ---------- */

  const columns: GridColDef[] = [
    { field: "number", headerName: "Номер", flex: 1, minWidth: 120 },
    { field: "clientName", headerName: "Клієнт", flex: 1.5, minWidth: 180 },
    { field: "issueDate", headerName: "Дата", minWidth: 120 },
    { field: "dueDate", headerName: "Термін", minWidth: 120 },
    { field: "total", headerName: "Сума", minWidth: 120 },
    {
      field: "status",
      headerName: "Статус",
      minWidth: 130,
      renderCell: (p: GridRenderCellParams<InvoiceStatus>) => (
        <InvoiceStatusChip status={p.value as InvoiceStatus} />
      ),
    },
    {
      field: "pdf",
      headerName: "PDF",
      sortable: false,
      width: 220,
      renderCell: (p) => (
        <InvoicePdfButton
          invoiceId={p.row.id}
          hasPdf={p.row.hasPdf}
          hasInternationalPdf={p.row.hasInternationalPdf}
        />
      ),
    },
    {
      field: "actions",
      headerName: "",
      sortable: false,
      width: 300,
      renderCell: (p) => {
        const id = p.row.id as string;
        const busy = Boolean(actionBusyKey?.startsWith(`${id}:`));
        return (
          <InvoiceRowActions
            status={p.row.status}
            busy={busy}
            hasClientEmail={Boolean(p.row.clientEmail)}
            onAction={(a) => onAction(id, a)}
          />
        );
      },
    },
    {
      field: "delete",
      headerName: "",
      sortable: false,
      width: 70,
      renderCell: (p) => (
        <InvoiceDeleteButton
          disabled={deleteBusyId === p.row.id}
          onClick={() => onDelete(p.row.id)}
        />
      ),
    },
  ];

  return (
    <Box
      sx={{
        "& .MuiDataGrid-root": { border: "none" },
      }}
    >
      {/* header: search + export (desktop only) */}
      <Box
        sx={{
          px: 1.5,
          pt: 1,
          pb: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Пошук по інвойсах… (номер, клієнт, дата, статус)"
            fullWidth
            size="small"
            sx={{
              bgcolor: "#fff",
              "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: query ? (
                <InputAdornment position="end">
                  <IconButton onClick={() => setQuery("")}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Box>

        {!disbaleExport && (
          <>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={openExportMenu}
              disabled={loading || filteredRows.length === 0}
              sx={{
                flexShrink: 0,
                flexGrow: 1,
                maxWidth: "150px",
                whiteSpace: "nowrap",
                color: "black",
                borderColor: "black",
              }}
            >
              Експорт
            </Button>

            <Menu
              anchorEl={exportAnchorEl}
              open={exportMenuOpen}
              onClose={closeExportMenu}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={exportCsv}>CSV</MenuItem>
              <MenuItem onClick={exportXlsx}>Excel (.xlsx)</MenuItem>
            </Menu>
          </>
        )}
      </Box>

      <DataGrid
        rows={filteredRows}
        columns={columns}
        loading={loading}
        disableRowSelectionOnClick
        pageSizeOptions={[10]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
        }}
        localeText={{
          noRowsLabel: query.trim()
            ? "Нічого не знайдено"
            : "Інвойсів поки немає",
        }}
      />
    </Box>
  );
};
