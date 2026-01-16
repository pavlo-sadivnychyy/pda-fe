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
import SmartToyIcon from "@mui/icons-material/SmartToy";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useRouter } from "next/navigation";

export function AiChatCard({ dragHandle }: { dragHandle?: React.ReactNode }) {
  const router = useRouter();

  return (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardHeader
        avatar={
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 999,
              bgcolor: "#eef2ff",
              display: "grid",
              placeItems: "center",
            }}
          >
            <SmartToyIcon sx={{ color: "#4f46e5" }} />
          </Box>
        }
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            AI Асистент
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Допомагає працювати швидше
          </Typography>
        }
        action={<Box sx={{ mr: 0.5 }}>{dragHandle}</Box>}
      />
      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={1.25}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            <strong>Став запитання</strong> або проси підготувати документи,
            відповіді клієнтам, тексти чи ідеї — асистент зробить це за тебе.
          </Typography>

          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            <strong>Всі діалоги зберігаються</strong> і доступні в будь-який
            момент.
          </Typography>

          <Box>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AutoAwesomeIcon />}
              onClick={() => router.push("/chat")}
              sx={{
                mt: 0.5,
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "none",
                bgcolor: "#111827",
                color: "white",
                "&:hover": { bgcolor: "#1f2937", boxShadow: "none" },
              }}
            >
              Відкрити AI чат
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
