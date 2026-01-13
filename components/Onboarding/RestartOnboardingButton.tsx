"use client";

import { Button } from "@mui/material";
import { useState } from "react";
import { OnboardingTour } from "./OnboardingTour";

export function RestartOnboardingButton() {
  const [signal, setSignal] = useState(0);

  return (
    <>
      <Button
        variant="outlined"
        onClick={() => setSignal((s) => s + 1)}
        sx={{ textTransform: "none", borderRadius: 999 }}
      >
        Запустити гайд
      </Button>

      <OnboardingTour forceStartSignal={signal} />
    </>
  );
}
