"use client";

import { useEffect, useState } from "react";

export function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        (window.navigator as Navigator & { standalone?: boolean }).standalone ===
          true);

    if (!isStandalone) return;

    setVisible(true);

    const fadeTimer = setTimeout(() => setFading(true), 1400);
    const hideTimer = setTimeout(() => setVisible(false), 1900);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#F8F7F3",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        transition: "opacity 0.4s ease",
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 18,
          backgroundColor: "#4A6CF7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 32px rgba(74, 108, 247, 0.3)",
        }}
      >
        <span
          style={{
            color: "#ffffff",
            fontSize: 28,
            fontWeight: 700,
            fontFamily: "var(--font-switzer), sans-serif",
            letterSpacing: "-0.5px",
          }}
        >
          ST
        </span>
      </div>

      {/* Wordmark */}
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 600,
            color: "#1A1D2E",
            fontFamily: "var(--font-switzer), sans-serif",
            letterSpacing: "-0.3px",
          }}
        >
          ScholaTempus
        </p>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: 13,
            fontWeight: 400,
            color: "#6B7280",
            fontFamily: "var(--font-switzer), sans-serif",
          }}
        >
          Zeiterfassung für Lehrpersonen
        </p>
      </div>

      {/* Loading dots */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginTop: 8,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "#4A6CF7",
              animation: `splash-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes splash-pulse {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.85); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
