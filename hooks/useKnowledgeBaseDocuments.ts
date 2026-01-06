import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type KbDocument = {
    id: string;
    organizationId: string;
    createdById: string;
    title: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    storageKey: string;
    source: 'UPLOAD' | 'MANUAL' | 'IMPORT';
    status: 'PROCESSING' | 'READY' | 'FAILED';
    description: string | null;
    language: string | null;
    tags: string[];
    pages: number | null;
    chunkCount: number;
    createdAt: string;
    updatedAt: string;
};

export function useKnowledgeBaseDocuments(organizationId?: string) {
    return useQuery<{ items: KbDocument[] }>({
        queryKey: ['kb-documents', organizationId],
        enabled: !!organizationId,
        queryFn: async () => {
            const res = await fetch(
                `${API_URL}/knowledge-base/documents?organizationId=${organizationId}`,
            );

            if (!res.ok) {
                throw new Error(`Get documents failed: ${res.status}`);
            }

            return res.json();
        },
    });
}

// старий JSON-create хук залишимо, раптом ще знадобиться
type CreateDocumentPayload = {
    organizationId: string;
    createdById: string;
    title: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    storageKey: string;
    description?: string;
    language?: string;
    tags?: string[];
};

export function useCreateKnowledgeBaseDocument() {
    const queryClient = useQueryClient();

    return useMutation<{ document: KbDocument }, Error, CreateDocumentPayload>({
        mutationFn: async (payload) => {
            const res = await fetch(`${API_URL}/knowledge-base/documents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error(`Create document failed: ${res.status}`);
            }

            return res.json();
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['kb-documents', variables.organizationId],
            });
        },
    });
}

// ✅ НОВИЙ upload-хук (multipart/form-data)
type UploadVariables = {
    organizationId: string;
    formData: FormData;
};

export function useUploadKnowledgeBaseDocument() {
    const queryClient = useQueryClient();

    return useMutation<{ document: KbDocument }, Error, UploadVariables>({
        mutationFn: async ({ formData }) => {
            const res = await fetch(`${API_URL}/knowledge-base/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                throw new Error(`Upload document failed: ${res.status}`);
            }

            return res.json();
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['kb-documents', variables.organizationId],
            });
        },
    });
}

export function useDeleteKnowledgeBaseDocument() {
    const queryClient = useQueryClient();

    return useMutation<
        { success: boolean },
        Error,
        { id: string; organizationId: string }
    >({
        mutationFn: async ({ id }) => {
            const res = await fetch(`${API_URL}/knowledge-base/documents/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                throw new Error(`Delete document failed: ${res.status}`);
            }

            return res.json();
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['kb-documents', variables.organizationId],
            });
        },
    });
}
