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

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTime, setNewTime] = useState("09:00");
  const [newPriority, setNewPriority] = useState<TodoPriority>("MEDIUM");

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
      const [hours, minutes] = newTime.split(":").map(Number);

      const base = selectedDate
        .hour(hours)
        .minute(minutes)
        .second(0)
        .millisecond(0);

      const payload: CreateTaskRequest = {
        userId,
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
        {
          status,
        },
      );
      return res.data.task;
    },
    onSuccess: () => invalidateDayAndToday(),
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
    createTaskMutation.mutate();
  }, [createTaskMutation, newTitle]);

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

    isDialogOpen,
    openCreateDialog,
    closeCreateDialog,

    newTitle,
    setNewTitle,
    newDescription,
    setNewDescription,
    newTime,
    setNewTime,
    newPriority,
    setNewPriority,

    todayTasksCount,
    todayQuery,

    dayTasks,
    dayQuery,

    createTaskMutation,
    deleteTaskMutation,
    updateStatusMutation,

    handleToggleStatus,
    submitCreateTask,
  };
};
