import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/libs/axios";

type CreateSessionPayload = {
  organizationId: string;
  createdById: string;
  title?: string;
};

type CreateSessionResponse = {
  session: {
    id: string;
    organizationId: string;
    createdById: string;
    title: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
};

export function useCreateChatSession() {
  const queryClient = useQueryClient();

  return useMutation<CreateSessionResponse, Error, CreateSessionPayload>({
    mutationFn: async (payload) => {
      const res = await api.post<CreateSessionResponse>(
        "/chat/sessions",
        payload,
      );
      return res.data;
    },

    onSuccess: (data) => {
      // ✅ важливо: інвалідимо саме такий ключ, який використовує useChatSessions
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });

      // ✅ і одразу прогріваємо session query, щоб чат відкрився без "порожньо"
      queryClient.invalidateQueries({
        queryKey: ["chat-session", data.session.id],
      });
    },
  });
}
