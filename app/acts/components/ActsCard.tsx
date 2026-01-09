"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";

export const ActsCard = ({
  organizationId,
  onCreate,
  children,
}: {
  organizationId?: string;
  onCreate: () => void;
  children: ReactNode;
}) => {
  return (
    <Card
      elevation={4}
      sx={{ borderRadius: 4, overflow: "hidden", padding: "16px" }}
    >
      <CardHeader
        title={
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#020617" }}
              >
                Тут зберігаються акти, які ти формуєш на основі інвойсів. Звідси
                можна скачати PDF.
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1}
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <Button
                variant="contained"
                disabled={!organizationId}
                onClick={onCreate}
                sx={{
                  textTransform: "none",
                  borderRadius: 999,
                  bgcolor: "#111827",
                  "&:hover": { bgcolor: "#020617" },
                }}
              >
                Створити акт
              </Button>
            </Stack>
          </Box>
        }
      />
      <CardContent sx={{ pt: 0 }}>{children}</CardContent>
    </Card>
  );
};
