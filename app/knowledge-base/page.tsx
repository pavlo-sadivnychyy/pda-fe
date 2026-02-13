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
import LockIcon from "@mui/icons-material/Lock";
import { useKnowledgeBasePage } from "@/hooksNew/useKnowledgeBasePage";
import { FullscreenLoader } from "@/app/clients/page";
import { useOrganizationContext } from "@/app/invoices/hooks/useOrganizationContext";

function PlanLimitBanner({
  current,
  limit,
  onUpgrade,
}: {
  current: number;
  limit: number;
  onUpgrade: () => void;
}) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid #fecaca",
        bgcolor: "#fff1f2",
        display: "flex",
        justifyContent: "space-between",
        gap: 2,
        alignItems: { xs: "flex-start", sm: "center" },
      }}
    >
      <Stack spacing={0.3}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 999,
              display: "grid",
              placeItems: "center",
              bgcolor: "#111827",
              color: "white",
            }}
          >
            <LockIcon fontSize="small" />
          </Box>

          <Typography sx={{ fontWeight: 900, color: "#991b1b" }}>
            Ліміт документів вичерпано
          </Typography>
        </Stack>

        <Typography variant="body2" sx={{ color: "#7f1d1d" }}>
          Використано {current} / {limit} документів. Щоб додати більше —
          підвищіть план.
        </Typography>
      </Stack>

      <Button
        onClick={onUpgrade}
        variant="contained"
        sx={{
          borderRadius: 999,
          px: 2.6,
          py: 1.1,
          fontWeight: 900,
          letterSpacing: "0.02em",
          textTransform: "none",

          // gradient background
          background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",

          color: "#fff",

          boxShadow:
            "0 8px 22px rgba(249,115,22,0.35), inset 0 0 0 1px rgba(255,255,255,0.2)",

          position: "relative",
          overflow: "hidden",

          // hover = lift + brighter
          "&:hover": {
            background: "linear-gradient(135deg, #fbbf24 0%, #fb923c 100%)",
            boxShadow:
              "0 12px 28px rgba(249,115,22,0.45), inset 0 0 0 1px rgba(255,255,255,0.25)",
            transform: "translateY(-1px)",
          },

          // click
          "&:active": {
            transform: "translateY(0px) scale(0.98)",
            boxShadow:
              "0 6px 16px rgba(249,115,22,0.35), inset 0 0 0 1px rgba(255,255,255,0.2)",
          },

          // pulse ring
          "@keyframes upgradePulse": {
            "0%": {
              boxShadow: "0 0 0 0 rgba(249,115,22,0.45)",
            },
            "70%": {
              boxShadow: "0 0 0 14px rgba(249,115,22,0)",
            },
            "100%": {
              boxShadow: "0 0 0 0 rgba(249,115,22,0)",
            },
          },

          animation: "upgradePulse 2.6s ease-out infinite",
        }}
      >
        Підвищити план
      </Button>
    </Box>
  );
}

const PLAN_LIMITS: Record<string, number> = {
  FREE: 3,
  BASIC: 20,
};

export default function KnowledgeBasePage() {
  const router = useRouter();
  const { planId, isUserLoading, isOrgLoading } = useOrganizationContext();

  const planLimit = PLAN_LIMITS[planId ?? ""] ?? Infinity;

  const vm = useKnowledgeBasePage();
  const isLimitReached = vm?.documents?.length >= planLimit;

  const isBootstrapping =
    isUserLoading || isOrgLoading || typeof planId === "undefined";

  if (isBootstrapping) {
    return <FullscreenLoader text="Завантажую..." />;
  }

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
            НА ГОЛОВНУ
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
                Документи
              </Typography>
            </Stack>

            <Chip label="KNOWLEDGE BASE" size="small" sx={styles.chip} />
          </Stack>

          <Typography variant="body2" sx={styles.subtitle}>
            Тут зберігаються всі згенеровані Вами акти/інвойси/комерційні
            пропозиції, а також документі які ви самі завантажите в систему.
          </Typography>
        </Box>
        {isLimitReached && planLimit !== Infinity ? (
          <Box sx={{ mb: 2, flexShrink: 0 }}>
            <PlanLimitBanner
              current={vm?.documents?.length}
              limit={planLimit}
              onUpgrade={() => router.push("/pricing")}
            />
          </Box>
        ) : null}

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
              <KnowledgeBaseShell isLimitReached={isLimitReached} vm={vm} />
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
