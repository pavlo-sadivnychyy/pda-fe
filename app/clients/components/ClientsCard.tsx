"use client";

import { Box, Button, Typography } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import type { ReactNode } from "react";

export const ClientsCard = ({
  onCreate,
  children,
  isLimitReached,
}: {
  count: number;
  onCreate: () => void;
  children: ReactNode;
  isLimitReached: boolean;
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
          Зберігай дані клієнтів, щоб швидко підставляти їх в інвойси та
          комунікацію.
        </Typography>

        {/* 👉 Кнопка тепер тут */}
        <Button
          onClick={onCreate}
          disabled={isLimitReached}
          startIcon={isLimitReached ? <LockIcon /> : null}
          sx={{
            borderRadius: 999,
            px: 3,
            fontWeight: 700,
            textTransform: "none",
            whiteSpace: "nowrap",

            bgcolor: "#020617",
            color: "#f9fafb",
            "&:hover": { bgcolor: "#0b1220" },

            "&.Mui-disabled": {
              bgcolor: "rgba(2,6,23,0.08)",
              color: "rgba(2,6,23,0.45)",
              border: "1px solid rgba(2,6,23,0.10)",
              boxShadow: "none",
              cursor: "not-allowed",
            },
            "&.Mui-disabled .MuiButton-startIcon": {
              color: "rgba(2,6,23,0.45)",
            },
          }}
        >
          {isLimitReached ? "Ліміт досягнуто" : "Додати клієнта"}
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

      {/* Пояснюючий текст знизу залишив — корисний */}
      <Typography
        variant="caption"
        sx={{
          display: "block",
          mt: 2,
          textAlign: "center",
          color: isLimitReached ? "#991b1b" : "#9ca3af",
          fontWeight: isLimitReached ? 700 : 500,
        }}
      >
        {isLimitReached
          ? "Недоступно на поточному плані — підвищіть план, щоб додати більше клієнтів."
          : "Клієнти повʼязані з вашим акаунтом та організацією"}
      </Typography>
    </Box>
  );
};
