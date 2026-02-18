"use client";

import { Button, Container } from "@mui/material";
import { TaxCalendarPage } from "./components/TaxCalendarPage";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Button
        onClick={() => router.push("/dashboard")}
        startIcon={<KeyboardReturnIcon />}
        sx={{ mb: 1, color: "#0f172a" }}
      >
        на головну
      </Button>
      <TaxCalendarPage />
    </Container>
  );
}
