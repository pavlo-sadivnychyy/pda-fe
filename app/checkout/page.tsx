"use client";

import * as React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";

declare global {
  interface Window {
    Paddle?: any;
  }
}

function loadPaddleJs(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Paddle) return resolve();

    const s = document.createElement("script");
    s.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Paddle.js"));
    document.body.appendChild(s);
  });
}

export default function CheckoutPage() {
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const txn = url.searchParams.get("_ptxn");
        if (!txn) {
          setError("Missing _ptxn. Open checkout from Pricing page again.");
          return;
        }

        await loadPaddleJs();

        const env = process.env.NEXT_PUBLIC_PADDLE_ENV ?? "sandbox";

        window.Paddle.Initialize({
          environment: env, // sandbox | production
        });

        // Open checkout for existing transaction :contentReference[oaicite:19]{index=19}
        window.Paddle.Checkout.open({
          transactionId: txn,
          // Optional:
          // displayMode: "overlay",
          // locale: "en" / "uk" (якщо доступно в акаунті)
        });
      } catch (e: any) {
        setError(e?.message ?? "Checkout init failed");
      }
    };

    run();
  }, []);

  if (error) {
    return (
      <Box
        sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 3 }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Не вдалося відкрити оплату
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {error}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <CircularProgress />
        <Typography sx={{ fontWeight: 700 }}>Відкриваємо оплату…</Typography>
      </Box>
    </Box>
  );
}
