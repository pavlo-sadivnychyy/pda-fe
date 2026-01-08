"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Box, Chip, Container, Paper, Stack, Typography } from "@mui/material";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";

import { KnowledgeBaseHeader } from "@/components/KnowledgeBaseHeader/KnowledgeBaseHeader";
import { KnowledgeBaseShell } from "@/components/KnowledgeBaseShell/KnowledgeBaseShell";

export default function KnowledgeBasePage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3f4f6", py: { xs: 3, md: 8 } }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* ✅ Хедер як на інших сторінках */}
        <Box sx={{ mb: 2.5 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "999px",
                  bgcolor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <AutoStoriesIcon sx={{ color: "#0f172a" }} />
              </Box>

              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "#0f172a" }}
              >
                База знань
              </Typography>
            </Stack>

            <Chip
              label="KNOWLEDGE BASE"
              size="small"
              sx={{
                bgcolor: "#ffffff",
                border: "1px solid #e2e8f0",
                color: "#0f172a",
                fontWeight: 700,
              }}
            />
          </Stack>

          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.8 }}>
            Завантажуй документи, договори та регламенти — асистент зможе
            знаходити по них відповіді та використовувати у генерації текстів.
          </Typography>
        </Box>

        {/* ✅ Контент в окремій paper-картці */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: { xs: 2, md: 4 },
            boxShadow: "0 24px 60px rgba(15, 23, 42, 0.12)",
            bgcolor: "#ffffff",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: { xs: "auto", md: "70vh" },
          }}
        >
          {/* твій існуючий хедер бази знань */}
          <KnowledgeBaseHeader />

          <Box
            sx={{
              mt: 2,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <SignedOut>
              <Box
                sx={{
                  flex: 1,
                  display: "grid",
                  placeItems: "center",
                  px: 2,
                }}
              >
                <Typography sx={{ color: "#6b7280", textAlign: "center" }}>
                  Щоб побачити базу знань, спочатку увійди в акаунт.
                </Typography>
              </Box>
            </SignedOut>

            <SignedIn>
              <KnowledgeBaseShell />
            </SignedIn>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
