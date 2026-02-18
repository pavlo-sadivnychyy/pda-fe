"use client";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import type { TaxEventTemplate } from "../types";
import { taxCalendarApi } from "../taxCalendar.api";
import { taxKeys } from "../queries";

type UiKind = "PAYMENT" | "REPORT" | "TASK";
type UiFreq = "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";

const kindUi = {
  PAYMENT: { label: "Оплата", icon: <PaymentsOutlinedIcon fontSize="small" /> },
  REPORT: { label: "Звіт", icon: <DescriptionOutlinedIcon fontSize="small" /> },
  TASK: { label: "Задача", icon: <TaskAltOutlinedIcon fontSize="small" /> },
} satisfies Record<UiKind, { label: string; icon: any }>;

const freqUi: Record<UiFreq, string> = {
  WEEKLY: "Щотижня",
  MONTHLY: "Щомісяця",
  QUARTERLY: "Щокварталу",
  YEARLY: "Щороку",
};

function rruleFromFreq(freq: UiFreq) {
  return `FREQ=${freq};INTERVAL=1`;
}

function freqFromRrule(rrule: string): UiFreq {
  const up = (rrule || "").toUpperCase();
  if (up.includes("FREQ=WEEKLY")) return "WEEKLY";
  if (up.includes("FREQ=MONTHLY")) return "MONTHLY";
  if (up.includes("FREQ=QUARTERLY")) return "QUARTERLY";
  return "YEARLY";
}

function humanLine(t: TaxEventTemplate) {
  const freq = freqUi[freqFromRrule(t.rrule)];
  return `Створюється ${freq.toLowerCase()}. Дедлайн — через ${t.dueOffsetDays} дн. о ${t.dueTimeLocal} після завершення періоду.`;
}

export function TaxTemplatesManager(props: {
  organizationId: string;
  templates: TaxEventTemplate[];
}) {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  const createM = useMutation({
    mutationFn: (payload: any) => taxCalendarApi.createTemplate(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: taxKeys.templates(props.organizationId),
      });
      await qc.invalidateQueries({ queryKey: ["tax"] });
      setCreateOpen(false);
    },
    onError: (error) => console.log(error),
  });

  const updateM = useMutation({
    mutationFn: (payload: any) => taxCalendarApi.updateTemplate(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: taxKeys.templates(props.organizationId),
      });
      await qc.invalidateQueries({ queryKey: ["tax"] });
    },
  });

  return (
    <Stack gap={2}>
      <Alert severity="info" sx={{ borderRadius: "12px" }}>
        <Typography fontWeight={900}>Автоправила (шаблони)</Typography>
        <Typography fontSize={13} color="text.secondary">
          Шаблон — це правило, за яким система створює події. Наприклад:
          “щокварталу” + “дедлайн через 25 днів о 18:00”.
        </Typography>
      </Alert>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography fontWeight={900}>Шаблони</Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          size="small"
          onClick={() => setCreateOpen((s) => !s)}
          sx={{
            borderRadius: "999px",
            boxShadow: "none",
            color: "white",
            bgcolor: "black",
          }}
        >
          Додати
        </Button>
      </Stack>

      {createOpen ? (
        <TemplateEditor
          organizationId={props.organizationId}
          saving={createM.isPending}
          onCancel={() => setCreateOpen(false)}
          onSave={(p) => createM.mutate(p)}
        />
      ) : null}

      <Divider />

      <Stack gap={1.25}>
        {props.templates.length === 0 ? (
          <Typography fontSize={13} color="text.secondary">
            Поки немає шаблонів. Додай перший — і потім натискай “Оновити події”
            на сторінці календаря.
          </Typography>
        ) : null}

        {props.templates.map((t) => (
          <TemplateRow
            key={t.id}
            template={t}
            saving={updateM.isPending}
            onSave={(patch) =>
              updateM.mutate({
                id: t.id,
                organizationId: props.organizationId,
                ...patch,
              })
            }
          />
        ))}
      </Stack>
    </Stack>
  );
}

function TemplateRow(props: {
  template: TaxEventTemplate;
  saving: boolean;
  onSave: (patch: any) => void;
}) {
  const [editing, setEditing] = useState(false);

  const kind = (props.template.kind as UiKind) ?? "TASK";

  return (
    <Box
      sx={{
        border: "1px solid rgba(15, 23, 42, 0.06)",
        borderRadius: "12px",
        p: 1.5,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        gap={1.5}
        alignItems="flex-start"
      >
        <Stack gap={0.35} minWidth={0}>
          <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
            <Typography
              fontWeight={900}
              sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {props.template.title}
            </Typography>
            <Chip
              icon={kindUi[kind].icon}
              label={kindUi[kind].label}
              size="small"
              variant="outlined"
              sx={{ borderRadius: "999px" }}
            />
          </Stack>

          <Typography fontSize={13} color="text.secondary">
            {props.template.description || "—"}
          </Typography>

          <Typography fontSize={12} color="text.secondary">
            {humanLine(props.template)}
          </Typography>
        </Stack>

        <IconButton size="small" onClick={() => setEditing((s) => !s)}>
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Stack>

      {editing ? (
        <Box sx={{ mt: 1.5 }}>
          <TemplateEditor
            organizationId={props.template.organizationId}
            initial={props.template}
            isUpdate
            saving={props.saving}
            onCancel={() => setEditing(false)}
            onSave={(payload) => {
              props.onSave(payload);
              setEditing(false);
            }}
          />
        </Box>
      ) : null}
    </Box>
  );
}

function TemplateEditor(props: {
  organizationId: string;
  initial?: Partial<TaxEventTemplate>;
  isUpdate?: boolean;
  saving: boolean;
  onSave: (payload: any) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(
    props.initial?.title ?? "Сплатити податок",
  );
  const [description, setDescription] = useState(
    props.initial?.description ?? "Оплата/звітність за період.",
  );

  const [kind, setKind] = useState<UiKind>(
    (props.initial?.kind as UiKind) ?? "PAYMENT",
  );
  const [freq, setFreq] = useState<UiFreq>(
    freqFromRrule(props.initial?.rrule ?? ""),
  );
  const [dueOffsetDays, setDueOffsetDays] = useState<number>(
    props.initial?.dueOffsetDays ?? 25,
  );
  const [dueTimeLocal, setDueTimeLocal] = useState(
    props.initial?.dueTimeLocal ?? "18:00",
  );

  return (
    <Stack gap={1.25}>
      <TextField
        label="Назва"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
      />
      <TextField
        label="Опис"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
      />

      <Stack direction={{ xs: "column", sm: "row" }} gap={1.25}>
        <FormControl fullWidth>
          <InputLabel>Тип</InputLabel>
          <Select
            label="Тип"
            value={kind}
            onChange={(e) => setKind(e.target.value as UiKind)}
          >
            <MenuItem value="PAYMENT">Оплата</MenuItem>
            <MenuItem value="REPORT">Звіт</MenuItem>
            <MenuItem value="TASK">Задача</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Періодичність</InputLabel>
          <Select
            label="Періодичність"
            value={freq}
            onChange={(e) => setFreq(e.target.value as UiFreq)}
          >
            <MenuItem value="WEEKLY">Щотижня</MenuItem>
            <MenuItem value="MONTHLY">Щомісяця</MenuItem>
            <MenuItem value="QUARTERLY">Щокварталу</MenuItem>
            <MenuItem value="YEARLY">Щороку</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} gap={1.25}>
        <TextField
          label="Дедлайн після завершення періоду (днів)"
          type="number"
          value={dueOffsetDays}
          onChange={(e) => setDueOffsetDays(Number(e.target.value))}
          fullWidth
        />
        <TextField
          label="Час дедлайну"
          value={dueTimeLocal}
          onChange={(e) => setDueTimeLocal(e.target.value)}
          fullWidth
        />
      </Stack>

      <Stack direction="row" justifyContent="flex-end" gap={1} sx={{ pt: 0.5 }}>
        <Button
          variant="outlined"
          onClick={props.onCancel}
          sx={{ borderRadius: "999px", borderColor: "black", color: "black" }}
        >
          Скасувати
        </Button>
        <Button
          variant="contained"
          disabled={props.saving}
          onClick={() =>
            props.onSave({
              organizationId: props.organizationId,
              title,
              description,
              kind,
              rrule: rruleFromFreq(freq),
              dueOffsetDays,
              dueTimeLocal,
              isActive: true,
            })
          }
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
          {props.isUpdate ? "Зберегти" : "Створити"}
        </Button>
      </Stack>
    </Stack>
  );
}
