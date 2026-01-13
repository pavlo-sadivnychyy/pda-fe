"use client";

import { Button, Stack } from "@mui/material";

export const InvoicePdfButton = ({
  invoiceId,
  hasPdf,
  hasInternationalPdf,
}: {
  invoiceId: string;
  hasPdf: boolean;
  hasInternationalPdf: boolean;
}) => {
  const openUa = () => {
    window.open(
      `/api/pdf/invoices/${invoiceId}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const openIntl = () => {
    window.open(
      `/api/pdf/invoices/${invoiceId}/international`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const uaPrimary = !hasPdf;
  const intlPrimary = !hasInternationalPdf;

  const baseSx = (isPrimary: boolean) => ({
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
  });

  return (
    <Stack direction="row" spacing={1} height="100%" alignItems="center">
      <Button
        size="small"
        onClick={openUa}
        variant={uaPrimary ? "contained" : "outlined"}
        sx={baseSx(uaPrimary)}
      >
        UA PDF
      </Button>

      <Button
        size="small"
        onClick={openIntl}
        variant={intlPrimary ? "contained" : "outlined"}
        sx={baseSx(intlPrimary)}
      >
        INTL PDF
      </Button>
    </Stack>
  );
};
