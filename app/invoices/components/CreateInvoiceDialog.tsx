"use client";

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import type { Client, InvoiceStatus } from "../types";
import { InvoiceItemsEditor } from "./InvoiceItemsEditor";
import { InvoiceTotals } from "./InvoiceTotals";

export const CreateInvoiceDialog = ({
  open,
  onClose,
  clients,
  loadingClients,
  formStatus,
  setFormStatus,
  form,
  setField,
  setItemField,
  addItem,
  removeItem,
  totals,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onClose: () => void;
  clients: Client[];
  loadingClients: boolean;

  formStatus: InvoiceStatus;
  setFormStatus: (s: InvoiceStatus) => void;

  form: {
    clientId: string;
    issueDate: string;
    dueDate: string;
    currency: string;
    notes: string;
    items: any[];
  };
  setField: (field: any, value: string) => void;
  setItemField: (index: number, field: any, value: string) => void;
  addItem: () => void;
  removeItem: (index: number) => void;

  totals: { subtotal: number; taxAmount: number; total: number };
  onSubmit: () => void;
  submitting: boolean;
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
            INVOICES
          </Typography>
        </Box>

        <Typography
          variant="h5"
          sx={{ fontWeight: 700, mb: 0.5, color: "#020617" }}
        >
          Створити інвойс
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "#6b7280", mb: 3, maxWidth: 620 }}
        >
          Обери клієнта, заповни реквізити рахунку, додай позиції та суми —
          система автоматично підрахує загальну суму.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2.5,
            mb: 3,
          }}
        >
          <FormControl fullWidth>
            <InputLabel shrink id="client-select-label">
              Клієнт
            </InputLabel>
            <Select
              labelId="client-select-label"
              label="Клієнт"
              value={form.clientId}
              onChange={(e) => setField("clientId", e.target.value)}
              disabled={loadingClients}
              displayEmpty
            >
              <MenuItem value="">
                <em>Без клієнта</em>
              </MenuItem>
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
                  {client.contactName ? ` — ${client.contactName}` : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel shrink id="status-select-label">
              Статус
            </InputLabel>
            <Select
              labelId="status-select-label"
              label="Статус"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as InvoiceStatus)}
            >
              <MenuItem value="DRAFT">Чернетка</MenuItem>
              <MenuItem value="SENT">Надіслано</MenuItem>
              <MenuItem value="PAID">Оплачено</MenuItem>
              <MenuItem value="OVERDUE">Прострочено</MenuItem>
              <MenuItem value="CANCELLED">Скасовано</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Дата виставлення"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={form.issueDate}
            onChange={(e) => setField("issueDate", e.target.value)}
          />

          <TextField
            label="Кінцевий термін оплати"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={form.dueDate}
            onChange={(e) => setField("dueDate", e.target.value)}
          />

          <TextField
            label="Валюта"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={form.currency}
            onChange={(e) => setField("currency", e.target.value)}
          />

          <TextField
            label="Нотатки (опціонально)"
            fullWidth
            multiline
            minRows={2}
            InputLabelProps={{ shrink: true }}
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
          />
        </Box>

        <InvoiceItemsEditor
          form={form}
          onItemChange={setItemField}
          onAddItem={addItem}
          onRemoveItem={removeItem}
        />

        <InvoiceTotals
          currency={form.currency}
          subtotal={totals.subtotal}
          taxAmount={totals.taxAmount}
          total={totals.total}
        />

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
            sx={{ textTransform: "none", color: "#6b7280" }}
          >
            Скасувати
          </Button>

          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={submitting}
            sx={{
              textTransform: "none",
              borderRadius: 999,
              px: 3,
              bgcolor: "#111827",
              "&:hover": { bgcolor: "#020617" },
            }}
          >
            Зберегти інвойс
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
