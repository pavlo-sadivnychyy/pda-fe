"use client";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DoNotDisturbOnOutlinedIcon from "@mui/icons-material/DoNotDisturbOnOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import type { TaxEventInstance } from "../types";

function fmt(dt: string) {
  const d = new Date(dt);
  return d.toLocaleString("uk-UA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function kindLabel(kind: string) {
  if (kind === "PAYMENT")
    return { label: "Оплата", icon: <PaymentsOutlinedIcon fontSize="small" /> };
  if (kind === "REPORT")
    return {
      label: "Звіт",
      icon: <DescriptionOutlinedIcon fontSize="small" />,
    };
  return { label: "Задача", icon: <TaskAltOutlinedIcon fontSize="small" /> };
}

function statusLabel(status: string) {
  if (status === "DONE")
    return {
      label: "Виконано",
      icon: <CheckCircleOutlineIcon />,
      variant: "outlined" as const,
    };
  if (status === "SKIPPED")
    return {
      label: "Пропущено",
      icon: <DoNotDisturbOnOutlinedIcon />,
      variant: "outlined" as const,
    };
  if (status === "OVERDUE")
    return {
      label: "Прострочено",
      icon: <WarningAmberOutlinedIcon />,
      variant: "filled" as const,
    };
  if (status === "IN_PROGRESS")
    return { label: "В роботі", icon: null, variant: "outlined" as const };
  return { label: "Очікує", icon: null, variant: "outlined" as const };
}

export function TaxEventRow(props: {
  event: TaxEventInstance;
  onDone: () => void;
  onSkip: () => void;
  loading?: boolean;
}) {
  const s = statusLabel(props.event.status);
  const k = kindLabel(props.event.template.kind);

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
        <Stack gap={0.5} minWidth={0}>
          <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
            <Typography
              fontWeight={800}
              sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {props.event.template.title}
            </Typography>

            <Chip
              label={s.label}
              icon={s.icon as any}
              variant={s.variant}
              size="small"
              sx={{ borderRadius: "999px" }}
            />

            <Chip
              label={k.label}
              icon={k.icon as any}
              size="small"
              variant="outlined"
              sx={{ borderRadius: "999px" }}
            />
          </Stack>

          <Typography fontSize={13} color="text.secondary">
            {props.event.template.description || "—"}
          </Typography>

          <Typography fontSize={12} color="text.secondary">
            Дедлайн: {fmt(props.event.dueAt)}
          </Typography>
        </Stack>

        <Stack direction="row" gap={1} flexShrink={0}>
          <Button
            size="small"
            variant="outlined"
            onClick={props.onSkip}
            disabled={props.loading || props.event.status === "DONE"}
            sx={{
              borderRadius: "999px",
              bgcolor: "white",
              color: "black",
              borderColor: "black",
            }}
          >
            Пропустити
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={props.onDone}
            disabled={props.loading || props.event.status === "DONE"}
            sx={{
              borderRadius: "999px",
              boxShadow: "none",
              bgcolor: "black",
              color: "white",
            }}
          >
            Виконано
          </Button>
        </Stack>
      </Stack>

      {props.event.note ? (
        <Typography mt={1} fontSize={12} color="text.secondary">
          Нотатка: {props.event.note}
        </Typography>
      ) : null}
    </Box>
  );
}
