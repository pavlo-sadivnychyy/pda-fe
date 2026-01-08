import dayjs, { Dayjs } from "dayjs";
import type { TodoPriority, TodoStatus } from "./types";

export const formatTime = (iso: string) => dayjs(iso).format("HH:mm");

export const formatDateHuman = (d: Dayjs) => d.format("DD MMMM YYYY");

export const priorityColor = (p: TodoPriority) => {
  switch (p) {
    case "HIGH":
      return "#ef4444";
    case "LOW":
      return "#22c55e";
    default:
      return "#0f172a";
  }
};

export const statusLabel = (s: TodoStatus) => {
  switch (s) {
    case "DONE":
      return "Виконано";
    case "IN_PROGRESS":
      return "В процесі";
    case "PENDING":
      return "Заплановано";
    case "CANCELLED":
      return "Скасовано";
    default:
      return s;
  }
};

export const statusChipStyles = (s: TodoStatus) => {
  const base = {
    height: 22,
    fontSize: 11,
    fontWeight: 500,
    cursor: "pointer" as const,
  };

  if (s === "DONE") return { ...base, bgcolor: "#dcfce7", color: "#166534" };
  if (s === "IN_PROGRESS")
    return { ...base, bgcolor: "#fef9c3", color: "#92400e" };
  if (s === "PENDING") return { ...base, bgcolor: "#ecfeff", color: "#0369a1" };
  return { ...base, bgcolor: "#f3f4f6", color: "#4b5563" };
};

export const getNextStatus = (current: TodoStatus): TodoStatus => {
  switch (current) {
    case "PENDING":
      return "IN_PROGRESS";
    case "IN_PROGRESS":
      return "DONE";
    case "DONE":
      return "CANCELLED";
    case "CANCELLED":
    default:
      return "PENDING";
  }
};
