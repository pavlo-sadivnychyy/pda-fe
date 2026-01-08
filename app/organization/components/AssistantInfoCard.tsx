"use client";

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Typography,
} from "@mui/material";
import PsychologyIcon from "@mui/icons-material/Psychology";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const commonCardStyles = {
  borderRadius: 3,
  bgcolor: "#FFFFFF",
  border: "1px solid #E2E8F0",
  boxShadow:
    "0px 20px 25px -5px rgba(0,0,0,0.05), 0px 10px 10px -5px rgba(0,0,0,0.04)",
};

export function AssistantInfoCard() {
  const items = [
    "відповідати з урахуванням вашої ніші, послуг та аудиторії;",
    "формувати тексти у стилі вашого бренду;",
    "швидше створювати комерційні пропозиції, листи, описи послуг, контент та документи;",
    "пропонувати релевантні ідеї, сценарії продажів та автоматизацію саме для вашого бізнесу.",
  ];

  return (
    <Card elevation={0} sx={commonCardStyles}>
      <CardHeader
        avatar={
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "999px",
              bgcolor: "#ecfeff",
              border: "1px solid #a5f3fc",
              display: "grid",
              placeItems: "center",
            }}
          >
            <PsychologyIcon sx={{ color: "#0e7490" }} />
          </Box>
        }
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Як асистент використовує дані
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>
            Чим якісніше заповнений профіль — тим корисніші будуть відповіді.
          </Typography>
        }
      />
      <CardContent>
        <Stack spacing={1.2}>
          <Typography variant="body2" sx={{ color: "#111827" }}>
            Асистент враховує ці дані, щоб:
          </Typography>

          {items.map((t) => (
            <Stack key={t} direction="row" spacing={1} alignItems="flex-start">
              <CheckCircleIcon
                sx={{ fontSize: 18, color: "#16a34a", mt: "2px" }}
              />
              <Typography variant="body2" sx={{ color: "#334155" }}>
                {t}
              </Typography>
            </Stack>
          ))}

          <Typography variant="body2" sx={{ color: "#64748B", mt: 1 }}>
            Ви можете оновлювати профіль у будь-який момент — асистент
            автоматично врахує зміни.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
