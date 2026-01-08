"use client";

import { useCallback, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useCurrentUser } from "@/hooksNew/useAppBootstrap";

import type {
  CreateTaskRequest,
  TasksResponse,
  TodoPriority,
  TodoStatus,
  TodoTask,
} from "../types";
import { getNextStatus } from "../utils";
import { api } from "@/libs/axios";

const buildDateTimeIso = (baseDay: Dayjs, timeHHmm: string) => {
  const [h, m] = timeHHmm.split(":").map(Number);
  return baseDay.hour(h).minute(m).second(0).millisecond(0).toISOString();
};

export const useTodoPage = () => {
  const queryClient = useQueryClient();

  const { data: userData, isLoading: isUserLoading } = useCurrentUser();
  const userId = (userData as any)?.id ?? null;

  const [selectedDate, setSelectedDate] = useState<Dayjs>(() =>
    dayjs().startOf("day"),
  );
  const [stripStart, setStripStart] = useState<Dayjs>(() =>
    dayjs().startOf("day").subtract(3, "day"),
  );

  // create dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState<string>(""); // "" => no endAt
  const [newPriority, setNewPriority] = useState<TodoPriority>("MEDIUM");

  // move dialog state
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [moveTask, setMoveTask] = useState<TodoTask | null>(null);
  const [moveDate, setMoveDate] = useState<string>(""); // YYYY-MM-DD

  const selectedDateString = useMemo(
    () => selectedDate.format("YYYY-MM-DD"),
    [selectedDate],
  );

  const daysStrip = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, idx) => stripStart.add(idx, "day")),
    [stripStart],
  );

  const shiftStrip = useCallback((direction: "prev" | "next") => {
    setStripStart((prev) => prev.add(direction === "next" ? 14 : -14, "day"));
  }, []);

  const resetToToday = useCallback(() => {
    const today = dayjs().startOf("day");
    setSelectedDate(today);
    setStripStart(today.subtract(3, "day"));
  }, []);

  const invalidateDayAndToday = useCallback(() => {
    if (!userId) return;
    queryClient.invalidateQueries({ queryKey: ["todo", "today", userId] });
    queryClient.invalidateQueries({
      queryKey: ["todo", "day", userId, selectedDateString],
    });
  }, [queryClient, userId, selectedDateString]);

  const todayQuery = useQuery<TasksResponse>({
    queryKey: ["todo", "today", userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await api.get<TasksResponse>("/todo/tasks/today", {
        params: { userId },
      });
      return res.data;
    },
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });

  const dayQuery = useQuery<TasksResponse>({
    queryKey: ["todo", "day", userId, selectedDateString],
    enabled: !!userId && !!selectedDateString,
    queryFn: async () => {
      const res = await api.get<TasksResponse>("/todo/tasks/day", {
        params: { userId, date: selectedDateString },
      });
      return res.data;
    },
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });

  const dayTasks = dayQuery.data?.items ?? [];
  const todayTasksCount = todayQuery.data?.items?.length ?? 0;

  const createTaskMutation = useMutation<TodoTask, Error, void>({
    mutationFn: async () => {
      if (!userId) throw new Error("No userId");

      const startAt = buildDateTimeIso(selectedDate, startTime);

      let endAt: string | undefined = undefined;
      if (endTime && endTime.trim()) {
        // якщо endTime < startTime — не валимо, але краще не давати створювати (валидація нижче)
        endAt = buildDateTimeIso(selectedDate, endTime);
      }

      const payload: CreateTaskRequest = {
        userId,
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        startAt,
        endAt,
        priority: newPriority,
      };

      const res = await api.post<{ task: TodoTask }>("/todo/tasks", payload);
      return res.data.task;
    },
    onSuccess: () => {
      setNewTitle("");
      setNewDescription("");
      setStartTime("09:00");
      setEndTime("");
      setNewPriority("MEDIUM");
      setIsDialogOpen(false);
      invalidateDayAndToday();
    },
  });

  const deleteTaskMutation = useMutation<string, Error, string>({
    mutationFn: async (id: string) => {
      await api.delete(`/todo/tasks/${id}`);
      return id;
    },
    onSuccess: () => invalidateDayAndToday(),
  });

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
    onSuccess: () => invalidateDayAndToday(),
  });

  const moveTaskMutation = useMutation<
    TodoTask,
    Error,
    { task: TodoTask; newDate: string }
  >({
    mutationFn: async ({ task, newDate }) => {
      const targetDay = dayjs(newDate).startOf("day");
      const start = dayjs(task.startAt);

      // зберігаємо час
      const newStart = targetDay
        .hour(start.hour())
        .minute(start.minute())
        .second(0)
        .millisecond(0);

      // якщо є endAt — зберігаємо тривалість
      const oldEnd = task.endAt ? dayjs(task.endAt) : null;
      const durationMs = oldEnd ? oldEnd.diff(start) : null;
      const newEnd =
        durationMs !== null ? newStart.add(durationMs, "millisecond") : null;

      const res = await api.patch<{ task: TodoTask }>(
        `/todo/tasks/${task.id}`,
        {
          startAt: newStart.toISOString(),
          endAt: newEnd ? newEnd.toISOString() : null,
        },
      );

      return res.data.task;
    },
    onSuccess: () => {
      setIsMoveOpen(false);
      setMoveTask(null);
      setMoveDate("");
      invalidateDayAndToday();
    },
  });

  const handleToggleStatus = useCallback(
    (task: TodoTask) => {
      const nextStatus = getNextStatus(task.status);
      updateStatusMutation.mutate({ id: task.id, status: nextStatus });
    },
    [updateStatusMutation],
  );

  const openCreateDialog = useCallback(() => setIsDialogOpen(true), []);
  const closeCreateDialog = useCallback(() => {
    if (createTaskMutation.isLoading) return;
    setIsDialogOpen(false);
  }, [createTaskMutation.isLoading]);

  const submitCreateTask = useCallback(() => {
    if (!newTitle.trim()) return;

    // проста валідація range: end має бути після start
    if (endTime && endTime.trim()) {
      const start = dayjs(buildDateTimeIso(selectedDate, startTime));
      const end = dayjs(buildDateTimeIso(selectedDate, endTime));
      if (end.isBefore(start) || end.isSame(start)) return;
    }

    createTaskMutation.mutate();
  }, [
    createTaskMutation,
    newTitle,
    endTime,
    selectedDate,
    startTime,
    endTime,
    newPriority,
  ]);

  const openMoveDialog = useCallback((task: TodoTask) => {
    setMoveTask(task);
    setMoveDate(dayjs(task.startAt).format("YYYY-MM-DD"));
    setIsMoveOpen(true);
  }, []);

  const closeMoveDialog = useCallback(() => {
    if (moveTaskMutation.isLoading) return;
    setIsMoveOpen(false);
    setMoveTask(null);
    setMoveDate("");
  }, [moveTaskMutation.isLoading]);

  const submitMoveTask = useCallback(() => {
    if (!moveTask || !moveDate) return;
    moveTaskMutation.mutate({ task: moveTask, newDate: moveDate });
  }, [moveTaskMutation, moveTask, moveDate]);

  return {
    userId,
    isUserLoading,

    selectedDate,
    setSelectedDate,
    selectedDateString,

    stripStart,
    daysStrip,
    shiftStrip,
    resetToToday,

    // create dialog
    isDialogOpen,
    openCreateDialog,
    closeCreateDialog,

    newTitle,
    setNewTitle,
    newDescription,
    setNewDescription,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    newPriority,
    setNewPriority,

    // move dialog
    isMoveOpen,
    moveTask,
    moveDate,
    setMoveDate,
    openMoveDialog,
    closeMoveDialog,
    submitMoveTask,

    todayTasksCount,
    todayQuery,

    dayTasks,
    dayQuery,

    createTaskMutation,
    deleteTaskMutation,
    updateStatusMutation,
    moveTaskMutation,

    handleToggleStatus,
    submitCreateTask,
  };
};
