"use client";

import { useState, useMemo } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
  TextField,
  MenuItem,
  IconButton,
  Dialog,
  DialogContent,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs, { Dayjs } from "dayjs";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { InfinitySpin } from "react-loader-spinner";

import { useCurrentUser } from "@/hooksNew/useAppBootstrap";

// базовий інстанс axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
});

// DTO типи під бекенд
type TodoStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "CANCELLED";
type TodoPriority = "LOW" | "MEDIUM" | "HIGH";

type TodoTask = {
  id: string;
  userId: string;
  organizationId?: string | null;
  title: string;
  description?: string | null;
  startAt: string; // ISO
  endAt?: string | null;
  status: TodoStatus;
  priority: TodoPriority;
  isPinned: boolean;
};

type TasksResponse = {
  items: TodoTask[];
};

type CreateTaskRequest = {
  userId: string;
  title: string;
  description?: string;
  startAt: string;
  endAt?: string;
  priority?: TodoPriority;
  status?: TodoStatus;
  organizationId?: string;
};

// допоміжне форматування
const formatTime = (iso: string) => {
  const d = dayjs(iso);
  return d.format("HH:mm");
};

const formatDateHuman = (d: Dayjs) => d.format("DD MMMM YYYY");

export default function TodoPage() {
  const queryClient = useQueryClient();

  // 1) юзер
  const { data: userData, isLoading: isUserLoading } = useCurrentUser();
  const USER_ID = userData?.id ?? null;

  // 2) всі хуки завжди в одному порядку
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  // стартова дата вікна для стрічки (сьогодні −3 дні)
  const [stripStart, setStripStart] = useState<Dayjs>(() =>
    dayjs().startOf("day").subtract(3, "day"),
  );

  // стан для модалки
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTime, setNewTime] = useState("09:00");
  const [newPriority, setNewPriority] = useState<TodoPriority>("MEDIUM");

  const selectedDateString = selectedDate.format("YYYY-MM-DD");

  // стрічка з 14 днів від stripStart
  const daysStrip = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, idx) => stripStart.add(idx, "day")),
    [stripStart],
  );

  const shiftStrip = (direction: "prev" | "next") => {
    setStripStart((prev) => prev.add(direction === "next" ? 14 : -14, "day"));
  };

  const resetToToday = () => {
    const today = dayjs().startOf("day");
    setSelectedDate(today);
    setStripStart(today.subtract(3, "day"));
  };

  // задачі на сьогодні для summary
  const { data: todayData, isLoading: isTodayLoading } =
    useQuery<TasksResponse>({
      queryKey: ["todo", "today", USER_ID],
      queryFn: async () => {
        const res = await api.get<TasksResponse>("/todo/tasks/today", {
          params: { userId: USER_ID },
        });
        return res.data;
      },
      enabled: !!USER_ID,
    });

  // задачі на обрану дату
  const {
    data: dayData,
    isLoading: isDayLoading,
    isFetching: isDayFetching,
  } = useQuery<TasksResponse>({
    queryKey: ["todo", "day", USER_ID, selectedDateString],
    queryFn: async () => {
      const res = await api.get<TasksResponse>("/todo/tasks/day", {
        params: {
          userId: USER_ID,
          date: selectedDateString,
        },
      });
      return res.data;
    },
    enabled: !!USER_ID && !!selectedDateString,
  });

  const dayTasks = dayData?.items ?? [];
  const todayTasksCount = todayData?.items?.length ?? 0;

  // створення задачі
  const createTaskMutation = useMutation<TodoTask, Error, void>({
    mutationFn: async () => {
      const [hours, minutes] = newTime.split(":").map(Number);
      const base = selectedDate
        .hour(hours)
        .minute(minutes)
        .second(0)
        .millisecond(0);

      const payload: CreateTaskRequest = {
        userId: USER_ID as string,
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        startAt: base.toISOString(),
        priority: newPriority,
      };

      const res = await api.post<{ task: TodoTask }>("/todo/tasks", payload);
      return res.data.task;
    },
    onSuccess: () => {
      setNewTitle("");
      setNewDescription("");
      setNewTime("09:00");
      setNewPriority("MEDIUM");
      setIsDialogOpen(false);

      queryClient.invalidateQueries({
        queryKey: ["todo", "day", USER_ID, selectedDateString],
      });
      queryClient.invalidateQueries({
        queryKey: ["todo", "today", USER_ID],
      });
    },
  });

  // видалення задачі
  const deleteTaskMutation = useMutation<string, Error, string>({
    mutationFn: async (id: string) => {
      await api.delete(`/todo/tasks/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["todo", "day", USER_ID, selectedDateString],
      });
      queryClient.invalidateQueries({
        queryKey: ["todo", "today", USER_ID],
      });
    },
  });

  // оновлення статусу задачі
  const updateStatusMutation = useMutation<
    TodoTask,
    Error,
    { id: string; status: TodoStatus }
  >({
    mutationFn: async ({ id, status }) => {
      const res = await api.patch<{ task: TodoTask }>(
        `/todo/tasks/${id}/status`,
        { status },
      );
      return res.data.task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["todo", "day", USER_ID, selectedDateString],
      });
      queryClient.invalidateQueries({
        queryKey: ["todo", "today", USER_ID],
      });
    },
  });

  const handleToggleStatus = (task: TodoTask) => {
    let nextStatus: TodoStatus;

    switch (task.status) {
      case "PENDING":
        nextStatus = "IN_PROGRESS";
        break;
      case "IN_PROGRESS":
        nextStatus = "DONE";
        break;
      case "DONE":
        nextStatus = "CANCELLED";
        break;
      case "CANCELLED":
      default:
        nextStatus = "PENDING";
        break;
    }

    updateStatusMutation.mutate({ id: task.id, status: nextStatus });
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (createTaskMutation.isLoading) return;
    setIsDialogOpen(false);
  };

  const handleCreateTask = () => {
    if (!newTitle.trim()) return;
    createTaskMutation.mutate();
  };

  const isCreating = createTaskMutation.isLoading;
  const isDeleting = deleteTaskMutation.isLoading;

  const priorityColor = (p: TodoPriority) => {
    switch (p) {
      case "HIGH":
        return "#ef4444";
      case "LOW":
        return "#22c55e";
      default:
        return "#0f172a";
    }
  };

  // глобальний лоадер, але ПІСЛЯ хуків
  if (isUserLoading || !USER_ID) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#f4f5f7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <InfinitySpin width="200" color="#202124" />
      </Box>
    );
  }

  // основний UI
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f4f5f7",
        py: { xs: 3, md: 8 },
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Chip
          label="TASK PLANNER"
          size="small"
          sx={{
            mb: 2,
            bgcolor: "#e5e7eb",
            color: "#4b5563",
            fontWeight: 500,
            borderRadius: "999px",
            fontSize: { xs: 10, sm: 12 },
            height: { xs: 22, sm: 24 },
          }}
        />

        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: { xs: 2, md: 4 },
            boxShadow: "0 24px 60px rgba(15, 23, 42, 0.12)",
            bgcolor: "#ffffff",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              gap: { xs: 1.5, md: 2 },
              mb: { xs: 3, md: 4 },
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 0.5,
                  fontSize: { xs: 18, md: 22 },
                }}
              >
                План задач
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#6b7280",
                  fontSize: { xs: 12, md: 14 },
                }}
              >
                Плануй свій день по годинах — асистент зможе краще підбирати
                тобі завдання.
              </Typography>
            </Box>

            <Box
              sx={{
                minWidth: { md: 220 },
                textAlign: { xs: "left", md: "right" },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  textTransform: "uppercase",
                  color: "#9ca3af",
                  fontWeight: 600,
                  fontSize: { xs: 10, md: 11 },
                }}
              >
                СЬОГОДНІ
              </Typography>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: 13, md: 14 },
                }}
              >
                {formatDateHuman(dayjs())}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#4b5563",
                  mt: 0.5,
                  fontSize: { xs: 12, md: 13 },
                }}
              >
                {isTodayLoading
                  ? "Завантаження..."
                  : `${todayTasksCount} задач(і) на сьогодні`}
              </Typography>
            </Box>
          </Box>

          {/* Календар-стрічка з навігацією */}
          <Box sx={{ mb: { xs: 2.5, md: 3 } }}>
            <Typography
              variant="caption"
              sx={{
                color: "#9ca3af",
                fontWeight: 600,
                letterSpacing: 0.4,
                fontSize: { xs: 10, md: 11 },
              }}
            >
              ОБЕРИ ДЕНЬ
            </Typography>

            <Box
              sx={{
                mt: 1.5,
                pb: { xs: 0.5, md: 1 },
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 1, sm: 1 },
                alignItems: { xs: "stretch", sm: "center" },
                width: "100%",
                maxWidth: "100%",
              }}
            >
              {/* Верхній ряд: стрілки + Сьогодні */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  width: { xs: "100%", sm: "auto" },
                  justifyContent: { xs: "flex-start", sm: "flex-start" },
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => shiftStrip("prev")}
                  sx={{
                    bgcolor: "#e5e7eb",
                    "&:hover": { bgcolor: "#d4d4d8" },
                    width: 32,
                    height: 32,
                  }}
                >
                  <ChevronLeftIcon sx={{ fontSize: 18 }} />
                </IconButton>

                <IconButton
                  size="small"
                  onClick={() => shiftStrip("next")}
                  sx={{
                    bgcolor: "#e5e7eb",
                    "&:hover": { bgcolor: "#d4d4d8" },
                    width: 32,
                    height: 32,
                  }}
                >
                  <ChevronRightIcon sx={{ fontSize: 18 }} />
                </IconButton>

                <Button
                  size="small"
                  onClick={resetToToday}
                  sx={{
                    textTransform: "none",
                    borderRadius: 999,
                    px: 2,
                    bgcolor: "#e5e7eb",
                    color: "#111827",
                    fontSize: { xs: 11, md: 12 },
                    "&:hover": { bgcolor: "#d4d4d8" },
                    whiteSpace: "nowrap",
                  }}
                >
                  Сьогодні
                </Button>
              </Box>

              {/* Стрічка дат */}
              <Box
                sx={{
                  display: "flex",
                  overflowX: "auto",
                  gap: 1,
                  flex: 1,
                  minWidth: 0,
                  maxWidth: "100%",
                  px: 0.5,
                }}
              >
                {daysStrip.map((d) => {
                  const isSelected = d.isSame(selectedDate, "day");
                  return (
                    <Button
                      key={d.toISOString()}
                      onClick={() => setSelectedDate(d)}
                      sx={{
                        minWidth: { xs: 60, sm: 72 },
                        borderRadius: 999,
                        flexDirection: "column",
                        alignItems: "center",
                        px: { xs: 1, sm: 1.5 },
                        py: { xs: 0.75, sm: 1 },
                        bgcolor: isSelected ? "#020617" : "#f3f4f6",
                        color: isSelected ? "#f9fafb" : "#111827",
                        textTransform: "none",
                        "&:hover": {
                          bgcolor: isSelected ? "#020617" : "#e5e7eb",
                        },
                        flexShrink: 0,
                        boxSizing: "border-box",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: { xs: 9, sm: 10 },
                          opacity: 0.8,
                        }}
                      >
                        {d.format("dd").toUpperCase()}
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          lineHeight: 1.1,
                          fontSize: { xs: 13, sm: 14 },
                        }}
                      >
                        {d.format("DD")}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: { xs: 9, sm: 10 },
                          opacity: 0.8,
                        }}
                      >
                        {d.format("MMM").toUpperCase()}
                      </Typography>
                    </Button>
                  );
                })}
              </Box>
            </Box>

            <Typography
              variant="body2"
              sx={{
                mt: 1.5,
                color: "#6b7280",
                fontSize: { xs: 12, md: 13 },
              }}
            >
              Обрана дата:{" "}
              <Box component="span" sx={{ fontWeight: 600, color: "#111827" }}>
                {formatDateHuman(selectedDate)}
              </Box>
            </Typography>
          </Box>

          {/* Картка задач на день */}
          <Box
            sx={{
              mt: 1,
              bgcolor: "#f9fafb",
              borderRadius: 3,
              p: { xs: 1.75, md: 2.5 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                gap: { xs: 1, sm: 0 },
                mb: 2,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: 14, md: 16 },
                }}
              >
                Задачі на день
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  width: { xs: "100%", sm: "auto" },
                  justifyContent: { xs: "space-between", sm: "flex-end" },
                }}
              >
                {isDayLoading || isDayFetching ? (
                  <CircularProgress size={18} />
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#6b7280",
                      fontSize: { xs: 12, md: 13 },
                    }}
                  >
                    {dayTasks.length === 0
                      ? "Ще немає задач"
                      : `${dayTasks.length} задач(і)`}
                  </Typography>
                )}

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleOpenDialog}
                  sx={{
                    textTransform: "none",
                    borderRadius: 999,
                    borderColor: "#020617",
                    color: "#020617",
                    fontWeight: 500,
                    fontSize: { xs: 12, md: 13 },
                    "&:hover": {
                      borderColor: "#020617",
                      bgcolor: "#e5e7eb",
                    },
                    whiteSpace: "nowrap",
                  }}
                >
                  Додати задачу
                </Button>
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1.5}>
              {dayTasks.map((task) => (
                <Box
                  key={task.id}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.25,
                    p: { xs: 1.25, md: 1.5 },
                    borderRadius: 2,
                    bgcolor: "#ffffff",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Box sx={{ minWidth: 48 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "#111827",
                        fontSize: { xs: 12, md: 13 },
                      }}
                    >
                      {formatTime(task.startAt)}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        mb: 0.5,
                        fontSize: { xs: 13, md: 14 },
                      }}
                    >
                      {task.title}
                    </Typography>
                    {task.description && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#6b7280",
                          fontSize: { xs: 12, md: 13 },
                        }}
                      >
                        {task.description}
                      </Typography>
                    )}

                    <Box
                      sx={{
                        mt: 0.75,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.75,
                      }}
                    >
                      <Chip
                        size="small"
                        label={
                          task.priority === "HIGH"
                            ? "Високий пріоритет"
                            : task.priority === "LOW"
                              ? "Низький пріоритет"
                              : "Середній пріоритет"
                        }
                        sx={{
                          height: 22,
                          bgcolor: "#f3f4f6",
                          color: priorityColor(task.priority),
                          fontSize: 11,
                          fontWeight: 500,
                        }}
                      />
                      <Chip
                        size="small"
                        label={
                          task.status === "DONE"
                            ? "Виконано"
                            : task.status === "IN_PROGRESS"
                              ? "В процесі"
                              : task.status === "PENDING"
                                ? "Заплановано"
                                : "Скасовано"
                        }
                        onClick={() => handleToggleStatus(task)}
                        sx={{
                          height: 22,
                          fontSize: 11,
                          fontWeight: 500,
                          cursor: "pointer",
                          bgcolor:
                            task.status === "DONE"
                              ? "#dcfce7"
                              : task.status === "IN_PROGRESS"
                                ? "#fef9c3"
                                : "#ecfeff",
                          color:
                            task.status === "DONE"
                              ? "#166534"
                              : task.status === "IN_PROGRESS"
                                ? "#92400e"
                                : "#0369a1",
                        }}
                      />
                    </Box>
                  </Box>

                  <IconButton
                    size="small"
                    disabled={isDeleting}
                    onClick={() => deleteTaskMutation.mutate(task.id)}
                    sx={{ mt: 0.25 }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              ))}

              {dayTasks.length === 0 && !isDayLoading && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "#9ca3af",
                    textAlign: "center",
                    mt: 2,
                    fontSize: { xs: 12, md: 13 },
                  }}
                >
                  На цю дату ще нічого не заплановано.
                </Typography>
              )}
            </Stack>
          </Box>

          <Box
            sx={{
              mt: { xs: 3, md: 4 },
              color: "#020617",
              px: { xs: 2, md: 3 },
              py: { xs: 1.2, md: 1.6 },
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              textAlign: "center",
            }}
          >
            <Typography fontSize={{ xs: 11, md: 13 }}>
              Профіль задач зберігається у твоєму акаунті. Асистент використовує
              їх, щоб планувати твій день.
            </Typography>
            <Typography fontSize={{ xs: 11, md: 13 }}>
              Ви також можете змінювати статус задачі, по кліку на статус
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* Модалка додавання задачі у стилі інших форм */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 0,
          },
        }}
      >
        <DialogContent
          sx={{
            padding: "24px",
          }}
        >
          {/* Чіп зверху */}
          <Box
            sx={{
              display: "inline-flex",
              px: 1.5,
              py: 0.5,
              borderRadius: 999,
              bgcolor: "#f3f4f6",
              mb: 2,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                letterSpacing: 0.8,
                fontWeight: 600,
                color: "#6b7280",
              }}
            >
              TASKS
            </Typography>
          </Box>

          {/* Заголовок + опис */}
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, mb: 0.5, color: "#020617" }}
          >
            Нова задача
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#6b7280", mb: 3, maxWidth: 520 }}
          >
            Створи задачу для{" "}
            <Box component="span" sx={{ fontWeight: 600, color: "#111827" }}>
              {formatDateHuman(selectedDate)}
            </Box>
            : задай назву, час, пріоритет та короткий опис — асистент
            використовуватиме ці дані під час планування дня.
          </Typography>

          {/* Поля форми */}
          <Stack spacing={2.5}>
            <TextField
              label="Назва задачі *"
              placeholder="Наприклад: Розібрати пошту та відповісти на листи"
              fullWidth
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Час"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                sx={{ width: { xs: "100%", sm: 180 } }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Пріоритет"
                select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as TodoPriority)}
                sx={{ width: { xs: "100%", sm: 220 } }}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="LOW">Низький</MenuItem>
                <MenuItem value="MEDIUM">Середній</MenuItem>
                <MenuItem value="HIGH">Високий</MenuItem>
              </TextField>
            </Stack>

            <TextField
              label="Опис (опціонально)"
              placeholder="Додаткові деталі, чекліст або контекст задачі"
              fullWidth
              multiline
              minRows={3}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          {/* Кнопки внизу */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 4,
              gap: 2,
            }}
          >
            <Button
              onClick={handleCloseDialog}
              disabled={isCreating}
              sx={{ textTransform: "none", color: "#6b7280" }}
            >
              Скасувати
            </Button>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateTask}
              disabled={!newTitle.trim() || isCreating}
              sx={{
                textTransform: "none",
                borderRadius: 999,
                px: { xs: 2.5, md: 3 },
                bgcolor: "#111827",
                "&:hover": { bgcolor: "#020617" },
              }}
            >
              {isCreating ? "Збереження..." : "Додати задачу"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
