"use client";

import { AnimatePresence, motion } from "framer-motion";
import { StepIndicator } from "./StepIndicator";

const STEP_LABELS = ["Klasse", "Funktion", "Daten", "Übersicht"];

interface OnboardingShellProps {
  currentStep: number;
  direction: "next" | "previous";
  children: React.ReactNode;
}

export function OnboardingShell({ currentStep, direction, children }: OnboardingShellProps) {
  const xEnter = direction === "next" ? 60 : -60;
  const xExit = direction === "next" ? -60 : 60;

  return (
    <div className="min-h-screen bg-background p-4 relative overflow-hidden">
      {/* Subtle radial gradient top-right */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.05),transparent_60%)]" />

      <div className="relative max-w-md mx-auto space-y-6 pt-8">
        {/* Logo / wordmark */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-foreground">Scholatempus</span>
        </div>

        {/* Step indicator */}
        <StepIndicator
          currentStep={currentStep}
          totalSteps={STEP_LABELS.length}
          stepLabels={STEP_LABELS}
        />

        {/* Animated content */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentStep}
            initial={{ x: xEnter, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: xExit, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>

        {/* Footer footnote */}
        <div className="text-center text-xs text-muted-foreground pb-4">
          Diese Einstellungen können später in den Profileinstellungen geändert werden.
        </div>
      </div>
    </div>
  );
}
