"use client";

import { Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import type { ReactNode } from "react";

export const ClientsCard = ({
  count,
  onCreate,
  children,
}: {
  count: number;
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
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
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

      <Box sx={{ borderBottom: "1px solid rgba(148,163,184,0.4)", mb: 2.5 }} />

      {children}

      <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid rgba(148,163,184,0.2)" }}>
        <Button
          fullWidth
          onClick={onCreate}
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 999,
            py: 1.4,
            fontWeight: 500,
            bgcolor: "#020617",
            color: "#f9fafb",
            textTransform: "none",
            "&:hover": { bgcolor: "#020617" },
          }}
        >
          Додати клієнта
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
          Клієнти повʼязані з вашим акаунтом та організацією
        </Typography>
      </Box>
    </Box>
  );
};
