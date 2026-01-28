"use client";

import { useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Paddle?: any;
  }
}

function loadPaddle(): Promise<void> {
  return new Promise((resolve) => {
    if (window.Paddle?.Checkout) return resolve();
    const s = document.createElement("script");
    s.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    s.async = true;
    s.onload = () => resolve();
    document.body.appendChild(s);
  });
}

export default function CheckoutPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const tx = new URL(location.href).searchParams.get("_ptxn");
      if (!tx) return;

      await loadPaddle();

      window.Paddle.Environment.set("sandbox");
      window.Paddle.Initialize({
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
      });

      window.Paddle.Checkout.open({
        transactionId: tx,

        eventCallback: (event: any) => {
          const name = String(event?.name ?? "");
          if (/completed|paid/i.test(name)) {
            router.replace("/pricing?checkout=success");
          }
          if (/closed/i.test(name)) {
            router.replace("/pricing?checkout=closed");
          }
        },

        onClose: () => {
          router.replace("/pricing?checkout=closed");
        },
      });
    })();
  }, [router]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
      }}
    >
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <CircularProgress />
        <Typography fontWeight={700}>Відкриваємо оплату…</Typography>
      </Box>
    </Box>
  );
}
