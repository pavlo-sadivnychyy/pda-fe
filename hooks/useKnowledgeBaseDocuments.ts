import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/libs/axios";

export type KbDocument = {
  id: string;
  organizationId: string;
  createdById: string;
  title: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  source: "UPLOAD" | "MANUAL" | "IMPORT";
  status: "PROCESSING" | "READY" | "FAILED";
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
    queryKey: ["kb-documents", organizationId],
    enabled: !!organizationId,
    queryFn: async () => {
      return await api.get(
        `/knowledge-base/documents?organizationId=${organizationId}`,
      );
    },
  });
}

export function useUploadKnowledgeBaseDocument() {
  const queryClient = useQueryClient();

  return useMutation<
    { document: KbDocument },
    Error,
    { formData: FormData; organizationId: string }
  >({
    mutationFn: async ({ formData }) => {
      const res = await api.post("/knowledge-base/upload", formData, {
        headers: {
          // важливо: даємо axios/browser поставити boundary
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data;
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["kb-documents", variables.organizationId],
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
      const res = await api.delete(`/knowledge-base/documents/${id}`);
      return res.data;
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["kb-documents", variables.organizationId],
      });
    },
  });
}
