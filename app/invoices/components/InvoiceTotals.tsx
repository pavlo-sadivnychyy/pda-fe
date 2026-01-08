"use client";

import { Box, Typography } from "@mui/material";
import { formatMoney } from "../utils";

export const InvoiceTotals = ({
  currency,
  subtotal,
  taxAmount,
  total,
}: {
  currency: string;
  subtotal: number;
  taxAmount: number;
  total: number;
}) => {
  return (
    <Box
      sx={{
        mt: 3,
        display: "flex",
        justifyContent: "space-between",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "flex-start", md: "center" },
        gap: 2,
      }}
    >
      <Box>
        <Typography
          variant="caption"
          sx={{ color: "#9ca3af", textTransform: "uppercase" }}
        >
          Підсумок
        </Typography>
        <Typography variant="body2" sx={{ color: "#6b7280" }}>
          Система автоматично рахує суму без ПДВ, податок та суму до оплати.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 0.5,
        }}
      >
        <Typography variant="body2">
          Сума без ПДВ: {formatMoney(subtotal)} {currency}
        </Typography>
        <Typography variant="body2">
          ПДВ: {formatMoney(taxAmount)} {currency}
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          До оплати: {formatMoney(total)} {currency}
        </Typography>
      </Box>
    </Box>
  );
};
