import { Suspense } from "react";
import { Box, Typography } from "@mui/material";
import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontWeight: 800, fontSize: 18 }}>
              Обробляємо оплату…
            </Typography>
            <Typography sx={{ color: "text.secondary", mt: 1 }}>
              Зараз повернемо тебе назад.
            </Typography>
          </Box>
        </Box>
      }
    >
      <CheckoutClient />
    </Suspense>
  );
}
