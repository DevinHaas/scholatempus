import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "SchulaTempus - Zeiterfassung für Lehrpersonen",
  description: "Professionelle Zeiterfassung für Lehrpersonen",
  manifest: "/manifest.json",
  themeColor: "#6366f1",
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="de">
        <body
          className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}
        >
          <Suspense>
            {children}
            <Analytics />
          </Suspense>
        </body>
      </html>
    </ClerkProvider>
  );
}
