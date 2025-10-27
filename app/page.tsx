"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

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
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900 px-6 py-16 text-white">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <motion.div
          className="mb-8 inline-flex items-center gap-3 rounded-full bg-white/10 px-5 py-3 backdrop-blur"
          animate={{ boxShadow: ["0 0 0px rgba(99,102,241,0.4)", "0 0 25px rgba(99,102,241,0.75)", "0 0 0px rgba(99,102,241,0.4)"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-sm uppercase tracking-[0.35em] text-indigo-300">
            ScholaTempus
          </span>
          <motion.span
            className="rounded-md bg-black/40 px-3 py-1 font-mono text-lg"
            animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {formattedTime}
          </motion.span>
        </motion.div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Time Tracked, Balance Restored.
        </h1>
        <p className="mt-4 text-lg text-indigo-100">
          A focused workspace for educators to see, feel, and master their workload in minutes.
        </p>

        <Link
          href="/home"
          className="mt-10 inline-flex items-center rounded-full bg-indigo-500 px-8 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
        >
          Try out
        </Link>
      </div>
    </main>
  );
}
