"use client";

import { Box, Button, Typography } from "@mui/material";
import type { ReactNode } from "react";
import AddIcon from "@mui/icons-material/Add";

export const ServicesCard = ({
  onCreate,
  children,
}: {
  onCreate: () => void;
  children: ReactNode;
}) => {
  return (
    <Box
      sx={{
        borderRadius: 5,
        bgcolor: "background.paper",
        boxShadow: "0px 18px 45px rgba(15,23,42,0.11)",
        p: { xs: 3, md: 4 },

        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        height: "100%",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
          mb: 3,
          flexShrink: 0,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#020617" }}>
          Збережи послуги, щоб швидко додавати їх у документи та не вводити ціну
          вручну.
        </Typography>

        <Button
          onClick={onCreate}
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 999,
            px: 3,
            fontWeight: 800,
            textTransform: "none",
            whiteSpace: "nowrap",

            bgcolor: "#020617",
            color: "#f9fafb",
            "&:hover": { bgcolor: "#0b1220" },
          }}
        >
          Додати послугу
        </Button>
      </Box>

      <Box
        sx={{
          borderBottom: "1px solid rgba(148,163,184,0.4)",
          mb: 2.5,
          flexShrink: 0,
        }}
      />

      {/* Scroll area */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          WebkitOverflowScrolling: "touch",
          pr: { xs: 0.5, md: 1 },
        }}
      >
        {children}
      </Box>

      <Typography
        variant="caption"
        sx={{
          display: "block",
          mt: 2,
          textAlign: "center",
          color: "#9ca3af",
          fontWeight: 500,
        }}
      >
        Послуги привʼязані до вашого акаунта
      </Typography>
    </Box>
  );
};
