import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            background: "#f3f4f6",
          }}
        >
          Loading…
        </div>
      }
    >
      <CheckoutClient />
    </Suspense>
  );
}
