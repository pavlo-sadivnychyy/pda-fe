"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

type UpdateOrganizationPayload = Partial<{
  name: string;
  industry: string | null;
  description: string | null;
  websiteUrl: string | null;
  country: string | null;
  city: string | null;
  timeZone: string | null;
  defaultLanguage: string | null;
  defaultCurrency: string | null;
  tagline: string | null;
  niche: string | null;
  longDescription: string | null;
}>;

export const useUpdateOrganization = (organizationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateOrganizationPayload) => {
      const res = await axios.patch(
        `${API_URL}/organizations/${organizationId}`,
        payload,
        {
          withCredentials: true,
        },
      );
      return res.data;
    },

    onSuccess: () => {
      // 🔥 оновлюємо організацію
      queryClient.invalidateQueries({
        queryKey: ["organization", organizationId],
      });

      // 🔥 оновлюємо bootstrap (бо там activeOrganization)
      queryClient.invalidateQueries({
        queryKey: ["app-bootstrap"],
      });
    },
  });
};
