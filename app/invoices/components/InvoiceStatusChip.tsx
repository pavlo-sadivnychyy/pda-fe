"use client";

import { Chip, Stack } from "@mui/material";
import type { InvoiceStatus } from "../types";
import { statuses } from "../types";
import { statusChipColor } from "../utils";

export const InvoiceStatusChip = ({ status }: { status: InvoiceStatus }) => {
  const { color, bg } = statusChipColor(status);

  return (
    <Stack direction="row" spacing={1} height="100%" alignItems="center">
      <Chip
        size="small"
        label={statuses[status]}
        sx={{
          fontSize: 12,
          fontWeight: 500,
          color,
          backgroundColor: bg,
          borderRadius: "999px",
        }}
      />
    </Stack>
  );
};
