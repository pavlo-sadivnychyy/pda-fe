import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic"; // щоб не пререндерився на build

function Fallback() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f3f4f6",
        padding: 24,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>Відкриваємо оплату…</div>
        <div style={{ marginTop: 8, opacity: 0.7 }}>Не закривай вкладку</div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <CheckoutClient />
    </Suspense>
  );
}
