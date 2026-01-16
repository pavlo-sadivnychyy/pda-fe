"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import dayjs from "dayjs";
import type { TodoTask } from "../types";
import { formatTime, priorityLabel, statusLabel } from "../utils";

type Props = {
  tasks: TodoTask[];
  count: number;
  isLoading: boolean;
  isFetching: boolean;
  onOpenTodo: () => void;
  dragHandle?: React.ReactNode; // ✅ NEW
};

export function TodayTasksCard({
  tasks,
  count,
  isLoading,
  isFetching,
  onOpenTodo,
  dragHandle,
}: Props) {
  const showLoader = isLoading || isFetching;

  return (
    <Card data-onb="card-todo" elevation={3} sx={{ borderRadius: 3 }}>
      <CardHeader
        avatar={<CheckCircleIcon sx={{ color: "#16a34a" }} />}
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Задачі на сьогодні
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Короткий огляд запланованих справ на поточний день.
          </Typography>
        }
        action={<Box sx={{ mr: 0.5 }}>{dragHandle}</Box>}
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 1.5 }}>
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            {showLoader ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <CircularProgress size={18} />
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Завантажуємо задачі...
                </Typography>
              </Stack>
            ) : (
              <Typography variant="body2">
                {count === 0
                  ? "На сьогодні задач ще немає."
                  : `На сьогодні заплановано ${count} задач(і).`}
              </Typography>
            )}

            <Chip
              label={count > 0 ? `${count} задач(і)` : "0 задач"}
              size="small"
              sx={{ bgcolor: "#eef2ff", color: "#4338ca", fontWeight: 500 }}
            />
          </Stack>

          <Divider />

          {count > 0 && (
            <List dense sx={{ py: 0 }}>
              {tasks.map((task) => {
                const isPast = dayjs(task.startAt).isBefore(dayjs());
                const showDoneIcon = task.status === "DONE" || isPast;

                return (
                  <ListItem key={task.id} disableGutters sx={{ mb: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {showDoneIcon ? (
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
                      primaryTypographyProps={{ component: "div" }}
                      secondaryTypographyProps={{ component: "div" }}
                      primary={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatTime(task.startAt)}
                          </Typography>
                          <Typography variant="body2">{task.title}</Typography>
                        </Stack>
                      }
                      secondary={
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                          <Chip
                            size="small"
                            label={priorityLabel(task.priority)}
                            sx={{
                              height: 20,
                              fontSize: 10,
                              bgcolor: "#f3f4f6",
                            }}
                          />
                          <Chip
                            size="small"
                            label={statusLabel(task.status)}
                            sx={{
                              height: 20,
                              fontSize: 10,
                              bgcolor: "#ecfeff",
                            }}
                          />
                        </Stack>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          )}

          {count === 0 && !showLoader && (
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", fontStyle: "italic" }}
            >
              Додай першу задачу в планувальнику, щоб не забути важливі справи.
            </Typography>
          )}

          <Button
            variant="outlined"
            fullWidth
            onClick={onOpenTodo}
            sx={{
              mt: 1,
              textTransform: "none",
              borderRadius: 999,
              borderColor: "#202124",
              color: "#202124",
              "&:hover": { borderColor: "#020617", bgcolor: "#f3f4f6" },
            }}
          >
            Відкрити планувальник
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
