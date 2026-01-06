import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ChatMessage } from './useChatSession';

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

type SendMessagePayload = {
    sessionId: string;
    userId: string;      // apiUser.id
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
) {
    const queryClient = useQueryClient();

    return useMutation<SendMessageResponse, Error, SendMessagePayload>({
        mutationFn: async ({ sessionId, userId, content }) => {
            const res = await fetch(
                `${API_BASE_URL}/chat/sessions/${sessionId}/messages`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId, content }),
                },
            );

            if (!res.ok) {
                throw new Error(
                    `Failed to send chat message: ${res.status}`,
                );
            }

            return res.json();
        },
        onSuccess: (_data, variables) => {
            // оновлюємо конкретну сесію (історію)
            queryClient.invalidateQueries({
                queryKey: ['chat-session', variables.sessionId],
            });
            // оновлюємо список сесій (щоб оновився updatedAt і порядок)
            queryClient.invalidateQueries({
                queryKey: ['chat-sessions', organizationId],
            });
        },
    });
}
