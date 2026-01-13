import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/libs/axios"; // ✅ твій axios instance
import type { ChatMessage } from "./useChatSession";

type SendMessagePayload = {
  sessionId: string;
  userId: string;
  content: string;
};

type KnowledgeSnippet = {
  content: string;
  source: string;
};

type SendMessageResponse = {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  knowledgeSnippets: KnowledgeSnippet[];
};

export function useSendChatMessage(organizationId?: string) {
  const queryClient = useQueryClient();

  return useMutation<SendMessageResponse, Error, SendMessagePayload>({
    mutationFn: async ({ sessionId, userId, content }) => {
      const res = await api.post<SendMessageResponse>(
        `/chat/sessions/${sessionId}/messages`,
        { userId, content },
      );
      return res.data;
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chat-session", variables.sessionId],
      });

      queryClient.invalidateQueries({
        queryKey: ["chat-sessions", organizationId],
      });
    },
  });
}
