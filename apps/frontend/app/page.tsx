"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useRef } from "react";
import { Hourglass, Menu, ArrowRight, CheckCircle2, Zap } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();

  const statsCardRef = useRef<HTMLDivElement>(null);
  const timerCardRef = useRef<HTMLDivElement>(null);
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (statsCardRef.current) {
      gsap.to(statsCardRef.current, {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
    if (timerCardRef.current) {
      gsap.to(timerCardRef.current, {
        y: -10,
        duration: 2,
        delay: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
    if (blob1Ref.current) {
      gsap.to(blob1Ref.current, {
        scale: 1.05,
        opacity: 0.8,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
    if (blob2Ref.current) {
      gsap.to(blob2Ref.current, {
        scale: 1.05,
        opacity: 0.8,
        duration: 2.5,
        delay: 0.7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
  });

  return (
    <div className="scroll-smooth">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full backdrop-blur-md bg-[oklch(0.98_0.005_106)]/80 border-b border-[oklch(0.9_0.01_258)]">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center size-10 rounded-xl bg-gradient-to-tr from-[oklch(0.55_0.18_258)] to-[oklch(0.6_0.15_200)] text-white shadow-lg transition-transform group-hover:scale-105">
                <Hourglass className="size-5" />
              </div>
              <span className="text-lg font-medium tracking-tight text-[oklch(0.15_0.02_258)]">
                ScholaTempus
              </span>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {isLoaded &&
                (isSignedIn ? (
                  <Link
                    href="/home"
                    className="inline-flex items-center justify-center h-10 px-5 rounded-full bg-[oklch(0.55_0.18_258)] text-white text-sm font-medium transition-all hover:bg-[oklch(0.55_0.18_258)]/90 shadow-[0_0_20px_-5px_oklch(0.55_0.18_258)] hover:shadow-[0_0_25px_-5px_oklch(0.55_0.18_258)]"
                  >
                    Zur Übersicht
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/sign-in"
                      className="text-sm font-normal text-[oklch(0.15_0.02_258)] hover:text-[oklch(0.55_0.18_258)] transition-colors"
                    >
                      Anmelden
                    </Link>
                    <Link
                      href="/sign-up"
                      className="inline-flex items-center justify-center h-10 px-5 rounded-full bg-[oklch(0.55_0.18_258)] text-white text-sm font-medium transition-all hover:bg-[oklch(0.55_0.18_258)]/90 shadow-[0_0_20px_-5px_oklch(0.55_0.18_258)] hover:shadow-[0_0_25px_-5px_oklch(0.55_0.18_258)]"
                    >
                      Kostenlos starten
                    </Link>
                  </>
                ))}
            </div>

            {/* Mobile Menu Icon */}
            <div className="md:hidden">
              <button className="p-2 text-[oklch(0.15_0.02_258)]">
                <Menu className="size-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="md:pt-40 md:pb-24 overflow-hidden pt-32 pb-16 relative min-h-screen">
        {/* Background Decor */}
        <div
          ref={blob1Ref}
          className="absolute top-0 right-0 -z-10 w-full h-full rounded-full bg-[oklch(0.55_0.18_258)]/5 blur-[120px]"
        ></div>
        <div
          ref={blob2Ref}
          className="absolute bottom-0 left-0 -z-10 w-full h-full rounded-full bg-[oklch(0.6_0.15_200)]/5 blur-[100px]"
        ></div>

        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 gap-x-12 gap-y-12 items-center">
            {/* Left Content */}
            <div className="z-10 relative w-full md:w-1/2 lg:w-full text-center md:text-left">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-8 justify-center md:justify-start">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 animate-fade-in-up">
                  <svg
                    viewBox="0 0 20 20"
                    width="14"
                    height="14"
                    aria-hidden="true"
                  >
                    <rect width="20" height="20" fill="#FF0000" rx="2" />
                    <rect x="4" y="7" width="12" height="6" fill="white" />
                    <rect x="7" y="4" width="6" height="12" fill="white" />
                  </svg>
                  <span className="text-xs font-medium text-red-600 uppercase tracking-wide">
                    Für Schweizer Schulen
                  </span>
                </div>
              </div>

              {/* Headline */}
              <h1 className="md:text-6xl lg:text-7xl text-[oklch(0.15_0.02_258)] leading-[1.1] text-5xl font-medium tracking-tight mb-6">
                Arbeitszeit erfasst. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[oklch(0.55_0.18_258)] to-[oklch(0.6_0.15_200)]">
                  Transparenz garantiert.
                </span>
              </h1>

              {/* Subhead */}
              <p className="text-lg md:text-xl text-[oklch(0.15_0.02_258)]/70 mb-10 leading-relaxed max-w-lg font-normal mx-auto md:mx-0">
                Verwalte und analysiere deine Arbeitszeit um mehr Transparenz zu
                schaffen und deine Arbeitsbelastung immer im Auge zu behalten.
              </p>

              {/* CTA Group */}
              <div className="flex flex-col sm:flex-row gap-4 items-center md:items-start justify-center md:justify-start">
                <Link
                  href="/sign-up"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[oklch(0.55_0.18_258)] px-8 text-base font-medium text-white shadow-lg shadow-[oklch(0.55_0.18_258)]/25 transition-transform hover:scale-105 hover:bg-[oklch(0.55_0.18_258)]/90"
                >
                  Jetzt starten
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative mt-12 lg:mt-0 flex justify-center lg:justify-end">
              {/* Stats Card — desktop only */}
              <div
                ref={statsCardRef}
                className="hidden lg:flex absolute -left-8 top-12 z-20 flex-col gap-2 bg-white/90 backdrop-blur-md border border-[oklch(0.9_0.01_258)] rounded-2xl p-4 shadow-xl w-44"
              >
                <CheckCircle2
                  className="size-8 text-[oklch(0.55_0.18_258)]"
                  strokeWidth={1.5}
                />
                <p className="text-sm font-semibold text-[oklch(0.15_0.02_258)] leading-snug">
                  Transparenz
                  <br />
                  wiederhergestellt
                </p>
              </div>

              {/* Timer Card — desktop only */}
              <div
                ref={timerCardRef}
                className="hidden lg:block absolute -right-4 bottom-16 z-20 bg-white/90 backdrop-blur-md border border-[oklch(0.9_0.01_258)] rounded-2xl p-4 shadow-xl w-48"
              >
                <div className="flex items-center gap-2 text-[oklch(0.6_0.15_200)] mb-2">
                  <Zap className="size-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Laufende Zeitmessung
                  </span>
                </div>
                <p className="text-2xl font-bold text-[oklch(0.15_0.02_258)] font-mono">
                  01:24:07
                </p>
                <p className="text-xs text-[oklch(0.15_0.02_258)]/50 mt-1">
                  Unterrichtsvorbereitung
                </p>
              </div>

              {/* Main Image Container with Fade Effect */}
              <div className="relative z-10 w-full max-w-md mx-auto lg:mr-0 aspect-[4/5] overflow-visible">
                <img
                  src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/112bb9eb-201c-4831-8eb4-aa1084833dca_1600w.jpg"
                  alt="Hand holding phone with modern interface"
                  className="[mask-image:radial-gradient(closest-side,black_65%,transparent_100%)] transition-transform duration-700 ease-out hover:scale-135 w-full h-full object-cover scale-125"
                  style={{
                    borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
