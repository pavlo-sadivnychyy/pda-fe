"use client";

import {
  Box,
  Card,
  CardContent,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import DownloadIcon from "@mui/icons-material/Download";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useCallback, useMemo, useState } from "react";
import type { Act } from "../types";
import { formatMoney, formatPeriod } from "../utils";
import { ActStatusChip } from "./ActStatusChip";
import { ActRowActions } from "./ActRowActions";

import * as XLSX from "xlsx";

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
  // wrap if contains quotes, newline, comma, semicolon
  if (/[",\n\r;]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

export const ActsGrid = ({
  acts,
  onDelete,
  deleteBusyId,
  onSend,
  sendBusyId,
  mobile,
  desktopGridHeight = 560,
  disbaleExport,
}: {
  acts: Act[];
  onDelete: (id: string) => void;
  deleteBusyId: string | null;
  onSend: (id: string) => Promise<void> | void;
  sendBusyId: string | null;
  disbaleExport: boolean;

  // ✅ responsive behavior controlled by parent page
  mobile: boolean;

  // ✅ required to avoid "0px height" error on desktop
  desktopGridHeight?: number;
}) => {
  const [query, setQuery] = useState("");

  // export menu (desktop only in UI)
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const exportMenuOpen = Boolean(exportAnchorEl);
  const openExportMenu = (e: React.MouseEvent<HTMLElement>) =>
    setExportAnchorEl(e.currentTarget);
  const closeExportMenu = () => setExportAnchorEl(null);

  const rows = useMemo(() => {
    return acts.map((a: any) => {
      const clientName = a?.client?.name ?? "—";
      const clientEmail = a?.client?.email ?? null;
      const invoiceNumber = a?.relatedInvoice?.number
        ? `№ ${a.relatedInvoice.number}`
        : "—";
      const period = formatPeriod(a?.periodFrom, a?.periodTo);

      // для UI (рядок)
      const totalFormatted = formatMoney(a?.total, a?.currency);

      // для експорту (число + валюта окремо)
      const totalValue = Number(a?.total ?? 0);
      const currency = String(a?.currency ?? "");

      const statusText = String(a?.status ?? "");

      return {
        ...a,
        clientName,
        clientEmail,
        invoiceNumber,
        period,
        totalFormatted,
        totalValue,
        currency,
        statusText,
      };
    });
  }, [acts]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r: any) => {
      const haystack = [
        r.number ?? "",
        r.clientName ?? "",
        r.clientEmail ?? "",
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
        flex: 1.6,
        minWidth: 180,
        renderCell: (params) => params.row?.clientName ?? "—",
      },
      {
        field: "relatedInvoice",
        headerName: "Інвойс",
        flex: 1,
        minWidth: 140,
        renderCell: (params) => params.row?.invoiceNumber ?? "—",
      },
      {
        field: "period",
        headerName: "Період",
        flex: 1.2,
        minWidth: 160,
        sortable: false,
        renderCell: (params) => params.row?.period ?? "—",
      },
      {
        field: "total",
        headerName: "Сума",
        flex: 1,
        minWidth: 140,
        renderCell: (params) => params.row?.totalFormatted ?? "—",
      },
      {
        field: "status",
        headerName: "Статус",
        flex: 0.9,
        minWidth: 130,
        renderCell: (params) => <ActStatusChip status={params.value} />,
      },
      {
        field: "actions",
        headerName: "Дії",
        sortable: false,
        filterable: false,
        flex: 1.3,
        minWidth: 220,
        renderCell: (params) => {
          const id = params.row.id as string;
          const busyDelete = deleteBusyId === id;
          const busySend = sendBusyId === id;

          return (
            <ActRowActions
              act={params.row}
              onOpenPdf={() => {
                window.open(
                  `/api/pdf/acts/${id}`,
                  "_blank",
                  "noopener,noreferrer",
                );
              }}
              onSend={() => onSend(id)}
              onDelete={() => onDelete(id)}
              busyDelete={busyDelete}
              busySend={busySend}
            />
          );
        },
      },
    ],
    [onDelete, deleteBusyId, onSend, sendBusyId],
  );

  // ---- Export (desktop only in UI)
  const getExportData = useCallback(() => {
    return filteredRows.map((r: any) => ({
      ID: r.id ?? "",
      "№ акта": r.number ?? "",
      Клієнт: r.clientName ?? "",
      "Email клієнта": r.clientEmail ?? "",
      Інвойс: r.invoiceNumber ?? "",
      Період: r.period ?? "",
      Сума: r.totalValue ?? 0, // numeric for Excel
      Валюта: r.currency ?? "",
      Статус: r.statusText ?? "",
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

    const csv = "\uFEFF" + lines.join("\n"); // BOM for Excel UTF-8
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const filename = `acts_${new Date().toISOString().slice(0, 10)}.csv`;
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
    XLSX.utils.book_append_sheet(wb, ws, "Acts");

    const filename = `acts_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);

    closeExportMenu();
  }, [getExportData]);

  const SearchBar = (
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
  );

  // ✅ MOBILE: карточки + page scroll
  if (mobile) {
    return (
      <Box>
        {SearchBar}

        <Stack spacing={1.2} sx={{ px: 1.5, pb: 1.5 }}>
          {filteredRows.map((a: any) => {
            const id = a.id as string;
            const busyDelete = deleteBusyId === id;
            const busySend = sendBusyId === id;

            return (
              <Card
                key={id}
                sx={{
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 8px 20px rgba(15,23,42,0.06)",
                  overflow: "hidden",
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={1}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
                          Акт № {a.number ?? "—"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#64748b" }}>
                          {a.clientName ?? "—"}{" "}
                          {a.invoiceNumber ? `• ${a.invoiceNumber}` : ""}
                        </Typography>
                      </Box>

                      <Box sx={{ flexShrink: 0 }}>
                        <ActStatusChip status={a.status} />
                      </Box>
                    </Stack>

                    <Divider />

                    <Stack spacing={0.6}>
                      <Row label="Період" value={a.period ?? "—"} />
                      <Row label="Сума" value={a.totalFormatted ?? "—"} />
                      {a.clientEmail ? (
                        <Row label="Email" value={a.clientEmail} />
                      ) : null}
                    </Stack>

                    <Divider />

                    {/* actions */}
                    <ActRowActions
                      act={a}
                      onOpenPdf={() =>
                        window.open(
                          `/api/pdf/acts/${id}`,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                      onSend={() => onSend(id)}
                      onDelete={() => onDelete(id)}
                      busyDelete={busyDelete}
                      busySend={busySend}
                    />
                  </Stack>
                </CardContent>
              </Card>
            );
          })}

          {!filteredRows.length ? (
            <Box sx={{ py: 3, textAlign: "center", color: "#64748b" }}>
              <Typography variant="body2">
                {query.trim()
                  ? "Нічого не знайдено за вашим запитом"
                  : "Актів поки немає"}
              </Typography>
            </Box>
          ) : null}
        </Stack>
      </Box>
    );
  }

  // ✅ DESKTOP: page NOT scroll, grid scrolls
  return (
    <Box
      sx={{
        height: desktopGridHeight,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Desktop header: search + export */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          pt: 1.25,
          pb: 1,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>{SearchBar}</Box>

        {!disbaleExport && (
          <>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={openExportMenu}
              disabled={filteredRows.length === 0}
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

      {/* ✅ critical: parent must have height, child must have minHeight:0 */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
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
            height: "100%",
            border: "none",
            "& .MuiDataGrid-columnHeaders": { bgcolor: "#f9fafb" },
          }}
        />
      </Box>
    </Box>
  );
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" sx={{ color: "#64748b" }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "#0f172a", fontWeight: 700, textAlign: "right" }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
