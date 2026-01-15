"use client";

import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo } from "react";
import type { ClientCrmStatus, ClientFormValues } from "../types";
import { CRM_STATUS_LABELS } from "../utils";

const CRM_OPTIONS: { value: ClientCrmStatus; label: string }[] = [
  { value: "LEAD", label: CRM_STATUS_LABELS.LEAD },
  { value: "IN_PROGRESS", label: CRM_STATUS_LABELS.IN_PROGRESS },
  { value: "ACTIVE", label: CRM_STATUS_LABELS.ACTIVE },
  { value: "INACTIVE", label: CRM_STATUS_LABELS.INACTIVE },
];

function normalizeTags(tags: string[]) {
  const cleaned = (tags ?? [])
    .map((t) => (t ?? "").trim())
    .filter(Boolean)
    .map((t) => (t.length > 30 ? t.slice(0, 30) : t));
  return Array.from(new Set(cleaned)).slice(0, 20);
}

export const ClientDialog = ({
  open,
  onClose,
  isEditing,
  form,
  setField,
  onSubmit,
  submitting,
  canSubmit,
  tagOptions,
}: {
  open: boolean;
  onClose: () => void;
  isEditing: boolean;
  form: ClientFormValues;
  setField: <K extends keyof ClientFormValues>(
    k: K,
    v: ClientFormValues[K],
  ) => void;
  onSubmit: () => void;
  submitting: boolean;
  canSubmit: boolean;
  tagOptions: string[];
}) => {
  const options = useMemo(
    () => (tagOptions ?? []).map((t) => t.trim()).filter(Boolean),
    [tagOptions],
  );

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4, p: 0 } }}
    >
      <DialogContent sx={{ padding: "24px" }}>
        <Box
          sx={{
            display: "inline-flex",
            px: 1.5,
            py: 0.5,
            borderRadius: 999,
            bgcolor: "#f3f4f6",
            mb: 2,
          }}
        >
          <Typography
            variant="caption"
            sx={{ letterSpacing: 0.8, fontWeight: 600, color: "#6b7280" }}
          >
            CLIENTS
          </Typography>
        </Box>

        <Typography
          variant="h5"
          sx={{ fontWeight: 700, mb: 0.5, color: "#020617" }}
        >
          {isEditing ? "Редагувати клієнта" : "Додати клієнта"}
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: "#6b7280", mb: 3, maxWidth: 520 }}
        >
          Заповни дані клієнта. Теги — як у CRM: вибирай зі списку, щоб швидко
          фільтрувати.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <TextField
            label="Назва клієнта *"
            placeholder="Наприклад: ТОВ «Агро Світ»"
            fullWidth
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            select
            label="CRM-статус"
            fullWidth
            value={form.crmStatus}
            onChange={(e) => setField("crmStatus", e.target.value as any)}
            InputLabelProps={{ shrink: true }}
          >
            {CRM_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>

          {/* ✅ ТЕГИ: ТІЛЬКИ ВИБІР З АВТОКОМПЛІТУ */}
          <Autocomplete
            multiple
            options={options}
            value={form.tags}
            onChange={(_, value) => {
              setField("tags", normalizeTags(value as string[]));
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  size="small"
                  label={option}
                  {...getTagProps({ index })}
                  key={`${option}-${index}`}
                  sx={{
                    bgcolor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    fontWeight: 800,
                  }}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Теги"
                placeholder="Обери теги…"
                InputLabelProps={{ shrink: true }}
              />
            )}
          />

          <TextField
            label="Контактна особа"
            placeholder="Введіть контактну особу"
            fullWidth
            value={form.contactName}
            onChange={(e) => setField("contactName", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Email"
            fullWidth
            placeholder="Введіть email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Телефон"
            placeholder="Введіть номер телефону"
            fullWidth
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Податковий номер / ЄДРПОУ"
            fullWidth
            placeholder="Введіть податковий номер"
            value={form.taxNumber}
            onChange={(e) => setField("taxNumber", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Адреса"
            placeholder="Введіть адресу"
            fullWidth
            value={form.address}
            onChange={(e) => setField("address", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Нотатки (опціонально)"
            fullWidth
            placeholder="Нотатки"
            multiline
            minRows={3}
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 4,
            gap: 2,
          }}
        >
          <Button
            onClick={onClose}
            disabled={submitting}
            sx={{ textTransform: "none", color: "#6b7280" }}
          >
            Скасувати
          </Button>

          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={submitting || !canSubmit}
            sx={{
              textTransform: "none",
              borderRadius: 999,
              px: 3,
              bgcolor: "#111827",
              "&:hover": { bgcolor: "#020617" },
            }}
          >
            {submitting ? "Зберігаємо..." : "Зберегти клієнта"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
