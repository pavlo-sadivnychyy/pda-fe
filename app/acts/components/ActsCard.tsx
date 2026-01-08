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
  count,
  onCreate,
  children,
}: {
  organizationId?: string;
  count: number;
  onCreate: () => void;
  children: ReactNode;
}) => {
  return (
    <Card elevation={4} sx={{ borderRadius: 4, overflow: "hidden" }}>
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
                Акти наданих послуг
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#6b7280", maxWidth: 520 }}
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
              <Typography
                variant="body2"
                sx={{
                  color: "#6b7280",
                  textAlign: { xs: "left", md: "right" },
                }}
              >
                {!organizationId
                  ? "Спочатку створіть або виберіть організацію."
                  : `Знайдено актів: ${count}`}
              </Typography>

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
