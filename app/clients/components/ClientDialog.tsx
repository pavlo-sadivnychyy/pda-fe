"use client";

import CloseIcon from "@mui/icons-material/Close";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
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

  // ✅ from hook
  errors,
  submitAttempted,
}: {
  open: boolean;
  onClose: () => void;
  isEditing: boolean;
  form: ClientFormValues;
  setField: <K extends keyof ClientFormValues>(
    k: K,
    v: ClientFormValues[K],
  ) => void;

  // ✅ onSubmit should already be wrapped with handleSubmit in ClientsPage
  onSubmit: () => void;

  submitting: boolean;
  canSubmit: boolean;
  tagOptions: string[];

  errors: Partial<Record<keyof ClientFormValues, string>>;
  submitAttempted: boolean;
}) => {
  const options = useMemo(
    () => (tagOptions ?? []).map((t) => t.trim()).filter(Boolean),
    [tagOptions],
  );

  const fieldError = (k: keyof ClientFormValues) =>
    Boolean(submitAttempted && errors?.[k]);

  const fieldHelper = (k: keyof ClientFormValues) =>
    submitAttempted ? (errors?.[k] ?? "") : "";

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="sm"
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
        <Typography sx={{ fontWeight: 800, fontSize: 18, color: "#020617" }}>
          {isEditing ? "Редагувати клієнта" : "Додати клієнта"}
        </Typography>

        <IconButton
          onClick={onClose}
          disabled={submitting}
          size="small"
          aria-label="Close dialog"
          sx={{
            color: "#6b7280",
            "&:hover": { bgcolor: "#f3f4f6" },
            "&.Mui-disabled": { color: "#cbd5e1" },
          }}
        >
          <CloseIcon fontSize="medium" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: "24px" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            paddingTop: "15px",
          }}
        >
          <TextField
            label="Назва клієнта *"
            placeholder="Наприклад: ТОВ «Агро Світ»"
            fullWidth
            variant="standard"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={fieldError("name")}
            helperText={fieldHelper("name")}
          />

          <TextField
            select
            label="CRM-статус"
            fullWidth
            variant="standard"
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
                variant="standard"
                placeholder="Обери теги…"
                InputLabelProps={{ shrink: true }}
                error={fieldError("tags")}
                helperText={fieldHelper("tags")}
              />
            )}
          />

          <TextField
            variant="standard"
            label="Контактна особа"
            placeholder="Введіть контактну особу"
            fullWidth
            value={form.contactName}
            onChange={(e) => setField("contactName", e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={fieldError("contactName")}
            helperText={fieldHelper("contactName")}
          />

          <TextField
            variant="standard"
            label="Email *"
            fullWidth
            placeholder="name@company.com"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={fieldError("email")}
            helperText={fieldHelper("email")}
            autoComplete="email"
          />

          <TextField
            variant="standard"
            label="Телефон"
            placeholder="+380..."
            fullWidth
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={fieldError("phone")}
            helperText={fieldHelper("phone")}
            autoComplete="tel"
          />

          <TextField
            variant="standard"
            label="Податковий номер / ЄДРПОУ"
            fullWidth
            placeholder="8 або 10 цифр"
            value={form.taxNumber}
            onChange={(e) => setField("taxNumber", e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={fieldError("taxNumber")}
            helperText={fieldHelper("taxNumber")}
          />

          <TextField
            variant="standard"
            label="Адреса"
            placeholder="Введіть адресу"
            fullWidth
            value={form.address}
            onChange={(e) => setField("address", e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={fieldError("address")}
            helperText={fieldHelper("address")}
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
            error={fieldError("notes")}
            helperText={fieldHelper("notes")}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            mt: 4,
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={submitting || !canSubmit}
            sx={{
              textTransform: "none",
              borderRadius: 999,
              px: 3,
              bgcolor: "#111827",
              color: "white",
              "&:hover": { bgcolor: "#020617" },
              "&.Mui-disabled": {
                bgcolor: "rgba(17,24,39,0.35)",
                color: "rgba(255,255,255,0.85)",
              },
            }}
          >
            {submitting ? "Зберігаємо..." : "Зберегти клієнта"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
