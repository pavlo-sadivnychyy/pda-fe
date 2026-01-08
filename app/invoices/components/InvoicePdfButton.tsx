"use client";

import { Button, Stack } from "@mui/material";

export const InvoicePdfButton = ({
  invoiceId,
  hasPdf,
}: {
  invoiceId: string;
  hasPdf: boolean;
}) => {
  const handleOpenPdf = () => {
    window.open(
      `/api/proxy/invoices/${invoiceId}/pdf`,
      "_blank",
      "noopener,noreferrer",
    );
    // ↑ Якщо ти реально відкриваєш напряму з бекенду, заміни на:
    // window.open(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoiceId}/pdf`, "_blank", "noopener,noreferrer")
  };

  const isPrimary = !hasPdf;

  return (
    <Stack direction="row" spacing={1} height="100%" alignItems="center">
      <Button
        size="small"
        onClick={handleOpenPdf}
        variant={isPrimary ? "contained" : "outlined"}
        sx={{
          textTransform: "none",
          fontSize: 12,
          borderRadius: 999,
          px: 2,
          py: 0.5,
          minWidth: 0,
          bgcolor: isPrimary ? "#111827" : "transparent",
          color: isPrimary ? "#f9fafb" : "#111827",
          borderColor: "#111827",
          "&:hover": {
            bgcolor: isPrimary ? "#020617" : "rgba(15,23,42,0.04)",
            borderColor: "#020617",
          },
        }}
      >
        {hasPdf ? "Відкрити PDF" : "Згенерувати PDF"}
      </Button>
    </Stack>
  );
};
