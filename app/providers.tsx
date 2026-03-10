"use client";

import React from "react";
import "dayjs/locale/uk";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { setClerkGetToken } from "@/libs/clerkToken";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ukUA as clukUA } from "@clerk/localizations";
import { ukUA } from "@mui/x-date-pickers/locales";
import dayjs from "dayjs";
dayjs.locale("uk");

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#ffbf57",
      light: "#ffd88a",
      dark: "#e0a845",
      contrastText: "#1a1200",
    },
  },
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
        localization={clukUA}
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
      >
        <ClerkTokenBridge />

        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale="uk"
              localeText={
                ukUA.components.MuiLocalizationProvider.defaultProps.localeText
              }
            >
              {children}
            </LocalizationProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </AppRouterCacheProvider>
  );
}
