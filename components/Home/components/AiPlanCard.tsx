"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import type { AiPlan } from "../types";
import { statusLabel } from "../utils";

type Props = {
  plan: AiPlan | null;
  disabledReason: "HAS_PLAN" | "NO_TASKS" | "LOADING" | "IDLE";
  isBusy: boolean;
  errorText: string | null;
  onGenerate: () => void;
};

export function AiPlanCard({
  plan,
  disabledReason,
  isBusy,
  errorText,
  onGenerate,
}: Props) {
  const isDisabled = disabledReason !== "IDLE" || isBusy;

  const buttonText = (() => {
    if (isBusy) return "Генеруємо...";
    if (disabledReason === "HAS_PLAN") return "План готовий";
    if (disabledReason === "NO_TASKS") return "Немає задач";
    if (disabledReason === "LOADING") return "Завантаження...";
    return "Згенерувати план";
  })();

  return (
    <Card elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
      <CardHeader
        avatar={<FlashOnIcon sx={{ color: "#f97316" }} />}
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            AI-план на сьогодні
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Асистент формує структурований план на основі твоїх задач.
          </Typography>
        }
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 1.5 }}>
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              План генерується один раз на день і зберігається до завтра.
            </Typography>

            <Button
              size="small"
              variant="contained"
              onClick={onGenerate}
              disabled={isDisabled}
              sx={{
                textTransform: "none",
                borderRadius: 999,
                bgcolor: "#202124",
                "&:hover": { bgcolor: "#111827" },
                fontSize: 12,
                px: 2,
                whiteSpace: "nowrap",
              }}
            >
              {buttonText}
            </Button>
          </Stack>

          {errorText && (
            <Typography variant="body2" sx={{ color: "#b91c1c", mt: 0.5 }}>
              {errorText}
            </Typography>
          )}

          {isBusy && !plan && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mt: 1 }}
            >
              <CircularProgress size={18} />
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Асистент аналізує задачі та складає план...
              </Typography>
            </Stack>
          )}

          {plan && !isBusy && <PlanView plan={plan} />}
        </Stack>
      </CardContent>
    </Card>
  );
}

function PlanView({ plan }: { plan: AiPlan }) {
  return (
    <Stack spacing={1.5} sx={{ mt: 1 }}>
      <Box
        sx={{
          bgcolor: "#fefce8",
          borderRadius: 2,
          p: 1.5,
          border: "1px solid #facc15",
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
          Підсумок дня
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "#4b5563", whiteSpace: "pre-line" }}
        >
          {plan.summary}
        </Typography>
      </Box>

      {plan.suggestions?.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Рекомендації асистента
          </Typography>
          <List dense sx={{ py: 0 }}>
            {plan.suggestions.map((s, idx) => (
              <ListItem key={idx} disableGutters sx={{ py: 0.25 }}>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ color: "#4b5563" }}>
                      • {s}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {plan.timeline?.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Поминутний план
          </Typography>
          <List dense sx={{ py: 0 }}>
            {plan.timeline.map((item, idx) => {
              const isDone = item.status === "DONE";
              return (
                <ListItem key={idx} disableGutters sx={{ mb: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {isDone ? (
                      <CheckCircleIcon
                        sx={{ fontSize: 18, color: "#16a34a" }}
                      />
                    ) : (
                      <RadioButtonUncheckedIcon
                        sx={{ fontSize: 18, color: "#9ca3af" }}
                      />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.time}
                        </Typography>
                        <Typography variant="body2">{item.task}</Typography>
                      </Stack>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        sx={{ color: "#6b7280", mt: 0.25 }}
                      >
                        Статус: {statusLabel(item.status)}
                      </Typography>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>
      )}
    </Stack>
  );
}
