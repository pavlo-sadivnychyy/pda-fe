"use client";

import { Box, Button, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function BillingSuccessPage() {
  const router = useRouter();

  return (
    <Box
      sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 3 }}
    >
      <Stack spacing={1.5} sx={{ maxWidth: 640 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Оплата успішна 🎉
        </Typography>
        <Typography sx={{ color: "text.secondary" }}>
          Ми зараз підтягнемо статус підписки. Якщо план ще не оновився —
          зачекай 5–10 секунд і онови сторінку.
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => router.push("/dashboard")}>
            Перейти в дашборд
          </Button>
          <Button variant="outlined" onClick={() => router.push("/pricing")}>
            До тарифів
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
