import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/libs/axios";
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

export function useSendChatMessage(
  organizationId?: string,
  apiUserId?: string,
) {
  const queryClient = useQueryClient();

  return useMutation<SendMessageResponse, Error, SendMessagePayload>({
    mutationFn: async ({ sessionId, userId, content }) => {
      const res = await api.post<SendMessageResponse>(
        `/chat/sessions/${sessionId}/messages`,
        { userId, content },
      );
      return res.data;
    },

    // ✅ 1) optimistic UI: одразу показуємо повідомлення користувача
    onMutate: async (vars) => {
      const sessionKey = ["chat-session", vars.sessionId, vars.userId];

      await queryClient.cancelQueries({ queryKey: sessionKey });

      const previous = queryClient.getQueryData<any>(sessionKey);

      const tempId = `temp-${Date.now()}`;
      const tempUserMessage: ChatMessage = {
        id: tempId,
        sessionId: vars.sessionId,
        role: "USER",
        content: vars.content,
        createdAt: new Date().toISOString(),
      } as any;

      queryClient.setQueryData<any>(sessionKey, (old) => {
        const base = old ?? {};
        const s = base.session ?? { messages: [] };

        return {
          ...base,
          session: {
            ...s,
            messages: [...(s.messages ?? []), tempUserMessage],
          },
        };
      });

      return { previous, sessionKey, tempId };
    },

    // ✅ 2) на успіх — додаємо assistantMessage, і заміняємо temp user message на реальний
    onSuccess: (data, vars, ctx) => {
      const sessionKey = ["chat-session", vars.sessionId, vars.userId];

      queryClient.setQueryData<any>(sessionKey, (old) => {
        const base = old ?? {};
        const s = base.session ?? { messages: [] };

        const messages = (s.messages ?? []).map((m: any) =>
          m.id === ctx?.tempId ? data.userMessage : m,
        );

        return {
          ...base,
          session: {
            ...s,
            messages: [...messages, data.assistantMessage],
          },
        };
      });

      // ✅ 3) підстраховка: інвалідимо конкретну сесію (на випадок, якщо структура кешу відрізняється)
      queryClient.invalidateQueries({
        queryKey: ["chat-session", vars.sessionId, vars.userId],
      });

      // ✅ 4) оновити список сесій (час updatedAt, сортування)
      // якщо useChatSessions має ["chat-sessions", orgId, userId] — краще так:
      if (organizationId && apiUserId) {
        queryClient.invalidateQueries({
          queryKey: ["chat-sessions", organizationId, apiUserId],
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
      }
    },

    onError: (_err, _vars, ctx) => {
      // rollback optimistic
      if (ctx?.previous) {
        queryClient.setQueryData(ctx.sessionKey, ctx.previous);
      } else if (ctx?.sessionKey) {
        queryClient.invalidateQueries({ queryKey: ctx.sessionKey });
      }
    },
  });
}
