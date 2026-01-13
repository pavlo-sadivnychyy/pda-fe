"use client";

import { useEffect, useMemo, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

import { onboardingSteps } from "./steps";
import { completeOnboarding } from "./api";
import { useCurrentUser } from "@/hooksNew/useAppBootstrap";

type Props = {
  /**
   * Для ручного запуску: передай будь-яке число і інкрементуй його.
   * Змінився signal -> стартує тур.
   */
  forceStartSignal?: number;
};

export function OnboardingTour({ forceStartSignal }: Props) {
  const { data: userData } = useCurrentUser();
  const onboardingCompleted = (userData as any)?.onboardingCompleted ?? true;

  const steps = useMemo(() => onboardingSteps, []);
  const drvRef = useRef<ReturnType<typeof driver> | null>(null);

  // init driver once (after first client render)
  useEffect(() => {
    drvRef.current = driver({
      showProgress: true,
      smoothScroll: true,
      allowClose: false,
      overlayOpacity: 0.55,
      disableActiveInteraction: true,
      popoverClass: "onb-popover",
      stagePadding: 6,
      stageRadius: 12,
      steps,
      onDestroyed: async () => {
        // user finished/closed -> mark completed
        try {
          await completeOnboarding();
        } catch (e) {
          console.error("completeOnboarding failed:", e);
        }
      },
    });
  }, [steps]);

  // auto-start if not completed
  useEffect(() => {
    if (!onboardingCompleted) {
      const t = setTimeout(() => drvRef.current?.drive(), 250);
      return () => clearTimeout(t);
    }
  }, [onboardingCompleted]);

  // manual start
  useEffect(() => {
    if (forceStartSignal && drvRef.current) {
      const t = setTimeout(() => drvRef.current?.drive(), 50);
      return () => clearTimeout(t);
    }
  }, [forceStartSignal]);

  return null;
}
