"use client";

import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DoNotDisturbOnOutlinedIcon from "@mui/icons-material/DoNotDisturbOnOutlined";
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { TaxEventInstance } from "../types";
import { SectionCard } from "./SectionCard";
import { taxCalendarApi } from "../taxCalendar.api";
import { taxKeys } from "../queries";
import { TaxEventRow } from "./TaxEventRow";

function dateToIso(d: Date) {
  return d.toISOString();
}

function asDayjs(d: Date) {
  return dayjs(d);
}

function dayjsToDate(v: Dayjs | null, fallback: Date) {
  return v ? v.toDate() : fallback;
}

type ActionKind = "DONE" | "SKIP";

export function TaxEventsCard(props: {
  organizationId: string;
  events: TaxEventInstance[];
  eventsLoading: boolean;

  range: { from: Date; to: Date };
  setRange: (r: { from: Date; to: Date }) => void;

  canGenerate: boolean;
  generating: boolean;
  onGenerate: () => void;

  onOpenSettings: () => void;
}) {
  const qc = useQueryClient();

  // Тут ISO лише для ключів рефреша списку (межі нормалізуються у TaxCalendarPage)
  const fromIso = useMemo(
    () => dateToIso(props.range.from),
    [props.range.from],
  );
  const toIsoStr = useMemo(() => dateToIso(props.range.to), [props.range.to]);

  const refresh = async () => {
    await qc.invalidateQueries({
      queryKey: taxKeys.events(props.organizationId, fromIso, toIsoStr),
    });
  };

  const [actionOpen, setActionOpen] = useState(false);
  const [actionKind, setActionKind] = useState<ActionKind>("DONE");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const doneM = useMutation({
    mutationFn: (payload: { id: string; note?: string }) =>
      taxCalendarApi.markDone({
        id: payload.id,
        organizationId: props.organizationId,
        note: payload.note,
      }),
    onSuccess: async () => {
      await refresh();
      closeAction();
    },
  });

  const skipM = useMutation({
    mutationFn: (payload: { id: string; note?: string }) =>
      taxCalendarApi.markSkip({
        id: payload.id,
        organizationId: props.organizationId,
        note: payload.note,
      }),
    onSuccess: async () => {
      await refresh();
      closeAction();
    },
  });

  const grouped = useMemo(() => {
    const map = new Map<string, TaxEventInstance[]>();
    for (const e of props.events) {
      const key = new Date(e.dueAt).toLocaleDateString("uk-UA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return Array.from(map.entries());
  }, [props.events]);

  const openAction = (kind: ActionKind, id: string) => {
    setActionKind(kind);
    setSelectedId(id);
    setNote("");
    setActionOpen(true);
  };

  const closeAction = () => {
    setActionOpen(false);
    setSelectedId(null);
    setNote("");
  };

  const emptyState = (() => {
    if (!props.canGenerate) {
      return (
        <Alert
          severity="warning"
          sx={{
            borderRadius: "12px",
            border: "1px solid rgba(15, 23, 42, 0.08)",
            bgcolor: "background.paper",
          }}
          action={
            <Button
              onClick={props.onOpenSettings}
              variant="contained"
              size="small"
              sx={{
                textTransform: "none",
                borderRadius: 999,
                py: 1,
                bgcolor: "#111827",
                boxShadow: "none",
                color: "white",
                "&:hover": {
                  bgcolor: "#000000",
                  boxShadow: "none",
                },
              }}
            >
              Налаштувати
            </Button>
          }
        >
          <Typography fontWeight={800} sx={{ mb: 0.5 }}>
            Події ще не зʼявляться
          </Typography>
          <Typography fontSize={13} color="text.secondary">
            Спочатку потрібні <b>профіль</b> і хоча б один <b>шаблон</b>. Після
            цього натисни “Оновити події”.
          </Typography>
        </Alert>
      );
    }

    return (
      <Alert
        severity="info"
        sx={{
          borderRadius: "12px",
          border: "1px solid rgba(15, 23, 42, 0.08)",
          bgcolor: "background.paper",
        }}
        action={
          <Button
            onClick={props.onGenerate}
            variant="contained"
            size="small"
            disabled={props.generating}
            sx={{ borderRadius: "999px", boxShadow: "none" }}
          >
            Згенерувати події
          </Button>
        }
      >
        <Typography fontWeight={800} sx={{ mb: 0.5 }}>
          Подій на цей період поки немає
        </Typography>
        <Typography fontSize={13} color="text.secondary">
          Події створюються за шаблонами <b>в межах дат “Від/До”</b>.
        </Typography>
      </Alert>
    );
  })();

  const actionLoading = doneM.isPending || skipM.isPending;

  return (
    <>
      <SectionCard
        title="Події та дедлайни"
        subtitle="Тут конкретні задачі з дедлайнами на вибраний період"
        right={
          <Stack direction="row" gap={1}>
            <Button
              startIcon={<RefreshIcon />}
              variant="outlined"
              size="small"
              onClick={refresh}
              disabled={props.eventsLoading || props.generating}
              sx={{
                borderRadius: "999px",
                borderColor: "black",
                color: "black",
              }}
            >
              Оновити список
            </Button>

            <Button
              variant="contained"
              size="small"
              onClick={props.onGenerate}
              disabled={!props.canGenerate || props.generating}
              sx={{
                textTransform: "none",
                borderRadius: 999,
                py: 1,
                bgcolor: "#111827",
                boxShadow: "none",
                color: "white",
                "&:hover": {
                  bgcolor: "#000000",
                  boxShadow: "none",
                },
              }}
            >
              Оновити події
            </Button>
          </Stack>
        }
      >
        <Stack direction={{ xs: "column", sm: "row" }} gap={1.25}>
          <DatePicker
            label="Від"
            value={asDayjs(props.range.from)}
            maxDate={asDayjs(props.range.to)}
            onChange={(v) =>
              props.setRange({
                from: dayjsToDate(v, props.range.from),
                to: props.range.to,
              })
            }
            slotProps={{ textField: { fullWidth: true } }}
          />

          <DatePicker
            label="До"
            value={asDayjs(props.range.to)}
            minDate={asDayjs(props.range.from)}
            onChange={(v) =>
              props.setRange({
                from: props.range.from,
                to: dayjsToDate(v, props.range.to),
              })
            }
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Stack>

        <Alert
          severity="success"
          sx={{
            mt: 1.5,
            borderRadius: "12px",
            border: "1px solid rgba(15, 23, 42, 0.08)",
            bgcolor: "background.paper",
          }}
        >
          <Typography fontWeight={800} sx={{ mb: 0.5 }}>
            Як це працює
          </Typography>
          <Typography fontSize={13} color="text.secondary">
            • Тут показані <b>конкретні дедлайни</b> на вибраний період.
            <br />
            • “Оновити події” — створює/оновлює події за шаблонами в межах дат
            “Від/До”.
            <br />• Для кожної події можна натиснути <b>“Виконано”</b> або{" "}
            <b>“Пропустити”</b>.
          </Typography>
        </Alert>

        <Divider sx={{ my: 2 }} />

        <Stack gap={1.25}>
          {props.events.length === 0 ? emptyState : null}

          {grouped.map(([day, items]) => (
            <Stack key={day} gap={1}>
              <Typography fontSize={13} color="text.secondary" fontWeight={800}>
                {day}
              </Typography>

              <Stack gap={1.25}>
                {items.map((ev) => (
                  <TaxEventRow
                    key={ev.id}
                    event={ev}
                    loading={actionLoading}
                    onDone={() => openAction("DONE", ev.id)}
                    onSkip={() => openAction("SKIP", ev.id)}
                  />
                ))}
              </Stack>
            </Stack>
          ))}
        </Stack>
      </SectionCard>

      <Dialog open={actionOpen} onClose={closeAction} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>
          {actionKind === "DONE" ? "Позначити як виконано" : "Пропустити подію"}
        </DialogTitle>
        <DialogContent>
          <Stack gap={1.25} sx={{ pt: 1 }}>
            <Alert
              severity={actionKind === "DONE" ? "success" : "warning"}
              icon={
                actionKind === "DONE" ? (
                  <CheckCircleOutlineIcon />
                ) : (
                  <DoNotDisturbOnOutlinedIcon />
                )
              }
              sx={{ borderRadius: "12px" }}
            >
              <Typography fontSize={13} color="text.secondary">
                {actionKind === "DONE"
                  ? "Подія буде закрита як виконана."
                  : "Подія буде позначена як пропущена (якщо цього разу не актуально)."}
              </Typography>
            </Alert>

            <TextField
              label="Нотатка (опційно)"
              placeholder="Наприклад: 'Оплачено в банкінгу' або 'Нульовий дохід цього кварталу'"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              fullWidth
            />

            <Stack
              direction="row"
              justifyContent="flex-end"
              gap={1}
              sx={{ pt: 1 }}
            >
              <Button
                variant="outlined"
                onClick={closeAction}
                sx={{ borderRadius: "999px" }}
              >
                Скасувати
              </Button>

              <Button
                variant="contained"
                disabled={actionLoading || !selectedId}
                onClick={() => {
                  if (!selectedId) return;
                  const payload = {
                    id: selectedId,
                    note: note.trim() ? note.trim() : undefined,
                  };
                  if (actionKind === "DONE") doneM.mutate(payload);
                  else skipM.mutate(payload);
                }}
                sx={{ borderRadius: "999px", boxShadow: "none" }}
              >
                Підтвердити
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
