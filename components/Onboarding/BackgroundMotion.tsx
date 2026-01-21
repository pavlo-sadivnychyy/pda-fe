import { Box } from "@mui/material";
import * as React from "react";

export function BackgroundMotion() {
  return (
    <Box
      aria-hidden
      sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: -200,
          background:
            "radial-gradient(circle at 20% 20%, rgba(251,145,46,0.10), transparent 45%)," +
            "radial-gradient(circle at 80% 30%, rgba(0,0,0,0.05), transparent 40%)," +
            "radial-gradient(circle at 45% 85%, rgba(251,145,46,0.08), transparent 46%)",
          filter: "blur(10px)",
          animation: "onb_bg 7s ease-in-out infinite",
          "@keyframes onb_bg": {
            "0%": { transform: "translate3d(0,0,0) scale(1)" },
            "50%": { transform: "translate3d(20px,-10px,0) scale(1.02)" },
            "100%": { transform: "translate3d(0,0,0) scale(1)" },
          },
        }}
      />
    </Box>
  );
}
