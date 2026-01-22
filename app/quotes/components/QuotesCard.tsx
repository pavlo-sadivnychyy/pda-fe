"use client";

import { Box, Button, Typography } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import type { ReactNode } from "react";

export const QuotesCard = ({
  // залишив для зовнішньої логіки
  children,
  setCreateOpen,
  organizationId,
  currentUserId,
  isLimitReached,
}: {
  count: number;
  children: ReactNode;
  setCreateOpen: (open: boolean) => void;
  organizationId: string;
  currentUserId: string;
  isLimitReached: boolean;
}) => {
  const disabled = !organizationId || !currentUserId || isLimitReached;

  return (
    <Box
      sx={{
        borderRadius: 5,
        bgcolor: "background.paper",
        boxShadow: "0px 18px 45px rgba(15,23,42,0.11)",
        p: { xs: 3, md: 4 },
        height: { xs: "auto", md: "100%" },
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
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
          Створюй та надсилай комерційні пропозиції клієнтам на email
        </Typography>

        {/* 👉 Кнопка в хедері */}
        <Button
          onClick={() => setCreateOpen(true)}
          disabled={disabled}
          startIcon={disabled ? <LockIcon /> : null}
          sx={{
            borderRadius: 999,
            px: 3,
            fontWeight: 800,
            textTransform: "none",
            whiteSpace: "nowrap",

            bgcolor: "#111827",
            color: "white",
            "&:hover": { bgcolor: "#020617" },

            "&.Mui-disabled": {
              bgcolor: "rgba(15, 23, 42, 0.08)",
              color: "rgba(15, 23, 42, 0.45)",
              border: "1px solid rgba(148,163,184,0.35)",
              boxShadow: "none",
            },
            "&.Mui-disabled .MuiButton-startIcon": {
              color: "rgba(15,23,42,0.45)",
            },
          }}
        >
          Створити пропозицію
        </Button>
      </Box>

      <Box
        sx={{
          borderBottom: "1px solid rgba(148,163,184,0.4)",
          mb: 2.5,
          flexShrink: 0,
        }}
      />

      {/* Content */}
      <Box sx={{ flex: 1, minHeight: 0 }}>{children}</Box>

      {/* Bottom info */}
      <Typography
        variant="caption"
        sx={{
          display: "block",
          mt: 2,
          textAlign: "center",
          color: "#9ca3af",
        }}
      >
        Комерційні пропозиції повʼязані з вашим акаунтом та організацією
      </Typography>
    </Box>
  );
};
