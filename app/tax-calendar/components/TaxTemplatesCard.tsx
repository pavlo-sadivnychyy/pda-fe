"use client";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { TaxEventTemplate, TaxProfile } from "../types";
import { SectionCard } from "./SectionCard";
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
  // MVP: INTERVAL=1 завжди
  return `FREQ=${freq};INTERVAL=1`;
}

function freqFromRrule(rrule: string): UiFreq {
  const up = (rrule || "").toUpperCase();
  if (up.includes("FREQ=WEEKLY")) return "WEEKLY";
  if (up.includes("FREQ=MONTHLY")) return "MONTHLY";
  if (up.includes("FREQ=QUARTERLY")) return "QUARTERLY";
  return "YEARLY";
}

function formatOffsetDays(n: number) {
  if (!n) return "в день закриття періоду";
  if (n === 1) return "+1 день";
  if (n >= 2 && n <= 4) return `+${n} дні`;
  return `+${n} днів`;
}

export function TaxTemplatesCard(props: {
  organizationId: string;
  profile: TaxProfile | null;
  templates: TaxEventTemplate[];
}) {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  const canEdit = Boolean(props.profile?.id);

  const createM = useMutation({
    mutationFn: (payload: any) => taxCalendarApi.createTemplate(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: taxKeys.templates(props.organizationId),
      });
      await qc.invalidateQueries({ queryKey: ["tax"] });
      setCreateOpen(false);
    },
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
    <SectionCard
      title="Шаблони подій"
      subtitle="Що саме буде створюватися автоматично"
      right={
        <Button
          startIcon={<AddIcon />}
          size="small"
          variant="contained"
          disabled={!canEdit || createM.isPending}
          onClick={() => setCreateOpen((s) => !s)}
          sx={{ borderRadius: "999px", boxShadow: "none" }}
        >
          Додати
        </Button>
      }
    >
      {!canEdit ? (
        <Typography fontSize={13} color="text.secondary">
          Спочатку налаштуй податковий профіль.
        </Typography>
      ) : null}

      <Typography fontSize={12} color="text.secondary">
        Шаблон = правило. Напр.: “Щокварталу” → створює подію кожен квартал, а
        дедлайн буде через N днів о певній годині.
      </Typography>

      {createOpen ? (
        <TemplateEditor
          organizationId={props.organizationId}
          onCancel={() => setCreateOpen(false)}
          onSave={(payload) => createM.mutate(payload)}
          saving={createM.isPending}
        />
      ) : null}

      <Divider sx={{ my: 2 }} />

      <Stack gap={1.25}>
        {props.templates.length === 0 ? (
          <Typography fontSize={13} color="text.secondary">
            Поки немає шаблонів. Додай перший.
          </Typography>
        ) : null}

        {props.templates.map((t) => (
          <TemplateRow
            key={t.id}
            template={t}
            onSave={(patch) =>
              updateM.mutate({
                id: t.id,
                organizationId: props.organizationId,
                ...patch,
              })
            }
            saving={updateM.isPending}
          />
        ))}
      </Stack>
    </SectionCard>
  );
}

function TemplateRow(props: {
  template: TaxEventTemplate;
  onSave: (patch: any) => void;
  saving: boolean;
}) {
  const [editing, setEditing] = useState(false);

  const kind = (props.template.kind as UiKind) ?? "TASK";
  const freq = freqFromRrule(props.template.rrule);

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
              fontWeight={800}
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

            {!props.template.isActive ? (
              <Chip label="Пауза" size="small" sx={{ borderRadius: "999px" }} />
            ) : null}
          </Stack>

          <Typography fontSize={13} color="text.secondary">
            {props.template.description || "—"}
          </Typography>

          <Typography fontSize={12} color="text.secondary">
            Періодичність: {freqUi[freq]} · Дедлайн:{" "}
            {formatOffsetDays(props.template.dueOffsetDays)} · о{" "}
            {props.template.dueTimeLocal}
          </Typography>
        </Stack>

        <IconButton onClick={() => setEditing((s) => !s)} size="small">
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Stack>

      {editing ? (
        <Box sx={{ mt: 1.5 }}>
          <TemplateEditor
            organizationId={props.template.organizationId}
            initial={props.template}
            isUpdate
            onCancel={() => setEditing(false)}
            saving={props.saving}
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
    props.initial?.description ??
      "Сума береться з оплачених інвойсів за період (MVP).",
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
  const [isActive, setIsActive] = useState<boolean>(
    props.initial?.isActive ?? true,
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
          <InputLabel>Тип події</InputLabel>
          <Select
            label="Тип події"
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

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Chip
          label={isActive ? "Активний" : "На паузі"}
          onClick={() => setIsActive((s) => !s)}
          sx={{ borderRadius: "999px", cursor: "pointer" }}
          variant="outlined"
        />

        <Stack direction="row" gap={1}>
          <Button
            variant="outlined"
            onClick={props.onCancel}
            sx={{ borderRadius: "999px" }}
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
                isActive,
              })
            }
            sx={{ borderRadius: "999px", boxShadow: "none" }}
          >
            {props.isUpdate ? "Зберегти" : "Створити"}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
