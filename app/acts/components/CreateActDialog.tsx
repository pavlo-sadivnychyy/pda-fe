"use client";

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import type { Invoice } from "../types";

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
            АКТИ
          </Typography>
        </Box>

        <Typography
          variant="h5"
          sx={{ fontWeight: 700, mb: 0.5, color: "#020617" }}
        >
          Створити акт наданих послуг
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "#6b7280", mb: 3, maxWidth: 520 }}
        >
          Обери інвойс, додай назву, номер, період та нотатки — дані підуть в
          документ і PDF.
        </Typography>

        <Stack spacing={2.5}>
          <TextField
            label="Назва акта"
            placeholder="Наприклад: Акт за січень для клієнта ABC"
            value={fields.actTitle}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: Boolean(fields.actTitle) }}
          />

          <TextField
            select
            label="Інвойс"
            value={fields.selectedInvoiceId}
            onChange={(e) => onSelectInvoice(e.target.value)}
            fullWidth
            disabled={loadingInvoices}
            helperText="Оберіть рахунок, на основі якого буде створено акт"
            InputLabelProps={{ shrink: true }}
          >
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
                <MenuItem key={inv.id} value={inv.id}>
                  № {inv.number} — {inv.client?.name ?? "Без клієнта"} (
                  {dayjs(inv.issueDate).format("DD.MM.YYYY")})
                </MenuItem>
              ))
            )}
          </TextField>

          <TextField
            label="Номер акта"
            value={fields.actNumber}
            onChange={(e) => setNumber(e.target.value)}
            fullWidth
            placeholder="Наприклад: ACT-001"
            helperText="Можеш залишити автозаповнений номер або змінити на свій формат"
            InputLabelProps={{ shrink: true }}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Період з"
              type="date"
              value={fields.periodFrom}
              onChange={(e) => setPeriodFrom(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Період по"
              type="date"
              value={fields.periodTo}
              onChange={(e) => setPeriodTo(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
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
            disabled={!canSubmit || submitting}
            sx={{
              textTransform: "none",
              borderRadius: 999,
              px: 3,
              bgcolor: "#111827",
              "&:hover": { bgcolor: "#020617" },
            }}
          >
            {submitting ? "Створюємо..." : "Створити акт"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
