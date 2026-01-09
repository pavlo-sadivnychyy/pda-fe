"use client";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Typography,
} from "@mui/material";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import { useRouter } from "next/navigation";

export function PopularTasksCard() {
  const router = useRouter();

  const items = [
    "Зробити опис товару",
    "Згенерувати пост для соцмереж",
    "Підготувати відповідь на скаргу",
    "Пояснити пункт договору",
    "Придумати ідеї акцій",
    "Скласти контент-план на тиждень",
  ];

  const handleClick = (label: string) => {
    const qs = new URLSearchParams({
      new: "1",
      prefill: label,
    });

    router.push(`/chat?${qs.toString()}`);
  };

  return (
    <Card elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
      <CardHeader
        avatar={<FlashOnIcon sx={{ color: "#f97316" }} />}
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Популярні задачі
          </Typography>
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={1.2}>
          {items.map((label) => (
            <Button
              key={label}
              onClick={() => handleClick(label)}
              variant="outlined"
              fullWidth
              size="small"
              sx={{
                justifyContent: "flex-start",
                textTransform: "none",
                borderColor: "#e5e7eb",
                color: "#374151",
                bgcolor: "#ffffff",
                borderRadius: 2,
                "&:hover": { borderColor: "#d1d5db", bgcolor: "#f9fafb" },
              }}
            >
              {label}
            </Button>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
