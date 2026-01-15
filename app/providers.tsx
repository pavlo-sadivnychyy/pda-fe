"use client";

import React from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { OnboardingProvider } from "@/components/Onboarding/OnboardingProvider";
import { OnboardingTour } from "@/components/Onboarding/OnboardingTour";
import { setClerkGetToken } from "@/libs/clerkToken";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";

const theme = createTheme({
  palette: { mode: "light" },
});

const queryClient = new QueryClient();

function ClerkTokenBridge() {
  const { getToken } = useAuth();

  // ✅ useLayoutEffect щоб встигло раніше (до "ефектів" і часто до першого кліку)
  React.useLayoutEffect(() => {
    setClerkGetToken(() => getToken());
  }, [getToken]);

  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <ClerkProvider
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
      >
        {/* ✅ Bridge має монтуватись якнайраніше */}
        <ClerkTokenBridge />

        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <CssBaseline />

            <OnboardingProvider>
              <OnboardingTour />
              {children}
            </OnboardingProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </AppRouterCacheProvider>
  );
}
