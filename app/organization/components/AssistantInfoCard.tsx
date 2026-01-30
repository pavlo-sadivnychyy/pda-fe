"use client";

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
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

          {/* ✅ Chips in one line (wrap if not enough space) */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              alignItems: "center",
            }}
          >
            {items.map((t) => (
              <Chip
                key={t}
                icon={
                  <CheckCircleIcon
                    sx={{
                      fontSize: 18,
                      color: "#16a34a !important",
                    }}
                  />
                }
                label={t}
                variant="outlined"
                sx={{
                  borderRadius: 999,
                  bgcolor: "#f8fafc",
                  borderColor: "#e2e8f0",
                  color: "#334155",
                  fontSize: 13,
                  height: 34,
                  "& .MuiChip-label": {
                    px: 1,
                    py: 0,
                    whiteSpace: "nowrap",
                  },
                }}
              />
            ))}
          </Box>

          <Typography variant="body2" sx={{ color: "#64748B", mt: 1 }}>
            Ви можете оновлювати профіль у будь-який момент — асистент
            автоматично врахує зміни.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
