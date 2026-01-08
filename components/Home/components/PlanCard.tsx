"use client";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import StarBorderIcon from "@mui/icons-material/StarBorder";

export function PlanCard() {
  return (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardHeader
        avatar={<StarBorderIcon sx={{ color: "#f59e0b" }} />}
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Ваш план
          </Typography>
        }
      />
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2">Поточний план:</Typography>
            <Chip
              label="Starter"
              size="small"
              sx={{ bgcolor: "#eef2ff", color: "#4338ca", fontWeight: 500 }}
            />
          </Stack>

          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Залишилось <b>134</b> AI-запити цього місяця.
          </Typography>

          <Button
            fullWidth
            variant="contained"
            sx={{
              textTransform: "none",
              bgcolor: "#202124",
              "&:hover": { bgcolor: "#111827" },
              borderRadius: 999,
            }}
          >
            Оновити план
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
