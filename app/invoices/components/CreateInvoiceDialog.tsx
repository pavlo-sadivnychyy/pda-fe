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
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

import type {
  Client,
  InvoiceStatus,
  InvoiceCreateFormState,
  InvoiceItemForm,
} from "../types";
import { InvoiceItemsEditor } from "./InvoiceItemsEditor";
import { InvoiceTotals } from "./InvoiceTotals";
import { INVOICE_STATUS_OPTIONS } from "@/app/invoices/utils";

import type { UserService } from "@/app/services/hooks/useServicesQueries";
import type { ValidationErrors } from "../hooks/useInvoiceForm";

function toDayjs(value: string): Dayjs | null {
  if (!value) return null;
  const d = dayjs(value);
  return d.isValid() ? d : null;
}

function toISODate(value: Dayjs | null): string {
  if (!value) return "";
  return value.format("YYYY-MM-DD");
}

export const CreateInvoiceDialog = ({
  open,
  onClose,
  clients,
  loadingClients,

  services,
  servicesLoading,

  formStatus,
  setFormStatus,
  form,
  errors,
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

  services: UserService[];
  servicesLoading: boolean;

  formStatus: InvoiceStatus;
  setFormStatus: (s: InvoiceStatus) => void;

  form: InvoiceCreateFormState;
  errors: ValidationErrors;
  setField: (field: keyof InvoiceCreateFormState, value: string) => void;
  setItemField: (
    index: number,
    field: keyof InvoiceItemForm,
    value: any,
  ) => void;
  addItem: () => void;
  removeItem: (index: number) => void;

  totals: { subtotal: number; taxAmount: number; total: number };
  onSubmit: () => void;
  submitting: boolean;
}) => {
  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
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
        <Typography sx={{ fontWeight: 800, fontSize: 18, color: "#020617" }}>
          Створити інвойс
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
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: "24px" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2.5,
            mb: 3,
            paddingTop: "15px",
          }}
        >
          <TextField
            select
            label="Клієнт"
            fullWidth
            variant="standard"
            value={form.clientId}
            onChange={(e) => setField("clientId", e.target.value)}
            disabled={loadingClients}
            InputLabelProps={{ shrink: true }}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value="">
              <em>Обери клієнта</em>
            </MenuItem>
            {clients.map((client) => (
              <MenuItem key={client.id} value={client.id}>
                {client.name}
                {client.contactName ? ` — ${client.contactName}` : ""}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Статус"
            fullWidth
            variant="standard"
            value={formStatus}
            onChange={(e) => setFormStatus(e.target.value as InvoiceStatus)}
            InputLabelProps={{ shrink: true }}
          >
            {INVOICE_STATUS_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>

          <DatePicker
            variant={"standard"}
            label="Дата виставлення"
            value={toDayjs(form.issueDate)}
            onChange={(d) => setField("issueDate", toISODate(d))}
            disabled={submitting}
            slotProps={{
              textField: {
                fullWidth: true,
                variant: "standard",
                InputLabelProps: { shrink: true },
              },
            }}
          />

          <DatePicker
            label="Кінцевий термін оплати"
            value={toDayjs(form.dueDate)}
            onChange={(d) => setField("dueDate", toISODate(d))}
            disabled={submitting}
            slotProps={{
              textField: {
                fullWidth: true,
                variant: "standard",
                InputLabelProps: { shrink: true },
              },
            }}
          />

          <TextField
            label="Валюта"
            fullWidth
            variant="standard"
            InputLabelProps={{ shrink: true }}
            value={form.currency}
            onChange={(e) => setField("currency", e.target.value)}
          />

          <TextField
            label="Нотатки (опціонально)"
            fullWidth
            variant="standard"
            multiline
            minRows={1}
            placeholder={"Введіть нотатки"}
            InputLabelProps={{ shrink: true }}
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
          />
        </Box>

        <InvoiceItemsEditor
          form={form}
          errors={errors}
          onItemChange={setItemField}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          services={services}
          servicesLoading={servicesLoading}
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
            justifyContent: "flex-end",
            alignItems: "center",
            mt: 4,
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={submitting}
            sx={{
              textTransform: "none",
              borderRadius: 999,
              px: 3,
              bgcolor: "#111827",
              color: "white",
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
