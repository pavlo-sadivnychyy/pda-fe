"use client";

import { Button, Stack } from "@mui/material";

export const ActPdfButton = ({ actId }: { actId: string }) => {
  const handleOpen = () => {
    window.open(`/api/pdf/acts/${actId}`, "_blank", "noopener,noreferrer");
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
