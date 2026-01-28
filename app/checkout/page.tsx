"use client";

import * as React from "react";

declare global {
  interface Window {
    Paddle?: any;
  }
}

function loadPaddleV2(): Promise<void> {
  return new Promise((resolve, reject) => {
    // ✅ prevent double-load
    if (window.Paddle?.Initialize && window.Paddle?.Checkout?.open)
      return resolve();

    // ✅ remove any old script (на всяк випадок)
    const existing = document.querySelector('script[src*="paddle"]');
    if (existing) existing.remove();

    const s = document.createElement("script");
    s.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Paddle v2"));
    document.body.appendChild(s);
  });
}

export default function CheckoutPage() {
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const txn = new URL(window.location.href).searchParams.get("_ptxn");
        if (!txn) throw new Error("Missing _ptxn");

        const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
        if (!token) throw new Error("Missing NEXT_PUBLIC_PADDLE_CLIENT_TOKEN");

        await loadPaddleV2();

        // ✅ IMPORTANT: token only
        window.Paddle.Initialize({ token });

        window.Paddle.Checkout.open({ transactionId: txn });
      } catch (e: any) {
        setErr(e?.message ?? String(e));
      }
    })();
  }, []);

  if (err) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Не вдалося відкрити оплату</h2>
        <pre style={{ whiteSpace: "pre-wrap" }}>{err}</pre>
      </div>
    );
  }

  return <div style={{ padding: 24 }}>Відкриваємо оплату…</div>;
}
