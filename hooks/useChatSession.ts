import { useQuery } from '@tanstack/react-query';
import type { ChatSession } from './useChatSessions';

export type ChatMessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

export type ChatMessage = {
    id: string;
    sessionId: string;
    role: ChatMessageRole;
    content: string;
    metadata?: any | null;
    createdAt: string;
};

type ChatSessionResponse = {
    session: ChatSession & {
        messages: ChatMessage[];
    };
};

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

export function useChatSession(
    sessionId?: string,
    userId?: string,
) {
    return useQuery<ChatSessionResponse>({
        queryKey: ['chat-session', sessionId, userId],
        enabled: !!sessionId && !!userId,
        queryFn: async () => {
            const params = new URLSearchParams({
                userId: userId as string,
            });

            const res = await fetch(
                `${API_BASE_URL}/chat/sessions/${sessionId}?${params.toString()}`,
            );

            if (!res.ok) {
                throw new Error(
                    `Failed to load chat session: ${res.status}`,
                );
            }

            return res.json();
        },
    });
}
