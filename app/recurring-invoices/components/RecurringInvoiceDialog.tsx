"use client";

import CloseIcon from "@mui/icons-material/Close";
import LockIcon from "@mui/icons-material/Lock";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Switch,
  TextField,
  Typography,
  FormControlLabel,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useEffect, useMemo, useState } from "react";

import type { Invoice } from "@/app/invoices/types";
import { useRecurringInvoiceMutations } from "../hooks/useRecurringInvoiceMutations";

type IntervalUnit = "DAY" | "WEEK" | "MONTH" | "YEAR";
type Status = "ACTIVE" | "PAUSED" | "CANCELLED";

function toDayjs(value?: string | null): Dayjs | null {
  if (!value) return null;
  const d = dayjs(value);
  return d.isValid() ? d : null;
}

function toISO(value: Dayjs | null): string {
  if (!value) return "";
  return value.toISOString();
}

const INTERVAL_OPTIONS: { value: IntervalUnit; label: string }[] = [
  { value: "MONTH", label: "Щомісяця" },
  { value: "WEEK", label: "Щотижня" },
  { value: "DAY", label: "Щодня" },
  { value: "YEAR", label: "Щороку" },
];

const STATUS_LABELS: Record<Status, string> = {
  ACTIVE: "Активний",
  PAUSED: "Пауза",
  CANCELLED: "Скасований",
};

const STATUS_HELPERS: Record<Status, string> = {
  ACTIVE: "Інвойси будуть створюватися автоматично за розкладом.",
  PAUSED: "Розклад збережеться, але інвойси тимчасово не створюватимуться.",
  CANCELLED: "Регулярний інвойс буде вимкнено. За потреби створіть новий.",
};

const VARIANT_LABELS: Record<"ua" | "international", string> = {
  ua: "Український (UA)",
  international: "Міжнародний",
};

function addInterval(from: Dayjs, unit: IntervalUnit, count: number) {
  const safeCount = Math.max(1, count || 1);

  switch (unit) {
    case "DAY":
      return from.add(safeCount, "day");
    case "WEEK":
      return from.add(safeCount, "week");
    case "MONTH":
      return from.add(safeCount, "month");
    case "YEAR":
      return from.add(safeCount, "year");
    default:
      return from.add(safeCount, "month");
  }
}

type FieldErrors = Partial<{
  intervalUnit: string;
  intervalCount: string;
  startAt: string;
  nextRunAt: string;
  dueDays: string;
  variant: string;
  status: string;
}>;

function isWholeNumberString(v: string) {
  return /^[0-9]+$/.test(v);
}

export function RecurringInvoiceDialog({
  open,
  onClose,
  isPro,
  templateInvoice,
  existingProfile,
  onSave,
  submitting,
  mode = "create",
  onUpdated,
}: {
  open: boolean;
  onClose: () => void;
  isPro: boolean;

  templateInvoice: Invoice | null;
  existingProfile: any | null;

  onSave: (payload: any) => void;

  submitting: boolean;
  mode?: "create" | "edit";

  // ✅ NEW: викликаємо після успішного edit
  onUpdated?: () => void | Promise<void>;
}) {
  const isEdit = mode === "edit" || Boolean(existingProfile?.id);

  const initial = useMemo(() => {
    if (existingProfile) return existingProfile;
    return null;
  }, [existingProfile]);

  const organizationId =
    templateInvoice?.organizationId ?? existingProfile?.organizationId;

  const [intervalUnit, setIntervalUnit] = useState<IntervalUnit>("MONTH");
  const [intervalCount, setIntervalCount] = useState<string>("1");

  const [startAt, setStartAt] = useState<Dayjs | null>(dayjs());
  const [nextRunAt, setNextRunAt] = useState<Dayjs | null>(dayjs());

  const [dueDays, setDueDays] = useState<string>("7");
  const [variant, setVariant] = useState<"ua" | "international">("ua");
  const [autoSendEmail, setAutoSendEmail] = useState<boolean>(false);
  const [status, setStatus] = useState<Status>("ACTIVE");

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string>("");

  const { updateRecurring } = useRecurringInvoiceMutations(organizationId);

  useEffect(() => {
    if (!open) return;

    setTouched({});
    setErrors({});
    setSubmitError("");

    if (initial) {
      setIntervalUnit((initial.intervalUnit as IntervalUnit) ?? "MONTH");
      setIntervalCount(String(initial.intervalCount ?? 1));
      setStartAt(toDayjs(initial.startAt) ?? dayjs());
      setNextRunAt(toDayjs(initial.nextRunAt) ?? dayjs());
      setDueDays(String(initial.dueDays ?? 7));
      setVariant(initial.variant === "international" ? "international" : "ua");
      setAutoSendEmail(Boolean(initial.autoSendEmail));
      setStatus((initial.status as Status) ?? "ACTIVE");
      return;
    }

    setIntervalUnit("MONTH");
    setIntervalCount("1");
    setStartAt(dayjs());
    setNextRunAt(dayjs());
    setDueDays("7");
    setVariant("ua");
    setAutoSendEmail(false);
    setStatus("ACTIVE");
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;

    const s = startAt ?? dayjs();
    const count = Math.max(1, Number.parseInt(intervalCount || "1", 10) || 1);
    const computedNext = addInterval(s, intervalUnit, count);

    setNextRunAt((prev) => {
      if (!prev) return computedNext;
      if (prev.isSame(computedNext, "minute")) return prev;
      return computedNext;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, startAt, intervalUnit, intervalCount]);

  const title = isEdit
    ? "Налаштування регулярного інвойсу"
    : "Створити регулярний інвойс";

  const templateLabel = templateInvoice
    ? `Шаблон інвойсу № ${templateInvoice.number}`
    : initial?.templateInvoiceNumber
      ? `Шаблон інвойсу № ${initial.templateInvoiceNumber}`
      : "Шаблон інвойсу";

  const scheduleSummary = useMemo(() => {
    const count = Math.max(1, Number.parseInt(intervalCount || "1", 10) || 1);
    const unitLabel =
      INTERVAL_OPTIONS.find((o) => o.value === intervalUnit)?.label ??
      "Щомісяця";

    const startText = startAt ? startAt.format("DD.MM.YYYY") : "—";
    const nextText = nextRunAt ? nextRunAt.format("DD.MM.YYYY") : "—";

    const dd = Math.max(0, Number.parseInt(dueDays || "0", 10) || 0);

    const intervalHuman =
      count === 1 ? unitLabel : `кожні ${count} ${unitLabel.toLowerCase()}`;

    const dueHuman =
      dd === 0
        ? "оплата одразу"
        : `оплата протягом ${dd} дн. після виставлення`;

    const sendHuman = autoSendEmail
      ? "інвойс надсилатиметься на email автоматично"
      : "інвойс не надсилатиметься автоматично";

    return `Інвойс буде виставлятися ${intervalHuman}. Початок: ${startText}. Наступний інвойс: ${nextText}. ${dueHuman}. ${sendHuman}.`;
  }, [intervalCount, intervalUnit, startAt, nextRunAt, dueDays, autoSendEmail]);

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};

    if (!intervalUnit)
      next.intervalUnit = "Оберіть, як часто виставляти інвойс.";

    const ic = (intervalCount ?? "").trim();
    if (!ic) next.intervalCount = "Вкажіть кількість (наприклад, 1 або 2).";
    else if (!isWholeNumberString(ic))
      next.intervalCount = "Введіть ціле число без символів.";
    else {
      const n = Number.parseInt(ic, 10);
      if (!Number.isFinite(n) || n < 1)
        next.intervalCount = "Мінімальне значення — 1.";
      else if (n > 365)
        next.intervalCount = "Занадто велике значення (макс. 365).";
    }

    if (!startAt || !startAt.isValid()) next.startAt = "Оберіть дату початку.";
    if (!nextRunAt || !nextRunAt.isValid())
      next.nextRunAt = "Оберіть дату наступного інвойсу.";

    if (startAt && startAt.isValid() && nextRunAt && nextRunAt.isValid()) {
      if (nextRunAt.isBefore(startAt, "day")) {
        next.nextRunAt =
          "Дата наступного інвойсу не може бути раніше дати початку.";
      }
    }

    const dd = (dueDays ?? "").trim();
    if (!dd) next.dueDays = "Вкажіть, скільки днів на оплату.";
    else if (!isWholeNumberString(dd))
      next.dueDays = "Введіть ціле число без символів.";
    else {
      const n = Number.parseInt(dd, 10);
      if (!Number.isFinite(n) || n < 0)
        next.dueDays = "Мінімальне значення — 0.";
      else if (n > 365) next.dueDays = "Занадто велике значення (макс. 365).";
    }

    if (!variant) next.variant = "Оберіть формат інвойсу.";
    if (!status) next.status = "Оберіть стан регулярного інвойсу.";

    return next;
  };

  const markAllTouched = () => {
    setTouched({
      intervalUnit: true,
      intervalCount: true,
      startAt: true,
      nextRunAt: true,
      dueDays: true,
      variant: true,
      status: true,
    });
  };

  const runValidation = (markTouched = false) => {
    if (markTouched) markAllTouched();
    const nextErrors = validate();
    setErrors(nextErrors);
    return nextErrors;
  };

  useEffect(() => {
    if (!open) return;
    setErrors(validate());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    intervalUnit,
    intervalCount,
    startAt,
    nextRunAt,
    dueDays,
    variant,
    status,
    open,
  ]);

  const handleSubmit = async () => {
    if (!isPro) return;

    setSubmitError("");

    const nextErrors = runValidation(true);
    if (Object.keys(nextErrors).length > 0) {
      setSubmitError(
        "Перевірте поля нижче — є помилки або пропущені значення.",
      );
      return;
    }

    const count = Math.max(1, Number.parseInt(intervalCount || "1", 10) || 1);
    const dd = Math.max(0, Number.parseInt(dueDays || "0", 10) || 0);

    const payload = {
      id: existingProfile?.id ?? undefined,

      organizationId:
        templateInvoice?.organizationId ?? existingProfile?.organizationId,

      clientId: templateInvoice?.clientId ?? existingProfile?.clientId ?? null,

      templateInvoiceId:
        templateInvoice?.id ?? existingProfile?.templateInvoiceId,

      intervalUnit,
      intervalCount: count,

      startAt: toISO(startAt),
      nextRunAt: toISO(nextRunAt),

      dueDays: dd,
      autoSendEmail: Boolean(autoSendEmail),
      variant,
      status,
    };

    if (existingProfile?.id && !templateInvoice) {
      await updateRecurring.mutateAsync({
        id: existingProfile.id,
        data: payload,
      });

      // ✅ рефетч карточок
      await onUpdated?.();

      onClose();
      return;
    }

    onSave(payload);
  };

  const showError = (key: keyof FieldErrors) =>
    Boolean(touched[key] && errors[key]);
  const helper = (key: keyof FieldErrors, fallback?: string) =>
    showError(key) ? errors[key] : fallback;

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}
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
        <Box>
          <Typography sx={{ fontWeight: 900, fontSize: 18, color: "#020617" }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            {templateLabel}
          </Typography>
        </Box>

        <IconButton
          onClick={onClose}
          disabled={submitting}
          size="small"
          aria-label="Закрити діалог"
          sx={{
            color: "#6b7280",
            "&:hover": { bgcolor: "#f3f4f6" },
            "&.Mui-disabled": { color: "#cbd5e1" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {!isPro ? (
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              bgcolor: "#f8fafc",
              display: "flex",
              gap: 1.2,
              alignItems: "center",
            }}
          >
            <LockIcon />
            <Typography sx={{ fontWeight: 800 }}>
              Доступно лише у PRO
            </Typography>
          </Box>
        ) : null}

        {submitError ? (
          <Box
            sx={{
              mt: 2.5,
              p: 2,
              borderRadius: 3,
              border: "1px solid #fecaca",
              bgcolor: "#fff1f2",
            }}
          >
            <Typography sx={{ fontWeight: 900, color: "#7f1d1d", mb: 0.5 }}>
              Є помилки
            </Typography>
            <Typography variant="body2" sx={{ color: "#7f1d1d" }}>
              {submitError}
            </Typography>
          </Box>
        ) : null}

        <Box
          sx={{
            mt: 2.5,
            p: 2,
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            bgcolor: "#f8fafc",
          }}
        >
          <Typography sx={{ fontWeight: 900, color: "#0f172a", mb: 0.5 }}>
            Підсумок
          </Typography>
          <Typography variant="body2" sx={{ color: "#475569" }}>
            {scheduleSummary}
          </Typography>
        </Box>

        <Box
          sx={{
            mt: 2.5,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2.2,
          }}
        >
          <TextField
            select
            required
            label="Як часто виставляти інвойс?"
            variant="standard"
            value={intervalUnit}
            onChange={(e) => setIntervalUnit(e.target.value as IntervalUnit)}
            InputLabelProps={{ shrink: true }}
            disabled={!isPro || submitting}
            onBlur={() => setTouched((p) => ({ ...p, intervalUnit: true }))}
            error={showError("intervalUnit")}
            helperText={helper(
              "intervalUnit",
              "Оберіть періодичність створення інвойсу",
            )}
          >
            {INTERVAL_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            required
            label="Через скільки періодів повторювати?"
            variant="standard"
            value={intervalCount}
            onChange={(e) =>
              setIntervalCount(e.target.value.replace(/[^\d]/g, ""))
            }
            InputLabelProps={{ shrink: true }}
            disabled={!isPro || submitting}
            placeholder="1"
            onBlur={() => setTouched((p) => ({ ...p, intervalCount: true }))}
            error={showError("intervalCount")}
            helperText={helper(
              "intervalCount",
              "Наприклад: 1 = кожного разу, 2 = через один раз",
            )}
          />

          <DatePicker
            label="Коли почати виставляти?"
            value={startAt}
            onChange={(d) => setStartAt(d)}
            disabled={!isPro || submitting}
            slotProps={{
              textField: {
                required: true,
                fullWidth: true,
                variant: "standard",
                InputLabelProps: { shrink: true },
                placeholder: "Оберіть дату",
                onBlur: () => setTouched((p) => ({ ...p, startAt: true })),
                error: showError("startAt"),
                helperText: helper(
                  "startAt",
                  "З цієї дати починає діяти регулярний розклад інвойсів",
                ),
              },
            }}
          />

          <DatePicker
            label="Коли виставити наступний інвойс?"
            value={nextRunAt}
            onChange={(d) => setNextRunAt(d)}
            disabled={!isPro || submitting}
            slotProps={{
              textField: {
                required: true,
                fullWidth: true,
                variant: "standard",
                InputLabelProps: { shrink: true },
                placeholder: "Оберіть дату",
                onBlur: () => setTouched((p) => ({ ...p, nextRunAt: true })),
                error: showError("nextRunAt"),
                helperText: helper(
                  "nextRunAt",
                  "Можна змінити вручну, якщо потрібна інша дата наступного інвойсу",
                ),
              },
            }}
          />

          <TextField
            required
            label="Скільки днів на оплату?"
            variant="standard"
            value={dueDays}
            onChange={(e) => setDueDays(e.target.value.replace(/[^\d]/g, ""))}
            InputLabelProps={{ shrink: true }}
            disabled={!isPro || submitting}
            placeholder="7"
            onBlur={() => setTouched((p) => ({ ...p, dueDays: true }))}
            error={showError("dueDays")}
            helperText={helper(
              "dueDays",
              "Дедлайн оплати: N днів після виставлення інвойсу",
            )}
          />

          <TextField
            select
            required
            label="Формат інвойсу"
            variant="standard"
            value={variant}
            onChange={(e) => setVariant(e.target.value as any)}
            InputLabelProps={{ shrink: true }}
            disabled={!isPro || submitting}
            onBlur={() => setTouched((p) => ({ ...p, variant: true }))}
            error={showError("variant")}
            helperText={helper(
              "variant",
              "Впливає на мову/формат документу та реквізити",
            )}
          >
            <MenuItem value="ua">{VARIANT_LABELS.ua}</MenuItem>
            <MenuItem value="international">
              {VARIANT_LABELS.international}
            </MenuItem>
          </TextField>

          <TextField
            select
            required
            label="Стан регулярного інвойсу"
            variant="standard"
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            InputLabelProps={{ shrink: true }}
            disabled={!isPro || submitting}
            onBlur={() => setTouched((p) => ({ ...p, status: true }))}
            error={showError("status")}
            helperText={helper("status", STATUS_HELPERS[status])}
          >
            <MenuItem value="ACTIVE">{STATUS_LABELS.ACTIVE}</MenuItem>
            <MenuItem value="PAUSED">{STATUS_LABELS.PAUSED}</MenuItem>
            <MenuItem value="CANCELLED">{STATUS_LABELS.CANCELLED}</MenuItem>
          </TextField>

          <Box sx={{ display: "flex", alignItems: "flex-end" }}>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoSendEmail}
                    onChange={(e) => setAutoSendEmail(e.target.checked)}
                    disabled={!isPro || submitting}
                  />
                }
                label="Надсилати інвойс клієнту на email автоматично"
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontSize: 14,
                    color: "#0f172a",
                    fontWeight: 800,
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: "#64748b", ml: 0.5 }}>
                Якщо увімкнути — інвойс буде автоматично відправлятися після
                створення
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 1 }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            disabled={submitting}
            sx={{ borderRadius: 999, textTransform: "none", fontWeight: 900 }}
          >
            Скасувати
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={!isPro || submitting}
            variant="contained"
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 900,
              color: "white",
              bgcolor: "#111827",
              "&:hover": { bgcolor: "#020617" },
            }}
          >
            Зберегти
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
