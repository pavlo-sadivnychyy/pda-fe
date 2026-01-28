"use client";

import * as React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

declare global {
  interface Window {
    Paddle?: any;
  }
}

function loadPaddleV2(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Paddle?.Initialize && window.Paddle?.Checkout?.open)
      return resolve();

    const s = document.createElement("script");
    s.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Paddle v2"));
    document.body.appendChild(s);
  });
}

export default function CheckoutPage() {
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const txn = new URL(window.location.href).searchParams.get("_ptxn");
        if (!txn) throw new Error("Missing _ptxn param");

        const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
        if (!token) throw new Error("Missing NEXT_PUBLIC_PADDLE_CLIENT_TOKEN");

        await loadPaddleV2();

        // ✅ CRITICAL: set sandbox BEFORE any other Paddle.js calls
        // If not set, Paddle uses production. :contentReference[oaicite:1]{index=1}
        window.Paddle.Environment.set("sandbox");

        // ✅ then initialize with client-side token :contentReference[oaicite:2]{index=2}
        window.Paddle.Initialize({ token });

        // ✅ open checkout for transaction
        window.Paddle.Checkout.open({ transactionId: txn });
      } catch (e: any) {
        setError(e?.message ?? "Checkout init failed");
      }
    })();
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
