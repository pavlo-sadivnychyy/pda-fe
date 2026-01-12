"use client";

import { Button } from "@mui/material";

export function QuoteConvertButton({
  disabled,
  busy,
  onClick,
}: {
  disabled?: boolean;
  busy?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      size="small"
      disabled={disabled || busy}
      onClick={onClick}
      variant="contained"
      sx={{
        textTransform: "none",
        fontSize: 12,
        borderRadius: 999,
        px: 2,
        py: 0.5,
        minWidth: 0,
        bgcolor: "#111827",
        color: "#f9fafb",
        "&:hover": { bgcolor: "#020617" },
      }}
    >
      {busy ? "Конвертую..." : "Convert → Invoice"}
    </Button>
  );
}
