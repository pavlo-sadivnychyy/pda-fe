import { useQuery } from "@tanstack/react-query";
import { api } from "@/libs/axios";
import type { KbDocument } from "./useKnowledgeBaseDocuments";

export type KbSearchResult = {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  createdAt: string;
  updatedAt: string;
  document: KbDocument;
};

export function useKnowledgeBaseSearch(
  organizationId?: string,
  query?: string,
) {
  return useQuery<{ items: KbSearchResult[] }>({
    queryKey: ["kb-search", organizationId, query],
    enabled: !!organizationId && !!query && query.trim().length >= 2,

    queryFn: async () => {
      const res = await api.get<{ items: KbSearchResult[] }>(
        "/knowledge-base/search",
        {
          params: {
            organizationId,
            q: query,
            limit: 10,
          },
        },
      );

      return res.data;
    },
  });
}
