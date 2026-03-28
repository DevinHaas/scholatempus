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
      // iPad Pro 12.9"
      {
        url: "/splash/splash-2048x2732.png",
        media:
          "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)",
      },
      // iPad Pro 10.5" / iPad Air 3rd gen
      {
        url: "/splash/splash-1668x2224.png",
        media:
          "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)",
      },
      // iPad mini / iPad Air 2 (retina)
      {
        url: "/splash/splash-1536x2048.png",
        media:
          "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)",
      },
      // 640×960 @2x
      {
        url: "/splash/splash-1280x1920.png",
        media:
          "(device-width: 640px) and (device-height: 960px) and (-webkit-device-pixel-ratio: 2)",
      },
      // iPhone 6+/7+/8+
      {
        url: "/splash/splash-1242x2208.png",
        media:
          "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)",
      },
      // iPhone X/XS/11 Pro
      {
        url: "/splash/splash-1125x2436.png",
        media:
          "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)",
      },
      // iPhone 6/7/8/SE 2nd gen
      {
        url: "/splash/splash-750x1334.png",
        media:
          "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
      },
      // 480×640 @2x
      {
        url: "/splash/splash-960x1280.png",
        media:
          "(device-width: 480px) and (device-height: 640px) and (-webkit-device-pixel-ratio: 2)",
      },
      // 360×480 @2x
      {
        url: "/splash/splash-720x960.png",
        media:
          "(device-width: 360px) and (device-height: 480px) and (-webkit-device-pixel-ratio: 2)",
      },
      // 240×320 @2x
      {
        url: "/splash/splash-480x640.png",
        media:
          "(device-width: 240px) and (device-height: 320px) and (-webkit-device-pixel-ratio: 2)",
      },
      // 320×470 @1x
      {
        url: "/splash/splash-320x470.png",
        media:
          "(device-width: 320px) and (device-height: 470px) and (-webkit-device-pixel-ratio: 1)",
      },
      // 320×426 @1x
      {
        url: "/splash/splash-320x426.png",
        media:
          "(device-width: 320px) and (device-height: 426px) and (-webkit-device-pixel-ratio: 1)",
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
