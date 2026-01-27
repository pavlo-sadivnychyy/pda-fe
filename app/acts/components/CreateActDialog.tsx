"use client";

import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type { Invoice } from "../types";

function toDayjs(value: string): Dayjs | null {
  if (!value) return null;
  const d = dayjs(value);
  return d.isValid() ? d : null;
}

function toISODate(value: Dayjs | null): string {
  if (!value) return "";
  return value.format("YYYY-MM-DD");
}

export const CreateActDialog = ({
  open,
  onClose,
  invoices,
  loadingInvoices,
  fields,
  setTitle,
  setNumber,
  setPeriodFrom,
  setPeriodTo,
  setNotes,
  onSelectInvoice,
  onSubmit,
  submitting,
  canSubmit,
}: {
  open: boolean;
  onClose: () => void;

  invoices: Invoice[];
  loadingInvoices: boolean;

  fields: {
    selectedInvoiceId: string;
    actTitle: string;
    actNumber: string;
    periodFrom: string;
    periodTo: string;
    notes: string;
  };

  setTitle: (v: string) => void;
  setNumber: (v: string) => void;
  setPeriodFrom: (v: string) => void;
  setPeriodTo: (v: string) => void;
  setNotes: (v: string) => void;

  onSelectInvoice: (invoiceId: string) => void;

  onSubmit: () => void;
  submitting: boolean;
  canSubmit: boolean;
}) => {
  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 4, padding: 0 } }}
    >
      {/* ✅ Header + X */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Typography sx={{ fontWeight: 800, color: "#020617" }}>
          Створити акт наданих послуг
        </Typography>

        <IconButton
          onClick={onClose}
          disabled={submitting}
          size="small"
          sx={{
            color: "#6b7280",
            "&:hover": { bgcolor: "#f3f4f6" },
            "&.Mui-disabled": { color: "#cbd5e1" },
          }}
          aria-label="Close"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: "24px" }}>
        <Stack spacing={2.5} paddingTop={"15px"}>
          <TextField
            variant={"standard"}
            label="Назва акта"
            placeholder="Наприклад: Акт за січень для клієнта ABC"
            value={fields.actTitle}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            select
            variant={"standard"}
            label="Інвойс"
            value={fields.selectedInvoiceId}
            onChange={(e) => onSelectInvoice(e.target.value)}
            fullWidth
            disabled={loadingInvoices}
            placeholder={"Оберіть інвойс"}
            helperText="Оберіть рахунок, на основі якого буде створено акт. Ви не можете свторити акт з інвйсу без клієнта."
            InputLabelProps={{ shrink: true }}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value="" sx={{ color: "text.secondary" }}>
              Обери інвойс
            </MenuItem>
            {loadingInvoices ? (
              <MenuItem value="">
                <em>Завантаження інвойсів...</em>
              </MenuItem>
            ) : invoices.length === 0 ? (
              <MenuItem value="">
                <em>Немає інвойсів для вибору</em>
              </MenuItem>
            ) : (
              invoices.map((inv) => (
                <MenuItem
                  disabled={!inv.client?.name}
                  key={inv.id}
                  value={inv.id}
                >
                  № {inv.number} — {inv.client?.name ?? "Без клієнта"} (
                  {dayjs(inv.issueDate).format("DD.MM.YYYY")})
                </MenuItem>
              ))
            )}
          </TextField>

          <TextField
            variant={"standard"}
            label="Номер акта"
            value={fields.actNumber}
            onChange={(e) => setNumber(e.target.value)}
            fullWidth
            placeholder="Наприклад: ACT-001"
            helperText="Можеш залишити автозаповнений номер або змінити на свій формат"
            InputLabelProps={{ shrink: true }}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <DatePicker
              label="Період з"
              value={toDayjs(fields.periodFrom)}
              onChange={(d) => setPeriodFrom(toISODate(d))}
              disabled={submitting}
              slotProps={{
                textField: {
                  fullWidth: true,
                  InputLabelProps: { shrink: true },
                },
              }}
            />
            <DatePicker
              label="Період по"
              value={toDayjs(fields.periodTo)}
              onChange={(d) => setPeriodTo(toISODate(d))}
              disabled={submitting}
              slotProps={{
                textField: {
                  fullWidth: true,
                  InputLabelProps: { shrink: true },
                },
              }}
            />
          </Stack>

          <TextField
            label="Нотатки (опціонально)"
            value={fields.notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            placeholder="Додай деталі, які будуть корисні в документі"
            InputLabelProps={{ shrink: true }}
          />
        </Stack>

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
            disabled={!canSubmit || submitting}
            sx={{
              textTransform: "none",
              borderRadius: 999,
              px: 3,
              bgcolor: "#111827",
              "&:hover": { bgcolor: "#020617" },
              color: "white",
            }}
          >
            {submitting ? "Створюємо..." : "Створити акт"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
