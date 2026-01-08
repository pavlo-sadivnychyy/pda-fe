"use client";

import { KnowledgeBaseHeader } from "@/components/KnowledgeBaseHeader/KnowledgeBaseHeader";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { KnowledgeBaseShell } from "@/components/KnowledgeBaseShell/KnowledgeBaseShell";

export default function KnowledgeBasePage() {
  return (
    <Box sx={styles.page}>
      <Card elevation={4} sx={styles.card}>
        <KnowledgeBaseHeader />

        <CardContent sx={styles.content}>
          <SignedOut>
            <Box sx={styles.center}>
              <Typography color="#6b7280">
                Щоб побачити базу знань, спочатку увійди в акаунт.
              </Typography>
            </Box>
          </SignedOut>

          <SignedIn>
            <KnowledgeBaseShell />
          </SignedIn>
        </CardContent>
      </Card>
    </Box>
  );
}

const styles = {
  page: {
    height: "100vh",
    bgcolor: "#f3f4f6",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    px: 2,
    py: 2,
    overflow: "hidden",
  },
  card: {
    width: "100%",
    maxWidth: 1400,
    borderRadius: 4,
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.18)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    maxHeight: "100%",
  },
  content: {
    px: { xs: 3, md: 4 },
    pb: 3,
    pt: 0,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  center: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
} as const;
