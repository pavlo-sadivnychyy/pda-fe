"use client";

import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import {
  CreateExpenseItemDto,
  ExpenseCategory,
  ExpenseItem,
  ExpenseItemType,
  UpdateExpenseItemDto,
} from "../planner.types";

type Props = {
  open: boolean;
  onClose: () => void;
  categories: ExpenseCategory[];
  planId: string;
  currency: string;
  item?: ExpenseItem | null;
  onCreate: (payload: CreateExpenseItemDto) => Promise<void>;
  onUpdate: (id: string, payload: UpdateExpenseItemDto) => Promise<void>;
};

export function ExpenseItemDialog({
  open,
  onClose,
  categories,
  planId,
  currency,
  item,
  onCreate,
  onUpdate,
}: Props) {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState<ExpenseItemType>("PLANNED");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState<Dayjs | null>(null);
  const [vendorName, setVendorName] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setCategoryId(item.categoryId ?? "");
      setType(item.type);

      setAmount(
        String(
          item.type === "PLANNED"
            ? Number(item.amountPlanned ?? 0)
            : Number(item.amountActual ?? 0),
        ),
      );

      setExpenseDate(dayjs(item.expenseDate));
      setVendorName(item.vendorName ?? "");
      setNote(item.note ?? "");
      return;
    }

    setTitle("");
    setCategoryId("");
    setType("PLANNED");
    setAmount("");
    setExpenseDate(dayjs());
    setVendorName("");
    setNote("");
  }, [item, open]);

  const handleSubmit = async () => {
    if (!expenseDate) return;

    setSubmitting(true);

    try {
      const formattedDate = expenseDate.format("YYYY-MM-DD");

      if (item) {
        const payload: UpdateExpenseItemDto = {
          categoryId: categoryId || null,
          title,
          vendorName: vendorName || undefined,
          note: note || undefined,
          type,
          amountPlanned: type === "PLANNED" ? Number(amount) : null,
          amountActual: type === "ACTUAL" ? Number(amount) : null,
          currency,
          expenseDate: formattedDate,
        };

        await onUpdate(item.id, payload);
      } else {
        const payload: CreateExpenseItemDto = {
          planId,
          categoryId: categoryId || undefined,
          title,
          vendorName: vendorName || undefined,
          note: note || undefined,
          type,
          amountPlanned: type === "PLANNED" ? Number(amount) : undefined,
          amountActual: type === "ACTUAL" ? Number(amount) : undefined,
          currency,
          expenseDate: formattedDate,
        };

        await onCreate(payload);
      }

      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{item ? "Редагувати витрату" : "Нова витрата"}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Назва"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            placeholder="Введіть назву"
            variant="standard"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            select
            label="Категорія"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            fullWidth
            variant="standard"
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="">Без категорії</MenuItem>

            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Тип"
            value={type}
            onChange={(e) => setType(e.target.value as ExpenseItemType)}
            fullWidth
            variant="standard"
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="PLANNED">Планова</MenuItem>
            <MenuItem value="ACTUAL">Фактична</MenuItem>
          </TextField>

          <TextField
            label="Сума"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            placeholder="Введіть суму"
            variant="standard"
            InputLabelProps={{ shrink: true }}
          />

          <DatePicker
            label="Дата"
            value={expenseDate}
            onChange={(value) => setExpenseDate(value)}
            slotProps={{
              textField: {
                fullWidth: true,
                variant: "standard",
                InputLabelProps: { shrink: true },
              },
            }}
          />

          <TextField
            label="Постачальник"
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
            fullWidth
            placeholder="Введіть постачальника"
            variant="standard"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Нотатка"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            minRows={3}
            fullWidth
            variant="standard"
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} sx={{ color: "black" }}>
          Скасувати
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!title || !amount || !expenseDate || submitting}
          sx={{ color: "white", bgcolor: "black", borderRadius: 999 }}
        >
          Зберегти
        </Button>
      </DialogActions>
    </Dialog>
  );
}
