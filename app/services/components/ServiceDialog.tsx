"use client";

import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";
import type { ServiceFormValues } from "../types";

export const ServiceDialog = ({
  open,
  onClose,
  isEditing,
  form,
  setField,
  onSubmit,
  submitting,
  canSubmit,
  errors,
  submitAttempted,
}: {
  open: boolean;
  onClose: () => void;
  isEditing: boolean;
  form: ServiceFormValues;
  setField: <K extends keyof ServiceFormValues>(
    k: K,
    v: ServiceFormValues[K],
  ) => void;
  onSubmit: () => void;
  submitting: boolean;
  canSubmit: boolean;
  errors: Partial<Record<keyof ServiceFormValues, string>>;
  submitAttempted: boolean;
}) => {
  const fieldError = (k: keyof ServiceFormValues) =>
    Boolean(submitAttempted && errors?.[k]);
  const fieldHelper = (k: keyof ServiceFormValues) =>
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
          {isEditing ? "Редагувати послугу" : "Додати послугу"}
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
            label="Назва послуги *"
            placeholder="Наприклад: Консультація"
            fullWidth
            variant="standard"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={fieldError("name")}
            helperText={fieldHelper("name")}
          />

          <TextField
            label="Опис (опціонально)"
            fullWidth
            placeholder="Короткий опис послуги"
            multiline
            minRows={3}
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            InputLabelProps={{ shrink: true }}
            variant="standard"
            error={fieldError("description")}
            helperText={fieldHelper("description")}
          />

          <TextField
            label="Ціна *"
            fullWidth
            placeholder="Наприклад: 1500 або 1500.00"
            value={form.price}
            onChange={(e) => setField("price", e.target.value)}
            InputLabelProps={{ shrink: true }}
            variant="standard"
            error={fieldError("price")}
            helperText={fieldHelper("price")}
            InputProps={{
              endAdornment: <InputAdornment position="end">UAH</InputAdornment>,
            }}
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
            {submitting ? "Зберігаємо..." : "Зберегти"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
