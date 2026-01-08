"use client";

import { Box, Button } from "@mui/material";
import type { InvoiceAction, InvoiceStatus } from "../types";

export const InvoiceRowActions = ({
  status,
  busy,
  onAction,
}: {
  status: InvoiceStatus;
  busy: boolean;
  onAction: (action: InvoiceAction) => void;
}) => {
  const canSend = status === "DRAFT" || status === "OVERDUE";
  const canMarkPaid = status === "SENT" || status === "OVERDUE";
  const canCancel = status === "DRAFT" || status === "SENT";

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        height: "100%",
        width: "100%",
      }}
    >
      <Button
        size="small"
        variant="outlined"
        disabled={!canSend || busy}
        onClick={() => onAction("send")}
        sx={{
          textTransform: "none",
          fontSize: 12,
          borderRadius: 999,
          px: 1.8,
          py: 0.4,
          borderColor: "#111827",
          color: "#111827",
          "&:hover": { borderColor: "#020617", bgcolor: "rgba(15,23,42,0.04)" },
          "&.Mui-disabled": { borderColor: "#e5e7eb", color: "#9ca3af" },
        }}
      >
        Відправлено
      </Button>

      <Button
        size="small"
        variant="outlined"
        disabled={!canMarkPaid || busy}
        onClick={() => onAction("mark-paid")}
        sx={{
          textTransform: "none",
          fontSize: 12,
          borderRadius: 999,
          px: 1.8,
          py: 0.4,
          borderColor: "#16a34a",
          color: "#166534",
          "&:hover": {
            borderColor: "#15803d",
            bgcolor: "rgba(22,163,74,0.06)",
          },
          "&.Mui-disabled": { borderColor: "#e5e7eb", color: "#9ca3af" },
        }}
      >
        Оплачено
      </Button>

      <Button
        size="small"
        variant="outlined"
        disabled={!canCancel || busy}
        onClick={() => onAction("cancel")}
        sx={{
          textTransform: "none",
          fontSize: 12,
          borderRadius: 999,
          px: 1.8,
          py: 0.4,
          borderColor: "#dc2626",
          color: "#b91c1c",
          "&:hover": {
            borderColor: "#b91c1c",
            bgcolor: "rgba(220,38,38,0.06)",
          },
          "&.Mui-disabled": { borderColor: "#fee2e2", color: "#fecaca" },
        }}
      >
        Скасувати
      </Button>
    </Box>
  );
};
