"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Typography } from "@mui/material";
import { api } from "@/libs/axios";

export default function CheckoutClient() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    const txn = sp.get("transaction_id") || sp.get("_ptxn");

    if (!txn) {
      router.replace("/pricing?checkout=cancel");
      return;
    }

    (async () => {
      try {
        await api.post("/billing/paddle/sync-transaction", {
          transactionId: txn,
        });
      } finally {
        router.replace("/pricing?checkout=success");
      }
    })();
  }, [router, sp]);

  return (
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
  );
}
