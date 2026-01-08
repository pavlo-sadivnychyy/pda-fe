"use client";

import { Button, Stack } from "@mui/material";
import { getApiBaseUrl } from "../utils";

export const ActPdfButton = ({ actId }: { actId: string }) => {
  const handleOpen = () => {
    const url = `${getApiBaseUrl()}/acts/${actId}/pdf`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Stack direction="row" spacing={1} height="100%" alignItems="center">
      <Button
        size="small"
        variant="outlined"
        onClick={handleOpen}
        sx={{
          textTransform: "none",
          fontSize: 12,
          borderRadius: 999,
          px: 2,
          py: 0.5,
          minWidth: 0,
          bgcolor: "#111827",
          color: "#f9fafb",
          borderColor: "#111827",
          "&:hover": { bgcolor: "#020617", borderColor: "#020617" },
        }}
      >
        Переглянути PDF
      </Button>
    </Stack>
  );
};
