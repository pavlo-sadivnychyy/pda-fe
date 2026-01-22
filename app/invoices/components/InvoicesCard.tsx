"use client";

import LockIcon from "@mui/icons-material/Lock";
import { Box, Button, Typography } from "@mui/material";
import type { ReactNode } from "react";

export const InvoicesCard = ({
  children,
  onCreate,
  isLimitReached,
}: {
  invoicesCount: number;
  children: ReactNode;
  onCreate: () => void;
  isLimitReached: boolean;
}) => {
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
          Виставляйте рахунки клієнтам, слідкуйте за оплатами та тримайте
          фінансовий облік в одному місці.
        </Typography>

        {/* 👉 Кнопка тепер тут */}
        <Button
          onClick={onCreate}
          disabled={isLimitReached}
          startIcon={isLimitReached ? <LockIcon /> : null}
          sx={{
            borderRadius: 999,
            px: 3,
            // py: 1.2,
            fontWeight: 800,
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
          {isLimitReached ? "Ліміт досягнуто" : "Створити інвойс"}
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

      {/* Bottom info text */}
      <Typography
        variant="caption"
        sx={{
          display: "block",
          mt: 2,
          textAlign: "center",
          color: isLimitReached ? "#b45309" : "#9ca3af",
          fontWeight: isLimitReached ? 700 : 500,
        }}
      >
        {isLimitReached
          ? "Ліміт плану вичерпано — підвищіть план, щоб створювати більше інвойсів"
          : "Інформація про інвойси зберігається у вашому акаунті"}
      </Typography>
    </Box>
  );
};
