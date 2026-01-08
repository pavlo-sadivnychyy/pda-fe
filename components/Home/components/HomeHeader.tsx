"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

type Props = {
  firstName?: string | null;
};

export function HomeHeader({ firstName }: Props) {
  const router = useRouter();

  return (
    <Card elevation={4} sx={{ borderRadius: 3, mb: 3, overflow: "hidden" }}>
      <CardContent sx={{ p: 3, pb: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              Привіт, {firstName ?? "👋"}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Чим сьогодні допомогти? Обери одну з популярних дій нижче або
              відкрий чат з асистентом.
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            width={{ xs: "100%", sm: "auto" }}
          >
            <Button
              onClick={() => router.push("/chat")}
              fullWidth
              variant="contained"
              sx={{
                textTransform: "none",
                bgcolor: "#202124",
                "&:hover": { bgcolor: "#111827" },
                borderRadius: 999,
                px: 3,
              }}
            >
              AI-чат
            </Button>

            <Button
              fullWidth
              variant="outlined"
              sx={{
                textTransform: "none",
                borderRadius: 999,
                borderColor: "#dadce0",
                color: "#374151",
                bgcolor: "#ffffff",
                "&:hover": { borderColor: "#c4c6cb", bgcolor: "#fafafa" },
              }}
            >
              Створити пост
            </Button>
          </Stack>
        </Stack>
      </CardContent>

      <Box
        sx={{
          height: 6,
          bgcolor: "rgba(250, 204, 21, 0.25)",
          backgroundImage:
            "linear-gradient(135deg, rgba(249,115,22,0.4) 0%, rgba(234,179,8,0.4) 100%)",
        }}
      />
    </Card>
  );
}
