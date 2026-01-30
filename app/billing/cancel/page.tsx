"use client";

import { Box, Button, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function BillingCancelPage() {
  const router = useRouter();

  return (
    <Box
      sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 3 }}
    >
      <Stack spacing={1.5} sx={{ maxWidth: 640 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Оплату скасовано
        </Typography>
        <Typography sx={{ color: "text.secondary" }}>
          Ти можеш спробувати знову або обрати інший план.
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => router.push("/pricing")}>
            Повернутись до тарифів
          </Button>
          <Button variant="outlined" onClick={() => router.push("/dashboard")}>
            На головну
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
