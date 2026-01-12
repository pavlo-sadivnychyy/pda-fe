"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/libs/axios";

export type ChatSessionStatus = "ACTIVE" | "ARCHIVED";

export type ChatSession = {
  id: string;
  organizationId: string;
  createdById: string;
  title: string;
  status: ChatSessionStatus;
  createdAt: string;
  updatedAt: string;
};

type ChatSessionsResponse = {
  items: ChatSession[];
};

function isValidId(v?: string): v is string {
  return (
    typeof v === "string" &&
    v.trim() !== "" &&
    v !== "undefined" &&
    v !== "null"
  );
}

export function useChatSessions(organizationId?: string, userId?: string) {
  const enabled = isValidId(organizationId) && isValidId(userId);

  return useQuery<ChatSessionsResponse>({
    queryKey: ["chat-sessions", organizationId, userId],
    enabled,
    queryFn: async () => {
      // 🔒 гард — якщо хтось випадково викличе queryFn
      if (!enabled) {
        return { items: [] };
      }

      try {
        const res = await api.get<ChatSessionsResponse>("/chat/sessions", {
          params: {
            organizationId,
            userId,
          },
        });

        // бекенд нормальний → просто повертаємо
        return res.data ?? { items: [] };
      } catch (err: any) {
        // ✅ КЛЮЧОВИЙ ФІКС:
        // якщо бекенд віддав 404 — трактуємо як "нема діалогів"
        if (err?.response?.status === 404) {
          return { items: [] };
        }

        // інші помилки — пробиваємо далі
        throw err;
      }
    },
    // щоб UI не смикався при мутаціях
    staleTime: 10_000,
  });
}
