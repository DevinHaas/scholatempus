import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { deDE } from "@clerk/localizations";
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

export const viewport: Viewport = {
  themeColor: "#4A6CF7",
};

export const metadata: Metadata = {
  title: "ScholaTempus - Zeiterfassung für Lehrpersonen",
  description: "Professionelle Zeiterfassung für Lehrpersonen",
  icons: {
    apple: "/icons/icon-180x180.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ScholaTempus",
    startupImage: [
      {
        url: "/splash/splash-1290x2796.png",
        media:
          "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/splash/splash-1179x2556.png",
        media:
          "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/splash/splash-1170x2532.png",
        media:
          "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/splash/splash-1242x2688.png",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/splash/splash-828x1792.png",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/splash/splash-750x1334.png",
        media:
          "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/splash/splash-2048x2732.png",
        media:
          "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/splash/splash-1668x2388.png",
        media:
          "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/splash/splash-1640x2360.png",
        media:
          "(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={deDE}>
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
