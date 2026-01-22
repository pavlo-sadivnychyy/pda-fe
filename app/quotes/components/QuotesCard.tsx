"use client";

import { Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import type { ReactNode } from "react";

export const QuotesCard = ({
  count,
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

        // ✅ на desktop карточка може бути flex-колонкою щоб грід займав весь простір
        height: { xs: "auto", md: "100%" },
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mb: 0.5, color: "#020617" }}
          >
            Створюй та надсилай комерційні пропозиції клієнтам на email
          </Typography>
        </Box>

        <Box
          sx={{
            minWidth: 220,
            display: "flex",
            flexDirection: "column",
            alignItems: { xs: "flex-start", md: "flex-end" },
            gap: 0.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "#6b7280", textTransform: "uppercase" }}
          >
            Усього пропозицій
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "#020617" }}
          >
            {count}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          borderBottom: "1px solid rgba(148,163,184,0.4)",
          mb: 2.5,
          flexShrink: 0,
        }}
      />

      {/* ✅ тут грід має розтягуватись і мати internal scroll */}
      <Box sx={{ flex: 1, minHeight: 0 }}>{children}</Box>

      <Box
        sx={{
          mt: 3,
          pt: 2,
          borderTop: "1px solid rgba(148,163,184,0.2)",
          flexShrink: 0,
        }}
      >
        <Button
          onClick={() => setCreateOpen(true)}
          variant="contained"
          startIcon={<AddIcon />}
          fullWidth
          disabled={disabled}
          sx={{
            textTransform: "none",
            borderRadius: 999,
            py: 1.35,
            fontWeight: 800,

            bgcolor: "#111827",
            color: "white",
            "&:hover": { bgcolor: "#020617" },

            "&.Mui-disabled": {
              bgcolor: "rgba(15, 23, 42, 0.08)",
              color: "rgba(15, 23, 42, 0.45)",
              border: "1px solid rgba(148,163,184,0.35)",
              boxShadow: "none",
            },
          }}
        >
          Створити пропозицію
        </Button>

        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 1.5,
            textAlign: "center",
            color: "#9ca3af",
          }}
        >
          Комерційні пропозиції повʼязані з вашим акаунтом та організацією
        </Typography>
      </Box>
    </Box>
  );
};
