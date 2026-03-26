"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export function StepIndicator({ currentStep, totalSteps, stepLabels }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center w-full">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  isActive && "border-primary bg-primary text-primary-foreground",
                  !isCompleted && !isActive && "border-muted-foreground/30 bg-background text-muted-foreground/50",
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : <span>{index + 1}</span>}
              </div>
              <span
                className={cn(
                  "text-xs font-medium transition-all duration-300 whitespace-nowrap",
                  isActive && "text-foreground font-semibold",
                  isCompleted && "text-primary",
                  !isCompleted && !isActive && "text-muted-foreground/50",
                )}
              >
                {stepLabels[index]}
              </span>
            </div>
            {index < totalSteps - 1 && (
              <div
                className={cn(
                  "h-px w-12 mx-2 mb-5 transition-all duration-500",
                  index < currentStep ? "bg-primary" : "bg-muted-foreground/20",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
