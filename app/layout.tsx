// app/layout.tsx
import type { Metadata } from "next";
import React from "react";
import { AppProviders } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personal Business Assistant",
  description: "AI-powered SaaS for your business",
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
