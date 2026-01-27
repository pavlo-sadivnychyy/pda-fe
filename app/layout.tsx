// app/layout.tsx
import type { Metadata } from "next";
import React from "react";
import { AppProviders } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spravly",
  description: "AI-powered SaaS for your business",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
