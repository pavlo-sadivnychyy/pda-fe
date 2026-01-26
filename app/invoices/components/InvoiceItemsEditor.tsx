"use client";

import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import type { InvoiceCreateFormState, InvoiceItemForm } from "../types";
import { useMemo, useState } from "react";
import { UserService } from "@/app/invoices/hooks/useServicesQueries";
import type { ValidationErrors } from "../hooks/useInvoiceForm";

type Props = {
  form: InvoiceCreateFormState;
  errors: ValidationErrors;

  onItemChange: (
    index: number,
    field: keyof InvoiceItemForm,
    value: any,
  ) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;

  services: UserService[];
  servicesLoading: boolean;
};

type ServiceOption = {
  id: string;
  label: string;
  price: number;
  description?: string | null;
};

const parsePrice = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export function InvoiceItemsEditor({
  form,
  errors,
  onItemChange,
  onAddItem,
  onRemoveItem,
  services,
  servicesLoading,
}: Props) {
  const options: ServiceOption[] = useMemo(
    () =>
      (services ?? []).map((s) => ({
        id: s.id,
        label: s.name,
        price: parsePrice(s.price),
        description: s.description ?? null,
      })),
    [services],
  );

  const [inputs, setInputs] = useState<Record<number, string>>({});

  const setInput = (index: number, v: string) =>
    setInputs((p) => ({ ...p, [index]: v }));

  return (
    <Box>
      <Typography sx={{ fontWeight: 900, color: "#0f172a", mb: 1.2 }}>
        Позиції інвойсу
      </Typography>

      <Box
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: 3,
          bgcolor: "#fff",
          overflow: "hidden",
        }}
      >
        {form.items.map((item, index) => {
          const selected = item.serviceId
            ? (options.find((o) => o.id === item.serviceId) ?? null)
            : null;

          const inputValue =
            inputs[index] ?? (selected ? selected.label : (item.name ?? ""));

          const itemErrors = errors.items[index] || {};

          return (
            <Box key={index} sx={{ p: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
                  Позиція {index + 1}
                </Typography>

                <IconButton
                  onClick={() => onRemoveItem(index)}
                  disabled={form.items.length === 1}
                  size="small"
                  sx={{
                    color: "#0f172a",
                    "&:hover": { bgcolor: "#f1f5f9" },
                    "&.Mui-disabled": { color: "#cbd5e1" },
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Box>

              <Box
                sx={{
                  mt: 1.6,
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1.6fr 1fr" },
                  gap: 2.2,
                }}
              >
                <Autocomplete
                  loading={servicesLoading}
                  options={options}
                  value={selected}
                  inputValue={inputValue}
                  freeSolo
                  getOptionLabel={(opt) =>
                    typeof opt === "string" ? opt : opt.label
                  }
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  onInputChange={(_, v) => {
                    setInput(index, v);
                    onItemChange(index, "serviceId", null);
                    onItemChange(index, "name", v);
                  }}
                  onChange={(_, v) => {
                    if (v && typeof v !== "string") {
                      setInput(index, v.label);
                      onItemChange(index, "serviceId", v.id);
                      onItemChange(index, "name", v.label);
                      onItemChange(index, "unitPrice", String(v.price ?? 0));

                      if (
                        !String(item.description ?? "").trim() &&
                        v.description
                      ) {
                        onItemChange(index, "description", v.description ?? "");
                      }

                      onItemChange(index, "addToMyServices", false);
                      return;
                    }

                    if (typeof v === "string") {
                      setInput(index, v);
                      onItemChange(index, "serviceId", null);
                      onItemChange(index, "name", v);
                    }
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
                            {opt.label}
                          </Typography>
                          {opt.description ? (
                            <Typography
                              variant="caption"
                              sx={{ color: "text.secondary" }}
                            >
                              {opt.description}
                            </Typography>
                          ) : null}
                        </Box>

                        <Typography
                          sx={{ fontWeight: 900, whiteSpace: "nowrap" }}
                        >
                          {Number(opt.price ?? 0).toFixed(2)}
                        </Typography>
                      </Box>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Послуга / товар"
                      variant="standard"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      placeholder="Обери зі списку або введи вручну"
                      error={Boolean(itemErrors.name)}
                      helperText={itemErrors.name}
                    />
                  )}
                />

                <TextField
                  label="Опис (опційно)"
                  variant="standard"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={item.description}
                  onChange={(e) =>
                    onItemChange(index, "description", e.target.value)
                  }
                />

                <TextField
                  label="Кількість"
                  variant="standard"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={item.quantity}
                  onChange={(e) =>
                    onItemChange(index, "quantity", e.target.value)
                  }
                  error={Boolean(itemErrors.quantity)}
                  helperText={itemErrors.quantity}
                  placeholder="Введіть число"
                />

                <TextField
                  label="Ціна за одиницю"
                  variant="standard"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={item.unitPrice}
                  onChange={(e) =>
                    onItemChange(index, "unitPrice", e.target.value)
                  }
                  error={Boolean(itemErrors.unitPrice)}
                  helperText={itemErrors.unitPrice}
                  placeholder="Введіть число (наприклад: 100 або 99.50)"
                />

                <TextField
                  label="Податок % (опційно)"
                  variant="standard"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={item.taxRate}
                  onChange={(e) =>
                    onItemChange(index, "taxRate", e.target.value)
                  }
                  placeholder="Наприклад: 20"
                />

                <Box sx={{ display: "flex", alignItems: "flex-end" }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(item.addToMyServices)}
                        onChange={(e) =>
                          onItemChange(
                            index,
                            "addToMyServices",
                            e.target.checked,
                          )
                        }
                        disabled={
                          Boolean(item.serviceId) ||
                          !String(item.name ?? "").trim()
                        }
                      />
                    }
                    label="Додати в мої товари/послуги"
                    sx={{
                      "& .MuiFormControlLabel-label": {
                        fontSize: 14,
                        color: "#0f172a",
                        fontWeight: 700,
                      },
                    }}
                  />
                </Box>
              </Box>

              {index !== form.items.length - 1 ? (
                <Divider sx={{ mt: 2 }} />
              ) : null}
            </Box>
          );
        })}
      </Box>

      <Box sx={{ mt: 1.6, display: "flex", justifyContent: "flex-start" }}>
        <Button
          onClick={onAddItem}
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 900,
            bgcolor: "#0f172a",
            color: "#fff",
            px: 2.5,
            "&:hover": { bgcolor: "#020617" },
          }}
        >
          Додати позицію
        </Button>
      </Box>
    </Box>
  );
}
