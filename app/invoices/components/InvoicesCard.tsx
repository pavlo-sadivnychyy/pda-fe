"use client";

import AddIcon from "@mui/icons-material/Add";
import { Box, Button, LinearProgress, Typography } from "@mui/material";
import type { ReactNode } from "react";

export const InvoicesCard = ({
  invoicesCount,
  children,
  onCreate,
}: {
  invoicesCount: number;
  children: ReactNode;
  onCreate: () => void;
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
            Виставляйте рахунки клієнтам, слідкуйте за оплатами та тримайте
            фінансовий облік в одному місці.
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
            Усього інвойсів
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "#020617" }}
          >
            {invoicesCount}
          </Typography>
          <Box sx={{ width: "100%", mt: 0.5 }}>
            <LinearProgress
              variant="determinate"
              value={100}
              sx={{
                height: 6,
                borderRadius: 999,
                bgcolor: "#e5e7eb",
                "& .MuiLinearProgress-bar": { bgcolor: "#020617" },
              }}
            />
          </Box>
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
          Створити інвойс
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
          Інформація про інвойси зберігається у вашому акаунті
        </Typography>
      </Box>
    </Box>
  );
};
