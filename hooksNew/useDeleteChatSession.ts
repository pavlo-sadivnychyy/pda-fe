"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/libs/axios";

export function useDeleteChatSession() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: { sessionId: string; userId: string }) => {
      const { sessionId, userId } = params;
      const res = await api.delete(`/chat/sessions/${sessionId}`, {
        params: { userId },
      });
      return res.data as { ok: true };
    },
    onSuccess: () => {
      // Підстрахуємось: інваліднемо все, що стосується чатів
      qc.invalidateQueries({ queryKey: ["chatSessions"] });
      qc.invalidateQueries({ queryKey: ["chatSession"] });
    },
  });
}
