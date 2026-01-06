import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ChatSession } from './useChatSessions';

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

type CreateSessionPayload = {
    organizationId: string;
    createdById: string; // apiUser.id
    title?: string;
};

type CreateSessionResponse = {
    session: ChatSession;
};

export function useCreateChatSession() {
    const queryClient = useQueryClient();

    return useMutation<
        CreateSessionResponse,
        Error,
        CreateSessionPayload
    >({
        mutationFn: async (payload) => {
            const res = await fetch(`${API_BASE_URL}/chat/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error(
                    `Failed to create chat session: ${res.status}`,
                );
            }

            return res.json();
        },
        onSuccess: (data) => {
            // оновлюємо список сесій
            queryClient.invalidateQueries({
                queryKey: ['chat-sessions'],
            });
            // і конкретну сесію
            queryClient.invalidateQueries({
                queryKey: ['chat-session', data.session.id],
            });
        },
    });
}
