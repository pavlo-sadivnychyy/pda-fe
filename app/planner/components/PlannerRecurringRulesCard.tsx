"use client";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { ExpenseRecurringRule } from "../planner.types";
import { formatMoney } from "../helpers";

type Props = {
  rules: ExpenseRecurringRule[];
  onEdit: (rule: ExpenseRecurringRule) => void;
  onDelete: (id: string) => void;
};

export function PlannerRecurringRulesCard({ rules, onEdit, onDelete }: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        p: 3,
      }}
    >
      <Typography variant="h6" fontWeight={800} mb={2.5}>
        Регулярні витрати
      </Typography>

      <Stack spacing={2}>
        {rules.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Немає регулярних витрат. Додай шаблони для оренди, реклами, податків
            або софту.
          </Typography>
        ) : (
          rules.map((rule) => (
            <Paper
              key={rule.id}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.default",
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                spacing={2}
              >
                <Stack spacing={0.5}>
                  <Typography fontWeight={800}>{rule.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatMoney(rule.amount)} {rule.currency} •{" "}
                    {rule.category?.name ?? "Без категорії"} • {rule.dayOfMonth}{" "}
                    числа
                  </Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip
                      size="small"
                      label={rule.isActive ? "Активна" : "Неактивна"}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`З ${rule.startMonthKey}`}
                    />
                    {rule.endMonthKey ? (
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`До ${rule.endMonthKey}`}
                      />
                    ) : null}
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Button
                    startIcon={<EditOutlinedIcon />}
                    onClick={() => onEdit(rule)}
                  >
                    Редагувати
                  </Button>
                  <Button
                    color="error"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => onDelete(rule.id)}
                  >
                    Видалити
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))
        )}
      </Stack>
    </Paper>
  );
}
