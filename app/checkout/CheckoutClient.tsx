"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
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
  const ptxn = sp.get("_ptxn");

  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setError(null);

        if (!ptxn) throw new Error("Немає параметра _ptxn у URL");

        const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
        if (!token) {
          throw new Error(
            "Немає NEXT_PUBLIC_PADDLE_CLIENT_TOKEN у env (це обов'язково для Paddle.Initialize)",
          );
        }

        await loadPaddleScript();
        if (cancelled) return;

        if (!window.Paddle?.Initialize) {
          throw new Error(
            "Paddle SDK не завантажився (нема Paddle.Initialize)",
          );
        }

        // ✅ ОБОВ'ЯЗКОВО
        window.Paddle.Initialize({
          token,
          checkout: {
            settings: {
              displayMode: "overlay",
              theme: "light",
              locale: "uk",
              // бажано тримати return-URLи на бекенді, але хай буде fallback:
              successUrl: `${window.location.origin}/billing/success`,
              cancelUrl: `${window.location.origin}/billing/cancel`,
            },
          },
        });

        // ✅ НІЧОГО не відкриваємо вручну
        // Paddle сам відкриє checkout для ?_ptxn=txn_... на default payment link сторінці.
        // Це якраз описано в їх доках.

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

        {/* корисно для дебагу */}
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          txn: {ptxn ?? "-"}
        </Typography>
      </Stack>
    </Box>
  );
}
