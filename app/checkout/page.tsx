"use client";

import * as React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [opened, setOpened] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const txn = new URL(window.location.href).searchParams.get("_ptxn");
        if (!txn) throw new Error("Missing _ptxn param");

        const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
        if (!token) throw new Error("Missing NEXT_PUBLIC_PADDLE_CLIENT_TOKEN");

        await loadPaddleV2();

        window.Paddle.Environment.set("sandbox");
        window.Paddle.Initialize({ token });

        // ✅ один хендлер: після success ведемо на /pricing
        const goBack = (status: "success" | "closed") => {
          // щоб не було double navigation
          if (typeof window !== "undefined") {
            router.push(`/pricing?checkout=${status}`);
          }
        };

        window.Paddle.Checkout.open({
          transactionId: txn,

          // ✅ This is the key: events from overlay
          // (Paddle sends a few event shapes, so handle defensively)
          eventCallback: (event: any) => {
            const type = String(event?.name ?? event?.type ?? "");
            // найчастіше: "checkout.completed" / "transaction.completed" / "checkout.closed"
            if (/completed/i.test(type)) {
              goBack("success");
            }
            if (/closed/i.test(type)) {
              // якщо юзер закрив хрестиком
              goBack("closed");
            }
          },

          // ✅ On close fallback (інколи зручніше)
          onClose: () => {
            goBack("closed");
          },
        });

        setOpened(true);
      } catch (e: any) {
        setError(e?.message ?? "Checkout init failed");
      }
    })();
  }, [router]);

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
        <Typography sx={{ fontWeight: 700 }}>
          {opened ? "Очікуємо завершення оплати…" : "Відкриваємо оплату…"}
        </Typography>
      </Box>
    </Box>
  );
}
