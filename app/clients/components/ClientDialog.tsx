"use client";

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  TextField,
  Typography,
} from "@mui/material";
import type { ClientFormValues } from "../types";

export const ClientDialog = ({
  open,
  onClose,
  isEditing,
  form,
  setField,
  onSubmit,
  submitting,
  canSubmit,
}: {
  open: boolean;
  onClose: () => void;
  isEditing: boolean;
  form: ClientFormValues;
  setField: (k: keyof ClientFormValues, v: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  canSubmit: boolean;
}) => {
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
          Заповни основні дані клієнта — назву компанії, контактну особу,
          реквізити та нотатки.
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
            label="Контактна особа"
            fullWidth
            value={form.contactName}
            onChange={(e) => setField("contactName", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Email"
            fullWidth
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Телефон"
            fullWidth
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Податковий номер / ЄДРПОУ"
            fullWidth
            value={form.taxNumber}
            onChange={(e) => setField("taxNumber", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Адреса"
            fullWidth
            value={form.address}
            onChange={(e) => setField("address", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Нотатки (опціонально)"
            fullWidth
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
