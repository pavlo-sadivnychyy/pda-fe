import { Box } from "@mui/material";
import * as React from "react";

export function StepCard({
  title,
  text,
  badge,
  hint,
  lockedIcon,
  tone,
}: {
  title: string;
  text: string;
  badge: string;
  hint?: string;
  lockedIcon?: boolean;
  tone: "primary" | "muted";
}) {
  const primary = tone === "primary";

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 4,
        border: "1px solid rgba(0,0,0,0.10)",
        p: { xs: 2, sm: 2.25 },
        background: primary ? "rgba(251,145,46,0.08)" : "rgba(0,0,0,0.02)",
        boxShadow: primary
          ? "0 18px 60px rgba(0,0,0,0.10)"
          : "0 10px 30px rgba(0,0,0,0.06)",
        overflow: "hidden",
        maxWidth: 820,
        mx: "auto",
      }}
    >
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          borderRadius: 999,
          px: 1.25,
          py: 0.5,
          fontSize: 12,
          fontWeight: 900,
          border: "1px solid rgba(0,0,0,0.10)",
          background: "rgba(255,255,255,0.9)",
        }}
      >
        {lockedIcon ? <span style={{ fontSize: 14 }}>🔒</span> : null}
        <span>{badge}</span>
      </Box>

      <Box sx={{ mt: 1.25, fontWeight: 980, fontSize: { xs: 16, sm: 18 } }}>
        {title}
      </Box>

      <Box sx={{ mt: 1, fontSize: 14, color: "rgba(0,0,0,0.72)" }}>{text}</Box>

      {hint ? (
        <Box sx={{ mt: 1.25, fontSize: 13, color: "rgba(0,0,0,0.62)" }}>
          {hint}
        </Box>
      ) : null}
    </Box>
  );
}
