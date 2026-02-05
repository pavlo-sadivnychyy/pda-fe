"use client";

import { Chip, Stack } from "@mui/material";
import type { ActStatus } from "../types";
import { actStatusLabel, statusChipColor } from "../utils";

export const ActStatusChip = ({ status }: { status: ActStatus }) => {
  const { bg, color } = statusChipColor(status);

  console.log(actStatusLabel[status]);
  console.log(status);

  return (
    <Stack direction="row" spacing={1} height="100%" alignItems="center">
      <Chip
        label={
          actStatusLabel[status] ??
          status.charAt(0).toUpperCase() + status.slice(1)
        }
        size="small"
        sx={{ bgcolor: bg, color, fontWeight: 500, borderRadius: "999px" }}
      />
    </Stack>
  );
};
