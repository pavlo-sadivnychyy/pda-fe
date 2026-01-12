"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/libs/axios";

type ChatMessage = {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  createdAt: string;
};

type ChatSession = {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
};

type GetChatSessionResponse = {
  session: { messages: ChatMessage[] } & Omit<ChatSession, "messages">;
};

export function useChatSession(sessionId?: string, userId?: string) {
  return useQuery({
    queryKey: ["chatSession", sessionId, userId],
    enabled: Boolean(sessionId && userId),
    queryFn: async () => {
      if (!sessionId || !userId) {
        return {
          session: { id: "", title: "", updatedAt: "", messages: [] },
        } as GetChatSessionResponse;
      }

      const res = await api.get(`/chat/sessions/${sessionId}`, {
        params: { userId },
      });

      return res.data as GetChatSessionResponse;
    },
    staleTime: 10_000,
  });
}
