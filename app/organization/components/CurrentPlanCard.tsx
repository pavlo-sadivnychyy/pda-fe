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
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

const commonCardStyles = {
  borderRadius: 3,
  bgcolor: "#FFFFFF",
  border: "1px solid #E2E8F0",
  boxShadow:
    "0px 20px 25px -5px rgba(0,0,0,0.05), 0px 10px 10px -5px rgba(0,0,0,0.04)",
};

export function CurrentPlanCard({ planName }: { planName: string }) {
  return (
    <Card elevation={0} sx={commonCardStyles}>
      <CardHeader
        avatar={
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "999px",
              bgcolor: "#fff7ed",
              border: "1px solid #fed7aa",
              display: "grid",
              placeItems: "center",
            }}
          >
            <WorkspacePremiumIcon sx={{ color: "#c2410c" }} />
          </Box>
        }
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Ваш поточний план
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>
            Доступні можливості асистента залежать від вашого тарифного плану.
          </Typography>
        }
      />
      <CardContent>
        <Stack direction="column" alignItems="start" spacing={2}>
          <Chip
            label={planName}
            sx={{
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              color: "#111827",
              fontWeight: 600,
            }}
          />
          <Typography variant="body2" sx={{ color: "#334155" }}>
            Наразі ви на базовому тарифі. Пізніше зʼявляться розширені плани з
            додатковими інструментами та командною роботою.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
