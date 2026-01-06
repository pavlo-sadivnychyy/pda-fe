import { useQuery } from "@tanstack/react-query";
import type { KbDocument } from "./useKnowledgeBaseDocuments";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
      const params = new URLSearchParams({
        organizationId: organizationId!,
        q: query!,
        limit: "10",
      });

      const res = await fetch(
        `${API_URL}/knowledge-base/search?${params.toString()}`,
      );

      if (!res.ok) {
        throw new Error(`Search failed: ${res.status}`);
      }

      return res.json();
    },
  });
}
