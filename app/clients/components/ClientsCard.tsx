"use client";

import { Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LockIcon from "@mui/icons-material/Lock";
import type { ReactNode } from "react";

export const ClientsCard = ({
  count,
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

        // ✅ make it a vertical layout container
        display: "flex",
        flexDirection: "column",

        // ✅ IMPORTANT for nested scroll
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
            Зберігай дані клієнтів, щоб швидко підставляти їх в інвойси та
            комунікацію.
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
            Усього клієнтів
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

      {/* ✅ Scroll area for table/rows */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",

          // optional: nicer scroll on iOS/mac
          WebkitOverflowScrolling: "touch",

          // optional: keep some padding for shadows etc.
          pr: { xs: 0.5, md: 1 },
        }}
      >
        {children}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          mt: 2.5,
          pt: 2,
          borderTop: "1px solid rgba(148,163,184,0.2)",
          flexShrink: 0,
        }}
      >
        <Button
          fullWidth
          onClick={onCreate}
          disabled={isLimitReached}
          startIcon={isLimitReached ? <LockIcon /> : <AddIcon />}
          sx={{
            borderRadius: 999,
            py: 1.4,
            fontWeight: 700,
            textTransform: "none",

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

        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 1.5,
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
    </Box>
  );
};
