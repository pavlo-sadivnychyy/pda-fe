"use client";

import { useEffect, useMemo, useState } from "react";
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
  CreateExpenseRecurringRuleDto,
  ExpenseCategory,
  ExpenseRecurringRule,
  UpdateExpenseRecurringRuleDto,
} from "../planner.types";

type Props = {
  open: boolean;
  onClose: () => void;
  categories: ExpenseCategory[];
  monthKey: string;
  rule?: ExpenseRecurringRule | null;
  onCreate: (payload: CreateExpenseRecurringRuleDto) => Promise<void>;
  onUpdate: (
    id: string,
    payload: UpdateExpenseRecurringRuleDto,
  ) => Promise<void>;
};

const CURRENCY_OPTIONS = ["UAH", "USD", "EUR", "PLN"];

const monthKeyToDayjs = (value?: string | null): Dayjs | null => {
  if (!value) return null;

  const parsed = dayjs(`${value}-01`);
  return parsed.isValid() ? parsed : null;
};

const dayjsToMonthKey = (value: Dayjs | null): string | undefined => {
  if (!value || !value.isValid()) return undefined;
  return value.format("YYYY-MM");
};

export function RecurringRuleDialog({
  open,
  onClose,
  categories,
  monthKey,
  rule,
  onCreate,
  onUpdate,
}: Props) {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("UAH");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [vendorName, setVendorName] = useState("");
  const [note, setNote] = useState("");
  const [startMonth, setStartMonth] = useState<Dayjs | null>(null);
  const [endMonth, setEndMonth] = useState<Dayjs | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (rule) {
      setTitle(rule.title);
      setCategoryId(rule.categoryId ?? "");
      setAmount(String(Number(rule.amount)));
      setCurrency(rule.currency);
      setDayOfMonth(String(rule.dayOfMonth));
      setVendorName(rule.vendorName ?? "");
      setNote(rule.note ?? "");
      setStartMonth(monthKeyToDayjs(rule.startMonthKey));
      setEndMonth(monthKeyToDayjs(rule.endMonthKey ?? ""));
      return;
    }

    setTitle("");
    setCategoryId("");
    setAmount("");
    setCurrency("UAH");
    setDayOfMonth("1");
    setVendorName("");
    setNote("");
    setStartMonth(monthKeyToDayjs(monthKey));
    setEndMonth(null);
  }, [rule, open, monthKey]);

  const startMonthKey = useMemo(
    () => dayjsToMonthKey(startMonth),
    [startMonth],
  );
  const endMonthKey = useMemo(() => dayjsToMonthKey(endMonth), [endMonth]);

  const handleSubmit = async () => {
    if (!startMonthKey) return;

    setSubmitting(true);

    try {
      if (rule) {
        const payload: UpdateExpenseRecurringRuleDto = {
          title,
          categoryId: categoryId || null,
          amount: Number(amount),
          currency,
          dayOfMonth: Number(dayOfMonth),
          vendorName: vendorName || undefined,
          note: note || undefined,
          startMonthKey,
          endMonthKey: endMonthKey || null,
          isActive: true,
        };

        await onUpdate(rule.id, payload);
      } else {
        const payload: CreateExpenseRecurringRuleDto = {
          title,
          categoryId: categoryId || undefined,
          amount: Number(amount),
          currency,
          dayOfMonth: Number(dayOfMonth),
          vendorName: vendorName || undefined,
          note: note || undefined,
          startMonthKey,
          endMonthKey,
          isActive: true,
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
      <DialogTitle>
        {rule ? "Редагувати регулярну витрату" : "Нова регулярна витрата"}
      </DialogTitle>

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
            label="Сума"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            placeholder="Введіть суму"
            variant="standard"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            select
            label="Валюта"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            fullWidth
            variant="standard"
            InputLabelProps={{ shrink: true }}
          >
            {CURRENCY_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="День місяця"
            type="number"
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
            fullWidth
            placeholder="Введіть день"
            variant="standard"
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: 1, max: 28 }}
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

          <DatePicker
            label="Початковий місяць"
            views={["year", "month"]}
            value={startMonth}
            onChange={(newValue) => setStartMonth(newValue)}
            slotProps={{
              textField: {
                fullWidth: true,
                variant: "standard",
                InputLabelProps: { shrink: true },
              },
            }}
          />

          <DatePicker
            label="Кінцевий місяць"
            views={["year", "month"]}
            value={endMonth}
            onChange={(newValue) => setEndMonth(newValue)}
            minDate={startMonth ?? undefined}
            slotProps={{
              textField: {
                fullWidth: true,
                variant: "standard",
                InputLabelProps: { shrink: true },
              },
            }}
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
          disabled={!title || !amount || !startMonthKey || submitting}
          sx={{ color: "white", bgcolor: "black", borderRadius: 999 }}
        >
          Зберегти
        </Button>
      </DialogActions>
    </Dialog>
  );
}
