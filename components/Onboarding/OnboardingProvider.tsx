"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type Ctx = {
  forceRun: boolean;
  startTour: () => void;
  stopTour: () => void;
};

const OnboardingContext = createContext<Ctx | null>(null);

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [forceRun, setForceRun] = useState(false);

  const startTour = useCallback(() => setForceRun(true), []);
  const stopTour = useCallback(() => setForceRun(false), []);

  const value = useMemo(
    () => ({ forceRun, startTour, stopTour }),
    [forceRun, startTour, stopTour],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx)
    throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
