"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Hourglass,
  Menu,
  ArrowRight,
  TrendingUp,
  Zap,
} from "lucide-react";

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Redirect authenticated users to /home
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/home");
    }
  }, [isLoaded, isSignedIn, router]);

  // Timer logic
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(elapsedSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (elapsedSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [elapsedSeconds]);

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
              <Link
                href="/sign-in"
                className="text-sm font-normal text-[oklch(0.15_0.02_258)] hover:text-[oklch(0.55_0.18_258)] transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center h-10 px-5 rounded-full bg-[oklch(0.55_0.18_258)] text-white text-sm font-medium transition-all hover:bg-[oklch(0.55_0.18_258)]/90 shadow-[0_0_20px_-5px_oklch(0.55_0.18_258)] hover:shadow-[0_0_25px_-5px_oklch(0.55_0.18_258)]"
              >
                Start for free
              </Link>
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
      <main className="md:pt-40 md:pb-24 overflow-hidden pt-32 pb-16 relative">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 -z-10 w-[50%] h-[80%] rounded-full bg-[oklch(0.55_0.18_258)]/5 blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 -z-10 w-[40%] h-[60%] rounded-full bg-[oklch(0.6_0.15_200)]/5 blur-[100px]"></div>

        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 gap-x-12 gap-y-12 items-center">
            {/* Left Content */}
            <div className="z-10 relative w-full md:w-1/2 lg:w-full">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[oklch(0.94_0.01_258)] border border-[oklch(0.9_0.01_258)] mb-8 animate-fade-in-up">
                <span className="flex h-2 w-2 rounded-full bg-[oklch(0.55_0.18_258)] animate-pulse"></span>
                <span className="text-xs font-medium text-[oklch(0.55_0.18_258)] uppercase tracking-wide">
                  New: Smart Scheduling
                </span>
              </div>

              {/* Headline */}
              <h1 className="md:text-6xl lg:text-7xl text-[oklch(0.15_0.02_258)] leading-[1.1] text-5xl font-medium tracking-tight mb-6">
                Time Tracked, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[oklch(0.55_0.18_258)] to-[oklch(0.6_0.15_200)]">
                  Balance Restored.
                </span>
              </h1>

              {/* Subhead */}
              <p className="text-lg md:text-xl text-[oklch(0.15_0.02_258)]/70 mb-10 leading-relaxed max-w-lg font-normal">
                A focused workspace for educators to see, feel, and master their
                workload in minutes. reclaim your evenings.
              </p>

              {/* CTA Group */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Link
                  href="/sign-up"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[oklch(0.55_0.18_258)] px-8 text-base font-medium text-white shadow-lg shadow-[oklch(0.55_0.18_258)]/25 transition-transform hover:scale-105 hover:bg-[oklch(0.55_0.18_258)]/90"
                >
                  Get started
                  <ArrowRight className="size-4" />
                </Link>
              </div>

              {/* Social Proof / Trusted Text */}
              <div className="mt-10 flex items-center gap-4 text-sm text-[oklch(0.15_0.02_258)]/50 font-normal">
                <div className="flex -space-x-2">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64"
                    alt="User"
                    className="inline-block size-8 rounded-full ring-2 ring-white object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64"
                    alt="User"
                    className="inline-block size-8 rounded-full ring-2 ring-white object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64"
                    alt="User"
                    className="inline-block size-8 rounded-full ring-2 ring-white object-cover"
                  />
                </div>
                <p>Trusted by 10,000+ educators</p>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative mt-12 lg:mt-0 flex justify-center lg:justify-end">
              {/* Main Circle Blob Background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[350px] md:size-[500px] rounded-full bg-[oklch(0.55_0.18_258)]/10"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[250px] md:size-[380px] rounded-full bg-[oklch(0.55_0.18_258)]/20 animate-pulse"></div>

              {/* Main Image Container with Fade Effect */}
              <div className="relative z-10 w-full max-w-md mx-auto lg:mr-0 aspect-[4/5] overflow-visible">
                <img
                  src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/112bb9eb-201c-4831-8eb4-aa1084833dca_1600w.jpg"
                  alt="Hand holding phone with modern interface"
                  className="[mask-image:radial-gradient(closest-side,black_40%,transparent_100%)] transition-transform duration-700 ease-out hover:scale-135 opacity-90 w-full h-full object-cover scale-125"
                  style={{
                    borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
                  }}
                />
              </div>

              {/* Floating Card: Stats (Left) */}
              <div className="absolute top-10 -left-4 md:-left-12 lg:-left-20 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/50 animate-float max-w-[180px] z-20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-[oklch(0.94_0.01_258)] text-[oklch(0.55_0.18_258)]">
                    <TrendingUp className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[oklch(0.15_0.02_258)]/60 font-medium">
                      Efficiency
                    </p>
                    <p className="text-sm font-semibold text-[oklch(0.15_0.02_258)]">
                      + 5 hrs/wk
                    </p>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-[oklch(0.94_0.01_258)] rounded-full overflow-hidden">
                  <div className="h-full w-[75%] bg-[oklch(0.55_0.18_258)] rounded-full"></div>
                </div>
              </div>

              {/* Floating Card: Timer (Right Bottom) */}
              <div className="absolute bottom-12 -right-4 md:-right-8 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/50 animate-float-delayed flex items-center gap-4 z-20">
                <div className="relative size-12 flex items-center justify-center">
                  <svg
                    className="size-full -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <path
                      className="text-[oklch(0.94_0.01_258)]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="text-[oklch(0.55_0.18_258)]"
                      strokeDasharray="75, 100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="size-5 text-[oklch(0.55_0.18_258)] fill-current" />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[oklch(0.15_0.02_258)]/60 font-medium">
                    Focus Mode
                  </p>
                  <p className="text-lg font-semibold text-[oklch(0.15_0.02_258)] font-mono tracking-tight">
                    {formattedTime}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
