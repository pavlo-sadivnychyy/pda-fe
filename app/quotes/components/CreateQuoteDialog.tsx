"use client";

import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Box,
  Button,
  Divider,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useMemo, useState } from "react";

import type { Client } from "@/app/clients/types"; // ✅ якщо інший шлях — підправ
import { useCreateQuoteMutation } from "../hooks/useCreateQuoteMutation";

type QuoteItemForm = {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // %
};

const emptyItem: QuoteItemForm = {
  name: "",
  description: "",
  quantity: 1,
  unitPrice: 0,
  taxRate: 0,
};

function toDayjs(value: string): Dayjs | null {
  if (!value) return null;
  const d = dayjs(value);
  return d.isValid() ? d : null;
}

function toISODate(value: Dayjs | null): string {
  if (!value) return "";
  return value.format("YYYY-MM-DD");
}

function todayISO() {
  return dayjs().format("YYYY-MM-DD");
}

export function CreateQuoteDialog({
  open,
  onClose,
  organizationId,
  createdById,
  clients,
  onCreated,
  onError,
}: {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  createdById: string;
  clients: Client[];
  onCreated: () => void;
  onError: (message: string) => void;
}) {
  const today = useMemo(() => todayISO(), []);

  const [clientId, setClientId] = useState<string>("");
  const [currency, setCurrency] = useState<string>("UAH");
  const [issueDate, setIssueDate] = useState<string>(today);
  const [validUntil, setValidUntil] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [items, setItems] = useState<QuoteItemForm[]>([{ ...emptyItem }]);

  const { mutateAsync, isLoading } = useCreateQuoteMutation();

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (acc, it) =>
        acc + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0),
      0,
    );
    const tax = items.reduce((acc, it) => {
      const base = (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0);
      const rate = Number(it.taxRate) || 0;
      return acc + base * (rate / 100);
    }, 0);
    const total = subtotal + tax;

    const fmt = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : "0.00");
    return { subtotal: fmt(subtotal), tax: fmt(tax), total: fmt(total) };
  }, [items]);

  const reset = () => {
    setClientId("");
    setCurrency("UAH");
    setIssueDate(today);
    setValidUntil("");
    setNotes("");
    setItems([{ ...emptyItem }]);
  };

  const addItem = () => setItems((p) => [...p, { ...emptyItem }]);
  const removeItem = (idx: number) =>
    setItems((p) => p.filter((_, i) => i !== idx));

  const updateItem = <K extends keyof QuoteItemForm>(
    idx: number,
    key: K,
    value: QuoteItemForm[K],
  ) => {
    setItems((p) =>
      p.map((it, i) => (i === idx ? { ...it, [key]: value } : it)),
    );
  };

  const validate = (): string | null => {
    if (!organizationId || !createdById)
      return "Немає organizationId/createdById";
    if (!items.length) return "Додай хоча б одну позицію";

    for (const [i, it] of items.entries()) {
      if (!it.name.trim()) return `Позиція #${i + 1}: назва обовʼязкова`;
      if ((Number(it.quantity) || 0) <= 0)
        return `Позиція #${i + 1}: quantity > 0`;
      if ((Number(it.unitPrice) || 0) < 0)
        return `Позиція #${i + 1}: unitPrice >= 0`;
      if ((Number(it.taxRate) || 0) < 0)
        return `Позиція #${i + 1}: taxRate >= 0`;
    }
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) return onError(err);

    try {
      await mutateAsync({
        organizationId,
        createdById,
        clientId: clientId || null,
        issueDate,
        validUntil: validUntil || null,
        currency,
        notes: notes || null,
        items: items.map((it) => ({
          name: it.name,
          description: it.description || null,
          quantity: Number(it.quantity) || 0,
          unitPrice: Number(it.unitPrice) || 0,
          taxRate: Number(it.taxRate) || 0,
        })),
      });

      reset();
      onCreated();
    } catch (e: any) {
      console.error(e);
      onError(e?.response?.data?.message || "Не вдалося створити Quote");
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4, p: 0 } }}
    >
      {/* ✅ HEADER як у твоїх інших Dialog */}
      <DialogTitle
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          bgcolor: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
            Нова комерційна пропозиція
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Заповни клієнта, позиції та умови.
          </Typography>
        </Box>

        <IconButton
          onClick={handleClose}
          disabled={isLoading}
          size="small"
          aria-label="Close dialog"
          sx={{
            color: "#6b7280",
            "&:hover": { bgcolor: "#f3f4f6" },
            "&.Mui-disabled": { color: "#cbd5e1" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: "#f8fafc" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: "#e2e8f0",
              p: 2,
              marginTop: "15px",
            }}
          >
            <Stack spacing={1.5}>
              {/* ✅ Select (TextField select) + placeholder */}
              <TextField
                select
                label="Клієнт"
                variant={"standard"}
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                size="small"
                fullWidth
                disabled={isLoading}
                InputLabelProps={{ shrink: true }}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="" sx={{ color: "text.secondary" }}>
                  Обери клієнта
                </MenuItem>
                {clients.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField
                  label="Валюта"
                  variant={"standard"}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  size="small"
                  fullWidth
                  disabled={isLoading}
                  InputLabelProps={{ shrink: true }}
                />

                {/* ✅ MUI DatePicker: issueDate */}
                <DatePicker
                  variant={"standard"}
                  label="Дата"
                  value={toDayjs(issueDate)}
                  onChange={(d) => setIssueDate(toISODate(d))}
                  disabled={isLoading}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      InputLabelProps: { shrink: true },
                    },
                  }}
                />
              </Stack>

              {/* ✅ MUI DatePicker: validUntil */}
              <DatePicker
                variant={"standard"}
                label="Дійсна до"
                value={toDayjs(validUntil)}
                onChange={(d) => setValidUntil(toISODate(d))}
                disabled={isLoading}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    InputLabelProps: { shrink: true },
                  },
                }}
              />

              <TextField
                variant={"standard"}
                label="Нотатки"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                size="small"
                fullWidth
                disabled={isLoading}
                multiline
                minRows={2}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Paper>

          <Paper
            variant="outlined"
            sx={{ borderRadius: 3, borderColor: "#e2e8f0", p: 2 }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
                Позиції
              </Typography>

              <Button
                onClick={addItem}
                startIcon={<AddIcon />}
                variant="outlined"
                size="small"
                color={"primary.contrastText"}
                disabled={isLoading}
                sx={{ textTransform: "none", borderRadius: 999 }}
              >
                Додати
              </Button>
            </Stack>

            <Box sx={{ overflowX: "auto" }}>
              <Table size="small" sx={{ minWidth: 720 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>Назва</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Опис</TableCell>
                    <TableCell sx={{ fontWeight: 800, width: 90 }}>
                      К-сть
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, width: 140 }}>
                      Ціна
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, width: 90 }}>
                      ПДВ %
                    </TableCell>
                    <TableCell sx={{ width: 56 }} />
                  </TableRow>
                </TableHead>

                <TableBody>
                  {items.map((it, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <TextField
                          value={it.name}
                          variant={"standard"}
                          onChange={(e) =>
                            updateItem(idx, "name", e.target.value)
                          }
                          size="small"
                          placeholder="Послуга/товар"
                          fullWidth
                          disabled={isLoading}
                        />
                      </TableCell>

                      <TableCell>
                        <TextField
                          value={it.description}
                          onChange={(e) =>
                            updateItem(idx, "description", e.target.value)
                          }
                          size="small"
                          variant={"standard"}
                          placeholder="Деталі"
                          fullWidth
                          disabled={isLoading}
                        />
                      </TableCell>

                      <TableCell>
                        <TextField
                          value={it.quantity}
                          onChange={(e) =>
                            updateItem(idx, "quantity", Number(e.target.value))
                          }
                          size="small"
                          variant={"standard"}
                          type="number"
                          inputProps={{ min: 1 }}
                          fullWidth
                          disabled={isLoading}
                        />
                      </TableCell>

                      <TableCell>
                        <TextField
                          variant={"standard"}
                          value={it.unitPrice}
                          onChange={(e) =>
                            updateItem(idx, "unitPrice", Number(e.target.value))
                          }
                          size="small"
                          type="number"
                          inputProps={{ min: 0, step: "0.01" }}
                          fullWidth
                          disabled={isLoading}
                        />
                      </TableCell>

                      <TableCell>
                        <TextField
                          variant={"standard"}
                          value={it.taxRate}
                          onChange={(e) =>
                            updateItem(idx, "taxRate", Number(e.target.value))
                          }
                          size="small"
                          type="number"
                          inputProps={{ min: 0, step: "0.01" }}
                          fullWidth
                          disabled={isLoading}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <IconButton
                          onClick={() => removeItem(idx)}
                          disabled={isLoading || items.length === 1}
                          size="small"
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Stack spacing={0.5} sx={{ alignItems: "flex-end" }}>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Subtotal: <b>{totals.subtotal}</b> {currency}
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Tax: <b>{totals.tax}</b> {currency}
              </Typography>
              <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
                Total: {totals.total} {currency}
              </Typography>
            </Stack>
          </Paper>

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={isLoading}
              sx={{
                textTransform: "none",
                borderRadius: 999,
                bgcolor: "#111827",
                "&:hover": { bgcolor: "#020617" },
                color: "white",
              }}
            >
              {isLoading ? "Зберігаю..." : "Зберегти Quote"}
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
