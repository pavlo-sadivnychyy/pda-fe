import { useQuery } from '@tanstack/react-query';

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

export type ChatSessionStatus = 'ACTIVE' | 'ARCHIVED';

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

export function useChatSessions(
    organizationId?: string,
    userId?: string,
) {
    return useQuery<ChatSessionsResponse>({
        queryKey: ['chat-sessions', organizationId, userId],
        enabled: !!organizationId && !!userId,
        queryFn: async () => {
            const params = new URLSearchParams({
                organizationId: organizationId as string,
                userId: userId as string,
            });

            const res = await fetch(
                `${API_BASE_URL}/chat/sessions?${params.toString()}`,
            );

            if (!res.ok) {
                throw new Error(
                    `Failed to load chat sessions: ${res.status}`,
                );
            }

            return res.json();
        },
    });
}
