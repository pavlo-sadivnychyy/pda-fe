"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import { useRouter } from "next/navigation";

import { KnowledgeBaseShell } from "@/components/KnowledgeBaseShell/KnowledgeBaseShell";

export default function KnowledgeBasePage() {
  const router = useRouter();

  return (
    <Box sx={styles.page}>
      <Container maxWidth="lg" sx={styles.container}>
        {/* ✅ HEADER (НЕ СКРОЛИТЬСЯ) */}
        <Box sx={styles.header}>
          <Button
            onClick={() => router.push("/dashboard")}
            sx={styles.backBtn}
            startIcon={<KeyboardReturnIcon fontSize="inherit" />}
          >
            на головну
          </Button>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={styles.iconBubble}>
                <AutoStoriesIcon sx={{ color: "#0f172a" }} />
              </Box>

              <Typography variant="h5" sx={styles.pageTitle}>
                База знань
              </Typography>
            </Stack>

            <Chip label="KNOWLEDGE BASE" size="small" sx={styles.chip} />
          </Stack>

          <Typography variant="body2" sx={styles.subtitle}>
            Завантажуй документи, договори та регламенти — асистент зможе
            знаходити по них відповіді та використовувати у генерації текстів.
          </Typography>
        </Box>

        {/* ✅ CONTENT AREA (ЗАЙМАЄ ЗАЛИШОК ВИСОТИ) */}
        <Paper elevation={0} sx={styles.paper}>
          <Box sx={styles.paperInner}>
            <SignedOut>
              <Box sx={styles.center}>
                <Typography sx={{ color: "#6b7280", textAlign: "center" }}>
                  Щоб побачити базу знань, спочатку увійди в акаунт.
                </Typography>
              </Box>
            </SignedOut>

            <SignedIn>
              {/* ✅ Всередині KnowledgeBaseShell вже має бути overflow hidden,
                  а скрол — тільки у списку документів */}
              <KnowledgeBaseShell />
            </SignedIn>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

const styles = {
  // ✅ блокуємо body scroll: сторінка рівно у в’юпорт
  page: {
    height: "100dvh", // краще для мобільних (динамічний viewport)
    overflow: "hidden",
    bgcolor: "#f3f4f6",
    display: "flex",
  },

  // ✅ контейнер теж як flex-col і НЕ дає скролу
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    py: { xs: 2, md: 4 }, // замість padding: "32px 0" (контрольовано)
    px: { xs: 2, sm: 3 },
  },

  // ✅ хедер не скролиться, займає тільки свою висоту
  header: {
    mb: 2.5,
    flexShrink: 0,
  },

  backBtn: {
    color: "black",
    mb: 2,
    alignSelf: "flex-start",
    textTransform: "none",
  },

  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: "999px",
    bgcolor: "#ffffff",
    border: "1px solid #e2e8f0",
    display: "grid",
    placeItems: "center",
  },

  pageTitle: { fontWeight: 800, color: "#0f172a" },

  chip: {
    bgcolor: "#ffffff",
    border: "1px solid #e2e8f0",
    color: "#0f172a",
    fontWeight: 700,
  },

  subtitle: { color: "#64748b", mt: 0.8 },

  // ✅ Paper займає весь залишок висоти і НЕ дає скролу назовні
  paper: {
    flex: 1,
    minHeight: 0,
    borderRadius: 4,
    p: { xs: 2, md: 4 },
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.12)",
    bgcolor: "#ffffff",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },

  paperInner: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  center: {
    flex: 1,
    display: "grid",
    placeItems: "center",
    px: 2,
    minHeight: 0,
  },
} as const;
