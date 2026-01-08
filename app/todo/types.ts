export type TodoStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "CANCELLED";
export type TodoPriority = "LOW" | "MEDIUM" | "HIGH";

export type TodoTask = {
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

export type TasksResponse = {
  items: TodoTask[];
};

export type CreateTaskRequest = {
  userId: string;
  title: string;
  description?: string;
  startAt: string;
  endAt?: string;
  priority?: TodoPriority;
  status?: TodoStatus;
  organizationId?: string;
};
