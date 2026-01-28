"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Button, Stack, Typography, Alert } from "@mui/material";
import { InfinitySpin } from "react-loader-spinner";

declare global {
  interface Window {
    Paddle?: any;
  }
}

function loadPaddleScript(): Promise<void> {
  if (typeof window !== "undefined" && window.Paddle) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-paddle="1"]',
    );

    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Paddle load error")),
      );
      return;
    }

    const s = document.createElement("script");
    s.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    s.async = true;
    s.setAttribute("data-paddle", "1");

    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Paddle load error"));

    document.head.appendChild(s);
  });
}

export default function CheckoutClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const ptxn = sp.get("_ptxn"); // txn_...
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        if (!ptxn) throw new Error("Немає параметра _ptxn у URL");

        await loadPaddleScript();
        if (cancelled) return;

        if (!window.Paddle?.Checkout?.open) {
          throw new Error("Paddle Checkout не доступний (SDK не завантажився)");
        }

        // Відкриваємо checkout по transactionId (txn_...)
        window.Paddle.Checkout.open({
          transactionId: ptxn,

          // Якщо в тебе на бекенді вже задані success/cancel — краще прибрати це звідси,
          // але як fallback ок.
          successUrl: `${window.location.origin}/billing/success`,
          cancelUrl: `${window.location.origin}/billing/cancel`,

          // Рекомендую на час дебагу увімкнути:
          // eventCallback: (ev: any) => console.log("Paddle event:", ev),
        });

        setLoading(false);
      } catch (e: any) {
        setLoading(false);
        setError(e?.message ?? "Не вдалося запустити оплату");
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [ptxn]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "#f3f4f6",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <InfinitySpin width="180" color="#202124" />
          <Typography sx={{ fontWeight: 700 }}>Відкриваємо оплату…</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Не закривай вкладку
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", p: 3 }}>
      <Stack spacing={2} sx={{ maxWidth: 680, mx: "auto", mt: 6 }}>
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Alert severity="info">
            Якщо модалка оплати не відкрилась — перевір блокувальник попапів або
            онови сторінку.
          </Alert>
        )}

        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={() => router.push("/pricing")}>
            Назад до тарифів
          </Button>
          <Button variant="outlined" onClick={() => window.location.reload()}>
            Оновити
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
