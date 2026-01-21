import { Box } from "@mui/material";
import * as React from "react";

export function ActionBtn({
  label,
  onClick,
  variant,
  disabled,
}: {
  label: string;
  onClick: () => void;
  variant: "primary" | "ghost" | "text";
  disabled?: boolean;
}) {
  const common = {
    px: 2.5,
    py: 1.1,
    borderRadius: 3,
    fontWeight: 950,
    cursor: disabled ? "not-allowed" : "pointer",
    userSelect: "none" as const,
    opacity: disabled ? 0.45 : 1,
    pointerEvents: disabled ? ("none" as const) : ("auto" as const),
    transition:
      "transform 120ms ease, filter 120ms ease, background 120ms ease",
  };

  if (variant === "primary") {
    return (
      <Box
        onClick={onClick}
        role="button"
        sx={{
          ...common,
          bgcolor: "#ffbf57",
          color: "#1a1200",
          border: "1px solid rgba(0,0,0,0.10)",
          boxShadow: "0 18px 55px rgba(0,0,0,0.14)",
          "&:hover": { filter: "brightness(0.98)" },
          "&:active": { transform: "translateY(1px)" },
        }}
      >
        {label}
      </Box>
    );
  }

  if (variant === "ghost") {
    return (
      <Box
        onClick={onClick}
        role="button"
        sx={{
          ...common,
          bgcolor: "rgba(0,0,0,0.04)",
          color: "rgba(0,0,0,0.85)",
          border: "1px solid rgba(0,0,0,0.10)",
          "&:hover": { bgcolor: "rgba(0,0,0,0.06)" },
          "&:active": { transform: "translateY(1px)" },
        }}
      >
        {label}
      </Box>
    );
  }

  return (
    <Box
      onClick={onClick}
      role="button"
      sx={{
        ...common,
        px: 1.5,
        py: 1.0,
        bgcolor: "transparent",
        color: "rgba(0,0,0,0.70)",
        "&:hover": { textDecoration: "underline" },
      }}
    >
      {label}
    </Box>
  );
}
