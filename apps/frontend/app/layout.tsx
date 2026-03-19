import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "@/providers/QueryProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const switzer = localFont({
  src: [
    { path: "../public/switzer/fonts/Switzer-Regular.woff2", weight: "400" },
    { path: "../public/switzer/fonts/Switzer-Medium.woff2", weight: "500" },
    { path: "../public/switzer/fonts/Switzer-Semibold.woff2", weight: "600" },
    { path: "../public/switzer/fonts/Switzer-Bold.woff2", weight: "700" },
  ],
  variable: "--font-switzer",
});

export const metadata: Metadata = {
  title: "SchulaTempus - Zeiterfassung für Lehrpersonen",
  description: "Professionelle Zeiterfassung für Lehrpersonen",
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
          className={`font-sans ${inter.variable} ${switzer.variable} antialiased`}
        >
          <Suspense>
            <QueryProvider>{children}</QueryProvider>
            <Analytics />
          </Suspense>

          <Toaster closeButton />
        </body>
      </html>
    </ClerkProvider>
  );
}
