"use client";

import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Divider,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Client } from "@/app/clients/types";
import { api } from "@/libs/axios";
import { useCreateQuoteMutation } from "../hooks/useCreateQuoteMutation";

type ServiceEntity = {
  id: string;
  name: string;
  description?: string | null;
  unitPrice?: number | string | null;
  price?: number | string | null;
  taxRate?: number | string | null;
};

type QuoteItemForm = {
  name: string;
  description: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
  serviceId: string | null;
  addToMyServices: boolean;
};

const emptyItem: QuoteItemForm = {
  name: "",
  description: "",
  quantity: "1",
  unitPrice: "",
  taxRate: "0",
  serviceId: null,
  addToMyServices: false,
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

const servicesKeys = {
  all: ["services"] as const,
  list: (search: string) => [...servicesKeys.all, "list", search] as const,
};

async function fetchServices(search: string) {
  const res = await api.get<{ services: ServiceEntity[] }>("/services", {
    params: search?.trim() ? { search: search.trim() } : undefined,
  });
  return res.data.services ?? [];
}

async function createService(payload: {
  name: string;
  description?: string | null;
  unitPrice: number;
  taxRate?: number | null;
  organizationId?: string;
}) {
  const res = await api.post<{ service: ServiceEntity }>("/services", payload);
  return res.data.service;
}

const priceRegex = /^\d+(\.\d{1,2})?$/;

function normalizePriceInput(s: string) {
  return (s ?? "").trim();
}

function isExactMatchServiceName(name: string, services: ServiceEntity[]) {
  const n = name.trim().toLowerCase();
  if (!n) return false;
  return services.some((s) => (s.name ?? "").trim().toLowerCase() === n);
}

function getServicePrice(s: ServiceEntity): number {
  const raw = s.unitPrice ?? s.price ?? 0;
  const n = typeof raw === "string" ? Number(raw) : Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function getServiceTax(s: ServiceEntity): number {
  const raw = s.taxRate ?? 0;
  const n = typeof raw === "string" ? Number(raw) : Number(raw);
  return Number.isFinite(n) ? n : 0;
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
  const qc = useQueryClient();
  const today = useMemo(() => todayISO(), []);

  const [clientId, setClientId] = useState<string>("");
  const [clientError, setClientError] = useState<string>(""); // ✅ new
  const [currency, setCurrency] = useState<string>("UAH");
  const [issueDate, setIssueDate] = useState<string>(today);
  const [validUntil, setValidUntil] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [items, setItems] = useState<QuoteItemForm[]>([{ ...emptyItem }]);

  const servicesQuery = useQuery({
    queryKey: servicesKeys.all,
    enabled: open,
    queryFn: () => fetchServices(""),
    staleTime: 60_000,
  });

  const createServiceMutation = useMutation({
    mutationFn: createService,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: servicesKeys.all });
    },
  });

  const { mutateAsync: createQuote, isLoading: isCreatingQuote } =
    useCreateQuoteMutation();

  const isLoading = isCreatingQuote || servicesQuery.isFetching;

  const services = servicesQuery.data ?? [];

  const addItem = () => setItems((p) => [...p, { ...emptyItem }]);
  const removeItem = (idx: number) =>
    setItems((p) => (p.length === 1 ? p : p.filter((_, i) => i !== idx)));

  const updateItem = <K extends keyof QuoteItemForm>(
    idx: number,
    key: K,
    value: QuoteItemForm[K],
  ) => {
    setItems((p) =>
      p.map((it, i) => (i === idx ? { ...it, [key]: value } : it)),
    );
  };

  const reset = () => {
    setClientId("");
    setClientError(""); // ✅
    setCurrency("UAH");
    setIssueDate(today);
    setValidUntil("");
    setNotes("");
    setItems([{ ...emptyItem }]);
  };

  const totals = useMemo(() => {
    const subtotalN = items.reduce((acc, it) => {
      const q = Number(it.quantity);
      const p = Number(it.unitPrice);
      if (!Number.isFinite(q) || !Number.isFinite(p)) return acc;
      return acc + q * p;
    }, 0);

    const taxN = items.reduce((acc, it) => {
      const q = Number(it.quantity);
      const p = Number(it.unitPrice);
      const r = Number(it.taxRate);
      if (!Number.isFinite(q) || !Number.isFinite(p) || !Number.isFinite(r))
        return acc;
      const base = q * p;
      return acc + base * (r / 100);
    }, 0);

    const totalN = subtotalN + taxN;
    const fmt = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : "0.00");
    return { subtotal: fmt(subtotalN), tax: fmt(taxN), total: fmt(totalN) };
  }, [items]);

  const validate = (): string | null => {
    if (!organizationId || !createdById)
      return "Немає organizationId/createdById";

    // ✅ клієнт обов'язковий
    if (!clientId) {
      setClientError("Оберіть клієнта");
      return "Клієнт — обовʼязково";
    } else {
      setClientError("");
    }

    if (!items.length) return "Додайте хоча б одну позицію";

    for (const [i, it] of items.entries()) {
      const row = i + 1;

      const name = (it.name ?? "").trim();
      if (!name) return `Позиція #${row}: послуга/товар — обовʼязково`;

      const qtyRaw = (it.quantity ?? "").trim();
      if (!qtyRaw) return `Позиція #${row}: кількість — обовʼязково`;
      if (qtyRaw.includes(","))
        return `Позиція #${row}: кількість тільки числом`;
      const qty = Number(qtyRaw);
      if (!Number.isFinite(qty) || qty <= 0)
        return `Позиція #${row}: кількість має бути числом > 0`;

      const priceRaw = normalizePriceInput(it.unitPrice ?? "");
      if (!priceRaw) return `Позиція #${row}: ціна — обовʼязково`;
      if (priceRaw.includes(",")) {
        return `Позиція #${row}: ціна має бути з крапкою (наприклад 12.50)`;
      }
      if (!priceRegex.test(priceRaw)) {
        return `Позиція #${row}: введіть коректну ціну (до 2 знаків після крапки)`;
      }
      const price = Number(priceRaw);
      if (!Number.isFinite(price) || price < 0)
        return `Позиція #${row}: ціна має бути числом >= 0`;

      const taxRaw = (it.taxRate ?? "").trim();
      if (taxRaw) {
        if (taxRaw.includes(",")) {
          return `Позиція #${row}: ПДВ має бути з крапкою (наприклад 20 або 20.00)`;
        }
        const tax = Number(taxRaw);
        if (!Number.isFinite(tax) || tax < 0)
          return `Позиція #${row}: ПДВ має бути числом >= 0`;
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) return onError(err);

    try {
      const toCreate = items
        .map((it) => ({
          ...it,
          nameTrim: it.name.trim(),
          priceN: Number(normalizePriceInput(it.unitPrice)),
          taxN: it.taxRate ? Number(it.taxRate) : 0,
        }))
        .filter((it) => it.addToMyServices)
        .filter((it) => !it.serviceId)
        .filter((it) => it.nameTrim.length > 0)
        .filter((it) => !isExactMatchServiceName(it.nameTrim, services));

      for (const it of toCreate) {
        await createServiceMutation.mutateAsync({
          name: it.nameTrim,
          description: it.description?.trim() ? it.description.trim() : null,
          price: it.priceN.toString(),
          taxRate: Number.isFinite(it.taxN) ? it.taxN : 0,
          organizationId,
        });
      }
    } catch (e: any) {
      console.error(e);
      return onError(
        e?.response?.data?.message ||
          "Не вдалося додати послугу/товар до списку",
      );
    }

    try {
      await createQuote({
        organizationId,
        createdById,
        clientId, // ✅ тепер точно не пустий
        issueDate,
        validUntil: validUntil || null,
        currency,
        notes: notes || null,
        items: items.map((it) => ({
          name: it.name.trim(),
          description: it.description?.trim() ? it.description.trim() : null,
          quantity: Number(it.quantity) || 0,
          unitPrice: Number(normalizePriceInput(it.unitPrice)) || 0,
          taxRate: it.taxRate ? Number(it.taxRate) || 0 : 0,
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
    reset();
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
            Обери клієнта, додай позиції та умови.
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
              <TextField
                select
                required
                label="Клієнт"
                variant="standard"
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  if (e.target.value) setClientError("");
                }}
                size="small"
                fullWidth
                disabled={isLoading}
                InputLabelProps={{ shrink: true }}
                SelectProps={{ displayEmpty: true }}
                error={Boolean(clientError)}
                helperText={clientError || " "}
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
                  variant="standard"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  size="small"
                  fullWidth
                  disabled={isLoading}
                  InputLabelProps={{ shrink: true }}
                />

                <DatePicker
                  label="Дата"
                  value={toDayjs(issueDate)}
                  onChange={(d) => setIssueDate(toISODate(d))}
                  disabled={isLoading}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      variant: "standard",
                      InputLabelProps: { shrink: true },
                    },
                  }}
                />
              </Stack>

              <DatePicker
                label="Дійсна до"
                value={toDayjs(validUntil)}
                onChange={(d) => setValidUntil(toISODate(d))}
                disabled={isLoading}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    variant: "standard",
                    InputLabelProps: { shrink: true },
                  },
                }}
              />

              <TextField
                variant="standard"
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
              sx={{ mb: 2 }}
            >
              <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
                Позиції
              </Typography>
            </Stack>

            <Stack spacing={2}>
              {items.map((it, idx) => {
                const showAddToServices =
                  it.name.trim().length > 0 &&
                  !it.serviceId &&
                  !isExactMatchServiceName(it.name, services);

                const itemTotal = (() => {
                  const q = Number(it.quantity);
                  const p = Number(it.unitPrice);
                  const r = Number(it.taxRate);
                  if (!Number.isFinite(q) || !Number.isFinite(p)) return 0;
                  const base = q * p;
                  const tax = Number.isFinite(r) ? base * (r / 100) : 0;
                  return base + tax;
                })();

                return (
                  <Paper
                    key={idx}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      borderColor: "#e5e7eb",
                      bgcolor: "#ffffff",
                      position: "relative",
                    }}
                  >
                    <Stack spacing={2}>
                      {/* Header з номером та кнопкою видалення */}
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, color: "#475569" }}
                        >
                          Позиція #{idx + 1}
                        </Typography>

                        <IconButton
                          onClick={() => removeItem(idx)}
                          disabled={isLoading || items.length === 1}
                          size="small"
                          sx={{
                            color: "#ef4444",
                            "&:hover": { bgcolor: "#fee2e2" },
                            "&.Mui-disabled": { color: "#cbd5e1" },
                          }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Stack>

                      {/* Послуга/товар */}
                      <Box>
                        <Autocomplete
                          freeSolo
                          options={services}
                          getOptionLabel={(opt) =>
                            typeof opt === "string" ? opt : opt.name
                          }
                          value={
                            it.serviceId
                              ? (services.find((s) => s.id === it.serviceId) ??
                                null)
                              : null
                          }
                          inputValue={it.name}
                          onInputChange={(_, value) => {
                            updateItem(idx, "name", value);
                            updateItem(idx, "serviceId", null);
                            if (!value.trim()) {
                              updateItem(idx, "addToMyServices", false);
                            }
                          }}
                          onChange={(_, selected) => {
                            if (!selected || typeof selected === "string") {
                              return;
                            }

                            updateItem(idx, "serviceId", selected.id);
                            updateItem(idx, "name", selected.name ?? "");
                            updateItem(
                              idx,
                              "description",
                              (selected.description ?? "") as any,
                            );

                            const price = getServicePrice(selected);
                            const tax = getServiceTax(selected);

                            updateItem(
                              idx,
                              "unitPrice",
                              Number.isFinite(price) ? String(price) : "",
                            );
                            updateItem(
                              idx,
                              "taxRate",
                              Number.isFinite(tax) ? String(tax) : "0",
                            );

                            updateItem(idx, "addToMyServices", false);
                          }}
                          renderOption={(props, opt) => (
                            <li {...props} key={opt.id}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  gap: 2,
                                  width: "100%",
                                  alignItems: "flex-start",
                                }}
                              >
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography
                                    sx={{
                                      fontWeight: 900,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {opt?.name}
                                  </Typography>
                                  {opt.description ? (
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "text.secondary" }}
                                    >
                                      {opt?.description}
                                    </Typography>
                                  ) : null}
                                </Box>

                                <Typography
                                  sx={{ fontWeight: 900, whiteSpace: "nowrap" }}
                                >
                                  {Number(opt?.price ?? 0).toFixed(2)}
                                </Typography>
                              </Box>
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              InputLabelProps={{ shrink: true }}
                              label="Послуга/товар"
                              variant="standard"
                              placeholder="Обери зі списку або введи вручну"
                              fullWidth
                              disabled={isLoading}
                              size="small"
                            />
                          )}
                        />

                        {showAddToServices && (
                          <FormControlLabel
                            sx={{ mt: 1, ml: 0 }}
                            control={
                              <Checkbox
                                size="small"
                                checked={it.addToMyServices}
                                onChange={(e) =>
                                  updateItem(
                                    idx,
                                    "addToMyServices",
                                    e.target.checked,
                                  )
                                }
                              />
                            }
                            label={
                              <Typography
                                variant="caption"
                                sx={{ color: "#475569" }}
                              >
                                Додати в "Мої послуги/товари"
                              </Typography>
                            }
                          />
                        )}
                      </Box>

                      <TextField
                        label="Опис"
                        value={it.description}
                        onChange={(e) =>
                          updateItem(idx, "description", e.target.value)
                        }
                        size="small"
                        variant="standard"
                        placeholder="Додаткова інформація про позицію"
                        fullWidth
                        disabled={isLoading}
                        InputLabelProps={{ shrink: true }}
                        multiline
                        minRows={2}
                      />

                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1.5}
                      >
                        <TextField
                          label="Кількість"
                          value={it.quantity}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || /^[0-9.]*$/.test(value)) {
                              updateItem(idx, "quantity", value);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === ",") e.preventDefault();
                          }}
                          size="small"
                          variant="standard"
                          InputLabelProps={{ shrink: true }}
                          placeholder="1"
                          fullWidth
                          disabled={isLoading}
                          inputProps={{ inputMode: "decimal" }}
                        />

                        <TextField
                          label="Ціна за одиницю"
                          value={it.unitPrice}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || /^[0-9.]*$/.test(value)) {
                              updateItem(idx, "unitPrice", value);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === ",") e.preventDefault();
                          }}
                          size="small"
                          variant="standard"
                          placeholder="0.00"
                          fullWidth
                          disabled={isLoading}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ inputMode: "decimal" }}
                        />

                        <TextField
                          label="ПДВ %"
                          InputLabelProps={{ shrink: true }}
                          value={it.taxRate}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || /^[0-9.]*$/.test(value)) {
                              updateItem(idx, "taxRate", value);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === ",") e.preventDefault();
                          }}
                          size="small"
                          variant="standard"
                          placeholder="0"
                          fullWidth
                          disabled={isLoading}
                          inputProps={{ inputMode: "decimal" }}
                        />
                      </Stack>

                      {itemTotal > 0 && (
                        <Box
                          sx={{
                            mt: 1,
                            pt: 1.5,
                            borderTop: "1px solid #e5e7eb",
                          }}
                        >
                          <Typography
                            variant="body2"
                            align="right"
                            sx={{ color: "#64748b" }}
                          >
                            Сума позиції:{" "}
                            <strong>
                              {itemTotal.toFixed(2)} {currency}
                            </strong>
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>

            <Button
              onClick={addItem}
              startIcon={<AddIcon />}
              variant="outlined"
              size="small"
              disabled={isLoading}
              sx={{
                my: 2,
                textTransform: "none",
                borderRadius: 999,
                border: "none",
                backgroundColor: "black",
                color: "white",
              }}
            >
              Додати
            </Button>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={0.5} sx={{ alignItems: "flex-end" }}>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Subtotal: <b>{totals.subtotal}</b> {currency}
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Tax: <b>{totals.tax}</b> {currency}
              </Typography>
              <Typography
                sx={{ fontWeight: 900, color: "#0f172a", fontSize: "1.1rem" }}
              >
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
                px: 3,
                py: 1,
              }}
            >
              {isLoading ? "Зберігаю..." : "Зберегти пропозицію"}
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
