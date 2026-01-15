"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/libs/axios";

export function useSendInvoiceDeadlineReminder() {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: {
      invoiceId: string;
      force?: boolean;
      message?: string;
      invalidateOrgId?: string | null;
    }) => {
      const res = await api.post(
        `/invoices/${params.invoiceId}/send-deadline-reminder`,
        {
          force: Boolean(params.force),
          message: params.message,
        },
      );

      return res.data as { success: true };
    },
    onSuccess: async (_data, vars) => {
      // Підтягнути "останнє нагадування" — бек у due-soon віддає reminders.take(1)
      if (vars.invalidateOrgId) {
        await qc.invalidateQueries({
          queryKey: ["invoices", "due-soon", vars.invalidateOrgId],
          exact: false,
        });
      } else {
        await qc.invalidateQueries({
          queryKey: ["invoices", "due-soon"],
          exact: false,
        });
      }
    },
  });

  return mutation;
}
