import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import type { TasksResponse, TodoTask } from "../types";
import { api } from "@/libs/axios";

export function useTodayTasks(currentUserId: string | null) {
  const query = useQuery<TasksResponse>({
    queryKey: ["todo", "today", currentUserId],
    enabled: !!currentUserId,
    staleTime: 15_000,
    keepPreviousData: true,
    queryFn: async () => {
      const res = await api.get<TasksResponse>("/todo/tasks/today", {
        params: { userId: currentUserId },
      });
      return res.data;
    },
    select: (data) => ({
      items: [...(data?.items ?? [])].sort(
        (a, b) => dayjs(a.startAt).valueOf() - dayjs(b.startAt).valueOf(),
      ),
    }),
  });

  const tasks: TodoTask[] = query.data?.items ?? [];
  const count = tasks.length;
  return {
    ...query,
    tasks,
    count,
  };
}
